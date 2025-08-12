import React, { createContext, useCallback, useContext, useState } from 'react';

const DataContext = createContext();

export function DataProvider({ children }) {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 10,
    hasNext: false,
    hasPrev: false,
  });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  //  CONTEXT PERFORMANCE OPTIMIZATION - Why useCallback is Critical Here:
  //
  // Context Provider Performance:
  // - All components consuming this context re-render when context value changes
  // - Without useCallback, fetchItems recreates on every render
  // - New function reference causes ALL consumers to re-render
  // - With useCallback, stable reference prevents unnecessary re-renders
  //
  // Memory Leak Prevention:
  // - Accepts AbortSignal parameter for request cancellation
  // - Prevents state updates on unmounted components
  // - Essential for components that fetch data and might unmount quickly
  const fetchItems = useCallback(async (abortSignal, options = {}) => {
    const { page = 1, limit = 10, search = '' } = options;

    setLoading(true);

    try {
      //  NETWORK OPTIMIZATION - URLSearchParams for clean query building
      // - Handles URL encoding automatically
      // - Prevents manual string concatenation errors
      // - More maintainable than template literals
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (search.trim()) {
        params.append('q', search.trim());
      }

      //  ABORT SIGNAL INTEGRATION - Request cancellation support
      // - Pass abort signal to fetch for browser-level cancellation
      // - Prevents memory leaks from dangling promises
      // - Improves app performance by cancelling unnecessary requests
      const res = await fetch(`http://localhost:4001/api/items?${params}`, {
        signal: abortSignal, // CRITICAL: Enables request cancellation
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const json = await res.json();

      //  ABORT PROTECTION - Only update state if request wasn't cancelled
      // This prevents the classic "Can't perform a React state update on unmounted component" warning
      if (!abortSignal?.aborted) {
        // 🔄 BACKWARD COMPATIBILITY - Handle both API response formats
        // This allows gradual migration and prevents breaking changes
        if (json.items && json.pagination) {
          // New paginated format - preferred for performance
          setItems(json.items);
          setPagination(json.pagination);
        } else {
          // Old format (array of items) - fallback for compatibility
          setItems(Array.isArray(json) ? json : []);
          setPagination({
            total: Array.isArray(json) ? json.length : 0,
            totalPages: 1,
            currentPage: 1,
            limit: Array.isArray(json) ? json.length : 0,
            hasNext: false,
            hasPrev: false,
          });
        }
      }
    } catch (error) {
      // 🛡️ ERROR HANDLING - Only handle errors if request wasn't aborted
      if (!abortSignal?.aborted) {
        console.error('Failed to fetch items:', error);
        // Set empty state on error - prevents broken UI states
        setItems([]);
        setPagination({
          total: 0,
          totalPages: 0,
          currentPage: 1,
          limit: 10,
          hasNext: false,
          hasPrev: false,
        });
      }
    } finally {
      // 🧹 CLEANUP - Always reset loading state (unless aborted)
      if (!abortSignal?.aborted) {
        setLoading(false);
      }
    }
  }, []); // Empty dependencies - function is stable across renders

  // Helper function for search
  const searchItems = useCallback((query) => {
    setSearchQuery(query);
  }, []);

  const value = {
    items,
    pagination,
    loading,
    searchQuery,
    fetchItems,
    searchItems,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export const useData = () => useContext(DataContext);
