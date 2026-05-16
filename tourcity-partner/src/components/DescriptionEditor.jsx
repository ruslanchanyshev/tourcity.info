import React, { useState, useEffect } from 'react';
import { Store, ChevronRight, AlertCircle } from 'lucide-react';

const DescriptionEditor = ({ 
  register, 
  setValue, 
  watch, 
  t, 
  uiLang, 
  activeLang, 
  expanded, 
  onToggle 
}) => {
  const descKey = `desc_${activeLang}`;
  const initialValue = watch(descKey) || '';
  
  // Local state to prevent whole-page re-renders on every keystroke
  const [localDesc, setLocalDesc] = useState(initialValue);

  // Sync local state when the active language changes
  useEffect(() => {
    setLocalDesc(initialValue);
  }, [activeLang, initialValue]);

  const handleChange = (e) => {
    const val = e.target.value;
    setLocalDesc(val);
    setValue(descKey, val, { shouldDirty: true });
  };

  const charCount = localDesc.length;
  const isOverLimit = charCount > 200;

  return (
    <div className={`card ${expanded ? 'expanded' : ''}`} style={{ padding: 16 }}>
      <div 
        onClick={onToggle}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
      >
        <h2 className="card-title" style={{ marginBottom: 0, fontSize: 13 }}>
          <Store size={16} color="var(--accent-gold)"/> {t.descTitle}
        </h2>
        <ChevronRight 
          size={16} 
          color="var(--text-muted)" 
          style={{ transform: expanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.3s' }} 
        />
      </div>

      {expanded && (
        <div className="animate-fade" style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <label style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              {t.descTitle} ({activeLang.toUpperCase()})
            </label>
            <span style={{ 
              fontSize: 10, 
              fontWeight: 800, 
              color: isOverLimit ? '#FF4444' : 'var(--text-muted)',
              background: isOverLimit ? 'rgba(255,68,68,0.1)' : 'transparent',
              padding: '2px 6px',
              borderRadius: '4px',
              transition: 'all 0.2s'
            }}>
              {charCount} / 200
            </span>
          </div>
          <textarea 
            value={localDesc} 
            onChange={handleChange} 
            rows={6}
            style={{ 
              fontSize: 13, 
              padding: 14,
              lineHeight: '1.6',
              border: isOverLimit ? '2px solid #FF4444' : '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.03)',
              transition: 'all 0.2s',
              width: '100%',
              borderRadius: '8px',
              color: '#FFF',
              outline: 'none'
            }}
            placeholder={t.placeholderDesc}
          />
          {isOverLimit && (
            <div style={{ color: '#FF4444', fontSize: 10, fontWeight: 700, marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
              <AlertCircle size={12} /> {uiLang === 'ru' ? 'Описание слишком длинное (макс. 200)' : 'Description too long (max 200)'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DescriptionEditor;
