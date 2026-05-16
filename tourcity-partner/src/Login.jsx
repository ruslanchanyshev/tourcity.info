import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, KeyRound, Loader2, Globe, Eye, EyeOff } from 'lucide-react';
import api from './api';
import translations from './translations';

function Login() {
  const [uiLang, setUiLang] = useState(localStorage.getItem('ui_lang') || 'ru');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const t = translations[uiLang];

  useEffect(() => {
    localStorage.setItem('ui_lang', uiLang);
  }, [uiLang]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/login', { username, password });
      localStorage.setItem('partner_token', res.data.token);
      localStorage.setItem('partner_mode', res.data.mode || 'places');
      if (res.data.expirationDate) {
        localStorage.setItem('partner_expiration', res.data.expirationDate);
      } else {
        localStorage.removeItem('partner_expiration');
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || (uiLang === 'ru' ? 'Ошибка входа' : 'Login error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Language Switcher Dropdown */}
      <div style={{ position: 'absolute', top: 20, right: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)' }}>
          <Globe size={18} color="var(--accent-gold)" />
          <select 
            value={uiLang} 
            onChange={(e) => setUiLang(e.target.value)}
            style={{ 
              background: 'transparent', 
              color: '#FFF', 
              border: 'none', 
              fontSize: 14, 
              fontWeight: 800, 
              cursor: 'pointer',
              outline: 'none',
              appearance: 'none',
              paddingRight: 10
            }}
          >
            {[
              { code: 'ru', label: '🇷🇺 Русский' },
              { code: 'en', label: '🇺🇸 English' },
              { code: 'vi', label: '🇻🇳 Tiếng Việt' },
              { code: 'ko', label: '🇰🇷 한국어' },
              { code: 'zh', label: '🇨🇳 中文' },
              { code: 'fr', label: '🇫🇷 Français' },
              { code: 'es', label: '🇪🇸 Español' }
            ].map(lang => (
              <option key={lang.code} value={lang.code} style={{ background: '#1a1a1a', color: '#FFF' }}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="auth-box">
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ width: 64, height: 64, background: 'rgba(212,161,23,0.1)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', border: '1px solid rgba(212,161,23,0.3)' }}>
            <KeyRound size={32} color="var(--accent-gold)" />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>{t.loginTitle}</h1>
          <p style={{ color: 'var(--text-muted)' }}>{t.subtitle}</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {error && (
            <div style={{ background: 'rgba(255,68,68,0.1)', color: 'var(--danger)', padding: 12, borderRadius: 8, fontSize: 14, textAlign: 'center', border: '1px solid rgba(255,68,68,0.2)' }}>
              {error}
            </div>
          )}

          <div style={{ position: 'relative' }}>
            <User size={20} color="var(--text-muted)" style={{ position: 'absolute', left: 16, top: 16 }} />
            <input
              type="text"
              placeholder={t.username}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ paddingLeft: 48 }}
              required
            />
          </div>

          <div style={{ position: 'relative' }}>
            <Lock size={20} color="var(--text-muted)" style={{ position: 'absolute', left: 16, top: 16 }} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder={t.password}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ paddingLeft: 48, paddingRight: 48 }}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: 12,
                top: 14,
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                padding: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 10 }}>
            {loading ? <Loader2 size={20} className="spin" /> : t.loginBtn}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
