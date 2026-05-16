import React, { useState, useEffect } from 'react';
import { AlertCircle, User } from 'lucide-react';
import api from '../api';

const AdminNotification = ({ uiLang }) => {
  const [data, setData] = useState({ global: null, targeted: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await api.get('/notification');
        if (res.data) {
          setData(res.data);
        }
      } catch (err) {
        console.warn('Failed to load notifications from admin', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();
  }, []);

  if (loading) return null;

  const showGlobal = data.global && data.global[uiLang]?.message;
  const showTargeted = data.targeted && data.targeted[uiLang]?.message;

  if (!showGlobal && !showTargeted) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
      
      {/* 1. Targeted (Personal) Notification */}
      {showTargeted && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(56,189,248,0.15) 0%, rgba(56,189,248,0.03) 100%)',
          border: '1px solid rgba(56,189,248,0.3)',
          borderRadius: '16px',
          padding: '16px',
          display: 'flex',
          gap: '14px',
          alignItems: 'flex-start',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
          backdropFilter: 'blur(4px)',
          animation: 'slideDown 0.3s ease-out'
        }}>
          <div style={{
            background: 'rgba(56,189,248,0.2)',
            borderRadius: '12px',
            padding: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#38BDF8'
          }}>
            <User size={22} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap', gap: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 900, color: '#38BDF8', letterSpacing: '0.5px' }}>
                {data.targeted[uiLang]?.title || (uiLang === 'ru' ? 'Персональное уведомление' : 'Personal Alert')}
              </h3>
              <span style={{ fontSize: '10px', color: 'rgba(56,189,248,0.6)', fontWeight: 600 }}>
                {data.targeted[uiLang]?.date}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '12.5px', color: 'rgba(255,255,255,0.9)', lineHeight: '1.6', fontWeight: 600 }}>
              {data.targeted[uiLang]?.message}
            </p>
          </div>
        </div>
      )}

      {/* 2. Global Notification */}
      {showGlobal && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(212,161,23,0.15) 0%, rgba(212,161,23,0.03) 100%)',
          border: '1px solid rgba(212,161,23,0.3)',
          borderRadius: '16px',
          padding: '16px',
          display: 'flex',
          gap: '14px',
          alignItems: 'flex-start',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
          backdropFilter: 'blur(4px)',
          animation: 'slideDown 0.3s ease-out'
        }}>
          <div style={{
            background: 'rgba(212,161,23,0.2)',
            borderRadius: '12px',
            padding: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-gold)'
          }}>
            <AlertCircle size={22} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap', gap: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 900, color: 'var(--accent-gold)', letterSpacing: '0.5px' }}>
                {data.global[uiLang]?.title}
              </h3>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>
                {data.global[uiLang]?.date}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '12.5px', color: 'rgba(255,255,255,0.85)', lineHeight: '1.6', fontWeight: 500 }}>
              {data.global[uiLang]?.message}
            </p>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminNotification;
