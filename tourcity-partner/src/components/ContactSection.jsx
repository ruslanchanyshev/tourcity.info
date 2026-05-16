import React from 'react';
import { Phone, ChevronRight } from 'lucide-react';
import { Controller } from 'react-hook-form';
import TimeInput from './TimeInput';

const ContactSection = ({ 
  register, 
  control, 
  setValue, 
  watch, 
  t, 
  uiLang, 
  expanded, 
  onToggle 
}) => {
  const category = watch('category') || '';
  const hours = watch('hours') || '';
  const inst = watch('inst') || '';
  const website = watch('website') || '';
  const site = watch('site') || '';
  const ext_1 = watch('ext_1') || '';

  const isServiceCategory = ['beauty', 'hair', 'health', 'fitness', 'photo_video', 'legal_visa', 'real_estate', 'home_services', 'tech_repair', 'auto_moto', 'kids', 'education', 'events', 'flowers', 'pets', 'delivery', 'tattoo', 'astrology', 'service', 'transport'].includes(category);

  // Parse hours to get start and end times
  const getHoursParts = () => {
    if (hours === '24/7') return { start: '09:00', end: '22:00' };
    const parts = hours.split(' - ');
    return {
      start: parts[0] || '09:00',
      end: parts[1] || '22:00'
    };
  };

  const { start, end } = getHoursParts();

  const handleToggle247 = () => {
    setValue('hours', hours === '24/7' ? '09:00 - 22:00' : '24/7', { shouldDirty: true });
  };

  return (
    <div className={`card ${expanded ? 'expanded' : ''}`} style={{ padding: 16 }}>
      <div 
        onClick={onToggle}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
      >
        <h2 className="card-title" style={{ marginBottom: 0, fontSize: 13 }}>
          <Phone size={16} color="var(--accent-gold)"/> {t.contactsTitle}
        </h2>
        <ChevronRight 
          size={16} 
          color="var(--text-muted)" 
          style={{ transform: expanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.3s' }} 
        />
      </div>
      
      {expanded && (
        <div className="animate-fade" style={{ marginTop: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>
                Instagram
              </label>
              <input 
                style={{ padding: 8, fontSize: 13 }} 
                {...register('inst')}
                placeholder="@..." 
              />
            </div>
            <div>
              <label style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>
                {t.telegram}
              </label>
              <input 
                style={{ padding: 8, fontSize: 13 }} 
                {...register('tg')}
                placeholder="username" 
              />
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
            <div>
              <label style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>
                {t.phone} / WhatsApp
              </label>
              <input 
                style={{ padding: 8, fontSize: 13 }} 
                {...register('wtsp')}
                placeholder="+84..." 
              />
            </div>
            <div>
              <label style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>
                {t.portfolio} / Site
              </label>
              <input 
                style={{ padding: 8, fontSize: 13 }} 
                {...register('site')}
                placeholder="https://..." 
              />
            </div>
          </div>

          {!isServiceCategory && (
            <div style={{ marginTop: 12 }}>
              <label style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>
                {t.address}
              </label>
              <input 
                style={{ padding: 8, fontSize: 13 }} 
                {...register('address')}
                placeholder={t.address} 
              />
            </div>
          )}

          <div style={{ marginTop: 12 }}>
            <label style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', marginBottom: 4, display: 'flex', justifyContent: 'space-between' }}>
              <span>{t.workingHours}</span>
              <span 
                onClick={handleToggle247}
                style={{ 
                  color: hours === '24/7' ? 'var(--accent-gold)' : 'inherit', 
                  cursor: 'pointer', 
                  opacity: hours === '24/7' ? 1 : 0.6 
                }}
              >
                24/7
              </span>
            </label>
            <div style={{ 
              display: 'flex', 
              gap: '12px', 
              alignItems: 'center', 
              opacity: hours === '24/7' ? 0.5 : 1, 
              pointerEvents: hours === '24/7' ? 'none' : 'auto', 
              marginTop: 4 
            }}>
              <TimeInput 
                value={start} 
                onChange={val => {
                  setValue('hours', `${val} - ${end}`, { shouldDirty: true });
                }}
              />
              <span style={{ color: 'var(--text-muted)', fontWeight: 900, fontSize: 12 }}>—</span>
              <TimeInput 
                value={end} 
                onChange={val => {
                  setValue('hours', `${start} - ${val}`, { shouldDirty: true });
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactSection;
