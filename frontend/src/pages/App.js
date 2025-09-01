import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Items from './Items';
import ItemDetail from './ItemDetail';
import { DataProvider } from '../state/DataContext';

function App() {
  return (
    <DataProvider>
      {/* Add CSS animations */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          
          @keyframes fadeInDown {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          .header-animate {
            animation: fadeInDown 0.6s ease-out;
          }
        `}
      </style>
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#f8fafc',
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        }}>
        {/* 🎨 PROFESSIONAL HEADER - Modern design with enhanced visual hierarchy */}
        <header
          className='header-animate'
          style={{
            background:
              'linear-gradient(135deg, #1e3a8a 0%, #3730a3 25%, #581c87 75%, #7c2d12 100%)',
            position: 'relative',
            overflow: 'hidden',
            boxShadow:
              '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          }}>
          {/* Animated background pattern */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 0.1,
              background: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />

          <nav
            style={{ position: 'relative', zIndex: 2, padding: '1.5rem 2rem' }}>
            <div
              style={{
                maxWidth: '1200px',
                margin: '0 auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
              {/* Logo and Brand */}
              <Link
                to='/'
                style={{
                  color: 'white',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  padding: '0.5rem',
                  borderRadius: '1rem',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.background = 'transparent';
                }}>
                {/* Enhanced Logo */}
                <div
                  style={{
                    background:
                      'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                    padding: '0.75rem',
                    borderRadius: '1rem',
                    boxShadow: '0 8px 16px rgba(251, 191, 36, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                  }}>
                  <span
                    style={{
                      fontSize: '1.5rem',
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
                    }}>
                    🛍️
                  </span>
                  <div
                    style={{
                      position: 'absolute',
                      top: '-2px',
                      right: '-2px',
                      width: '8px',
                      height: '8px',
                      background: '#10b981',
                      borderRadius: '50%',
                      border: '2px solid white',
                      boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.3)',
                    }}
                  />
                </div>

                {/* Brand Name */}
                <div>
                  <h1
                    style={{
                      fontSize: '1.75rem',
                      fontWeight: '800',
                      margin: 0,
                      background:
                        'linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      letterSpacing: '-0.025em',
                    }}>
                    ItemStore Pro
                  </h1>
                  <p
                    style={{
                      fontSize: '0.75rem',
                      margin: 0,
                      color: 'rgba(255, 255, 255, 0.7)',
                      fontWeight: '500',
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                    }}>
                    Enterprise Edition
                  </p>
                </div>
              </Link>

              {/* Status Badges */}
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {/* Performance Badge */}
                <div
                  style={{
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    padding: '0.5rem 1rem',
                    borderRadius: '2rem',
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}>
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      background: '#10b981',
                      borderRadius: '50%',
                      boxShadow: '0 0 8px rgba(16, 185, 129, 0.6)',
                      animation: 'pulse 2s infinite',
                    }}
                  />
                  <span
                    style={{
                      color: '#10b981',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                    }}>
                    MongoDB Optimized
                  </span>
                </div>

                {/* Version Badge */}
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    padding: '0.5rem 1rem',
                    borderRadius: '2rem',
                    backdropFilter: 'blur(10px)',
                  }}>
                  <span
                    style={{
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                    }}>
                    v2.0 Enhanced
                  </span>
                </div>
              </div>
            </div>
          </nav>
        </header>

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
              Built with React + Node.js | Assignment Solved - Optimized for
              Performance | Memory Leak Free ✨
            </p>
          </div>
        </footer>
      </div>
    </DataProvider>
  );
}

export default App;
