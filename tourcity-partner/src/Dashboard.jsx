import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from './api';
import translations from './translations';
import logo from './assets/logo.png';
import { 
  LogOut, 
  Store, 
  MapPin, 
  Phone, 
  Globe, 
  Award, 
  ChevronRight,
  Gift,
  Calendar,
  ShoppingBag,
  Coffee,
  ArrowLeft
} from 'lucide-react';

import AdminNotification from './components/AdminNotification';
import ContactSection from './components/ContactSection';
import DescriptionEditor from './components/DescriptionEditor';
import EventSection from './components/EventSection';
import DiscountSection from './components/DiscountSection';

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

  const { register, control, handleSubmit, reset, watch, setValue } = useForm();

  useEffect(() => {
    localStorage.setItem('partner_lang', uiLang);
  }, [uiLang]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/pois');
        const poisData = res.data.pois || res.data;
        const mode = res.data.mode;
        console.log('[DEBUG] Partner Mode detected:', mode);

        if (mode) {
          localStorage.setItem('partner_mode', mode);
        }

        setPois(poisData);
        if (poisData.length === 1) {
          setSelectedPoi(poisData[0]);
          reset(poisData[0]);
        }
      } catch (err) {
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate, reset]);

  const handleSelectPoi = (poi) => {
    setSelectedPoi(poi);
    reset(poi);
  };

  const handleBackToList = () => {
    setSelectedPoi(null);
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      await api.patch(`/pois/${selectedPoi.id}`, data);
      alert(t.saveSuccess);
    } catch (err) {
      alert(uiLang === 'ru' ? 'Ошибка сохранения' : 'Save error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!window.confirm(uiLang === 'ru' ? 'Отменить событие? Оно сразу исчезнет из приложения.' : 'Cancel event? It will immediately disappear from the app.')) return;
    setDeletingEvent(true);
    try {
      await api.delete(`/pois/${selectedPoi.id}/event`);
      setValue('ext_7', '', { shouldDirty: true });
      setValue('ext_8', '', { shouldDirty: true });
      setValue('ext_9', '09:00', { shouldDirty: true });
      setValue('ext_10', '', { shouldDirty: true });
      setValue('ext_11', '', { shouldDirty: true });
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

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  if (loading) return <div className="loading">...</div>;

  return (
    <div className="app-container">
      {/* Top Header */}
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
        {/* Admin Notification Panel - displayed above list or editor */}
        <AdminNotification uiLang={uiLang} />

        {!selectedPoi ? (
          <div className="poi-list animate-fade">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <h1 style={{ fontSize: 20, fontWeight: 900, margin: 0, color: 'var(--accent-gold)' }}>
                {t.dashboardTitle}
              </h1>
              <span style={{ 
                fontSize: 10, 
                textTransform: 'uppercase', 
                letterSpacing: 1, 
                background: 'rgba(255,255,255,0.05)', 
                padding: '4px 8px', 
                borderRadius: 6, 
                color: 'var(--text-muted)',
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                {localStorage.getItem('partner_mode') === 'services' ? (uiLang === 'ru' ? 'Режим: Услуги' : 'Mode: Services') : (uiLang === 'ru' ? 'Режим: Места' : 'Mode: Places')}
              </span>
            </div>
            <h2 style={{ fontSize: 11, fontWeight: 900, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 12, paddingLeft: 8 }}>
              {t.selectPoi}
            </h2>
            {pois.map(poi => (
              <div key={poi.id} className="poi-card" onClick={() => handleSelectPoi(poi)}>
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
          <form onSubmit={handleSubmit(onSubmit)} className="editor-layout animate-fade" style={{ gap: 12 }}>
            {pois.length > 1 && (
              <button type="button" onClick={handleBackToList} className="btn-back">
                <ArrowLeft size={16} /> {t.backToList}
              </button>
            )}

            {/* Contacts Section */}
            <ContactSection
              register={register}
              control={control}
              setValue={setValue}
              watch={watch}
              t={t}
              uiLang={uiLang}
              expanded={expandedSections.contacts}
              onToggle={() => toggleSection('contacts')}
            />

            {/* Description Editor */}
            <DescriptionEditor
              register={register}
              setValue={setValue}
              watch={watch}
              t={t}
              uiLang={uiLang}
              activeLang={activeLang}
              expanded={expandedSections.description}
              onToggle={() => toggleSection('description')}
            />

            {/* Event Section */}
            <EventSection
              register={register}
              control={control}
              setValue={setValue}
              watch={watch}
              t={t}
              uiLang={uiLang}
              expanded={expandedSections.event}
              onToggle={() => toggleSection('event')}
              onDeleteEvent={handleDeleteEvent}
              deletingEvent={deletingEvent}
            />

            {/* Coupon/Discount Section */}
            <DiscountSection
              register={register}
              control={control}
              watch={watch}
              t={t}
              uiLang={uiLang}
            />

            <button type="submit" disabled={saving} className="btn-primary" style={{ padding: 14, fontSize: 14, fontWeight: 900, marginTop: 8 }}>
              {saving ? t.saving : t.saveBtn}
            </button>
          </form>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
