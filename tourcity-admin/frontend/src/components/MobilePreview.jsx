import React from 'react';
import { MapPin, Phone, Globe, Clock, Star, X, Map as MapIcon, ChevronRight, Tag } from 'lucide-react';

export default function MobilePreview({ poi }) {
  if (!poi) return null;

  const amenityTags = poi.ext_5 ? poi.ext_5.split(/[;,]+/).map(t => t.trim()).filter(Boolean) : [];
  
  // Tag COLORS from GuideDetailView.swift
  const tagColors = ['#d4a117', '#669959', '#75500a', '#907216', '#d4a117', '#cc5633', '#a67a4d'];

  return (
    <div className="preview-section animate-fade">
      <div className="header-subtitle mb-8 opacity-40">Предпросмотр (iOS)</div>
      
      <div className="iphone-frame">
        <div className="h-full overflow-y-auto bg-bg-espresso no-scrollbar">
          {/* Hero Header matching GuideDetailView.swift */}
          <div className="relative h-[220px] w-full" style={{ 
            background: `linear-gradient(to bottom, rgba(212, 161, 23, 0.4), rgba(212, 161, 23, 0.15), #1a110c)` 
          }}>
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.05] text-accent-gold scale-[5]">
                <MapIcon size={40} />
             </div>

             <div className="absolute top-10 right-4 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center">
                <X size={14} className="text-white" />
             </div>

             <div className="absolute bottom-0 left-0 p-6 space-y-2">
                <div className="flex items-center gap-2">
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] text-accent-gold">
                      {poi.category}
                   </span>
                   {poi.featured === '1' && (
                      <div className="flex items-center gap-1 bg-accent-gold/20 px-2 py-0.5 rounded-full text-[8px] font-black text-accent-gold">
                         <Star size={8} fill="currentColor" /> FEATURED
                      </div>
                   )}
                </div>
                <h2 className="text-2xl font-black text-text-main leading-tight tracking-tight">{poi.name_ru || 'Название места'}</h2>
             </div>
          </div>

          <div className="p-6 space-y-8">
             {/* Quick Info Section */}
             <div className="flex gap-2.5">
                <div className="flex items-center gap-1.5 px-3 py-2 bg-accent-gold/10 border border-accent-gold/20 rounded-xl">
                   <Star size={12} className="text-accent-gold" fill="currentColor" />
                   <span className="text-[13px] font-bold text-text-main">{poi.rating || '5.0'}</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-2 border border-white/5 rounded-xl" style={{ backgroundColor: 'rgba(102, 153, 89, 0.12)', borderColor: 'rgba(102, 153, 89, 0.2)' }}>
                   <span className="text-[13px] font-bold" style={{ color: '#669959' }}>{poi.price === '1' ? '$' : poi.price === '2' ? '$$' : '$$$'}</span>
                </div>
                {poi.hours && (
                   <div className="flex items-center gap-1.5 px-3 py-2 border border-white/5 rounded-xl" style={{ backgroundColor: 'rgba(212, 161, 23, 0.12)', borderColor: 'rgba(212, 161, 23, 0.2)' }}>
                      <Clock size={12} className="text-accent-gold" />
                      <span className="text-[13px] font-bold text-text-main">Открыто</span>
                   </div>
                )}
             </div>

             {/* Public Tags Section */}
             {amenityTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                   {amenityTags.map((tag, idx) => (
                      <div key={tag} className="px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wide" style={{ 
                         color: tagColors[idx % tagColors.length],
                         backgroundColor: `${tagColors[idx % tagColors.length]}1f`,
                         border: `1px solid ${tagColors[idx % tagColors.length]}4d`
                      }}>
                         {tag}
                      </div>
                   ))}
                </div>
             )}

             {/* Show on Map Button */}
             <div className="bg-accent-gold py-4 px-6 rounded-2xl flex items-center justify-between shadow-2xl shadow-accent-gold/20 text-black cursor-pointer group">
                <div className="flex items-center gap-3">
                   <MapIcon size={20} fill="currentColor" />
                   <span className="text-sm font-black tracking-widest">MAP NAVIGATION</span>
                </div>
                <ChevronRight size={18} className="opacity-40 group-hover:translate-x-1 transition-transform" />
             </div>

             {/* Discount Section Card */}
             {poi.ext_2 && (
                <div className="p-5 rounded-[24px] bg-white/5 border border-accent-gold/25 shadow-2xl space-y-4 relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-accent-gold/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
                   <div className="flex justify-between items-center relative z-10">
                      <div className="space-y-1">
                         <div className="flex items-center gap-2">
                            <Tag size={14} className="text-accent-gold" />
                            <span className="text-sm font-bold text-text-main">Скидка доступна</span>
                         </div>
                         {poi.ext_3 && (
                            <div className="text-[12px] font-medium text-accent-gold/80 pl-6 uppercase tracking-widest">До {poi.ext_3}</div>
                         )}
                      </div>
                      <div className="text-4xl font-black text-accent-gold leading-none">{poi.ext_2}%</div>
                   </div>
                   
                   {poi.ext_4 && (
                      <div className="relative z-10 bg-black/20 p-3.5 rounded-xl text-[12px] font-semibold text-text-dim border border-white/5">
                         {poi.ext_4 === '100' ? 'Скидка на весь чек' : `Условие №${poi.ext_4}`}
                      </div>
                   )}
                </div>
             )}

             <div className="border-t border-white/5 pt-8 space-y-6">
                <div className="space-y-3">
                   <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent-gold opacity-50">Описание</span>
                   <p className="text-sm text-text-dim leading-relaxed font-medium">
                      {poi.desc_ru || 'Описание пока не добавлено...'}
                   </p>
                </div>

                <div className="space-y-4 pt-4 pb-12">
                   <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent-gold opacity-50">Информация</span>
                   
                   <div className="space-y-3">
                      {poi.address && (
                         <div className="flex items-center gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl">
                            <MapPin size={18} className="text-accent-gold opacity-60" />
                            <div className="space-y-1">
                               <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Локация</div>
                               <div className="text-[13px] font-semibold text-text-main line-clamp-1">{poi.address}</div>
                            </div>
                         </div>
                      )}
                      {poi.phone && (
                         <div className="flex items-center gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl">
                            <Phone size={18} className="text-accent-gold opacity-60" />
                            <div className="space-y-1">
                               <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Контакты</div>
                               <div className="text-[13px] font-semibold text-text-main">{poi.phone}</div>
                            </div>
                         </div>
                      )}
                      {poi.website && (
                         <div className="flex items-center gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl">
                            <Globe size={18} className="text-accent-gold opacity-60" />
                            <div className="space-y-1">
                               <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Сайт</div>
                               <div className="text-[13px] font-semibold text-text-main line-clamp-1">{poi.website}</div>
                            </div>
                         </div>
                      )}
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
