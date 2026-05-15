import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Check, X, Clock, User, Store, AlertCircle, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';

const API_URL = 'http://localhost:3001/api';

const FIELD_LABELS = {
  name_ru: 'Название (RU)',
  name_en: 'Название (EN)',
  phone: 'Телефон',
  address: 'Адрес',
  instagram: 'Instagram',
  hours: 'Часы работы',
  ext_2: 'Размер скидки (%)',
  ext_3: 'Срок действия',
  ext_4: 'Код условия (акция)',
  desc_ru: 'Описание (RU)',
  desc_en: 'Описание (EN)',
  ext_7: 'Событие: Название',
  ext_8: 'Событие: Дата',
  ext_9: 'Событие: Время',
  ext_10: 'Событие: Место',
  ext_11: 'Событие: Условия',
};

const DISCOUNT_CODES = [
  { code: '100', text: 'Скидка на весь чек' },
  { code: '1', text: 'Только на напитки' },
  { code: '2', text: 'Только на меню кухни' },
  { code: '3', text: 'Кроме алкоголя' },
  { code: '4', text: 'Специальное предложение' },
  { code: '5', text: 'Happy Hour (14:00-17:00)' },
  { code: '6', text: 'Мин. чек 500k VND' },
  { code: '7', text: 'Завтраки (08:00-10:00)' },
  { code: '8', text: 'Завтраки (08:00-11:00)' },
  { code: '9', text: 'Завтраки (08:00-12:00)' },
  { code: '10', text: 'Вечер (17:00-19:00)' },
  { code: '11', text: 'Вечер (17:00-20:00)' },
  { code: '12', text: 'После 20:00' },
  { code: '13', text: 'После 21:00' },
  { code: '14', text: 'После 22:00' },
  { code: '15', text: 'По будням (Пн-Пт)' },
  { code: '16', text: 'Компании от 4-х чел' },
  { code: '17', text: 'День рождения (±3 дня)' },
  { code: '18', text: 'Только для девушек' },
  { code: '19', text: 'Для семей с детьми' },
  { code: '20', text: 'За отзыв в Google Maps' },
  { code: '21', text: 'Только на вынос' },
  { code: '22', text: 'При оплате наличными' },
  { code: '23', text: 'Мин. чек 1 млн VND' },
  { code: '24', text: 'На вьетнамскую кухню' },
  { code: '25', text: 'Только на морепродукты' },
  { code: '26', text: 'На первый заказ' },
  { code: '27', text: '1+1 (BOGO)' },
  { code: '28', text: 'За пост в соцсетях' },
  { code: '29', text: 'В дождливую погоду' },
  { code: '30', text: 'Для групп от 10 чел' },
  { code: '31', text: 'Завтраки до 11:00' },
  { code: '32', text: 'После 22:00' },
  { code: '33', text: 'Эксклюзивно в приложении' },
  { code: '34', text: 'Напиток в подарок' },
  { code: '35', text: 'Десерт в подарок' },
  { code: '36', text: 'Только внутри заведения' },
  { code: '37', text: 'От 3-х блюд' },
  { code: '38', text: 'Только для резидентов' },
  { code: '39', text: 'Семейный комбо' },
  { code: '40', text: 'За отзыв (Google Maps)' },
  { code: '41', text: 'За чекин' },
  { code: '42', text: 'При предзаказе' },
  { code: '43', text: 'Месяц дня рождения' },
  { code: '44', text: 'В день годовщины' },
  { code: '45', text: 'Для экспатов' },
  { code: '46', text: 'В непиковые часы' },
  { code: '47', text: 'Со своим стаканом' },
  { code: '48', text: 'Комбо-сеты' },
  { code: '49', text: 'Оплата по QR' },
  { code: '50', text: 'Повторный визит' }
];

