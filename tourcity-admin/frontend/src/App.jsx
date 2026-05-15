import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PoiList from './components/PoiList';
import PoiEditor from './components/PoiEditor';
import ParsingZone from './components/ParsingZone';
import PartnerManager from './components/PartnerManager';
import ModerationZone from './components/ModerationZone';
import { Users, FileText, Smartphone, RefreshCw, X, ShieldCheck } from 'lucide-react';

const API_URL = 'http://localhost:3001/api';

function App() {
  const [pois, setPois] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState('');
  const [activeCategories, setActiveCategories] = useState([]); // multi-select
  const [selectedPoi, setSelectedPoi] = useState(null);
  const [mode, setMode] = useState('places'); // 'places' or 'services'
  
  // Drafts state for multi-card editing
  const [drafts, setDrafts] = useState({});
  const [savingAll, setSavingAll] = useState(false);
  const [activeOverlay, setActiveOverlay] = useState(null); // 'partners', 'moderation'
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    fetchPois();
  }, [mode]);

  const fetchPois = async () => {
    try {
      setLoading(true);
      setPois([]); // Clear old data immediately to avoid confusion
      const res = await axios.get(`${API_URL}/pois?mode=${mode}&t=${Date.now()}`);
      setPois(res.data);
      
      // Also fetch pending count
      const pRes = await axios.get(`${API_URL}/admin/partners/pending`);
      setPendingCount(pRes.data.length);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (updatedPoi) => {
    try {
      if (updatedPoi._rowIndex !== undefined) {
        await axios.patch(`${API_URL}/pois/${updatedPoi._rowIndex}?mode=${mode}`, updatedPoi);
      } else {
        await axios.post(`${API_URL}/pois?mode=${mode}`, updatedPoi);
      }
      
      // Clear this specific draft
      const draftKey = updatedPoi._rowIndex !== undefined ? updatedPoi._rowIndex : updatedPoi.id;
      setDrafts(prev => {
        const newDrafts = { ...prev };
        delete newDrafts[draftKey];
        return newDrafts;
      });
      
      setSelectedPoi(null);
      fetchPois();
    } catch (err) {
      alert('Ошибка при сохранении: ' + err.message);
    }
  };

  const handleDraftChange = (poi) => {
    const key = poi._rowIndex !== undefined ? poi._rowIndex : poi.id;
    setDrafts(prev => ({ ...prev, [key]: poi }));
  };

  const handleSaveAll = async () => {
    const keys = Object.keys(drafts);
    if (keys.length === 0) return;
    
    try {
      setSavingAll(true);
      for (const key of keys) {
        const updatedPoi = drafts[key];
        if (updatedPoi._rowIndex !== undefined) {
          await axios.patch(`${API_URL}/pois/${updatedPoi._rowIndex}?mode=${mode}`, updatedPoi);
        } else {
          await axios.post(`${API_URL}/pois?mode=${mode}`, updatedPoi);
        }
      }
      setDrafts({});
      setSelectedPoi(null);
      fetchPois();
    } catch (err) {
      alert('Ошибка при массовом сохранении: ' + err.message);
    } finally {
      setSavingAll(false);
    }
  };

  const toggleCategory = (cat) => {
    setActiveCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  // Derive unique categories from loaded data
  const availableCategories = [...new Set(pois.map(p => p.category).filter(Boolean))].sort();

  const filteredPois = pois.filter(poi => {
    const s = globalFilter.toLowerCase();
    const matchesText =
      (poi.name_ru || '').toLowerCase().includes(s) ||
      (poi.id || '').toLowerCase().includes(s) ||
      (poi.ext_5 || '').toLowerCase().includes(s) ||
      (poi.category || '').toLowerCase().includes(s);
    const matchesCategory =
      activeCategories.length === 0 || activeCategories.includes(poi.category);
    return matchesText && matchesCategory;
  });

  return (
    <div className="admin-layout animate-fade">
      <main className="main-content">
        <div className="list-section">
          {/* Header Area with Dynamic Title */}
          <div className="header-bar">
            <div>
              <p className="header-subtitle">{mode === 'places' ? 'Управление городом' : 'Частные мастера'}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <h1 className="header-title" style={{ marginBottom: 0 }}>{mode === 'places' ? 'Локации' : 'Услуги'}</h1>
                <div style={{ 
                  fontSize: '12px', 
                  fontWeight: 700, 
                  color: 'var(--accent-gold)', 
                  background: 'rgba(212,161,23,0.1)', 
                  padding: '4px 10px', 
                  borderRadius: '100px',
                  border: '1px solid rgba(212,161,23,0.2)'
                }}>
                  {pois.length} {mode === 'places' ? 'мест' : 'услуг'}
                </div>
              </div>
            </div>
            {Object.keys(drafts).length > 0 && (
              <button 
                onClick={handleSaveAll} 
                disabled={savingAll}
                style={{
                  background: 'var(--accent-gold)',
                  color: '#000',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: savingAll ? 'not-allowed' : 'pointer',
                  opacity: savingAll ? 0.7 : 1,
                  boxShadow: '0 4px 12px rgba(212,161,23,0.3)',
                  transition: 'all 0.2s'
                }}
              >
                {savingAll ? 'Сохранение...' : `Сохранить изменения (${Object.keys(drafts).length})`}
              </button>
            )}
            
            <div style={{ display: 'flex', gap: '12px', marginLeft: 'auto' }}>
              <button 
                onClick={() => setActiveOverlay(activeOverlay === 'moderation' ? null : 'moderation')}
                style={{
                  background: activeOverlay === 'moderation' ? 'var(--accent-gold)' : 'rgba(255,255,255,0.05)',
                  color: activeOverlay === 'moderation' ? '#000' : '#FFF',
                  border: '1px solid rgba(255,255,255,0.1)',
                  padding: '8px 16px',
                  borderRadius: '12px',
                  fontWeight: 600,
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  position: 'relative'
                }}
              >
                <ShieldCheck size={16} color={activeOverlay === 'moderation' ? "#000" : (pendingCount > 0 ? "var(--danger)" : "var(--accent-gold)")} /> 
                Модерация
                {pendingCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: -6,
                    right: -6,
                    background: 'var(--danger)',
                    color: 'white',
                    fontSize: '10px',
                    fontWeight: 900,
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 10px rgba(255,68,68,0.5)'
                  }}>
                    {pendingCount}
                  </span>
                )}
              </button>

              <button 
                onClick={() => setActiveOverlay(activeOverlay === 'partners' ? null : 'partners')}
                style={{
                  background: activeOverlay === 'partners' ? 'var(--accent-gold)' : 'rgba(255,255,255,0.05)',
                  color: activeOverlay === 'partners' ? '#000' : '#FFF',
                  border: '1px solid rgba(255,255,255,0.1)',
                  padding: '8px 16px',
                  borderRadius: '12px',
                  fontWeight: 600,
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer'
                }}
              >
                <Users size={16} color={activeOverlay === 'partners' ? "#000" : "var(--accent-gold)"} /> Управление партнерами
              </button>
            </div>
          </div>

          {/* New Premium Mode Switcher */}
          <div className="mode-switcher" data-mode={mode}>
            <div className="mode-indicator"></div>
            <button 
              onClick={() => { setMode('places'); setSelectedPoi(null); setDrafts({}); }}
              className={`mode-btn ${mode === 'places' ? 'active' : ''}`}
            >
              Места
            </button>
            <button 
              onClick={() => { setMode('services'); setSelectedPoi(null); setDrafts({}); }}
              className={`mode-btn ${mode === 'services' ? 'active' : ''}`}
            >
              Услуги
            </button>
          </div>

          <PoiList 
            pois={filteredPois}
            loading={loading}
            selectedPoi={selectedPoi}
            totalPoisCount={pois.length}
            availableCategories={availableCategories}
            activeCategories={activeCategories}
            onToggleCategory={toggleCategory}
            onPoiClick={setSelectedPoi}
            onNewPoi={() => setSelectedPoi({ 
              id: `new_poi_${Date.now()}`, 
              category: mode === 'services' ? 'service' : 'sight',
              name_ru: '',
              _rowIndex: undefined 
            })}
            globalFilter={globalFilter}
            setGlobalFilter={setGlobalFilter}
            drafts={drafts}
          />
        </div>

        <div className="editor-section">
          {selectedPoi ? (
            <PoiEditor 
              mode={mode}
              poi={selectedPoi}
              initialDraft={selectedPoi ? drafts[selectedPoi._rowIndex !== undefined ? selectedPoi._rowIndex : selectedPoi.id] : null}
              onDraftChange={handleDraftChange}
              onSave={handleSave}
              onCancel={() => setSelectedPoi(null)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-12 opacity-30 select-none">
              <div className="w-24 h-24 bg-card-bg rounded-[2rem] border border-white/5 flex items-center justify-center mb-8 shadow-2xl">
                 <div className="text-accent-gold text-4xl font-black">TC</div>
              </div>
              <h3 className="text-2xl font-black text-white mb-3">
                {mode === 'places' ? 'Выберите объект' : 'Выберите услугу'}
              </h3>
              <p className="max-w-[280px] text-sm text-text-dim leading-relaxed font-medium">
                {mode === 'places' 
                  ? 'Выберите локацию из списка для редактирования или создайте новую.' 
                  : 'Выберите мастера или сервис для управления данными.'}
              </p>
            </div>
          )}
        </div>

        {mode === 'places' && (
          <ParsingZone 
            onResultApply={(parsedData) => {
              setSelectedPoi(prev => ({ ...prev, ...parsedData }));
            }}
            onCreateNew={async (parsedData) => {
              await handleSave(parsedData);
            }}
          />
        )}

        {activeOverlay === 'partners' && (
          <PartnerManager 
            onClose={() => setActiveOverlay(null)} 
            mode={mode} 
            pois={pois} 
          />
        )}
        {activeOverlay === 'moderation' && (
          <ModerationZone 
            onClose={() => {
              setActiveOverlay(null);
              fetchPois(); 
            }} 
          />
        )}
      </main>
    </div>
  );
}

export default App;
