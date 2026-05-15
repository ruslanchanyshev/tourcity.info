import React, { useState } from 'react';
import { Search, Plus, X } from 'lucide-react';

// Category color map — matches the CSS classes and mobile app design
const CAT_COLORS = {
  beach:         '#d4a117',
  restaurant:    '#cc5633',
  cafe:          '#a67a4d',
  sight:         '#0076d6',
  fastfood:      '#e26a2c',
  hotel:         '#8ca6bf',
  temple:        '#bf4d4d',
  museum:        '#9980a6',
  shopping:      '#d98c66',
  nightlife:     '#805999',
  nature:        '#669959',
  entertainment: '#e6a626',
  transport:     '#8099a6',
  medical:       '#cc4d4d',
  service:       '#8c8c80',
};

const CAT_LABELS = {
  beach:         'Пляж',
  restaurant:    'Ресторан',
  cafe:          'Кафе',
  sight:         'Достопримечательность',
  fastfood:      'Фастфуд',
  hotel:         'Отель',
  temple:        'Храм',
  museum:        'Музей',
  shopping:      'Шопинг',
  nightlife:     'Ночная жизнь',
  nature:        'Природа',
  entertainment: 'Развлечения',
  transport:     'Транспорт',
  medical:       'Медицина',
  service:       'Сервис',
};

