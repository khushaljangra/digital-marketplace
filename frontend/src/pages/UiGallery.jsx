import React, { useState } from 'react';
import { Search, Copy, Check, Sparkles, Code2, Play } from 'lucide-react';
import UI_COMPONENTS from '../utils/uiComponents.json';

const UiGallery = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeTab, setActiveTab] = useState({}); // Stores state { [compId]: 'preview' | 'html' | 'css' }
  const [copiedId, setCopiedId] = useState(null); // Stores copied component ID for checkout toast
  const [visibleCount, setVisibleCount] = useState(12);

  const categories = [
    'All',
    'Loaders',
    'Buttons',
    'Cards',
    'Inputs',
    'Switches',
    'Checkboxes',
    'Radio Buttons',
    'Forms',
    'Tooltips',
    'Notifications',
    'Patterns'
  ];

  const filteredComponents = UI_COMPONENTS.filter(comp => {
    const matchesSearch = comp.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || comp.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const displayedComponents = filteredComponents.slice(0, visibleCount);

  const getIframeSrcDoc = (html, css) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background-color: #0f172a;
            overflow: hidden;
          }
          ${css}
        </style>
      </head>
      <body>
        ${html}
      </body>
      </html>
    `;
  };

  const copyToClipboard = (text, id, type) => {
    navigator.clipboard.writeText(text);
    setCopiedId(`${id}-${type}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getActiveTab = (compId) => activeTab[compId] || 'preview';

  const setTab = (compId, tab) => {
    setActiveTab(prev => ({ ...prev, [compId]: tab }));
  };

  // 3D Tilt mouse move tracker
  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Calculate rotation angles (max 8 degrees for smooth tilt)
    const rotateX = ((centerY - y) / centerY) * 8;
    const rotateY = ((x - centerX) / centerX) * 8;
    
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    card.style.boxShadow = `0 12px 24px rgba(0, 0, 0, 0.3), 0 0 15px rgba(99, 102, 241, 0.15)`;
    
    // Update border neon glow position
    const glow = card.querySelector('.3d-glow');
    if (glow) {
      glow.style.opacity = '1';
      glow.style.background = `radial-gradient(circle 100px at ${x}px ${y}px, rgba(99, 102, 241, 0.18), transparent)`;
    }
  };

  // Reset 3D Tilt on mouse leave
  const handleMouseLeave = (e) => {
    const card = e.currentTarget;
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    card.style.boxShadow = 'none';
    
    const glow = card.querySelector('.3d-glow');
    if (glow) {
      glow.style.opacity = '0';
    }
  };

  return (
    <div style={{ padding: '40px 0', minHeight: '80vh' }} className="container animate-fade-in">
      {/* Header Banner */}
      <div style={{
        textAlign: 'center',
        marginBottom: '45px',
        padding: '40px 30px',
        borderRadius: '20px',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(168, 85, 247, 0.08) 100%)',
        border: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
      }}>
        <div style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '8px', 
          color: '#818cf8', 
          fontWeight: 700, 
          fontSize: '13px', 
          marginBottom: '12px', 
          textTransform: 'uppercase',
          letterSpacing: '1px',
          background: 'rgba(99, 102, 241, 0.1)',
          padding: '6px 12px',
          borderRadius: '50px'
        }}>
          <Sparkles size={14} className="animate-pulse" /> 3D UI Arena
        </div>
        <h1 style={{ fontSize: '36px', fontWeight: 900, margin: '0 0 12px 0', fontFamily: 'var(--font-heading)', background: 'linear-gradient(to right, #ffffff, #a5b4fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Smooth 3D UI components
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '620px', margin: '0 auto', fontSize: '15px', lineHeight: 1.6 }}>
          Experience butter-smooth interactive components built with pure CSS & Tailwind. Click on code tabs, inspect, copy and drop directly into your personal workspace!
        </p>
      </div>

      {/* Filters & Search Header */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '16px',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '35px',
        borderBottom: '1px solid var(--border)',
        paddingBottom: '24px'
      }}>
        {/* Category Tabs */}
        <div style={{ 
          display: 'flex', 
          gap: '8px', 
          overflowX: 'auto', 
          paddingBottom: '6px', 
          maxWidth: '100%',
          scrollbarWidth: 'none'
        }} className="no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setVisibleCount(12);
              }}
              style={{
                padding: '10px 20px',
                borderRadius: '50px',
                border: '1px solid',
                borderColor: selectedCategory === cat ? 'var(--primary)' : 'var(--border)',
                background: selectedCategory === cat ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : 'var(--bg-secondary)',
                color: selectedCategory === cat ? 'white' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                whiteSpace: 'nowrap',
                boxShadow: selectedCategory === cat ? '0 4px 12px rgba(99, 102, 241, 0.3)' : 'none'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Field */}
        <div style={{ position: 'relative', width: '320px' }}>
          <input
            type="text"
            placeholder="Search custom layout elements..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setVisibleCount(12);
            }}
            style={{
              width: '100%',
              padding: '12px 16px 12px 42px',
              borderRadius: '50px',
              border: '1px solid var(--border)',
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              fontSize: '14px',
              outline: 'none',
              transition: 'all 0.3s ease'
            }}
            className="search-input-field"
          />
          <Search size={16} style={{ position: 'absolute', left: '16px', top: '14px', color: 'var(--text-secondary)' }} />
        </div>
      </div>

      {/* Grid of Components */}
      {displayedComponents.length > 0 ? (
        <div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
            gap: '28px'
          }}>
            {displayedComponents.map(comp => {
              const currentTab = getActiveTab(comp.id);
              return (
                <div 
                  key={comp.id} 
                  className="card 3d-tilt-card" 
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                  style={{
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '420px',
                    border: '1px solid var(--border)',
                    borderRadius: '16px',
                    background: 'var(--bg-secondary)',
                    position: 'relative',
                    transition: 'transform 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.15s ease',
                    transformStyle: 'preserve-3d',
                    transform: 'perspective(1000px)'
                  }}
                >
                  {/* Neon Glow Hover Border (Radial Background Gradient) */}
                  <div 
                    className="3d-glow" 
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      pointerEvents: 'none',
                      opacity: 0,
                      transition: 'opacity 0.25s ease',
                      zIndex: 10
                    }}
                  />

                  {/* 3D Depth Wrapper Content */}
                  <div style={{ 
                    transform: 'translateZ(25px)', 
                    transformStyle: 'preserve-3d', 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column' 
                  }}>
                    
                    {/* Card Header */}
                    <div style={{
                      padding: '18px 20px',
                      borderBottom: '1px solid var(--border)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: 'rgba(255,255,255,0.01)'
                    }}>
                      <div>
                        <h3 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 700, maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={comp.name}>{comp.name}</h3>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <span style={{
                            background: 'rgba(99, 102, 241, 0.08)',
                            color: '#818cf8',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 600
                          }}>{comp.category}</span>
                          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>by {comp.author}</span>
                        </div>
                      </div>

                      {/* Tab buttons switcher */}
                      <div style={{ display: 'flex', background: 'var(--bg-tertiary)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                        <button
                          onClick={() => setTab(comp.id, 'preview')}
                          style={{
                            padding: '6px 12px',
                            fontSize: '11px',
                            fontWeight: 700,
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            background: currentTab === 'preview' ? 'var(--bg-primary)' : 'transparent',
                            color: currentTab === 'preview' ? 'var(--text-primary)' : 'var(--text-secondary)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <Play size={11} /> Preview
                        </button>
                        <button
                          onClick={() => setTab(comp.id, 'html')}
                          style={{
                            padding: '6px 12px',
                            fontSize: '11px',
                            fontWeight: 700,
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            background: currentTab === 'html' ? 'var(--bg-primary)' : 'transparent',
                            color: currentTab === 'html' ? 'var(--text-primary)' : 'var(--text-secondary)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <Code2 size={11} /> HTML
                        </button>
                        <button
                          onClick={() => setTab(comp.id, 'css')}
                          style={{
                            padding: '6px 12px',
                            fontSize: '11px',
                            fontWeight: 700,
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            background: currentTab === 'css' ? 'var(--bg-primary)' : 'transparent',
                            color: currentTab === 'css' ? 'var(--text-primary)' : 'var(--text-secondary)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <Code2 size={11} /> CSS
                        </button>
                      </div>
                    </div>

                    {/* Content Display Frame */}
                    <div style={{ flexGrow: 1, position: 'relative', background: '#090d16', overflow: 'hidden' }}>
                      {/* Live Render Preview */}
                      {currentTab === 'preview' && (
                        <iframe
                          srcDoc={getIframeSrcDoc(comp.html, comp.css)}
                          style={{
                            width: '100%',
                            height: '100%',
                            border: 'none',
                            display: 'block'
                          }}
                          title={comp.name}
                          sandbox="allow-scripts"
                        />
                      )}

                      {/* HTML Source View */}
                      {currentTab === 'html' && (
                        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                          <pre style={{
                            margin: 0,
                            padding: '18px',
                            overflow: 'auto',
                            color: '#94a3b8',
                            fontFamily: 'monospace',
                            fontSize: '12px',
                            flexGrow: 1,
                            lineHeight: 1.5
                          }} className="custom-scrollbar">
                            <code>{comp.html}</code>
                          </pre>
                          <button
                            onClick={() => copyToClipboard(comp.html, comp.id, 'html')}
                            style={{
                              position: 'absolute',
                              bottom: '14px',
                              right: '14px',
                              padding: '8px 14px',
                              borderRadius: '8px',
                              border: '1px solid #334155',
                              background: '#1e293b',
                              color: 'white',
                              fontSize: '12px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                              transition: 'all 0.2s ease'
                            }}
                            className="copy-btn-action"
                          >
                            {copiedId === `${comp.id}-html` ? (
                              <><Check size={12} style={{ color: '#10b981' }} /> Copied</>
                            ) : (
                              <><Copy size={12} /> Copy HTML</>
                            )}
                          </button>
                        </div>
                      )}

                      {/* CSS Source View */}
                      {currentTab === 'css' && (
                        <div style={{ height: '100%', position: 'relative', display: 'flex', flexDirection: 'column' }}>
                          <pre style={{
                            margin: 0,
                            padding: '18px',
                            overflow: 'auto',
                            color: '#818cf8',
                            fontFamily: 'monospace',
                            fontSize: '12px',
                            flexGrow: 1,
                            lineHeight: 1.5
                          }} className="custom-scrollbar">
                            <code>{comp.css}</code>
                          </pre>
                          <button
                            onClick={() => copyToClipboard(comp.css, comp.id, 'css')}
                            style={{
                              position: 'absolute',
                              bottom: '14px',
                              right: '14px',
                              padding: '8px 14px',
                              borderRadius: '8px',
                              border: '1px solid #334155',
                              background: '#1e293b',
                              color: 'white',
                              fontSize: '12px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                              transition: 'all 0.2s ease'
                            }}
                            className="copy-btn-action"
                          >
                            {copiedId === `${comp.id}-css` ? (
                              <><Check size={12} style={{ color: '#10b981' }} /> Copied</>
                            ) : (
                              <><Copy size={12} /> Copy CSS</>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Load More Button */}
          {filteredComponents.length > visibleCount && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '45px' }}>
              <button
                onClick={() => setVisibleCount(prev => prev + 12)}
                style={{
                  padding: '14px 32px',
                  borderRadius: '50px',
                  border: '1px solid var(--border)',
                  background: 'linear-gradient(180deg, var(--bg-secondary), var(--bg-tertiary))',
                  color: 'var(--text-primary)',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  outline: 'none',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                }}
                className="load-more-btn"
              >
                Load More Components ({filteredComponents.length - visibleCount} remaining)
              </button>
            </div>
          )}
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '60px 0',
          border: '1px dashed var(--border)',
          borderRadius: '16px',
          color: 'var(--text-secondary)',
          background: 'var(--bg-secondary)'
        }}>
          <p style={{ margin: '0 0 8px 0', fontWeight: 600 }}>No components found</p>
          <p style={{ margin: 0, fontSize: '13px' }}>Try adjusting your search filters or browse another category.</p>
        </div>
      )}
    </div>
  );
};

export default UiGallery;
