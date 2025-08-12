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

  // Render pagination controls
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
            margin: '0 2px',
            padding: '8px 12px',
            backgroundColor: i === currentPage ? '#007bff' : '#f8f9fa',
            color: i === currentPage ? 'white' : '#333',
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
          }}>
          {i}
        </button>
      );
    }

    return (
      <div style={{ margin: '20px 0', textAlign: 'center' }}>
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={!pagination.hasPrev || loading}
          style={{
            margin: '0 5px',
            padding: '8px 12px',
            backgroundColor: '#f8f9fa',
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            cursor: !pagination.hasPrev || loading ? 'not-allowed' : 'pointer',
            opacity: !pagination.hasPrev || loading ? 0.6 : 1,
          }}>
          Previous
        </button>

        {pages}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={!pagination.hasNext || loading}
          style={{
            margin: '0 5px',
            padding: '8px 12px',
            backgroundColor: '#f8f9fa',
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            cursor: !pagination.hasNext || loading ? 'not-allowed' : 'pointer',
            opacity: !pagination.hasNext || loading ? 0.6 : 1,
          }}>
          Next
        </button>

        <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
          Showing{' '}
          {pagination.total > 0 ? (currentPage - 1) * pagination.limit + 1 : 0}{' '}
          to {Math.min(currentPage * pagination.limit, pagination.total)} of{' '}
          {pagination.total} items
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: '20px' }}>
      {/* Search Input and Controls */}
      <div style={{ marginBottom: '20px' }}>
        <div
          style={{
            display: 'flex',
            gap: '15px',
            alignItems: 'center',
            marginBottom: '15px',
          }}>
          <input
            type='text'
            placeholder='Search items by name or category...'
            value={searchInput}
            onChange={handleSearchChange}
            disabled={loading}
            style={{
              flex: 1,
              maxWidth: '400px',
              padding: '10px',
              fontSize: '16px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              opacity: loading ? 0.6 : 1,
            }}
          />

          {/* Virtualization Toggle - Shows performance benefits */}
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
            }}>
            <input
              type='checkbox'
              checked={useVirtualization}
              onChange={(e) => setUseVirtualization(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            <span style={{ fontSize: '14px', color: '#666' }}>
              Use Virtualization
              {useVirtualization && (
                <span style={{ color: '#28a745' }}> (⚡ Performance Mode)</span>
              )}
            </span>
          </label>
        </div>

        {loading && (
          <div style={{ marginTop: '10px', color: '#666' }}>Loading...</div>
        )}
      </div>

      {/* Results Summary */}
      {searchQuery && (
        <div style={{ marginBottom: '15px', color: '#666' }}>
          Search results for "{searchQuery}": {pagination.total} items found
        </div>
      )}

      {/* Performance Information */}
      {items.length > 0 && (
        <div
          style={{
            marginBottom: '15px',
            padding: '10px',
            backgroundColor: '#e3f2fd',
            borderRadius: '4px',
            fontSize: '14px',
            color: '#1976d2',
          }}>
          <strong>Performance Demo:</strong>{' '}
          {useVirtualization
            ? `Virtualized rendering - only visible items are rendered (efficient for ${items.length}+ items)`
            : `Standard rendering - all ${items.length} items rendered (can be slow with large datasets)`}
        </div>
      )}

      {/* Items List - Conditional Rendering */}
      {items.length === 0 && !loading ? (
        <p style={{ textAlign: 'center', color: '#666', margin: '40px 0' }}>
          {searchQuery
            ? 'No items found matching your search.'
            : 'No items available.'}
        </p>
      ) : useVirtualization ? (
        <>
          {/* Virtualized List for Performance */}
          <VirtualizedItemList
            items={items}
            searchQuery={searchQuery}
            loading={loading}
            height={500}
            itemHeight={80}
          />

          {/* Pagination for virtualized view */}
          {renderPagination()}
        </>
      ) : (
        <>
          {/* Standard List */}
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {items.map((item) => (
              <li
                key={item.id}
                style={{
                  marginBottom: '10px',
                  padding: '15px',
                  border: '1px solid #eee',
                  borderRadius: '4px',
                  backgroundColor: '#f9f9f9',
                }}>
                <Link
                  to={'/items/' + item.id}
                  style={{
                    textDecoration: 'none',
                    color: '#007bff',
                    fontWeight: 'bold',
                    display: 'block',
                    marginBottom: '5px',
                  }}>
                  {item.name}
                </Link>
                <div style={{ fontSize: '14px', color: '#666' }}>
                  Category: {item.category} | Price: ${item.price}
                </div>
              </li>
            ))}
          </ul>

          {/* Pagination for standard view */}
          {renderPagination()}
        </>
      )}
    </div>
  );
}

export default Items;
