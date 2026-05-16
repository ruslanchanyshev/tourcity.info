import React, { useRef } from 'react';

const MONTHS_LONG_RU = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
const MONTHS_LONG_EN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function DateInput({ value, onChange, lang = 'ru', placeholder }) {
  const inputRef = useRef(null);

  // Format display text from DD.MM.YYYY
  let displayText = '';
  if (value && value.includes('.')) {
    const [d, m, y] = value.split('.');
    const mIdx = parseInt(m, 10) - 1;
    const months = lang === 'ru' ? MONTHS_LONG_RU : MONTHS_LONG_EN;
    displayText = `${parseInt(d, 10)} ${months[mIdx] || ''} ${y}`;
  }

  // Convert DD.MM.YYYY → YYYY-MM-DD for native input value
  const toNative = (v) => {
    if (!v || !v.includes('.')) return '';
    const [d, m, y] = v.split('.');
    return `${y}-${m}-${d}`;
  };

  // Convert YYYY-MM-DD → DD.MM.YYYY for storage
  const fromNative = (v) => {
    if (!v) return '';
    const [y, m, d] = v.split('-');
    return `${d}.${m}.${y}`;
  };

  const open = () => {
    if (inputRef.current) {
      try { inputRef.current.showPicker(); } catch { inputRef.current.click(); }
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%' }} onClick={open}>
      {/* Styled display — always fits in container */}
      <div style={{
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 12,
        padding: '10px 40px 10px 14px',
        fontSize: 13,
        fontWeight: 700,
        color: displayText ? '#FFF' : 'rgba(255,255,255,0.35)',
        cursor: 'pointer',
        userSelect: 'none',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        minHeight: 42,
        display: 'flex',
        alignItems: 'center',
      }}>
        {displayText || (placeholder || (lang === 'ru' ? 'Выбрать дату' : 'Pick a date'))}
      </div>

      {/* Calendar icon */}
      <span style={{
        position: 'absolute',
        right: 12,
        top: '50%',
        transform: 'translateY(-50%)',
        fontSize: 16,
        pointerEvents: 'none',
        opacity: 0.7,
      }}>📅</span>

      {/* Hidden native input — provides the system date picker */}
      <input
        ref={inputRef}
        type="date"
        value={toNative(value)}
        onChange={e => onChange(fromNative(e.target.value))}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          opacity: 0,
          cursor: 'pointer',
          zIndex: 1,
        }}
      />
    </div>
  );
}

export default DateInput;
