import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Items from './Items';
import ItemDetail from './ItemDetail';
import { DataProvider } from '../state/DataContext';

function App() {
  return (
    <DataProvider>
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#f8fafc',
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        }}>
        {/* 🎨 MODERN NAVIGATION - Beautiful header with gradient */}
        <nav
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '1rem 2rem',
            boxShadow:
              '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          }}>
          <div
            style={{
              maxWidth: '1200px',
              margin: '0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <Link
              to='/'
              style={{
                color: 'white',
                textDecoration: 'none',
                fontSize: '1.5rem',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => (e.target.style.transform = 'scale(1.05)')}
              onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}>
              <span
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  padding: '0.5rem',
                  borderRadius: '0.5rem',
                  backdropFilter: 'blur(10px)',
                }}>
                🛍️
              </span>
              ItemStore Pro
            </Link>

            <div
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                padding: '0.5rem 1rem',
                borderRadius: '2rem',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}>
              <span
                style={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                }}>
                ✨ Optimized for Performance
              </span>
            </div>
          </div>
        </nav>

        {/* 🌟 MAIN CONTENT AREA */}
        <main
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 1rem',
          }}>
          <Routes>
            <Route path='/' element={<Items />} />
            <Route path='/items/:id' element={<ItemDetail />} />
          </Routes>
        </main>

        {/* 🎯 FOOTER */}
        <footer
          style={{
            marginTop: '4rem',
            padding: '2rem',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            textAlign: 'center',
          }}>
          <div
            style={{
              maxWidth: '1200px',
              margin: '0 auto',
            }}>
            <p
              style={{
                margin: '0',
                opacity: '0.9',
                fontSize: '0.875rem',
              }}>
              🚀 Built with React + Node.js | Optimized for Performance | Memory
              Leak Free ✨
            </p>
          </div>
        </footer>
      </div>
    </DataProvider>
  );
}

export default App;
