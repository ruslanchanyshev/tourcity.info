import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api';
import translations from './translations';
import { getDiscountCodes } from './discountCodes';
import logo from './assets/logo.png';
import { 
  LogOut, 
  Store, 
  MapPin, 
  Phone, 
  Globe, 
  Clock, 
  Award, 
  Save, 
  ChevronRight,
  Gift,
  AlertCircle,
  Calendar,
  ShoppingBag,
  Coffee,
  ArrowLeft
} from 'lucide-react';

const getPoiIcon = (category) => {
  const cat = (category || '').toLowerCase();
  if (cat.includes('rest')) return <Store size={24} />;
  if (cat.includes('cafe') || cat.includes('coffee')) return <Coffee size={24} />;
  if (cat.includes('shop') || cat.includes('mall')) return <ShoppingBag size={24} />;
  if (cat.includes('spa') || cat.includes('massage')) return <Award size={24} />;
  return <MapPin size={24} />;
};

const LANGUAGES = [
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'es', label: 'Español', flag: '🇪🇸' }
];


import { useRef } from 'react';

const MONTHS_LONG_RU = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
const MONTHS_LONG_EN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// Native date picker with controlled styled display — no overflow on any screen
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


const Dashboard = () => {
  const [pois, setPois] = useState([]);
  const [selectedPoi, setSelectedPoi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeLang, setActiveLang] = useState('ru');
  const [uiLang, setUiLang] = useState(localStorage.getItem('partner_lang') || 'ru');
  const [expandedSections, setExpandedSections] = useState({
    contacts: false,
    description: false,
    event: false,
    coupon: true
  });
  const [deletingEvent, setDeletingEvent] = useState(false);
  const navigate = useNavigate();

  const t = translations[uiLang] || translations.ru;

  useEffect(() => {
    localStorage.setItem('partner_lang', uiLang);
  }, [uiLang]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/pois');
        setPois(res.data);
        if (res.data.length === 1) {
          setSelectedPoi(res.data[0]);
        }
      } catch (err) {
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch(`/pois/${selectedPoi.id}`, selectedPoi);
      alert(t.saveSuccess);
    } catch (err) {
      alert(uiLang === 'ru' ? 'Ошибка сохранения' : 'Save error');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setSelectedPoi(prev => ({ ...prev, [field]: value }));
  };

  const handleDeleteEvent = async () => {
    if (!window.confirm(uiLang === 'ru' ? 'Отменить событие? Оно сразу исчезнет из приложения.' : 'Cancel event? It will immediately disappear from the app.')) return;
    setDeletingEvent(true);
    try {
      await api.delete(`/pois/${selectedPoi.id}/event`);
      setSelectedPoi(prev => ({ ...prev, ext_7: '', ext_8: '', ext_9: '', ext_10: '', ext_11: '' }));
      setExpandedSections(prev => ({ ...prev, event: false }));
      alert(uiLang === 'ru' ? 'Событие удалено' : 'Event deleted');
    } catch (err) {
      alert(uiLang === 'ru' ? 'Ошибка удаления' : 'Delete error');
    } finally {
      setDeletingEvent(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('partner_token');
    navigate('/');
  };

  if (loading) return <div className="loading">...</div>;

  return (
    <div className="app-container">
      {/* Top Header: single row, logo+title left, lang+logout right */}
      <div className="top-header">
        <div className="top-header-left">
          <img src={logo} alt="TourCity Logo" className="header-logo" />
          <h1 className="header-title">{t.title}</h1>
        </div>
        <div className="top-header-right">
          <div className="lang-picker">
            <select
              value={uiLang}
              onChange={(e) => { setUiLang(e.target.value); setActiveLang(e.target.value); }}
              className="lang-select"
            >
              {LANGUAGES.map(lang => (
                <option key={lang.code} value={lang.code} style={{ background: '#1a1a1a', color: '#FFF' }}>
                  {lang.flag} {lang.label}
                </option>
              ))}
            </select>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {selectedPoi && (
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '24px', 
          fontSize: 16, 
          fontWeight: 700, 
          color: 'var(--text-muted)'
        }}>
          {selectedPoi[`name_${uiLang}`] || selectedPoi.name_ru}
        </div>
      )}

      <main className="main">
        {!selectedPoi ? (
          <div className="poi-list animate-fade">
            <h2 style={{ fontSize: 11, fontWeight: 900, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 12, paddingLeft: 8 }}>
              {t.selectPoi}
            </h2>
            {pois.map(poi => (
              <div key={poi.id} className="poi-card" onClick={() => setSelectedPoi(poi)}>
                <div className="poi-icon-box">
                  {getPoiIcon(poi.category)}
                </div>
                <div className="poi-info">
                  <div className="poi-name">{poi.name_ru || poi.id}</div>
                  <div className="poi-category">
                    {poi.category}
                  </div>
                </div>
                <div className="poi-chevron">
                  <ChevronRight size={20} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="editor-layout animate-fade" style={{ gap: 12 }}>
            {pois.length > 1 && (
              <button onClick={() => setSelectedPoi(null)} className="btn-back">
                <ArrowLeft size={16} /> {t.backToList}
              </button>
            )}

            {/* Contacts Section (Collapsible) */}
            <div className={`card ${expandedSections.contacts ? 'expanded' : ''}`} style={{ padding: 16 }}>
              <div 
                onClick={() => setExpandedSections(prev => ({ ...prev, contacts: !prev.contacts }))}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
              >
                <h2 className="card-title" style={{ marginBottom: 0, fontSize: 13 }}><Phone size={16} color="var(--accent-gold)"/> {t.contactsTitle}</h2>
                <ChevronRight size={16} color="var(--text-muted)" style={{ transform: expandedSections.contacts ? 'rotate(90deg)' : 'none', transition: 'transform 0.3s' }} />
              </div>
              
              {expandedSections.contacts && (
                <div className="animate-fade" style={{ marginTop: 16 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>Instagram</label>
                      <input style={{ padding: 8, fontSize: 13 }} value={selectedPoi.website || ''} onChange={e => handleChange('website', e.target.value)} placeholder="@..." />
                    </div>
                    <div>
                      <label style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>{t.telegram}</label>
                      <input style={{ padding: 8, fontSize: 13 }} value={selectedPoi.tg_bot || ''} onChange={e => handleChange('tg_bot', e.target.value)} placeholder="username" />
                    </div>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
                    <div>
                      <label style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>{t.phone} / WhatsApp</label>
                      <input style={{ padding: 8, fontSize: 13 }} value={selectedPoi.phone || ''} onChange={e => handleChange('phone', e.target.value)} placeholder="+84..." />
                    </div>
                    <div>
                      <label style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>{t.portfolio}</label>
                      <input style={{ padding: 8, fontSize: 13 }} value={selectedPoi.ext_1 || ''} onChange={e => handleChange('ext_1', e.target.value)} placeholder="https://..." />
                    </div>
                  </div>

                  {!['beauty', 'hair', 'health', 'fitness', 'photo_video', 'legal_visa', 'real_estate', 'home_services', 'tech_repair', 'auto_moto', 'kids', 'education', 'events', 'flowers', 'pets', 'delivery', 'tattoo', 'astrology', 'service', 'transport'].includes(selectedPoi.category) && (
                    <div style={{ marginTop: 12 }}>
                      <label style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>{t.address}</label>
                      <input style={{ padding: 8, fontSize: 13 }} value={selectedPoi.address || ''} onChange={e => handleChange('address', e.target.value)} placeholder={t.address} />
                    </div>
                  )}
                  <div style={{ marginTop: 12 }}>
                    <label style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', marginBottom: 4, display: 'flex', justifyContent: 'space-between' }}>
                      <span>{t.workingHours}</span>
                      <span 
                        onClick={() => handleChange('hours', selectedPoi.hours === '24/7' ? '' : '24/7')}
                        style={{ color: selectedPoi.hours === '24/7' ? 'var(--accent-gold)' : 'inherit', cursor: 'pointer', opacity: selectedPoi.hours === '24/7' ? 1 : 0.6 }}
                      >
                        24/7
                      </span>
                    </label>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', opacity: selectedPoi.hours === '24/7' ? 0.5 : 1, pointerEvents: selectedPoi.hours === '24/7' ? 'none' : 'auto' }}>
                      <input 
                        type="time"
                        style={{ padding: 8, fontSize: 13, flex: 1, backgroundColor: 'var(--bg-secondary)', color: 'var(--text-main)', border: 'none', borderRadius: 8, outline: 'none' }} 
                        value={selectedPoi.hours === '24/7' ? '' : (selectedPoi.hours || '').split(' - ')[0] || ''} 
                        onChange={e => {
                          const parts = (selectedPoi.hours || '').split(' - ');
                          const end = parts.length > 1 ? parts[1] : '';
                          handleChange('hours', `${e.target.value}${end ? ' - ' + end : ' - '}`);
                        }} 
                      />
                      <span style={{ color: 'var(--text-muted)' }}>—</span>
                      <input 
                        type="time"
                        style={{ padding: 8, fontSize: 13, flex: 1, backgroundColor: 'var(--bg-secondary)', color: 'var(--text-main)', border: 'none', borderRadius: 8, outline: 'none' }} 
                        value={selectedPoi.hours === '24/7' ? '' : (selectedPoi.hours || '').split(' - ')[1] || ''} 
                        onChange={e => {
                          const start = (selectedPoi.hours || '').split(' - ')[0] || '';
                          handleChange('hours', `${start} - ${e.target.value}`);
                        }} 
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Description Section (Collapsible) */}
            <div className={`card ${expandedSections.description ? 'expanded' : ''}`} style={{ padding: 16 }}>
              <div 
                onClick={() => setExpandedSections(prev => ({ ...prev, description: !prev.description }))}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
              >
                <h2 className="card-title" style={{ marginBottom: 0, fontSize: 13 }}><Store size={16} color="var(--accent-gold)"/> {t.descTitle}</h2>
                <ChevronRight size={16} color="var(--text-muted)" style={{ transform: expandedSections.description ? 'rotate(90deg)' : 'none', transition: 'transform 0.3s' }} />
              </div>

              {expandedSections.description && (
                <div className="animate-fade" style={{ marginTop: 16 }}>
                  <textarea 
                    value={selectedPoi[`desc_${activeLang}`] || ''} 
                    onChange={e => handleChange(`desc_${activeLang}`, e.target.value)} 
                    rows={4}
                    style={{ fontSize: 13, padding: 12 }}
                    placeholder={t.placeholderDesc}
                  />
                </div>
              )}
            </div>

            {/* Event Section — collapsible, above Coupon */}
            {['beauty', 'hair', 'health', 'fitness', 'photo_video', 'legal_visa', 'real_estate', 'home_services', 'tech_repair', 'auto_moto', 'kids', 'education', 'events', 'flowers', 'pets', 'delivery', 'tattoo', 'astrology', 'service', 'transport'].includes(selectedPoi.category) && (
              <div className="card" style={{ border: '1px solid rgba(74,222,128,0.15)', background: 'rgba(74,222,128,0.02)', padding: 16 }}>
                <div
                  onClick={() => setExpandedSections(prev => ({ ...prev, event: !prev.event }))}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                >
                  <h2 className="card-title" style={{ marginBottom: 0, color: '#4ADE80', fontSize: 13 }}>
                    <Calendar size={16} /> {t.eventTitle}
                  </h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {selectedPoi.ext_7 && (
                      <span style={{ background: '#4ADE80', color: '#000', fontSize: 9, fontWeight: 900, padding: '2px 8px', borderRadius: 10 }}>
                        {uiLang === 'ru' ? 'АКТИВНО' : 'ACTIVE'}
                      </span>
                    )}
                    <ChevronRight size={16} color="var(--text-muted)" style={{ transform: expandedSections.event ? 'rotate(90deg)' : 'none', transition: 'transform 0.3s' }} />
                  </div>
                </div>

                {expandedSections.event && (
                  <div className="animate-fade" style={{ marginTop: 16 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', overflow: 'hidden' }}>
                      <div>
                        <label style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>{t.eventName}</label>
                        <input style={{ padding: 8, fontSize: 13 }} value={selectedPoi.ext_7 || ''} onChange={e => handleChange('ext_7', e.target.value)} placeholder={uiLang === 'ru' ? 'Например: Открытие сезона' : 'E.g. Season Opening'} />
                      </div>

                      {/* Date — custom picker, works on all screens */}
                      <div>
                        <label style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>{t.eventDate}</label>
                        <DateInput
                          value={selectedPoi.ext_8 || ''}
                          onChange={val => handleChange('ext_8', val)}
                          lang={uiLang}
                        />
                      </div>

                      {/* Time: two selects side-by-side, each exactly 50% */}
                      <div>
                        <label style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>{t.eventTime}</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                          <select
                            value={(selectedPoi.ext_9 || '09:00').split(':')[0]}
                            onChange={e => { const mins = (selectedPoi.ext_9 || '09:00').split(':')[1] || '00'; handleChange('ext_9', `${e.target.value}:${mins}`); }}
                            style={{ fontWeight: 700, fontSize: 14, padding: '10px 14px', width: '100%' }}
                          >
                            {Array.from({ length: 24 }).map((_, i) => { const h = i.toString().padStart(2, '0'); return <option key={h} value={h}>{h}ч</option>; })}
                          </select>
                          <select
                            value={(selectedPoi.ext_9 || '09:00').split(':')[1] || '00'}
                            onChange={e => { const hours = (selectedPoi.ext_9 || '09:00').split(':')[0] || '09'; handleChange('ext_9', `${hours}:${e.target.value}`); }}
                            style={{ fontWeight: 700, fontSize: 14, padding: '10px 14px', width: '100%' }}
                          >
                            {['00', '10', '20', '30', '40', '50'].map(m => <option key={m} value={m}>{m}м</option>)}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>{t.eventLocation}</label>
                        <input style={{ padding: 8, fontSize: 13 }} value={selectedPoi.ext_10 || ''} onChange={e => handleChange('ext_10', e.target.value)} placeholder={uiLang === 'ru' ? 'Адрес или название места' : 'Venue address or name'} />
                      </div>

                      <div>
                        <label style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>{t.eventConditions}</label>
                        <input style={{ padding: 8, fontSize: 13 }} value={selectedPoi.ext_11 || ''} onChange={e => handleChange('ext_11', e.target.value)} placeholder={uiLang === 'ru' ? 'Свободный вход / предварительная запись' : 'Free entry / reservation required'} />
                      </div>

                      {/* Delete event button */}
                      {selectedPoi.ext_7 && (
                        <button
                          onClick={handleDeleteEvent}
                          disabled={deletingEvent}
                          style={{
                            marginTop: 4, padding: '8px 16px', borderRadius: 10, border: '1px solid rgba(255,68,68,0.3)',
                            background: 'rgba(255,68,68,0.1)', color: '#FF4444', fontSize: 12, fontWeight: 700,
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                            width: '100%', transition: 'all 0.2s'
                          }}
                        >
                          {deletingEvent ? '...' : `🗑 ${uiLang === 'ru' ? 'Отменить событие' : 'Cancel Event'}`}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Coupon Section */}
            <div className="card" style={{ border: '1px solid rgba(212,161,23,0.2)', background: 'rgba(212,161,23,0.03)', padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h2 className="card-title" style={{ marginBottom: 0, color: 'var(--accent-gold)', fontSize: 13 }}><Gift size={16} /> {t.couponTitle}</h2>
                {selectedPoi.ext_2 && selectedPoi.ext_2 !== '0' && (
                  <span style={{ background: '#22C55E', color: '#FFF', fontSize: 9, fontWeight: 900, padding: '2px 8px', borderRadius: 10 }}>{t.couponActive}</span>
                )}
              </div>

              <div className="coupon-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div style={{ minWidth: 0 }}>
                  <label style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>%</label>
                  <select value={selectedPoi.ext_2 || '0'} onChange={e => handleChange('ext_2', e.target.value)} style={{ fontWeight: 800, fontSize: 14, color: 'var(--accent-gold)', width: '100%', padding: '10px 14px' }}>
                    <option value="0">{t.couponNone}</option>
                    {[5, 10, 15, 20, 25, 30, 40, 50].map(v => <option key={v} value={v}>{v}%</option>)}
                    <option value="Special">Special</option>
                  </select>
                </div>
                <div style={{ minWidth: 0, overflow: 'hidden' }}>
                  <label style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>{t.couponExpiry}</label>
                  <DateInput
                    value={selectedPoi.ext_3 || ''}
                    onChange={val => handleChange('ext_3', val)}
                    lang={uiLang}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>{t.couponConditions}</label>
                <select value={selectedPoi.ext_4 || ''} onChange={e => handleChange('ext_4', e.target.value)} style={{ fontSize: 13, padding: 8 }}>
                  <option value="">-- {t.couponConditions} --</option>
                  {getDiscountCodes(uiLang).map(item => <option key={item.code} value={item.code}>{item.text}</option>)}
                </select>
              </div>
            </div>

            <button onClick={handleSave} disabled={saving} className="btn-primary" style={{ padding: 14, fontSize: 14, fontWeight: 900, marginTop: 8 }}>
              {saving ? t.saving : t.saveBtn}
            </button>


          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
