import React, { useRef } from 'react';

function TimeInput({ value, onChange }) {
  const inputRef = useRef(null);
  
  const openPicker = () => {
    if (inputRef.current) {
      try { inputRef.current.showPicker(); } catch { inputRef.current.click(); }
    }
  };

  return (
    <div style={{ position: 'relative', flex: 1 }} onClick={openPicker}>
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '10px',
        padding: '8px 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        height: '40px',
        transition: 'all 0.2s',
      }}>
        <span style={{ fontSize: 14, fontWeight: 800, color: value ? '#FFF' : 'rgba(255,255,255,0.3)' }}>
          {value || '--:--'}
        </span>
      </div>
      <input
        ref={inputRef}
        type="time"
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0,
          width: '100%',
          height: '100%',
          cursor: 'pointer'
        }}
      />
    </div>
  );
}

export default TimeInput;
