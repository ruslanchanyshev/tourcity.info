import React from 'react';
import { Gift } from 'lucide-react';
import { Controller } from 'react-hook-form';
import DateInput from './DateInput';
import { getDiscountCodes } from '../discountCodes';

const DiscountSection = ({ 
  register, 
  control, 
  watch, 
  t, 
  uiLang 
}) => {
  const size_discount = watch('size_discount') || '0';
  const exp_discount = watch('exp_discount') || '';
  const info_discount = watch('info_discount') || '';

  const isActive = size_discount && size_discount !== '0';

  return (
    <div className="card" style={{ border: '1px solid rgba(212,161,23,0.2)', background: 'rgba(212,161,23,0.03)', padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h2 className="card-title" style={{ marginBottom: 0, color: 'var(--accent-gold)', fontSize: 13 }}>
          <Gift size={16} /> {t.couponTitle}
        </h2>
        {isActive && (
          <span style={{ background: '#22C55E', color: '#FFF', fontSize: 9, fontWeight: 900, padding: '2px 8px', borderRadius: 10 }}>
            {t.couponActive}
          </span>
        )}
      </div>

      <div className="coupon-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <div style={{ minWidth: 0 }}>
          <label style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>
            %
          </label>
          <select 
            {...register('size_discount')} 
            style={{ fontWeight: 800, fontSize: 14, color: 'var(--accent-gold)', width: '100%', padding: '10px 14px' }}
          >
            <option value="0">{t.couponNone}</option>
            {[5, 10, 15, 20, 25, 30, 40, 50].map(v => (
              <option key={v} value={v}>{v}%</option>
            ))}
            <option value="Special">Special</option>
          </select>
        </div>
        
        <div style={{ minWidth: 0, overflow: 'hidden' }}>
          <label style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>
            {t.couponExpiry}
          </label>
          <Controller
            name="exp_discount"
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
      </div>

      <div>
        <label style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>
          {t.couponConditions}
        </label>
        <select 
          {...register('info_discount')} 
          style={{ fontSize: 13, padding: 8, width: '100%' }}
        >
          <option value="">-- {t.couponConditions} --</option>
          {getDiscountCodes(uiLang, localStorage.getItem('partner_mode') || 'places').map(item => (
            <option key={item.code} value={item.code}>{item.text}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default DiscountSection;
