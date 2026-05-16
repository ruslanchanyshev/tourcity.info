import React from 'react';
import { Calendar, ChevronRight } from 'lucide-react';
import { Controller } from 'react-hook-form';
import DateInput from './DateInput';

const EventSection = ({ 
  register, 
  control, 
  setValue, 
  watch, 
  t, 
  uiLang, 
  expanded, 
  onToggle,
  onDeleteEvent,
  deletingEvent
}) => {
  const category = watch('category') || '';
  const ext_7 = watch('ext_7') || '';
  const ext_8 = watch('ext_8') || '';
  const ext_9 = watch('ext_9') || '09:00';
  const ext_11 = watch('ext_11') || '';

  const isServiceCategory = ['beauty', 'hair', 'health', 'fitness', 'photo_video', 'legal_visa', 'real_estate', 'home_services', 'tech_repair', 'auto_moto', 'kids', 'education', 'events', 'flowers', 'pets', 'delivery', 'tattoo', 'astrology', 'service', 'transport'].includes(category);

  if (!isServiceCategory) return null;

  // Split time "09:00" -> hour & minute
  const [hour, minute] = ext_9.split(':');

  const handleHourChange = (e) => {
    setValue('ext_9', `${e.target.value}:${minute || '00'}`, { shouldDirty: true });
  };

  const handleMinuteChange = (e) => {
    setValue('ext_9', `${hour || '09'}:${e.target.value}`, { shouldDirty: true });
  };

  return (
    <div className="card" style={{ border: '1px solid rgba(74,222,128,0.15)', background: 'rgba(74,222,128,0.02)', padding: 16 }}>
      <div
        onClick={onToggle}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
      >
        <h2 className="card-title" style={{ marginBottom: 0, color: '#4ADE80', fontSize: 13 }}>
          <Calendar size={16} /> {t.eventTitle}
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {ext_7 && (
            <span style={{ background: '#4ADE80', color: '#000', fontSize: 9, fontWeight: 900, padding: '2px 8px', borderRadius: 10 }}>
              {uiLang === 'ru' ? 'АКТИВНО' : 'ACTIVE'}
            </span>
          )}
          <ChevronRight 
            size={16} 
            color="var(--text-muted)" 
            style={{ transform: expanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.3s' }} 
          />
        </div>
      </div>

      {expanded && (
        <div className="animate-fade" style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', overflow: 'hidden' }}>
            <div>
              <label style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>
                {t.eventName}
              </label>
              <input 
                style={{ padding: 8, fontSize: 13 }} 
                {...register('ext_7')}
                placeholder={uiLang === 'ru' ? 'Например: Открытие сезона' : 'E.g. Season Opening'} 
              />
            </div>

            {/* Date Picker via controller */}
            <div>
              <label style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>
                {t.eventDate}
              </label>
              <Controller
                name="ext_8"
                control={control}
                render={({ field }) => (
                  <DateInput
                    value={field.value || ''}
                    onChange={field.onChange}
                    lang={uiLang}
                  />
                )}
              />
            </div>

            {/* Time Picker */}
            <div>
              <label style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>
                {t.eventTime}
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <select
                  value={hour || '09'}
                  onChange={handleHourChange}
                  style={{ fontWeight: 700, fontSize: 14, padding: '10px 14px', width: '100%' }}
                >
                  {Array.from({ length: 24 }).map((_, i) => { 
                    const h = i.toString().padStart(2, '0'); 
                    return <option key={h} value={h}>{h}ч</option>; 
                  })}
                </select>
                <select
                  value={minute || '00'}
                  onChange={handleMinuteChange}
                  style={{ fontWeight: 700, fontSize: 14, padding: '10px 14px', width: '100%' }}
                >
                  {['00', '10', '20', '30', '40', '50'].map(m => (
                    <option key={m} value={m}>{m}м</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>
                {t.eventLocation}
              </label>
              <input 
                style={{ padding: 8, fontSize: 13 }} 
                {...register('ext_10')}
                placeholder={uiLang === 'ru' ? 'Адрес или название места' : 'Venue address or name'} 
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <label style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)' }}>
                  {t.eventConditions}
                </label>
                <span style={{ fontSize: 10, fontWeight: 800, color: ext_11.length >= 60 ? '#4ADE80' : 'var(--text-muted)' }}>
                  {ext_11.length} / 60
                </span>
              </div>
              <input 
                style={{ padding: 8, fontSize: 13 }} 
                maxLength={60}
                {...register('ext_11')}
                placeholder={uiLang === 'ru' ? 'Свободный вход / предварительная запись' : 'Free entry / reservation required'} 
              />
            </div>

            {/* Cancel/Delete Event */}
            {ext_7 && (
              <button
                type="button"
                onClick={onDeleteEvent}
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
  );
};

export default EventSection;
