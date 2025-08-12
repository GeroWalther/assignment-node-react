import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

function ItemDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const isMountedRef = useRef(true);

  useEffect(() => {
    const abortController = new AbortController();
    
    const fetchItem = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/items/${id}`, {
          signal: abortController.signal
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const itemData = await response.json();
        
        if (isMountedRef.current) {
          setItem(itemData);
        }
      } catch (err) {
        if (isMountedRef.current && err.name !== 'AbortError') {
          setError(err.message);
          console.error('Failed to fetch item:', err);
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    };

    fetchItem();

    return () => {
      isMountedRef.current = false;
      abortController.abort();
    };
  }, [id]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // 🎨 BEAUTIFUL LOADING STATE
  if (loading) {
    return (
      <div style={{
        padding: '2rem 0',
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          textAlign: 'center',
          background: 'white',
          padding: '3rem',
          borderRadius: '1rem',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
          border: '1px solid #f1f5f9',
          maxWidth: '400px',
          width: '100%'
        }}>
          <div style={{
            width: '3rem',
            height: '3rem',
            border: '4px solid #f3f4f6',
            borderTop: '4px solid #667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1.5rem auto'
          }}></div>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#374151',
            margin: '0 0 0.5rem 0'
          }}>
            Loading Item Details
          </h3>
          <p style={{
            color: '#6b7280',
            margin: '0',
            fontSize: '0.875rem'
          }}>
            Please wait while we fetch the information...
          </p>
        </div>
      </div>
    );
  }

  // 🚨 ERROR STATE
  if (error || !item) {
    return (
      <div style={{
        padding: '2rem 0',
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          textAlign: 'center',
          background: 'white',
          padding: '3rem',
          borderRadius: '1rem',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
          border: '2px solid #fecaca',
          maxWidth: '500px',
          width: '100%'
        }}>
          <div style={{
            fontSize: '4rem',
            marginBottom: '1rem'
          }}>
            😕
          </div>
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            color: '#dc2626',
            margin: '0 0 0.75rem 0'
          }}>
            Item Not Found
          </h3>
          <p style={{
            color: '#6b7280',
            margin: '0 0 2rem 0',
            fontSize: '1rem'
          }}>
            {error || 'The item you\'re looking for doesn\'t exist or has been removed.'}
          </p>
          <Link
            to="/"
            style={{
              display: 'inline-block',
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '0.75rem',
              fontWeight: '600',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            ← Back to Items
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem 0', minHeight: '60vh' }}>
      {/* 🔙 BACK NAVIGATION */}
      <div style={{ marginBottom: '2rem' }}>
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#667eea',
            textDecoration: 'none',
            fontSize: '0.875rem',
            fontWeight: '500',
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            transition: 'all 0.2s ease',
            background: 'rgba(102, 126, 234, 0.1)'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(102, 126, 234, 0.2)';
            e.target.style.transform = 'translateX(-4px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(102, 126, 234, 0.1)';
            e.target.style.transform = 'translateX(0)';
          }}
        >
          <span>←</span>
          Back to Items
        </Link>
      </div>

      {/* 🎨 BEAUTIFUL ITEM CARD */}
      <div style={{
        background: 'white',
        borderRadius: '1.5rem',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        border: '1px solid #f1f5f9',
        overflow: 'hidden',
        animation: 'fadeInUp 0.6s ease forwards'
      }}>
        {/* Card Header with Gradient */}
        <div style={{
          background: `linear-gradient(135deg, hsl(${(item.id * 137.5) % 360}, 70%, 60%) 0%, hsl(${(item.id * 137.5 + 60) % 360}, 70%, 70%) 100%)`,
          padding: '3rem 2rem',
          position: 'relative',
          overflow: 'hidden',
          textAlign: 'center'
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
              display: 'inline-block',
              background: 'rgba(255, 255, 255, 0.2)',
              padding: '1rem',
              borderRadius: '1rem',
              fontSize: '3rem',
              marginBottom: '1rem',
              backdropFilter: 'blur(10px)'
            }}>
              {item.category === 'Electronics' ? '💻' : 
               item.category === 'Clothing' ? '👕' : 
               item.category === 'Books' ? '📚' : 
               item.category === 'Sports' ? '⚽' : '🛍️'}
            </div>
            
            <div style={{
              display: 'inline-block',
              background: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '2rem',
              fontSize: '0.875rem',
              fontWeight: '600',
              backdropFilter: 'blur(10px)',
              marginBottom: '0.5rem'
            }}>
              {item.category}
            </div>
          </div>
        </div>

        {/* Card Content */}
        <div style={{ padding: '3rem 2rem' }}>
          <div style={{
            textAlign: 'center',
            marginBottom: '3rem'
          }}>
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: '800',
              color: '#1f2937',
              margin: '0 0 1rem 0',
              lineHeight: '1.2'
            }}>
              {item.name}
            </h1>
            
            <div style={{
              fontSize: '3rem',
              fontWeight: '900',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              margin: '2rem 0'
            }}>
              <span style={{ fontSize: '1.5rem', opacity: '0.8' }}>$</span>
              {item.price.toLocaleString()}
            </div>
          </div>

          {/* Feature Highlights */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem',
            marginTop: '3rem'
          }}>
            <div style={{
              background: '#f8fafc',
              padding: '1.5rem',
              borderRadius: '1rem',
              border: '2px solid #e2e8f0',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '2rem',
                marginBottom: '0.75rem'
              }}>
                🚚
              </div>
              <h4 style={{
                fontSize: '1rem',
                fontWeight: '600',
                color: '#374151',
                margin: '0 0 0.5rem 0'
              }}>
                Free Shipping
              </h4>
              <p style={{
                fontSize: '0.875rem',
                color: '#6b7280',
                margin: '0'
              }}>
                Fast & reliable delivery
              </p>
            </div>

            <div style={{
              background: '#f8fafc',
              padding: '1.5rem',
              borderRadius: '1rem',
              border: '2px solid #e2e8f0',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '2rem',
                marginBottom: '0.75rem'
              }}>
                🛡️
              </div>
              <h4 style={{
                fontSize: '1rem',
                fontWeight: '600',
                color: '#374151',
                margin: '0 0 0.5rem 0'
              }}>
                Quality Guaranteed
              </h4>
              <p style={{
                fontSize: '0.875rem',
                color: '#6b7280',
                margin: '0'
              }}>
                30-day return policy
              </p>
            </div>

            <div style={{
              background: '#f8fafc',
              padding: '1.5rem',
              borderRadius: '1rem',
              border: '2px solid #e2e8f0',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '2rem',
                marginBottom: '0.75rem'
              }}>
                ⭐
              </div>
              <h4 style={{
                fontSize: '1rem',
                fontWeight: '600',
                color: '#374151',
                margin: '0 0 0.5rem 0'
              }}>
                Top Rated
              </h4>
              <p style={{
                fontSize: '0.875rem',
                color: '#6b7280',
                margin: '0'
              }}>
                Customer favorite
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            marginTop: '3rem',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button
              style={{
                padding: '1rem 2rem',
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '0.75rem',
                fontSize: '1rem',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 20px rgba(5, 150, 105, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(5, 150, 105, 0.3)';
              }}
            >
              🛒 Add to Cart
            </button>
            
            <button
              style={{
                padding: '1rem 2rem',
                background: 'white',
                color: '#374151',
                border: '2px solid #e5e7eb',
                borderRadius: '0.75rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.color = '#667eea';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.color = '#374151';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              ❤️ Add to Wishlist
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ItemDetail;