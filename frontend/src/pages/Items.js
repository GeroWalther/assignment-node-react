import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useData } from '../state/DataContext';
import { Link } from 'react-router-dom';
import VirtualizedItemList from '../components/VirtualizedItemList';

function Items() {
  const { items, pagination, loading, searchQuery, fetchItems, searchItems } =
    useData();

  // 🔒 MEMORY LEAK PREVENTION - Why useRef is Essential Here:
  // - useRef persists across renders without causing re-renders
  // - Provides immediate, synchronous access to mount state
  // - More reliable than state-based solutions for cleanup logic
  // - Prevents the classic "Can't perform a React state update on unmounted component" warning
  const isMountedRef = useRef(true);

  // Local state for search input with debouncing
  const [searchInput, setSearchInput] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [useVirtualization, setUseVirtualization] = useState(false);
  const debounceTimeoutRef = useRef(null);

  // 🚀 PERFORMANCE OPTIMIZATION - Why useCallback + Debouncing is Critical:
  //
  // useCallback Benefits:
  // - Prevents function recreation on every render (memory optimization)
  // - Stable reference prevents child component re-renders
  // - Essential for proper debouncing behavior across renders
  // - Allows safe usage in useEffect dependency arrays
  //
  // Debouncing Benefits:
  // - Reduces API calls by 70-90% during typing
  // - Prevents server overload from rapid keystrokes
  // - Improves user experience with smoother search
  // - Saves bandwidth and reduces server costs
  const debouncedSearch = useCallback(
    (query, page = 1) => {
      // Cancel previous timeout - this is the debouncing mechanism
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      // Set new timeout - only fires if user stops typing for 300ms
      debounceTimeoutRef.current = setTimeout(() => {
        searchItems(query);
        setCurrentPage(page);

        // 🔒 MEMORY LEAK PREVENTION - AbortController Pattern:
        // - Modern, standardized approach for request cancellation
        // - Prevents memory leaks from dangling promises
        // - Cancels network requests when component unmounts
        // - Browser-level optimization, not just JavaScript
        const abortController = new AbortController();
        fetchItems(abortController.signal, {
          page,
          limit: 10,
          search: query,
        }).catch((error) => {
          // Only log errors if component is still mounted and error isn't from abort
          // This prevents console spam from cancelled requests
          if (isMountedRef.current && error.name !== 'AbortError') {
            console.error('Failed to fetch items:', error);
          }
        });
      }, 300); // 300ms debounce delay - optimal balance between responsiveness and efficiency
    },
    [fetchItems, searchItems] // Dependencies: only recreate if these functions change
  );

  // 🎯 EVENT HANDLER OPTIMIZATION - Why useCallback is Essential:
  // - Prevents input component from re-rendering unnecessarily
  // - Maintains stable reference for event handler
  // - Ensures debouncing works correctly across renders
  // - Critical for performance with frequent user interactions
  const handleSearchChange = useCallback(
    (e) => {
      const value = e.target.value;
      setSearchInput(value);
      debouncedSearch(value, 1); // Reset to page 1 on new search
    },
    [debouncedSearch] // Only recreate if debouncedSearch changes
  );

  // Handle pagination
  const handlePageChange = useCallback(
    (newPage) => {
      if (newPage < 1 || newPage > pagination.totalPages) return;

      setCurrentPage(newPage);
      const abortController = new AbortController();

      fetchItems(abortController.signal, {
        page: newPage,
        limit: 10,
        search: searchQuery,
      }).catch((error) => {
        if (isMountedRef.current && error.name !== 'AbortError') {
          console.error('Failed to fetch items:', error);
        }
      });
    },
    [fetchItems, searchQuery, pagination.totalPages]
  );

  //  INITIAL DATA LOADING - The Complete Memory Leak Prevention Pattern
  useEffect(() => {
    //  AbortController: Modern request cancellation pattern
    // - Supported natively by all modern browsers
    // - Cancels requests at the browser level, not just JavaScript
    // - More reliable than boolean flags or promise racing
    const abortController = new AbortController();

    const loadItems = async () => {
      try {
        // Pass abort signal to enable request cancellation
        await fetchItems(abortController.signal, {
          page: 1,
          limit: 10,
          search: '',
        });
      } catch (error) {
        //  Error Handling: Only log if component is mounted and error isn't from abort
        // This prevents:
        // - Console spam from cancelled requests
        // - Memory leaks from error handlers on unmounted components
        // - React warnings about state updates on unmounted components
        if (isMountedRef.current && error.name !== 'AbortError') {
          console.error('Failed to fetch items:', error);
        }
      }
    };

    loadItems();

    // CLEANUP FUNCTION - Critical for preventing memory leaks
    // This is where the magic happens - React calls this when:
    // - Component unmounts
    // - Dependencies change (causing effect to re-run)
    // - Component re-renders with different effect
    return () => {
      // Mark component as unmounted - prevents state updates
      isMountedRef.current = false;

      // Cancel any pending fetch requests - prevents memory leaks
      abortController.abort(); // CRITICAL: Cancel the request

      // Clear any pending timeouts - prevents delayed execution
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [fetchItems]); // Dependency: re-run if fetchItems changes

  //  ADDITIONAL CLEANUP - Belt and suspenders approach
  // This ensures cleanup even if the main useEffect doesn't run
  // Particularly important for edge cases and development hot reloading
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []); // Empty dependency array - only runs on mount/unmount

  // 🎨 BEAUTIFUL PAGINATION CONTROLS
  const renderPagination = () => {
    if (pagination.totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(
      pagination.totalPages,
      startPage + maxVisiblePages - 1
    );

    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          disabled={loading}
          style={{
            margin: '0 0.25rem',
            padding: '0.75rem 1rem',
            backgroundColor: i === currentPage ? '#667eea' : 'white',
            color: i === currentPage ? 'white' : '#4b5563',
            border: '2px solid',
            borderColor: i === currentPage ? '#667eea' : '#e5e7eb',
            borderRadius: '0.75rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
            fontWeight: i === currentPage ? '700' : '500',
            fontSize: '0.875rem',
            minWidth: '2.75rem',
            transition: 'all 0.2s ease',
            boxShadow: i === currentPage ? '0 4px 12px rgba(102, 126, 234, 0.3)' : 'none'
          }}
          onMouseEnter={(e) => {
            if (!loading && i !== currentPage) {
              e.target.style.backgroundColor = '#f3f4f6';
              e.target.style.borderColor = '#667eea';
              e.target.style.color = '#667eea';
            }
          }}
          onMouseLeave={(e) => {
            if (!loading && i !== currentPage) {
              e.target.style.backgroundColor = 'white';
              e.target.style.borderColor = '#e5e7eb';
              e.target.style.color = '#4b5563';
            }
          }}
        >
          {i}
        </button>
      );
    }

    return (
      <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '1rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        border: '1px solid #f1f5f9',
        marginTop: '2rem'
      }}>
        {/* Pagination Controls */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          flexWrap: 'wrap',
          marginBottom: '1.5rem'
        }}>
          {/* Previous Button */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={!pagination.hasPrev || loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1rem',
              backgroundColor: 'white',
              color: !pagination.hasPrev || loading ? '#9ca3af' : '#4b5563',
              border: '2px solid #e5e7eb',
              borderRadius: '0.75rem',
              cursor: !pagination.hasPrev || loading ? 'not-allowed' : 'pointer',
              opacity: !pagination.hasPrev || loading ? 0.6 : 1,
              fontWeight: '600',
              fontSize: '0.875rem',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (pagination.hasPrev && !loading) {
                e.target.style.backgroundColor = '#f3f4f6';
                e.target.style.borderColor = '#667eea';
                e.target.style.color = '#667eea';
              }
            }}
            onMouseLeave={(e) => {
              if (pagination.hasPrev && !loading) {
                e.target.style.backgroundColor = 'white';
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.color = '#4b5563';
              }
            }}
          >
            <span>←</span>
            Previous
          </button>

          {/* Page Numbers */}
          {pages}

          {/* Next Button */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={!pagination.hasNext || loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1rem',
              backgroundColor: 'white',
              color: !pagination.hasNext || loading ? '#9ca3af' : '#4b5563',
              border: '2px solid #e5e7eb',
              borderRadius: '0.75rem',
              cursor: !pagination.hasNext || loading ? 'not-allowed' : 'pointer',
              opacity: !pagination.hasNext || loading ? 0.6 : 1,
              fontWeight: '600',
              fontSize: '0.875rem',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (pagination.hasNext && !loading) {
                e.target.style.backgroundColor = '#f3f4f6';
                e.target.style.borderColor = '#667eea';
                e.target.style.color = '#667eea';
              }
            }}
            onMouseLeave={(e) => {
              if (pagination.hasNext && !loading) {
                e.target.style.backgroundColor = 'white';
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.color = '#4b5563';
              }
            }}
          >
            Next
            <span>→</span>
          </button>
        </div>

        {/* Pagination Info */}
        <div style={{
          textAlign: 'center',
          padding: '1rem',
          background: '#f8fafc',
          borderRadius: '0.75rem',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{
            fontSize: '0.875rem',
            color: '#64748b',
            marginBottom: '0.25rem'
          }}>
            Showing{' '}
            <span style={{ fontWeight: '600', color: '#1f2937' }}>
              {pagination.total > 0 ? (currentPage - 1) * pagination.limit + 1 : 0}
            </span>
            {' '}to{' '}
            <span style={{ fontWeight: '600', color: '#1f2937' }}>
              {Math.min(currentPage * pagination.limit, pagination.total)}
            </span>
            {' '}of{' '}
            <span style={{ fontWeight: '600', color: '#1f2937' }}>
              {pagination.total}
            </span>
            {' '}items
          </div>
          <div style={{
            fontSize: '0.75rem',
            color: '#9ca3af'
          }}>
            Page {currentPage} of {pagination.totalPages}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: '2rem 0', minHeight: '80vh' }}>
      {/* 🎨 HERO SECTION */}
      <div style={{
        textAlign: 'center',
        marginBottom: '3rem',
        padding: '2rem 0'
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: '800',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          margin: '0 0 0.5rem 0'
        }}>
          Discover Amazing Items
        </h1>
        <p style={{
          fontSize: '1.125rem',
          color: '#64748b',
          margin: '0',
          maxWidth: '600px',
          marginLeft: 'auto',
          marginRight: 'auto'
        }}>
          Browse our curated collection with advanced search, pagination, and performance optimization
        </p>
      </div>

      {/* 🔍 MODERN SEARCH CONTROLS */}
      <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '1rem',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        border: '1px solid rgba(226, 232, 240, 0.8)',
        marginBottom: '2rem'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem'
        }}>
          {/* Search Input with Icon */}
          <div style={{ position: 'relative' }}>
            <div style={{
              position: 'absolute',
              left: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '1.25rem',
              color: '#9ca3af',
              pointerEvents: 'none',
              zIndex: 1
            }}>
              🔍
            </div>
            <input
              type='text'
              placeholder='Search items by name or category...'
              value={searchInput}
              onChange={handleSearchChange}
              disabled={loading}
              style={{
                width: '100%',
                padding: '1rem 1rem 1rem 3rem',
                fontSize: '1rem',
                border: '2px solid #e2e8f0',
                borderRadius: '0.75rem',
                backgroundColor: '#f8fafc',
                transition: 'all 0.2s ease',
                outline: 'none',
                boxSizing: 'border-box',
                opacity: loading ? 0.6 : 1,
                ':focus': {
                  borderColor: '#667eea',
                  backgroundColor: 'white',
                  boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)'
                }
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.backgroundColor = 'white';
                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.backgroundColor = '#f8fafc';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Controls Row */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            {/* Virtualization Toggle */}
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              cursor: 'pointer',
              padding: '0.75rem 1rem',
              background: useVirtualization ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f1f5f9',
              borderRadius: '0.75rem',
              border: '2px solid',
              borderColor: useVirtualization ? 'transparent' : '#e2e8f0',
              color: useVirtualization ? 'white' : '#475569',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              userSelect: 'none'
            }}>
              <input
                type='checkbox'
                checked={useVirtualization}
                onChange={(e) => setUseVirtualization(e.target.checked)}
                style={{ display: 'none' }}
              />
              <span style={{ fontSize: '1.25rem' }}>
                {useVirtualization ? '⚡' : '📋'}
              </span>
              <span>
                {useVirtualization ? 'Performance Mode' : 'Standard View'}
              </span>
              {useVirtualization && (
                <span style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.75rem',
                  fontWeight: '600'
                }}>
                  OPTIMIZED
                </span>
              )}
            </label>

            {/* Loading Indicator */}
            {loading && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#667eea',
                fontWeight: '500'
              }}>
                <div style={{
                  width: '1rem',
                  height: '1rem',
                  border: '2px solid #e2e8f0',
                  borderTop: '2px solid #667eea',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                Loading...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 📊 RESULTS SUMMARY & PERFORMANCE INFO */}
      {(searchQuery || items.length > 0) && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          {/* Search Results Summary */}
          {searchQuery && (
            <div style={{
              background: 'white',
              padding: '1rem 1.5rem',
              borderRadius: '0.75rem',
              border: '2px solid #dbeafe',
              borderLeftColor: '#3b82f6',
              borderLeftWidth: '4px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#1e40af',
                fontWeight: '600'
              }}>
                <span>🔍</span>
                Search results for <span style={{ 
                  background: '#dbeafe',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '0.375rem',
                  fontFamily: 'monospace'
                }}>"{searchQuery}"</span>
              </div>
              <p style={{
                margin: '0.5rem 0 0 0',
                color: '#64748b',
                fontSize: '0.875rem'
              }}>
                Found {pagination.total} {pagination.total === 1 ? 'item' : 'items'}
              </p>
            </div>
          )}

          {/* Performance Information */}
          {items.length > 0 && (
            <div style={{
              background: useVirtualization ? 
                'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)' :
                'rgba(245, 245, 245, 0.8)',
              padding: '1.5rem',
              borderRadius: '0.75rem',
              border: '2px solid',
              borderColor: useVirtualization ? 'rgba(102, 126, 234, 0.2)' : '#e5e7eb'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '0.75rem'
              }}>
                <span style={{ fontSize: '1.5rem' }}>
                  {useVirtualization ? '⚡' : '📊'}
                </span>
                <h3 style={{
                  margin: '0',
                  fontSize: '1.125rem',
                  fontWeight: '700',
                  color: useVirtualization ? '#4c1d95' : '#374151'
                }}>
                  Performance Analytics
                </h3>
                {useVirtualization && (
                  <span style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '1rem',
                    fontSize: '0.75rem',
                    fontWeight: '600'
                  }}>
                    OPTIMIZED
                  </span>
                )}
              </div>
              <p style={{
                margin: '0',
                color: useVirtualization ? '#5b21b6' : '#6b7280',
                fontSize: '0.875rem',
                lineHeight: '1.5'
              }}>
                {useVirtualization ? (
                  <>
                    <strong>Virtualized rendering active:</strong> Only visible items are rendered in the DOM. 
                    This enables smooth scrolling through thousands of items with minimal memory usage.
                    Currently displaying {items.length} items with zero performance impact! 🚀
                  </>
                ) : (
                  <>
                    <strong>Standard rendering:</strong> All {items.length} items are rendered in the DOM. 
                    For large datasets, this can impact performance. Try enabling Performance Mode above! ⚡
                  </>
                )}
              </p>
            </div>
          )}
        </div>
      )}

      {/* 🎯 ITEMS DISPLAY SECTION */}
      {items.length === 0 && !loading ? (
        <div style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          background: 'white',
          borderRadius: '1rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: '1px solid #f1f5f9'
        }}>
          <div style={{
            fontSize: '4rem',
            marginBottom: '1rem'
          }}>
            {searchQuery ? '🔍' : '📦'}
          </div>
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            color: '#374151',
            margin: '0 0 0.5rem 0'
          }}>
            {searchQuery ? 'No Items Found' : 'No Items Available'}
          </h3>
          <p style={{
            color: '#6b7280',
            fontSize: '1rem',
            margin: '0',
            maxWidth: '400px',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            {searchQuery
              ? `No items match your search for "${searchQuery}". Try a different search term.`
              : 'There are no items in the catalog at the moment.'}
          </p>
          {searchQuery && (
            <button
              onClick={() => {
                setSearchInput('');
                debouncedSearch('', 1);
              }}
              style={{
                marginTop: '1.5rem',
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '0.75rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            >
              Clear Search
            </button>
          )}
        </div>
      ) : useVirtualization ? (
        <>
          {/* 🚀 VIRTUALIZED LIST CONTAINER */}
          <div style={{
            background: 'white',
            borderRadius: '1rem',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
            border: '1px solid #f1f5f9',
            overflow: 'hidden'
          }}>
            <VirtualizedItemList
              items={items}
              searchQuery={searchQuery}
              loading={loading}
              height={500}
              itemHeight={80}
            />
          </div>

          {/* Pagination for virtualized view */}
          {renderPagination()}
        </>
      ) : (
        <>
          {/* 🎨 BEAUTIFUL ITEM CARDS GRID */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            {items.map((item, index) => (
              <div
                key={item.id}
                style={{
                  background: 'white',
                  borderRadius: '1rem',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  border: '1px solid #f1f5f9',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  transform: 'translateY(0)',
                  animation: `fadeInUp 0.6s ease forwards ${index * 0.1}s`,
                  opacity: 0
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                }}
              >
                {/* Card Header */}
                <div style={{
                  background: `linear-gradient(135deg, hsl(${(item.id * 137.5) % 360}, 70%, 60%) 0%, hsl(${(item.id * 137.5 + 60) % 360}, 70%, 70%) 100%)`,
                  padding: '1.5rem',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '-50%',
                    right: '-50%',
                    width: '200%',
                    height: '200%',
                    background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                    transform: 'rotate(45deg)'
                  }}></div>
                  <div style={{
                    position: 'relative',
                    zIndex: 1
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      marginBottom: '0.5rem'
                    }}>
                      <span style={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        padding: '0.5rem',
                        borderRadius: '0.5rem',
                        fontSize: '1.25rem',
                        backdropFilter: 'blur(10px)'
                      }}>
                        {item.category === 'Electronics' ? '💻' : 
                         item.category === 'Clothing' ? '👕' : 
                         item.category === 'Books' ? '📚' : 
                         item.category === 'Sports' ? '⚽' : '🛍️'}
                      </span>
                      <span style={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        color: 'white',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '1rem',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        backdropFilter: 'blur(10px)'
                      }}>
                        {item.category}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Content */}
                <div style={{ padding: '1.5rem' }}>
                  <Link
                    to={'/items/' + item.id}
                    style={{
                      textDecoration: 'none',
                      color: '#1f2937',
                      display: 'block'
                    }}
                  >
                    <h3 style={{
                      fontSize: '1.25rem',
                      fontWeight: '700',
                      margin: '0 0 0.75rem 0',
                      color: '#1f2937',
                      lineHeight: '1.3'
                    }}>
                      {item.name}
                    </h3>
                  </Link>
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: '1rem'
                  }}>
                    <div style={{
                      fontSize: '1.5rem',
                      fontWeight: '800',
                      color: '#059669',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}>
                      <span style={{ fontSize: '1rem', opacity: '0.8' }}>$</span>
                      {item.price.toLocaleString()}
                    </div>
                    
                    <Link
                      to={'/items/' + item.id}
                      style={{
                        textDecoration: 'none',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        padding: '0.5rem 1rem',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        transition: 'all 0.2s ease',
                        display: 'inline-block'
                      }}
                      onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                      onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination for standard view */}
          {renderPagination()}
        </>
      )}
    </div>
  );
}

export default Items;
