import React from 'react';
import { 
  X, 
  Star, 
  Clock, 
  Tag, 
  Map, 
  ChevronRight, 
  MapPin, 
  Phone
} from 'lucide-react';

const CardPreviewModal = ({ poi, formValues, uiLang = 'ru', onClose }) => {
  if (!poi) return null;

  // Merge original poi data with transient formValues for real-time live preview!
  const currentData = { ...poi, ...formValues };

  // Language fallback
  const getField = (fieldPrefix) => {
    return currentData[`${fieldPrefix}_${uiLang}`] || currentData[`${fieldPrefix}_ru`] || currentData[`${fieldPrefix}_en`] || '';
  };

  const name = getField('name') || currentData.id || 'Наименование';
  const desc = getField('desc') || 'Описание заведения...';
  const category = (currentData.category || 'КАФЕ').toUpperCase();
  const rating = currentData.rating || '4.8';
  const hours = currentData.hours || currentData.opening_hours || '08:00 - 22:00';
  const address = currentData.address || 'Nha Trang, Vietnam';

  // Discount values
  const sizeDiscount = currentData.size_discount || currentData.ext_2 || '';
  const infoDiscount = currentData.info_discount || currentData.ext_4 || currentData.ext_6 || '100';

  // Get image URL
  const images = (currentData.images || '').split(/[,\s\n]+/).filter(Boolean);
  const heroImage = images[0] || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=1000&auto=format&fit=crop';

  // Tags
  const rawTags = (currentData.all_tags || currentData.ext_5 || '').split(/[;,]+/).map(t => t.trim()).filter(Boolean);
  const displayTags = rawTags.length > 0 
    ? rawTags.slice(0, 5).map(t => t.replace(/^tag_search_/, '').replace(/_/g, ' '))
    : ['Кондиционер', 'Оплата картой', 'Русское меню', 'Wi-Fi', 'Веранда'];

  // Discount text formatting
  const getDiscountSubtitle = () => {
    if (sizeDiscount && sizeDiscount !== 'Special') {
      return `${sizeDiscount}% (${infoDiscount === '100' ? 'На весь чек' : 'Спец. условия'})`;
    } else if (sizeDiscount === 'Special') {
      return 'Специальное предложение';
    } else if (infoDiscount) {
      return 'Подарок при посещении';
    }
    return '5% (На весь чек)';
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(5, 3, 2, 0.85)',
      backdropFilter: 'blur(12px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      {/* Modal Container */}
      <div style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        maxHeight: '95vh',
      }}>
        {/* Top Control Bar */}
        <div style={{
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          width: '100%',
          maxWidth: '390px',
          marginBottom: '12px',
          padding: '0 8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              background: 'linear-gradient(135deg, #d4a117 0%, #e5ad23 100%)',
              color: '#111',
              fontSize: '11px',
              fontWeight: '900',
              padding: '4px 10px',
              borderRadius: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              iOS Preview
            </span>
            <span style={{ fontSize: '12px', fontWeight: '700', color: 'rgba(255,255,255,0.7)' }}>
              Карточка в приложении
            </span>
          </div>

          <button 
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#FFF',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* iPhone Device Frame */}
        <div style={{
          width: '380px',
          height: '750px',
          backgroundColor: '#16120e',
          borderRadius: '44px',
          border: '10px solid #2a241e',
          boxShadow: '0 25px 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(212,161,23,0.2)',
          overflow: 'hidden',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          userSelect: 'none'
        }}>
          {/* Dynamic Island / Status Bar */}
          <div style={{
            height: '40px',
            backgroundColor: 'transparent',
            display: 'flex',
            justify: 'space-between',
            alignItems: 'center',
            padding: '0 24px',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 10,
            color: '#ffffff',
            fontSize: '12px',
            fontWeight: '700',
            pointerEvents: 'none'
          }}>
            <span>02:40</span>
            {/* Camera / Notch pill */}
            <div style={{
              width: '90px',
              height: '24px',
              backgroundColor: '#000',
              borderRadius: '20px',
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              top: '6px'
            }} />
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center', fontSize: '10px' }}>
              <span>5G</span>
              <span>46%</span>
            </div>
          </div>

          {/* Scrollable Screen Content */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            color: '#ffffff',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
            paddingBottom: '24px'
          }}>

            {/* 1. Hero Image Container */}
            <div style={{
              position: 'relative',
              width: '100%',
              height: '240px',
              overflow: 'hidden'
            }}>
              <img 
                src={heroImage} 
                alt={name} 
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }} 
              />
              {/* Gradient Overlay */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(to top, rgba(22,18,14,1) 0%, rgba(22,18,14,0.5) 50%, rgba(0,0,0,0.2) 100%)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                padding: '20px'
              }}>
                <div style={{
                  fontSize: '11px',
                  fontWeight: '800',
                  color: 'rgba(255,255,255,0.7)',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  marginBottom: '4px'
                }}>
                  {category}
                </div>
                <h1 style={{
                  fontSize: '22px',
                  fontWeight: '900',
                  lineHeight: '1.2',
                  margin: 0,
                  color: '#ffffff',
                  textShadow: '0 2px 8px rgba(0,0,0,0.5)'
                }}>
                  {name}
                </h1>
              </div>

              {/* Close Button top right */}
              <div style={{
                position: 'absolute',
                top: '44px',
                right: '16px',
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: 'rgba(0,0,0,0.5)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff'
              }}>
                <X size={14} />
              </div>
            </div>

            {/* Content Body */}
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* 2. Badges Bar */}
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: '#271f18',
                  border: '1px solid rgba(212,161,23,0.3)',
                  color: '#d4a117',
                  padding: '6px 12px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '800'
                }}>
                  <Star size={13} fill="#d4a117" color="#d4a117" />
                  <span>{rating}</span>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#271f18',
                  border: '1px solid rgba(212,161,23,0.2)',
                  color: '#d4a117',
                  padding: '6px 12px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '700'
                }}>
                  <Clock size={13} color="#d4a117" />
                  <span>Часы</span>
                </div>
              </div>

              {/* 3. Tags Chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {displayTags.map((tag, idx) => (
                  <span key={idx} style={{
                    backgroundColor: 'rgba(40,32,24,0.8)',
                    border: '1px solid rgba(212,161,23,0.25)',
                    color: '#c49a2a',
                    fontSize: '11px',
                    fontWeight: '700',
                    padding: '5px 12px',
                    borderRadius: '14px',
                    textTransform: 'capitalize'
                  }}>
                    {tag}
                  </span>
                ))}
              </div>

              {/* 4. Overview Section */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                <div style={{
                  fontSize: '10px',
                  fontWeight: '900',
                  color: '#b8861e',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase'
                }}>
                  ОБЗОР
                </div>
                <p style={{
                  fontSize: '13px',
                  lineHeight: '1.5',
                  color: 'rgba(255,255,255,0.9)',
                  margin: 0
                }}>
                  {desc}
                </p>
              </div>

              {/* 5. Coupon Card Banner */}
              {(sizeDiscount || infoDiscount) && (
                <div style={{
                  background: 'linear-gradient(135deg, #c48214 0%, #a86c0c 100%)',
                  borderRadius: '18px',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 8px 20px rgba(196,130,20,0.3)',
                  cursor: 'pointer'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff'
                    }}>
                      <Tag size={20} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '900', color: '#ffffff' }}>
                        Купон на скидку
                      </span>
                      <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.85)', fontWeight: '600' }}>
                        {getDiscountSubtitle()}
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={18} color="rgba(255,255,255,0.8)" />
                </div>
              )}

              {/* 6. Map Action Button */}
              <div style={{
                backgroundColor: '#dca318',
                borderRadius: '18px',
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                color: '#ffffff',
                boxShadow: '0 6px 16px rgba(220,163,24,0.3)',
                cursor: 'pointer'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Map size={18} color="#ffffff" />
                  <span style={{ fontSize: '14px', fontWeight: '900' }}>
                    Показать на карте
                  </span>
                </div>
                <ChevronRight size={18} color="#ffffff" />
              </div>

              {/* 7. Details Section */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
                <div style={{
                  fontSize: '10px',
                  fontWeight: '900',
                  color: '#b8861e',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase'
                }}>
                  ДЕТАЛИ
                </div>

                {/* Address Card */}
                <div style={{
                  backgroundColor: '#241c16',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '16px',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(212,161,23,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#d4a117',
                    flexShrink: 0
                  }}>
                    <MapPin size={16} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: '700' }}>
                      Адрес
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: '800', color: '#ffffff' }}>
                      {address}
                    </span>
                  </div>
                </div>

                {/* Working Hours Card */}
                <div style={{
                  backgroundColor: '#241c16',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '16px',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(212,161,23,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#d4a117',
                    flexShrink: 0
                  }}>
                    <Clock size={16} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: '700' }}>
                      Режим работы
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: '800', color: '#ffffff' }}>
                      {hours}
                    </span>
                  </div>
                </div>

                {/* Phone / Contact Card (if available) */}
                {(currentData.phone || currentData.wtsp || currentData.call) && (
                  <div style={{
                    backgroundColor: '#241c16',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '16px',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(212,161,23,0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#d4a117',
                      flexShrink: 0
                    }}>
                      <Phone size={16} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: '700' }}>
                        Телефон / Связь
                      </span>
                      <span style={{ fontSize: '13px', fontWeight: '800', color: '#ffffff' }}>
                        {currentData.phone || currentData.wtsp || currentData.call}
                      </span>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardPreviewModal;