const ModerationZone = ({ onClose }) => {
  const [pendingEdits, setPendingEdits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEdit, setSelectedEdit] = useState(null);
  const [originalPoi, setOriginalPoi] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // { action, edit }

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/admin/partners/pending`);
      setPendingEdits(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOriginal = async (edit) => {
    try {
      setSelectedEdit(edit);
      setOriginalPoi(null);
      const res = await axios.get(`${API_URL}/pois?mode=${edit.mode}`);
      const poi = res.data.find(p => p.id === edit.targetId);
      setOriginalPoi(poi);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAction = (action, edit) => {
    // Show inline confirm instead of window.confirm (Chrome blocks it on re-render)
    setConfirmAction({ action, edit });
  };

  const executeAction = async () => {
    if (!confirmAction) return;
    const { action, edit } = confirmAction;
    setConfirmAction(null);
    setProcessing(true);
    try {
      await axios.post(`${API_URL}/admin/partners/${action}`, {
        mode: edit.mode,
        rowIndex: edit.rowIndex,
        targetId: edit.targetId,
        payload: edit.payload
      });
      setSelectedEdit(null);
      fetchPending();
    } catch (err) {
      console.error('Action error:', err);
      alert('Ошибка: ' + (err.response?.data?.error || err.message));
    } finally {
      setProcessing(false);
    }
  };

  const renderDiff = () => {
    if (!selectedEdit || !originalPoi) return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px', opacity: 0.5 }}>
        <RefreshCw className="animate-spin" style={{ marginBottom: '16px' }} />
        <p style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Загрузка...</p>
      </div>
    );
    
    const changes = JSON.parse(selectedEdit.payload);
    const changedKeys = Object.keys(changes).filter(key => {
      if (key === '_rowIndex' || key === 'id') return false;
      const oldVal = (originalPoi[key] || '').toString().trim();
      const newVal = (changes[key] || '').toString().trim();
      return oldVal !== newVal;
    });

    if (changedKeys.length === 0) return (
      <div style={{ padding: '40px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <p style={{ color: 'var(--text-dim)' }}>Реальных изменений не найдено.</p>
      </div>
    );

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {changedKeys.map(key => {
          const label = FIELD_LABELS[key] || key;
          
          // Helper to resolve condition text if the key is ext_4
          const formatValue = (val) => {
            if (key === 'ext_4' && val && val !== '(пусто)' && val !== '(удалено)') {
              const condition = DISCOUNT_CODES.find(c => c.code === val.toString().trim());
              return condition ? `${val} — ${condition.text}` : val;
            }
            return val;
          };

          const displayOld = formatValue(originalPoi[key] || '(пусто)');
          const displayNew = formatValue(changes[key] || '(удалено)');

          return (
            <div key={key} style={{ background: 'var(--bg-card-bg)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--accent-gold)' }}></div>
                <div style={{ fontSize: '10px', fontWeight: 900, color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 40px 1fr', alignItems: 'center', gap: '12px' }}>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-dim)', textDecoration: 'line-through' }}>{displayOld}</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <ArrowRight size={16} color="var(--accent-gold)" style={{ opacity: 0.3 }} />
                </div>
                <div style={{ background: 'rgba(212,161,23,0.05)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(212,161,23,0.2)' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-main)', fontWeight: 700 }}>{displayNew}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div style={{ 
      position: 'fixed', inset: 0, zIndex: 1000, 
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' 
    }}>
      {/* Backdrop */}
      <div onClick={onClose} style={{ 
        position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' 
      }}></div>

      {/* Modal Container */}
      <div style={{ 
        position: 'relative', width: '100%', maxWidth: '1100px', height: '80vh', 
        background: 'var(--bg-deep)', border: '1px solid rgba(255,255,255,0.1)', 
        borderRadius: '32px', display: 'flex', overflow: 'hidden', boxShadow: 'var(--shadow-luxe)'
      }}>
        
        {/* Sidebar List */}
        <div style={{ 
          width: '320px', borderRight: '1px solid rgba(255,255,255,0.05)', 
          background: 'rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column' 
        }}>
          <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <ShieldCheck size={20} color="var(--accent-gold)" />
              <h2 style={{ fontSize: '14px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Модерация</h2>
            </div>
            <p style={{ fontSize: '10px', color: 'var(--text-dim)', fontWeight: 700 }}>Заявок в очереди: {pendingEdits.length}</p>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '20px', opacity: 0.5 }}>Загрузка...</div>
            ) : pendingEdits.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', opacity: 0.3, fontSize: '12px' }}>Нет новых правок</div>
            ) : (
              pendingEdits.map((edit, idx) => (
                <div 
                  key={idx}
                  onClick={() => fetchOriginal(edit)}
                  style={{ 
                    padding: '16px', borderRadius: '16px', marginBottom: '8px', cursor: 'pointer',
                    background: selectedEdit === edit ? 'var(--accent-gold)' : 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <User size={12} color={selectedEdit === edit ? '#000' : 'var(--accent-gold)'} />
                    <span style={{ fontSize: '10px', fontWeight: 900, color: selectedEdit === edit ? '#000' : 'var(--text-dim)' }}>{edit.username}</span>
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: selectedEdit === edit ? '#000' : '#fff' }}>{edit.targetId}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'rgba(0,0,0,0.1)' }}>
          <div style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 900, textTransform: 'uppercase' }}>Анализ правок</h3>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', padding: '8px', borderRadius: '10px', cursor: 'pointer' }}>
              <X size={20} color="#fff" />
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
            {selectedEdit ? (
              <div style={{ maxWidth: '700px', margin: '0 auto' }}>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
                  <button 
                    disabled={processing}
                    onClick={() => handleAction('reject', selectedEdit)}
                    style={{ 
                      flex: 1, padding: '14px', borderRadius: '14px', border: '1px solid rgba(255,68,68,0.2)',
                      background: 'rgba(255,68,68,0.05)', color: '#ff4444', fontWeight: 800, fontSize: '11px',
                      textTransform: 'uppercase', cursor: 'pointer'
                    }}
                  >
                    Удалить
                  </button>
                  <button 
                    disabled={processing}
                    onClick={() => handleAction('approve', selectedEdit)}
                    style={{ 
                      flex: 1, padding: '14px', borderRadius: '14px', background: 'var(--accent-gold)',
                      color: '#000', fontWeight: 900, fontSize: '11px', border: 'none',
                      textTransform: 'uppercase', cursor: 'pointer', boxShadow: '0 8px 24px rgba(212,161,23,0.2)'
                    }}
                  >
                    Одобрить изменения
                  </button>
                </div>

                {renderDiff()}
              </div>
            ) : (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.2 }}>
                <Store size={64} style={{ marginBottom: '16px' }} />
                <p style={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Выберите заявку для проверки</p>
              </div>
            )}
          </div>
        </div>

        {/* Inline Confirm Dialog — replaces window.confirm (blocked by Chrome) */}
        {confirmAction && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 1200,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(4px)'
          }}>
            <div style={{
              background: '#1a1a1a', borderRadius: '20px',
              border: '1px solid rgba(255,255,255,0.1)',
              padding: '32px', maxWidth: '400px', width: '90%',
              textAlign: 'center', boxShadow: '0 32px 64px rgba(0,0,0,0.5)'
            }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%', margin: '0 auto 20px',
                background: confirmAction.action === 'approve' ? 'rgba(212,161,23,0.15)' : 'rgba(255,68,68,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: `1px solid ${confirmAction.action === 'approve' ? 'rgba(212,161,23,0.3)' : 'rgba(255,68,68,0.3)'}`
              }}>
                {confirmAction.action === 'approve'
                  ? <Check size={28} color="var(--accent-gold)" />
                  : <X size={28} color="#ff4444" />
                }
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 900, marginBottom: 8 }}>
                {confirmAction.action === 'approve' ? 'Одобрить изменения?' : 'Удалить запрос?'}
              </h3>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: 28, lineHeight: 1.5 }}>
                {confirmAction.action === 'approve'
                  ? 'Данные партнёра будут обновлены в базе и появятся в приложении.'
                  : 'Запрос будет безвозвратно удалён из очереди модерации.'
                }
              </p>
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  onClick={() => setConfirmAction(null)}
                  style={{
                    flex: 1, padding: '12px', borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'transparent', color: 'rgba(255,255,255,0.6)',
                    fontWeight: 700, fontSize: '13px', cursor: 'pointer'
                  }}
                >
                  Отмена
                </button>
                <button
                  onClick={executeAction}
                  style={{
                    flex: 1, padding: '12px', borderRadius: '12px', border: 'none',
                    background: confirmAction.action === 'approve' ? 'var(--accent-gold)' : '#ff4444',
                    color: confirmAction.action === 'approve' ? '#000' : '#fff',
                    fontWeight: 900, fontSize: '13px', cursor: 'pointer'
                  }}
                >
                  {confirmAction.action === 'approve' ? '✓ Да, одобрить' : '✕ Да, удалить'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Processing Loader */}
        {processing && (
          <div style={{ 
            position: 'absolute', inset: 0, zIndex: 1100, background: 'rgba(0,0,0,0.7)', 
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' 
          }}>
            <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid rgba(212,161,23,0.2)', borderTopColor: 'var(--accent-gold)', borderRadius: '50%' }}></div>
            <p style={{ marginTop: '16px', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', color: 'var(--accent-gold)' }}>Применяем...</p>
          </div>
        )}
      </div>
      
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
};

export default ModerationZone;
