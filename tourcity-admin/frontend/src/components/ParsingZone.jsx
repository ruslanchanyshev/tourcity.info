import React, { useState } from 'react';
import { Search, PlusCircle, Loader2, MapPin, Phone, Globe, Star, Info, CheckCircle2, Sparkles, Tag, DollarSign } from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

const ALL_TAGS_OPTIONS = [
  'wifi', 'strong_wifi', 'ac', 'parking', 'pool', 'infinity_pool', 'kids_pool',
  'pool_bar', 'beach_club', 'ocean_access', 'beach_towels', 'sunset_view',
  'outdoor_seating', 'private_room', 'quiet_zone', 'coworking', 'usb_charging',
  'charging_stations', 'live_music', 'live_sports', 'spa_services', 'shuttle_service',
  'bike_rental', 'atm_nearby', 'pharmacy_nearby', 'halal_food', 'vegan_friendly',
  'vegetarian', 'gluten_free', 'high_chairs', 'kids_room', 'kids_menu',
  'ru_speaking', 'eng_speaking', 'kor_speaking', 'delivery', 'takeaway',
  'no_smoking', 'smoking_area', 'card_payment', 'cash_only', 'booking_required',
  'happy_hour', 'street_food', 'craft_beer', 'craft_cocktails', 'hookah', 'wheelchair',
  'завтраки', 'кальяны', 'вид на море', 'крыша', 'терраса', 'пляж', 'бассейн',
  'бесплатная парковка', 'вип-зал', 'частный пляж', 'открытая кухня', 'премиум',
  'лайв музыка', 'концерт', 'диджей', 'караоке', 'спортбар', 'трансляция прямая',
  'керлингбоулинг', 'шафле', 'боулинг', 'биллиард', 'настольный теннис',
  'детская площадка', 'пещеры', 'водопад', 'национальный парк',
  'массаж', 'йога', 'медитация', 'фитнес',
  'стрит фуд', 'вьетнамская кухня', 'суши', 'русская кухня', 'европейская кухня',
  'безглютеновая диета', 'детское меню', 'ланч', 'коктейли', 'винная карта'
];

