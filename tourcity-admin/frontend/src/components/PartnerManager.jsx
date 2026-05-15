import { useState, useEffect } from 'react';
import { X, Users, Check, Loader2, ShieldCheck, Calendar, Store, RefreshCw } from 'lucide-react';

const API_URL = 'http://localhost:3001/api';

export default function PartnerManager({ onClose, mode, pois }) {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedPois, setSelectedPois] = useState([]);
  const [trustLevel, setTrustLevel] = useState('regular');
  const [expirationDate, setExpirationDate] = useState('');
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Password Reset State
  const [resettingUser, setResettingUser] = useState(null);
  const [resetPasswords, setResetPasswords] = useState({});

  // Auto-generate password
  const generatePassword = () => {
    return Math.random().toString(36).substring(2, 8) + Math.random().toString(36).substring(2, 8);
  };

  useEffect(() => {
    setPassword(generatePassword());
    fetchPartners();
  }, [mode]);

  const fetchPartners = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/partners?mode=${mode}`);
      const data = await res.json();
      setPartners(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const togglePoi = (id) => {
    if (selectedPois.includes(id)) {
      setSelectedPois(selectedPois.filter(x => x !== id));
    } else {
      setSelectedPois([...selectedPois, id]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (selectedPois.length === 0) {
      setError('Выберите хотя бы одно заведение из списка');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/admin/partners`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          password,
          poiIds: selectedPois,
          trustLevel,
          expirationDate,
          mode
        })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);
      
      setSuccess('Партнер успешно создан!');
      setUsername('');
      setPassword(generatePassword());
      setSelectedPois([]);
      setExpirationDate('');
      fetchPartners();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async (partnerUsername) => {
    if (!window.confirm(`Вы уверены, что хотите сбросить пароль для ${partnerUsername}?`)) return;
    
    const newPassword = generatePassword();
    setResettingUser(partnerUsername);
    
    try {
      const res = await fetch(`${API_URL}/admin/partners/${partnerUsername}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword, mode })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setResetPasswords(prev => ({ ...prev, [partnerUsername]: newPassword }));
    } catch (e) {
      alert(`Ошибка: ${e.message}`);
    } finally {
      setResettingUser(null);
    }
  };

  // Filter partners: Only show partners who manage POIs in the current mode
  // A partner is relevant to the current mode if ANY of their poiIds exist in the current `pois` list.
  const activePoiIds = pois.map(p => p.id);
  const relevantPartners = partners.filter(p => 
    p.poiIds.some(id => activePoiIds.includes(id))
  );

  return (
    <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 480, background: 'var(--bg-card)', borderLeft: '1px solid rgba(255,255,255,0.05)', zIndex: 100, display: 'flex', flexDirection: 'column', boxShadow: '-10px 0 30px rgba(0,0,0,0.5)' }}>
      {/* Header */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Users size={20} color="var(--accent-gold)" /> Управление партнерами
          </h2>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            {mode === 'places' ? 'Бизнес-партнеры (Места)' : 'Частные мастера (Услуги)'}
          </div>
        </div>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
          <X size={24} />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
        
        {/* CREATE FORM */}
        <div style={{ background: 'rgba(0,0,0,0.2)', padding: 20, borderRadius: 16, marginBottom: 30, border: '1px solid rgba(255,255,255,0.05)' }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Добавить нового партнера</h3>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {error && <div style={{ color: '#ff4444', fontSize: 13, padding: 8, background: 'rgba(255,68,68,0.1)', borderRadius: 8 }}>{error}</div>}
            {success && <div style={{ color: '#4ADE80', fontSize: 13, padding: 8, background: 'rgba(74,222,128,0.1)', borderRadius: 8 }}>{success}</div>}
            
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>Логин (в приложении)</label>
                <input required value={username} onChange={e => setUsername(e.target.value)} placeholder="name_123" style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>Пароль (выдается партнеру)</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input required value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }} />
                  <button type="button" onClick={() => setPassword(generatePassword())} title="Сгенерировать новый пароль" style={{ padding: '0 12px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8, color: 'var(--accent-gold)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <RefreshCw size={16} />
                  </button>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}><ShieldCheck size={12}/> Режим модерации</label>
                <select value={trustLevel} onChange={e => setTrustLevel(e.target.value)} style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }}>
                  <option value="trusted">Без проверки (Trusted)</option>
                  <option value="regular">Ручная модерация (Regular)</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}><Calendar size={12}/> Срок действия (опционально)</label>
                <input 
                  type="date"
                  value={expirationDate ? expirationDate.split('.').reverse().join('-') : ''} 
                  onChange={e => {
                    if (e.target.value) {
                      const [y, m, d] = e.target.value.split('-');
                      setExpirationDate(`${d}.${m}.${y}`);
                    } else {
                      setExpirationDate('');
                    }
                  }} 
                  style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff', colorScheme: 'dark' }} 
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, display: 'block' }}><Store size={12}/> Привязать заведения ({mode === 'places' ? 'Места' : 'Услуги'})</label>
              <div style={{ maxHeight: 150, overflowY: 'auto', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 8, padding: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {pois.map(poi => (
                  <label key={poi.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', padding: '4px 8px', borderRadius: 4, background: selectedPois.includes(poi.id) ? 'rgba(212,161,23,0.1)' : 'transparent' }}>
                    <input 
                      type="checkbox" 
                      checked={selectedPois.includes(poi.id)}
                      onChange={() => togglePoi(poi.id)}
                    />
                    {poi.name_ru || poi.id}
                  </label>
                ))}
              </div>
            </div>

            <button disabled={saving} type="submit" style={{ marginTop: 8, width: '100%', padding: 12, background: 'var(--accent-gold)', color: '#000', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', display: 'flex', justifyContent: 'center' }}>
              {saving ? <Loader2 size={18} className="spin" /> : 'Создать аккаунт партнера'}
            </button>
          </form>
        </div>

        {/* LIST */}
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Существующие партнеры ({relevantPartners.length})</h3>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 20 }}><Loader2 size={24} className="spin" color="var(--accent-gold)" /></div>
        ) : relevantPartners.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>В этом разделе пока нет партнеров</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {relevantPartners.map((p, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: 16, borderRadius: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{p.username}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 100, background: p.trustLevel === 'trusted' ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.1)', color: p.trustLevel === 'trusted' ? '#4ADE80' : '#FFF' }}>
                    {p.trustLevel.toUpperCase()}
                  </div>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Заведения: <span style={{ color: '#fff' }}>{p.poiIds.join(', ')}</span></div>
                {p.expirationDate && (
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Действует до: <span style={{ color: 'orange' }}>{p.expirationDate}</span></div>
                )}
                
                <div style={{ marginTop: 12, borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {resetPasswords[p.username] ? (
                    <div style={{ color: '#4ADE80', fontSize: 12, fontWeight: 600 }}>Новый пароль: {resetPasswords[p.username]}</div>
                  ) : (
                    <button 
                      onClick={() => handleResetPassword(p.username)} 
                      disabled={resettingUser === p.username}
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 12, padding: '6px 12px', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      {resettingUser === p.username ? <Loader2 size={12} className="spin"/> : <RefreshCw size={12}/>} Сбросить пароль
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
