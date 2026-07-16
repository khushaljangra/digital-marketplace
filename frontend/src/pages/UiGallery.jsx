import React, { useState } from 'react';
import { Search, Copy, Check, ExternalLink, Sparkles, Code2, Play } from 'lucide-react';
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

  return (
    <div style={{ padding: '40px 0', minHeight: '80vh' }} className="container animate-fade-in">
      {/* Header Banner */}
      <div style={{
        textAlign: 'center',
        marginBottom: '40px',
        padding: '30px',
        borderRadius: '16px',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%)',
        border: '1px solid var(--border)'
      }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: 600, fontSize: '14px', marginBottom: '8px', textTransform: 'uppercase' }}>
          <Sparkles size={16} /> Uiverse UI Gallery
        </div>
        <h1 style={{ fontSize: '32px', fontWeight: 800, margin: '0 0 12px 0', fontFamily: 'var(--font-heading)' }}>
          Community UI Components
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto', fontSize: '15px' }}>
          Interactive open-source custom UI design assets. Grab HTML and CSS templates and drop them directly into your personal web projects.
        </p>
      </div>

      {/* Filters & Search Header */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '16px',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '30px',
        borderBottom: '1px solid var(--border)',
        paddingBottom: '20px'
      }}>
        {/* Category Tabs */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', maxWidth: '100%' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setVisibleCount(12);
              }}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid',
                borderColor: selectedCategory === cat ? 'var(--primary)' : 'var(--border)',
                background: selectedCategory === cat ? 'var(--primary)' : 'var(--bg-secondary)',
                color: selectedCategory === cat ? 'white' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Field */}
        <div style={{ position: 'relative', width: '300px' }}>
          <input
            type="text"
            placeholder="Search UI components..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setVisibleCount(12);
            }}
            style={{
              width: '100%',
              padding: '10px 16px 10px 40px',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              fontSize: '14px',
              outline: 'none'
            }}
          />
          <Search size={16} style={{ position: 'absolute', left: '14px', top: '12px', color: 'var(--text-secondary)' }} />
        </div>
      </div>

      {/* Grid of Components */}
      {displayedComponents.length > 0 ? (
        <div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
            gap: '24px'
          }}>
            {displayedComponents.map(comp => {
              const currentTab = getActiveTab(comp.id);
              return (
                <div key={comp.id} className="card" style={{
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '420px',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  background: 'var(--bg-secondary)'
                }}>
                  {/* Card Title Header */}
                  <div style={{
                    padding: '16px',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <h3 style={{ margin: '0 0 2px 0', fontSize: '15px', fontWeight: 700, maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={comp.name}>{comp.name}</h3>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{
                          background: 'var(--bg-tertiary)',
                          color: 'var(--primary)',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 600
                        }}>{comp.category}</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>by {comp.author}</span>
                      </div>
                    </div>

                    {/* Navigation Tab Buttons */}
                    <div style={{ display: 'flex', background: 'var(--bg-tertiary)', padding: '3px', borderRadius: '6px' }}>
                      <button
                        onClick={() => setTab(comp.id, 'preview')}
                        style={{
                          padding: '5px 10px',
                          fontSize: '12px',
                          fontWeight: 600,
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          background: currentTab === 'preview' ? 'var(--bg-primary)' : 'transparent',
                          color: currentTab === 'preview' ? 'var(--text-primary)' : 'var(--text-secondary)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Play size={12} /> Live
                      </button>
                      <button
                        onClick={() => setTab(comp.id, 'html')}
                        style={{
                          padding: '5px 10px',
                          fontSize: '12px',
                          fontWeight: 600,
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          background: currentTab === 'html' ? 'var(--bg-primary)' : 'transparent',
                          color: currentTab === 'html' ? 'var(--text-primary)' : 'var(--text-secondary)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Code2 size={12} /> HTML
                      </button>
                      <button
                        onClick={() => setTab(comp.id, 'css')}
                        style={{
                          padding: '5px 10px',
                          fontSize: '12px',
                          fontWeight: 600,
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          background: currentTab === 'css' ? 'var(--bg-primary)' : 'transparent',
                          color: currentTab === 'css' ? 'var(--text-primary)' : 'var(--text-secondary)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Code2 size={12} /> CSS
                      </button>
                    </div>
                  </div>

                  {/* Tab Contents Frame */}
                  <div style={{ flexGrow: 1, position: 'relative', background: '#0f172a' }}>
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
                          padding: '16px',
                          overflow: 'auto',
                          color: '#94a3b8',
                          fontFamily: 'monospace',
                          fontSize: '12px',
                          flexGrow: 1
                        }}>
                          <code>{comp.html}</code>
                        </pre>
                        <button
                          onClick={() => copyToClipboard(comp.html, comp.id, 'html')}
                          style={{
                            position: 'absolute',
                            bottom: '12px',
                            right: '12px',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            border: '1px solid #334155',
                            background: '#1e293b',
                            color: 'white',
                            fontSize: '11px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.2)'
                          }}
                        >
                          {copiedId === `${comp.id}-html` ? (
                            <><Check size={12} style={{ color: '#10b981' }} /> Copied!</>
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
                          padding: '16px',
                          overflow: 'auto',
                          color: '#38bdf8',
                          fontFamily: 'monospace',
                          fontSize: '12px',
                          flexGrow: 1
                        }}>
                          <code>{comp.css}</code>
                        </pre>
                        <button
                          onClick={() => copyToClipboard(comp.css, comp.id, 'css')}
                          style={{
                            position: 'absolute',
                            bottom: '12px',
                            right: '12px',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            border: '1px solid #334155',
                            background: '#1e293b',
                            color: 'white',
                            fontSize: '11px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.2)'
                          }}
                        >
                          {copiedId === `${comp.id}-css` ? (
                            <><Check size={12} style={{ color: '#10b981' }} /> Copied!</>
                          ) : (
                            <><Copy size={12} /> Copy CSS</>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Load More Button */}
          {filteredComponents.length > visibleCount && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
              <button
                onClick={() => setVisibleCount(prev => prev + 12)}
                style={{
                  padding: '12px 28px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  outline: 'none',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
                }}
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
          borderRadius: '12px',
          color: 'var(--text-secondary)'
        }}>
          <p style={{ margin: '0 0 8px 0', fontWeight: 600 }}>No components found</p>
          <p style={{ margin: 0, fontSize: '13px' }}>Try adjusting your search filters or browse another category.</p>
        </div>
      )}
    </div>
  );
};

export default UiGallery;