export default function ParsingZone({ onResultApply, onCreateNew }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState(''); // 'fetching' | 'thinking' | ''
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleParse = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setSuccess(false);
    try {
      const res = await axios.post(`${API_URL}/serp-parse`, { q: query });
      setResult(res.data);
    } catch (err) {
      console.error('Parsing error details:', err.response?.data || err.message);
      const serverError = err.response?.data?.error;
      setError(serverError || `Failed to parse: ${err.message}. Try a more specific name.`);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAIDesc = async (modeParam = 'both') => {
    // If called from onClick, modeParam might be the event object. Default it to 'both'.
    const mode = typeof modeParam === 'string' ? modeParam : 'both';
    
    if (!result || !result.data_id) return;
    setAiLoading(true);
    setAiStatus('fetching');
    setError(null);
    try {
      console.log('Starting AI for mode:', mode);
      setAiStatus('thinking');
      const res = await axios.post(`${API_URL}/generate-ai-description`, { 
        data_id: result.data_id,
        name_ru: result.name_ru,
        mode,
        allowedTags: ALL_TAGS_OPTIONS
      }, {
        timeout: 180000 
      });
      
      setResult(prev => {
        const newData = { ...prev };
        const desc = res.data.description || res.data.desc;
        if (desc) newData.desc_ru = desc;
        
        // Merge tags if returned
        if (res.data.tags && res.data.tags.length > 0) {
          const existingTags = prev.all_tags ? prev.all_tags.split(/[;,]+/).map(t => t.trim()).filter(Boolean) : [];
          const combined = Array.from(new Set([...existingTags, ...res.data.tags]));
          newData.all_tags = combined.join('; ');
        }
        
        return newData;
      });
    } catch (err) {
      console.error('AI GENERATION ERROR:', err);
      const msg = err.response?.data?.error || err.message || 'Unknown error';
      setError(`AI Error: ${msg}`);
    } finally {
      setAiLoading(false);
      setAiStatus('');
    }
  };

  const handleCreateCard = async () => {
    if (!result) return;
    setLoading(true);
    try {
      await onCreateNew(result);
      setSuccess(true);
      setResult(null);
      setQuery('');
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Failed to create card: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="preview-section animate-fade" style={{ padding: '32px' }}>
      <div className="header-subtitle mb-8 opacity-40">Парсинг локаций</div>
      
      {/* SEARCH BOX */}
      <div className="editor-card" style={{ margin: '0 0 24px 0', width: '100%' }}>
        <div className="card-label"><Search size={14} /> Поиск в Google Maps</div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <input 
            className="premium-input" 
            placeholder="Название или ссылка..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleParse()}
          />
          <button 
            onClick={handleParse}
            disabled={loading}
            className="btn-primary"
            style={{ padding: '0 24px', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
          </button>
        </div>
        {error && (
          <div style={{ marginTop: '12px', color: '#ff6b6b', fontSize: '12px', fontWeight: '600' }}>
            {error}
          </div>
        )}
      </div>

      {/* RESULT PREVIEW */}
      {result && (
        <div className="animate-fade" style={{ width: '100%' }}>
          <div className="editor-card" style={{ margin: '0 0 24px 0', width: '100%', borderColor: 'rgba(212, 161, 23, 0.3)' }}>
            <div className="card-label"><Info size={14} /> Результат парсинга</div>
            
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '4px' }}>{result.name_ru}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className={`badge cat-${result.category}`}>{result.category}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-gold)', fontSize: '12px', fontWeight: '700' }}>
                  <Star size={12} fill="currentColor" /> {result.rating}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--text-dim)' }}>
                <MapPin size={14} className="opacity-50" /> {result.address || 'Адрес не найден'}
              </div>
              {result.phone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--text-dim)' }}>
                  <Phone size={14} className="opacity-50" /> {result.phone}
                </div>
              )}
              {result.website && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--text-dim)' }}>
                  <Globe size={14} className="opacity-50" /> {result.website}
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--accent-gold)', fontWeight: '600' }}>
                <MapPin size={14} className="opacity-50" /> {result.lat}, {result.lon}
              </div>

              {result.price && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--text-dim)' }}>
                  <DollarSign size={14} className="opacity-50" /> Ценовая категория: {result.price}
                </div>
              )}

              {result.all_tags && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                  <Tag size={14} className="opacity-50" style={{ marginTop: '2px' }} /> 
                  <span style={{ fontStyle: 'italic' }}>{result.all_tags}</span>
                </div>
              )}

              {result.desc_ru && (
                <div style={{ 
                  marginTop: '12px', 
                  padding: '12px', 
                  background: 'rgba(212, 161, 23, 0.05)', 
                  borderLeft: '2px solid var(--accent-gold)',
                  fontSize: '13px',
                  color: 'var(--text-main)',
                  lineHeight: '1.6'
                }}>
                  {result.desc_ru}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
            <button 
              onClick={handleCreateCard}
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
            >
              <PlusCircle size={18} /> СОЗДАТЬ КАРТОЧКУ
            </button>
          </div>
        </div>
      )}

      {/* SUCCESS MESSAGE */}
      {success && (
        <div 
          className="animate-fade"
          style={{ 
            marginTop: '24px', 
            padding: '20px', 
            background: 'rgba(102, 153, 89, 0.1)', 
            border: '1px solid rgba(102, 153, 89, 0.2)', 
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: '#669959',
            fontWeight: '700'
          }}
        >
          <CheckCircle2 size={24} />
          Локация успешно добавлена в таблицу!
        </div>
      )}

      {/* EMPTY STATE */}
      {!result && !loading && !success && (
        <div style={{ marginTop: '40px', textAlign: 'center', opacity: 0.2 }}>
           <DownloadCloudIcon size={64} style={{ marginBottom: '16px' }} />
           <p style={{ fontSize: '14px', fontWeight: '600' }}>Введите название кафе или ресторана для быстрого создания</p>
        </div>
      )}
    </div>
  );
}

function DownloadCloudIcon({ size, style }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      style={style}
    >
      <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
      <path d="M12 12v9" />
      <path d="m8 17 4 4 4-4" />
    </svg>
  );
}