export default function PoiList({
  pois, loading, selectedPoi, totalPoisCount,
  availableCategories, activeCategories, onToggleCategory,
  onPoiClick, onNewPoi, globalFilter, setGlobalFilter, drafts = {}
}) {
  const [showFilter, setShowFilter] = useState(false);

  const hasActiveFilter = activeCategories.length > 0;

  return (
    <div className="animate-fade" style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden' }}>
      {/* ── SEARCH & FILTER ── */}
      <div style={{ padding: '0 32px 32px 32px' }}>
        <div style={{ display:'flex', gap:8 }}>
          <div style={{ position:'relative', flex: 1 }}>
            <Search style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)', pointerEvents:'none' }} size={16} />
            <input
              type="text"
              placeholder="Поиск по названию или ID..."
              className="premium-input"
              style={{ paddingLeft: 44 }}
              value={globalFilter}
              onChange={e => setGlobalFilter(e.target.value)}
            />
          </div>

          {/* Filter toggle button */}
          <button
            onClick={() => setShowFilter(v => !v)}
            title="Фильтр по категориям"
            style={{
              flexShrink: 0,
              width: 48, height: 48,
              borderRadius: 12,
              border: hasActiveFilter
                ? '1px solid rgba(212,161,23,0.5)'
                : '1px solid rgba(255,255,255,0.08)',
              background: hasActiveFilter
                ? 'rgba(212,161,23,0.12)'
                : 'rgba(0,0,0,0.3)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.25s',
              position: 'relative',
            }}
          >
            {/* Hamburger / filter icon */}
            <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
              <rect x="0" y="0" width="18" height="2.5" rx="1.25" fill={hasActiveFilter ? 'var(--accent-gold)' : 'var(--text-muted)'}/>
              <rect x="3" y="5.75" width="12" height="2.5" rx="1.25" fill={hasActiveFilter ? 'var(--accent-gold)' : 'var(--text-muted)'}/>
              <rect x="6" y="11.5" width="6" height="2.5" rx="1.25" fill={hasActiveFilter ? 'var(--accent-gold)' : 'var(--text-muted)'}/>
            </svg>
            {hasActiveFilter && (
              <div style={{
                position:'absolute', top:-4, right:-4,
                width:16, height:16,
                background:'var(--accent-gold)',
                borderRadius:'50%',
                fontSize:9, fontWeight:900, color:'#000',
                display:'flex', alignItems:'center', justifyContent:'center',
              }}>
                {activeCategories.length}
              </div>
            )}
          </button>
        </div>

        {/* ── CATEGORY FILTER PANEL ── */}
        {showFilter && (
          <div style={{
            marginTop: 12,
            padding: 12,
            background: 'rgba(0,0,0,0.4)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 16,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 6,
          }}>
            <div
              onClick={() => {
                // Clear all active filters by toggling each one off
                if (activeCategories.length > 0) {
                  activeCategories.slice().forEach(c => onToggleCategory(c));
                }
              }}
              style={{
                padding: '5px 12px',
                borderRadius: 100,
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s',
                background: hasActiveFilter ? 'transparent' : 'rgba(212,161,23,0.15)',
                color: hasActiveFilter ? 'var(--text-muted)' : 'var(--accent-gold)',
                border: hasActiveFilter ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(212,161,23,0.3)',
              }}
            >
              Все
            </div>

            {availableCategories.map(cat => {
              const isActive = activeCategories.includes(cat);
              const color = CAT_COLORS[cat] || '#888';
              // Count POIs in this category (from original pois — passed separately)
              const label = CAT_LABELS[cat] || cat;
              return (
                <div
                  key={cat}
                  onClick={() => onToggleCategory(cat)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: 100,
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    background: isActive ? `${color}22` : 'rgba(255,255,255,0.03)',
                    color: isActive ? color : 'var(--text-muted)',
                    border: isActive ? `1px solid ${color}55` : '1px solid rgba(255,255,255,0.06)',
                    boxShadow: isActive ? `0 0 12px ${color}22` : 'none',
                  }}
                >
                  {label}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── TABLE ── */}
      <div style={{ flex:1, overflowY:'auto', overflowX:'hidden' }}>
        {loading ? (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:80, color:'var(--text-muted)' }}>
            <div style={{ width:40, height:40, border:'2px solid var(--accent-gold)', borderTopColor:'transparent', borderRadius:'50%', marginBottom:20 }} className="animate-spin" />
            <span style={{ fontSize:10, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.2em', opacity:0.4 }}>Синхронизация...</span>
          </div>
        ) : (
          <table className="data-table" style={{ width:'100%' }}>
            <thead>
              <tr>
                <th className="table-cell" style={{ fontSize:10, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.2em', color:'var(--text-muted)', paddingTop:24 }}>Объект</th>
                <th className="table-cell" style={{ fontSize:10, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.2em', color:'var(--text-muted)', paddingTop:24, textAlign:'right', paddingRight:24 }}>Тип</th>
              </tr>
            </thead>
            <tbody>
              {pois.map((poi, idx) => {
                const isActive = selectedPoi?.id === poi.id;
                const color = CAT_COLORS[poi.category] || '#888';
                return (
                  <tr
                    key={poi.id || idx}
                    className="table-row"
                    style={{ background: isActive ? 'rgba(212,161,23,0.06)' : undefined }}
                    onClick={() => onPoiClick(poi)}
                  >
                    <td className="table-cell">
                      <div style={{ display:'grid', gridTemplateColumns:'3px 1fr', gap:16, alignItems:'center' }}>
                        <div style={{ height:28, borderRadius:4, background: color, opacity: isActive ? 1 : 0.6 }} />
                        <div style={{ minWidth:0 }}>
                          <div style={{ fontWeight:600, color:'var(--text-main)', marginBottom:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', fontSize:14, display:'flex', alignItems:'center', gap:6 }}>
                            {poi.name_ru || 'Без имени'}
                            {drafts[poi._rowIndex !== undefined ? poi._rowIndex : poi.id] && (
                              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-gold)' }} title="Есть несохраненные изменения" />
                            )}
                          </div>
                          <div style={{ fontSize:10, color:'var(--text-muted)', fontWeight:500, textTransform:'uppercase', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', letterSpacing:'0.05em' }}>
                            {poi.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell" style={{ textAlign:'right', paddingRight:24 }}>
                      <span className={`badge cat-${poi.category}`}>{poi.category}</span>
                    </td>
                  </tr>
                );
              })}

              {/* Add New Row */}
              <tr onClick={onNewPoi} className="table-row" style={{ opacity:0.5 }}>
                <td colSpan="2" className="table-cell" style={{ textAlign:'center', padding:'24px' }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.15em', color:'var(--accent-gold)' }}>
                    <Plus size={14}/> Добавить объект
                  </div>
                </td>
              </tr>

              {pois.length === 0 && !loading && (
                <tr>
                  <td colSpan="2" style={{ textAlign:'center', padding:'60px 24px', color:'var(--text-muted)', fontSize:14, fontStyle:'italic', opacity:0.4 }}>
                    Ничего не найдено
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
