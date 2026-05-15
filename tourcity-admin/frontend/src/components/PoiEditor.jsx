import React, { useState, useEffect } from 'react';
import { 
  X, Save, Globe, Phone, MapPin, 
  Clock, Award, Tag, Image as ImageIcon,
  Map as MapIcon, Star, Info, ChevronRight, ExternalLink, Check,
  Sparkles, Loader2, Calendar
} from 'lucide-react';

const AMENITY_OPTIONS = [
  'wifi', 'strong_wifi', 'ac', 'parking', 'pool', 'infinity_pool', 'kids_pool', 
  'pool_bar', 'beach_club', 'ocean_access', 'beach_towels', 'sunset_view',
  'outdoor_seating', 'private_room', 'quiet_zone', 'coworking', 'usb_charging',
  'charging_stations', 'live_music', 'live_sports', 'spa_services', 'shuttle_service',
  'bike_rental', 'atm_nearby', 'pharmacy_nearby', 'halal_food', 'vegan_friendly',
  'vegetarian', 'gluten_free', 'high_chairs', 'kids_room', 'kids_menu',
  'ru_speaking', 'eng_speaking', 'kor_speaking', 'english_speaking_staff',
  'delivery', 'takeaway', 'no_smoking', 'smoking_area', 'card_payment',
  'cash_only', 'booking_required', 'happy_hour', 'street_food', 'craft_beer',
  'craft_cocktails', 'hookah', 'wheelchair',
  
  // Добавленные из поиска:
  'tag_search_seafood', 'tag_search_local_food', 'tag_search_sushi', 'tag_search_meat',
  'tag_search_rooftop', 'tag_search_romantic', 'tag_search_karaoke', 'tag_search_club'
];

// Russian labels pulled from LocalizationManager.swift
// Key = stored value, value = what admin sees
const TAG_LABELS_RU = {
  wifi:                   'Wi-Fi',
  strong_wifi:            'Скоростной Wi-Fi',
  ac:                     'Кондиционер',
  parking:                'Парковка',
  pool:                   'Бассейн',
  infinity_pool:          'Инфинити-бассейн',
  kids_pool:              'Детский бассейн',
  pool_bar:               'Бар у бассейна',
  beach_club:             'Пляжный клуб',
  ocean_access:           'Выход к морю',
  beach_towels:           'Пляжные полотенца',
  sunset_view:            'Вид на закат',
  outdoor_seating:        'Столики на улице',
  private_room:           'VIP кабинеты',
  quiet_zone:             'Тихая зона',
  coworking:              'Коворкинг',
  usb_charging:           'USB зарядки',
  charging_stations:      'Зарядка гаджетов',
  live_music:             'Живая музыка',
  live_sports:            'Трансляции матчей',
  spa_services:           'СПА услуги',
  shuttle_service:        'Шаттл / Трансфер',
  bike_rental:            'Аренда байков',
  atm_nearby:             'Банкомат рядом',
  pharmacy_nearby:        'Аптека рядом',
  halal_food:             'Халяльное меню',
  vegan_friendly:         'Веганское меню',
  vegetarian:             'Вегетарианское',
  gluten_free:            'Безглютеновое',
  high_chairs:            'Детские стульчики',
  kids_room:              'Детская комната',
  kids_menu:              'Детское меню',
  ru_speaking:            'Русское меню',
  eng_speaking:           'English Menu',
  kor_speaking:           'Корейское меню',
  english_speaking_staff: 'Англоязычный персонал',
  delivery:               'Доставка',
  takeaway:               'На вынос',
  no_smoking:             'Для некурящих',
  smoking_area:           'Зона для курения',
  card_payment:           'Оплата картой',
  cash_only:              'Только наличные',
  booking_required:       'Бронирование',
  happy_hour:             'Счастливые часы',
  street_food:            'Уличная еда',
  craft_beer:             'Крафтовое пиво',
  craft_cocktails:        'Крафтовые коктейли',
  hookah:                 'Кальян',
  wheelchair:             'Доступная среда',
  
  // Universal Search Tags (Часть теперь доступна как публичные)
  tag_search_seafood: 'Морепродукты',
  tag_search_sushi: 'Суши / Роллы',
  tag_search_meat: 'Мясо / Стейк',
  tag_search_pizza: 'Пицца (Поиск)',
  tag_search_burger: 'Бургеры (Поиск)',
  tag_search_local_food: 'Местная кухня',
  tag_search_vegan: 'Веган / ЗОЖ (Поиск)',
  tag_search_coffee: 'Кофе (Поиск)',
  tag_search_dessert: 'Десерты / Выпечка (Поиск)',
  tag_search_rooftop: 'Руфтоп / Вид',
  tag_search_live_music_venue: 'Живая музыка (Поиск)',
  tag_search_club: 'Клуб / Вечеринка',
  tag_search_romantic: 'Романтика',
  tag_search_pool_venue: 'Бассейн (Поиск)',
  tag_search_karaoke: 'Караоке',
  tag_search_souvenir: 'Сувениры (Поиск)',
  tag_search_pharmacy: 'Аптека (Поиск)',
  tag_search_supermarket: 'Супермаркет (Поиск)',
};


// SEARCH_TAG_GROUPS and ALL_TAGS_OPTIONS are defined below with dynamic grouping


// ── SERVICES SPECIFIC CONSTANTS ──
const SERVICE_AMENITY_OPTIONS = [
  'home_visit', 'studio_only', 'free_consult', 'online_booking', 'crypto_payment', 
  'card_payment', 'cash_only', 'ru_speaking', 'eng_speaking', 'vn_speaking',
  'prepayment_req', 'urgent_service', 'guarantee', 'portfolio_avail', 'med_edu'
];

Object.assign(TAG_LABELS_RU, {
  home_visit: 'Выезд на дом',
  studio_only: 'Только в студии',
  free_consult: 'Бесплатная консультация',
  online_booking: 'Онлайн-запись',
  crypto_payment: 'Оплата Crypto',
  vn_speaking: 'Вьетнамский мастер',
  prepayment_req: 'По предоплате',
  urgent_service: 'Срочный вызов',
  guarantee: 'Дает гарантию',
  portfolio_avail: 'Есть портфолио',
  med_edu: 'Мед. образование',
  
  tag_search_manicure: 'маникюр', tag_search_pedicure: 'педикюр', tag_search_extensions: 'наращивание', tag_search_eyelashes: 'ресницы', tag_search_eyebrows: 'брови', tag_search_lamination: 'ламинирование', tag_search_sugaring: 'шугаринг', tag_search_laser: 'лазер', tag_search_botox: 'ботокс', tag_search_lips: 'губы',
  tag_search_haircut: 'стрижка', tag_search_coloring: 'окрашивание', tag_search_blond: 'блонд', tag_search_keratin: 'кератин', tag_search_barbershop: 'барбершоп', tag_search_beard: 'борода',
  tag_search_massage: 'массаж', tag_search_chiropractor: 'мануальщик', tag_search_osteopath: 'остеопат', tag_search_psychologist: 'психолог', tag_search_tarot: 'таролог', tag_search_natal_chart: 'натальная карта',
  tag_search_nanny: 'няня', tag_search_tutor: 'репетитор', tag_search_english: 'английский', tag_search_vietnamese: 'вьетнамский', tag_search_vocals: 'вокал', tag_search_guitar: 'гитара', tag_search_dance: 'танцы',
  tag_search_visarun: 'визаран', tag_search_borderrun: 'бордерран', tag_search_residence_permit: 'внж', tag_search_driving_license: 'права', tag_search_bank_card: 'банковская карта',
  tag_search_cleaning: 'клининг', tag_search_house_cleaning: 'уборка', tag_search_dry_cleaning: 'химчистка', tag_search_laundry: 'стирка', tag_search_ac_repair: 'ремонт кондиционеров', tag_search_electrician: 'электрик', tag_search_plumber: 'сантехник', tag_search_furniture_assembly: 'сборка мебели',
  tag_search_custom_cake: 'торт на заказ', tag_search_cupcakes: 'капкейки', tag_search_flower_delivery: 'доставка цветов', tag_search_balloons: 'шарики', tag_search_animator: 'аниматор', tag_search_photographer: 'фотограф', tag_search_videographer: 'видеограф', tag_search_drone: 'дрон',
  tag_search_bike_rental: 'аренда байка', tag_search_car_rental: 'аренда авто', tag_search_car_wash: 'автомойка', tag_search_taxi: 'такси', tag_search_transfer: 'трансфер', tag_search_cargo: 'карго', tag_search_parcel_delivery: 'доставка посылок',
  tag_search_phone_repair: 'ремонт телефонов', tag_search_apple_repair: 'ремонт apple', tag_search_laptop_repair: 'ремонт ноутбуков',
  tag_search_jewelry: 'ювелирные украшения', tag_search_gold: 'золото', tag_search_silver: 'серебро', tag_search_pearl: 'жемчуг', tag_search_gems: 'драгоценные камни', tag_search_accessories: 'украшения',
  tag_search_spa: 'спа и массаж',
  tag_search_tattoo: 'тату', tag_search_piercing: 'пирсинг',
  tag_search_real_estate: 'аренда жилья', tag_search_realtor: 'риелтор',
  tag_search_grooming: 'груминг', tag_search_dog_walking: 'выгул собак', tag_search_pet_boarding: 'передержка',
  tag_search_fitness_trainer: 'фитнес тренер', tag_search_personal_trainer: 'персональный тренер', tag_search_gym: 'тренажерный зал', tag_search_yoga: 'йога', tag_search_pilates: 'пилатес', tag_search_boxing: 'бокс', tag_search_muay_thai: 'муай тай', tag_search_stretching: 'растяжка', tag_search_surfing: 'серфинг', tag_search_diving: 'дайвинг'
});

const SEARCH_TAG_GROUPS = [
  {
    id: 'jewelry',
    title: '💎 ЮВЕЛИРНЫЕ ИЗДЕЛИЯ',
    tags: ['tag_search_jewelry', 'tag_search_gold', 'tag_search_silver', 'tag_search_pearl', 'tag_search_gems', 'tag_search_accessories']
  },
  {
    id: 'beauty',
    title: '💅 КРАСОТА И СПА',
    tags: ['tag_search_massage', 'tag_search_spa', 'tag_search_manicure', 'tag_search_pedicure', 'tag_search_extensions', 'tag_search_eyelashes', 'tag_search_eyebrows', 'tag_search_lamination', 'tag_search_sugaring', 'tag_search_laser', 'tag_search_botox', 'tag_search_lips', 'tag_search_haircut', 'tag_search_coloring', 'tag_search_blond', 'tag_search_keratin', 'tag_search_barbershop', 'tag_search_beard', 'tag_search_tattoo', 'tag_search_piercing']
  },
  {
    id: 'services',
    title: '🏠 УСЛУГИ И БЫТ',
    tags: ['tag_search_cleaning', 'tag_search_house_cleaning', 'tag_search_dry_cleaning', 'tag_search_laundry', 'tag_search_ac_repair', 'tag_search_electrician', 'tag_search_plumber', 'tag_search_furniture_assembly', 'tag_search_phone_repair', 'tag_search_apple_repair', 'tag_search_laptop_repair', 'tag_search_nanny', 'tag_search_real_estate', 'tag_search_realtor', 'tag_search_grooming', 'tag_search_dog_walking', 'tag_search_pet_boarding']
  },
  {
    id: 'edu',
    title: '🎓 ОБУЧЕНИЕ И ХОББИ',
    tags: ['tag_search_tutor', 'tag_search_english', 'tag_search_vietnamese', 'tag_search_vocals', 'tag_search_guitar', 'tag_search_dance', 'tag_search_psychologist', 'tag_search_tarot', 'tag_search_natal_chart']
  },
  {
    id: 'transport',
    title: '🚲 ТРАНСПОРТ И ДОКУМЕНТЫ',
    tags: ['tag_search_bike_rental', 'tag_search_car_rental', 'tag_search_car_wash', 'tag_search_taxi', 'tag_search_transfer', 'tag_search_cargo', 'tag_search_parcel_delivery', 'tag_search_visarun', 'tag_search_borderrun', 'tag_search_residence_permit', 'tag_search_driving_license', 'tag_search_bank_card']
  },
  {
    id: 'media',
    title: '🎈 ПРАЗДНИКИ И МЕДИА',
    tags: ['tag_search_custom_cake', 'tag_search_cupcakes', 'tag_search_flower_delivery', 'tag_search_balloons', 'tag_search_animator', 'tag_search_photographer', 'tag_search_videographer', 'tag_search_drone']
  },
  {
    id: 'food',
    title: '🍕 КУХНЯ И ЕДА',
    tags: ['tag_search_pizza', 'tag_search_burger', 'tag_search_vegan', 'tag_search_seafood', 'tag_search_local_food', 'tag_search_sushi', 'tag_search_meat', 'tag_search_coffee', 'tag_search_dessert']
  },
  {
    id: 'sport',
    title: '🏋️ СПОРТ',
    tags: ['tag_search_fitness_trainer', 'tag_search_personal_trainer', 'tag_search_gym', 'tag_search_yoga', 'tag_search_pilates', 'tag_search_boxing', 'tag_search_muay_thai', 'tag_search_stretching', 'tag_search_surfing', 'tag_search_diving']
  }
];

const SERVICE_TAGS_OPTIONS = SEARCH_TAG_GROUPS.flatMap(g => g.tags);
const ALL_TAGS_OPTIONS = [...SEARCH_TAG_GROUPS.flatMap(g => g.tags)];
// Add old static tags for compatibility
const OLD_STATIC_TAGS = ['wifi', 'strong_wifi', 'ac', 'parking', 'pool', 'infinity_pool', 'kids_pool', 'pool_bar', 'beach_club', 'ocean_access', 'beach_towels', 'sunset_view', 'outdoor_seating', 'private_room', 'quiet_zone', 'coworking', 'usb_charging', 'charging_stations', 'live_music', 'live_sports', 'spa_services', 'shuttle_service', 'atm_nearby', 'pharmacy_nearby', 'halal_food', 'vegan_friendly', 'vegetarian', 'gluten_free', 'high_chairs', 'kids_room', 'kids_menu', 'ru_speaking', 'eng_speaking', 'kor_speaking', 'delivery', 'takeaway', 'no_smoking', 'smoking_area', 'card_payment', 'cash_only', 'booking_required', 'happy_hour', 'street_food', 'craft_beer', 'craft_cocktails', 'hookah', 'wheelchair', 'завтраки', 'вид на море', 'терраса', 'пляж', 'бесплатная парковка', 'вип-зал', 'частный пляж', 'открытая кухня', 'премиум', 'концерт', 'диджей', 'спортбар', 'трансляция прямая', 'керлингбоулинг', 'шафле', 'боулинг', 'биллиард', 'настольный теннис', 'детская площадка', 'пещеры', 'водопад', 'национальный парк', 'массаж', 'йога', 'медитация', 'фитнес', 'русская кухня', 'европейская кухня', 'безалкогольные напитки', 'винная карта', 'авторские напитки', 'repeat_visit', 'tag_search_live_music_venue', 'tag_search_pool_venue', 'tag_search_souvenir', 'tag_search_pharmacy', 'tag_search_supermarket'];
ALL_TAGS_OPTIONS.push(...OLD_STATIC_TAGS);


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

const MALL_OPTIONS = [
  { id: 'mall_ab', name: 'AB Central Square' },
  { id: 'mall_vincom_tranphu', name: 'Vincom Plaza (Tran Phu)' },
  { id: 'mall_vincom_lethanhton', name: 'Vincom Plaza (Le Thanh Ton)' },
  { id: 'mall_goldcoast', name: 'Gold Coast Mall' },
  { id: 'mall_lottemart', name: 'LOTTE MART (Standalone)' },
  { id: 'mall_ntc', name: 'Nha Trang Center' },
  { id: 'mall_go', name: 'GO! Nha Trang (Big C)' },
  { id: 'mall_coop', name: 'Co.opmart' },
];

// Languages — compact labels for the switcher
const LANGUAGES = [
  { code: 'ru', label: 'RU', name: 'Русский' },
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'vi', label: 'VI', name: 'Tiếng Việt' },
  { code: 'ko', label: 'KO', name: '한국어' },
  { code: 'zh', label: 'ZH', name: '中文' },
  { code: 'fr', label: 'FR', name: 'Français' },
  { code: 'es', label: 'ES', name: 'Español' },
];

export default function PoiEditor({ mode = 'places', poi, initialDraft, onDraftChange, onSave, onCancel }) {
  const [data, setData] = useState(initialDraft || poi);
  const [activeTab, setActiveTab] = useState('main');
  const [selectedLang, setSelectedLang] = useState('ru');
  const [translating, setTranslating] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [showDiscountSelector, setShowDiscountSelector] = useState(false);

  useEffect(() => {
    setData(initialDraft || poi);
    setActiveTab('main');
  }, [poi._rowIndex, poi.id]);

  // Автоматическое сохранение в черновик при любых изменениях
  useEffect(() => {
    // Если ссылка на объект изменилась (была мутация через setData) и это не первичный объект
    if (data && data !== poi && onDraftChange) {
      onDraftChange(data);
    }
  }, [data]);

  const handleChange = (field, value) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  if (!data) return null;

  const saveGeminiKey = undefined; // no longer needed

  // Translate via local Ollama (no API key required)
  const translateWithGemini = async () => {
    const srcName = data.name_ru || '';
    const srcDesc = data.desc_ru || '';
    if (!srcName && !srcDesc) {
      alert('Сначала заполните название и описание на русском (RU)');
      return;
    }
    setTranslating(true);
    try {
      const res = await fetch('http://localhost:3001/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name_ru: srcName, desc_ru: srcDesc }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Backend error');
      const updates = {};
      for (const [lang, vals] of Object.entries(json)) {
        if (vals.name) updates[`name_${lang}`] = vals.name;
        if (vals.desc) updates[`desc_${lang}`] = vals.desc;
      }
      setData(prev => ({ ...prev, ...updates }));
    } catch (err) {
      alert('Ошибка перевода: ' + err.message);
    } finally {
      setTranslating(false);
    }
  };



  const toggleAmenity = (tag) => {
    const current = data.ext_5 ? data.ext_5.split(/[;,]+/).map(x => x.trim()).filter(Boolean) : [];
    const next = current.includes(tag) ? current.filter(x => x !== tag) : [...current, tag];
    handleChange('ext_5', next.join('; '));
  };

  const toggleAllTag = (tag) => {
    const current = data.all_tags ? data.all_tags.split(/[;,]+/).map(x => x.trim()).filter(Boolean) : [];
    const next = current.includes(tag) ? current.filter(x => x !== tag) : [...current, tag];
    handleChange('all_tags', next.join('; '));
  };

  const selectedDiscountItem = DISCOUNT_CODES.find(c => c.code === data.ext_4);

  return (
    // KEY FIX: flex-col with overflow:hidden so inner scroll works correctly
    <div style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden' }} className="animate-fade">

      {/* HEADER */}
      <div className="header-bar" style={{ flexShrink: 0 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', width:'100%' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="header-subtitle">Редактирование</div>
              <div style={{
                padding: '2px 8px',
                borderRadius: 4,
                fontSize: 9,
                fontWeight: 900,
                background: mode === 'services' ? 'rgba(180,120,220,0.15)' : 'rgba(122,168,212,0.15)',
                color: mode === 'services' ? '#b478dc' : '#7aa8d4',
                border: mode === 'services' ? '1px solid rgba(180,120,220,0.3)' : '1px solid rgba(122,168,212,0.3)',
                textTransform: 'uppercase'
              }}>
                {mode === 'services' ? '👤 МАСТЕР' : '📍 МЕСТО'}
              </div>
            </div>
            <h1 className="header-title" style={{ maxWidth: 320, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {data.name_ru || 'Новый объект'}
            </h1>
          </div>
          <button onClick={onCancel} style={{ width:40, height:40, borderRadius:10, background:'transparent', border:'1px solid rgba(255,255,255,0.08)', cursor:'pointer', transition:'all 0.2s', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <X size={18} color="var(--text-muted)" />
          </button>
        </div>
      </div>

      {/* TABS — fixed, doesn't scroll */}
      <div className="tab-container" style={{ flexShrink: 0 }}>
        {[
          { id: 'main', label: 'БАЗА' },
          { id: 'content', label: 'ТЕКСТ' },
          { id: 'media', label: 'МЕДИА' },
          { id: 'ext', label: 'ДОП' },
          { id: 'event', label: 'СОБЫТИЕ', hidden: mode !== 'services' }
        ].map(tab => {
          if (tab.hidden) return null;
          return (
            <div 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id)} 
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            >
              {tab.label}
            </div>
          );
        })}
      </div>

      {/* SCROLLABLE CONTENT AREA */}
      <div style={{ flex:1, overflowY:'auto', overflowX:'hidden' }}>

        {/* ── TAB: БАЗА ── */}
        {activeTab === 'main' && (
          <div className="animate-fade">
            <div className="editor-card">
              <div className="card-label"><Info size={14}/> Основная информация</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
                <input className="premium-input" placeholder="ID объекта" value={data.id || ''} onChange={e => handleChange('id', e.target.value)} />
                <select className="premium-input" style={{ cursor:'pointer' }} value={data.category || (mode === 'services' ? 'beauty' : 'sight')} onChange={e => handleChange('category', e.target.value)}>
                  <optgroup label="── ЛОКАЦИИ (PLACES) ──">
                    <option value="sight">Entertainment / Sight</option>
                    <option value="restaurant">Restaurant</option>
                    <option value="fastfood">Fastfood</option>
                    <option value="cafe">Cafe</option>
                    <option value="beach">Beach</option>
                    <option value="hotel">Hotel</option>
                    <option value="shopping">Shop / Mall</option>
                    <option value="temple">Temple / Pagoda</option>
                    <option value="museum">Museum</option>
                    <option value="nature">Nature / Park</option>
                    <option value="nightlife">Nightlife / Bar</option>
                    <option value="entertainment">Entertainment</option>
                  </optgroup>
                  
                  <optgroup label="── УСЛУГИ (SERVICES) ──">
                    <option value="spa">Spa & Massage</option>
                    <option value="beauty">Beauty & Health</option>
                    <option value="hair">Hair / Barbershop</option>
                    <option value="health">Health & Medical (Private)</option>
                    <option value="medical">Medical / Pharmacy</option>
                    <option value="fitness">Sports & Fitness</option>
                    <option value="photo_video">Photo & Video</option>
                    <option value="tech_repair">Tech Repair</option>
                    <option value="auto_moto">Auto & Moto</option>
                    <option value="kids">For Kids / Nannies</option>
                    <option value="education">Education / Languages</option>
                    <option value="events">Events & Holidays</option>
                    <option value="flowers">Flowers & Gifts</option>
                    <option value="pets">Pets / Grooming</option>
                    <option value="delivery">Delivery & Cargo</option>
                    <option value="tattoo">Tattoo & Piercing</option>
                    <option value="astrology">Astrology & Esoteric</option>
                    <option value="real_estate">Real Estate</option>
                    <option value="legal_visa">Visas & Documents</option>
                    <option value="home_services">Home Services / Cleaning</option>
                    <option value="transport">Transport / Rental</option>
                    <option value="service">Other Service</option>
                  </optgroup>
                </select>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                {mode !== 'services' && (
                  <div style={{ position:'relative' }}>
                    <Star style={{ position:'absolute', right:16, top:'50%', transform:'translateY(-50%)', color:'rgba(212,161,23,0.4)' }} size={14}/>
                    <input className="premium-input" type="number" step="0.1" placeholder="Рейтинг (0-5)" value={data.rating || ''} onChange={e => handleChange('rating', e.target.value)} />
                  </div>
                )}
                <input className="premium-input" type="number" placeholder="Цена (1-4)" value={data.price || ''} onChange={e => handleChange('price', e.target.value)} />
              </div>
            </div>

            <div className="editor-card">
              <div className="card-label"><MapIcon size={14}/> {mode === 'services' ? 'Район работы' : 'Геолокация'}</div>
              {mode === 'services' ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {[
                    { id: 'area_north', label: 'Север (North)' },
                    { id: 'area_center', label: 'Центр (Center)' },
                    { id: 'area_south', label: 'Юг (South)' }
                  ].map(area => {
                    const isActive = data.all_tags?.split(/[;,]+/).map(x => x.trim()).includes(area.id);
                    return (
                      <div
                        key={area.id}
                        onClick={() => toggleAllTag(area.id)}
                        style={{
                          padding: '8px 16px',
                          borderRadius: 100,
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          background: isActive ? 'var(--accent-gold)' : 'rgba(0,0,0,0.3)',
                          color: isActive ? '#000' : 'var(--text-dim)',
                          border: isActive ? '1px solid var(--accent-gold)' : '1px solid rgba(255,255,255,0.08)',
                        }}
                      >
                        {area.label}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
                    <input className="premium-input" placeholder="Широта (Lat)" value={data.lat || ''} onChange={e => handleChange('lat', e.target.value)} />
                    <input className="premium-input" placeholder="Долгота (Lon)" value={data.lon || ''} onChange={e => handleChange('lon', e.target.value)} />
                  </div>
                  <div style={{ position:'relative' }}>
                    <ExternalLink style={{ position:'absolute', right:16, top:'50%', transform:'translateY(-50%)', color:'rgba(212,161,23,0.4)', cursor:'pointer' }} size={14} onClick={() => data.ext_1 && window.open(data.ext_1, '_blank')} />
                    <input className="premium-input" style={{ paddingRight: 48 }} placeholder="Ссылка на карту (Maps URL)" value={data.ext_1 || ''} onChange={e => handleChange('ext_1', e.target.value)} />
                  </div>
                </>
              )}
            </div>

            <div className="editor-card">
              <div className="card-label"><Phone size={14}/> Контакты и Ссылки</div>
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {mode === 'services' ? (
                  <>
                    {/* Режим МАСТЕРА: Раздельные поля */}
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                      <div style={{ position:'relative' }}>
                        <span style={{ position:'absolute', left:12, top:-8, fontSize:9, background:'var(--bg-card)', padding:'0 4px', color:'var(--text-muted)' }}>INSTAGRAM</span>
                        <input className="premium-input" placeholder="Ник или ссылка" value={data.website || ''} onChange={e => handleChange('website', e.target.value)} />
                      </div>
                      <div style={{ position:'relative' }}>
                        <span style={{ position:'absolute', left:12, top:-8, fontSize:9, background:'var(--bg-card)', padding:'0 4px', color:'var(--text-muted)' }}>TELEGRAM</span>
                        <input className="premium-input" placeholder="Ник (без @)" value={data.tg_bot || ''} onChange={e => handleChange('tg_bot', e.target.value)} />
                      </div>
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                      <div style={{ position:'relative' }}>
                        <span style={{ position:'absolute', left:12, top:-8, fontSize:9, background:'var(--bg-card)', padding:'0 4px', color:'var(--text-muted)' }}>WHATSAPP / ТЕЛ</span>
                        <input className="premium-input" placeholder="Номер телефона" value={data.phone || ''} onChange={e => handleChange('phone', e.target.value)} />
                      </div>
                      <div style={{ position:'relative' }}>
                        <span style={{ position:'absolute', left:12, top:-8, fontSize:9, background:'var(--bg-card)', padding:'0 4px', color:'var(--text-muted)' }}>САЙТ / ПОРТФОЛИО</span>
                        <input className="premium-input" placeholder="https://..." value={data.ext_1 || ''} onChange={e => handleChange('ext_1', e.target.value)} />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Режим ЛОКАЦИИ: Стандартные поля */}
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                      <input className="premium-input" placeholder="Телефон" value={data.phone || ''} onChange={e => handleChange('phone', e.target.value)} />
                      <input className="premium-input" placeholder="Веб-сайт" value={data.website || ''} onChange={e => handleChange('website', e.target.value)} />
                    </div>
                    <div style={{ position:'relative' }}>
                      <Globe style={{ position:'absolute', right:16, top:'50%', transform:'translateY(-50%)', color:'rgba(212,161,23,0.4)', cursor:'pointer' }} size={14} onClick={() => data.instagram && window.open(data.instagram, '_blank')} />
                      <input className="premium-input" style={{ paddingRight: 48 }} placeholder="Instagram URL" value={data.instagram || ''} onChange={e => handleChange('instagram', e.target.value)} />
                    </div>
                  </>
                )}
                <input className="premium-input" placeholder="Режим работы" value={data.hours || ''} onChange={e => handleChange('hours', e.target.value)} />
                <textarea className="premium-input" style={{ height:80, resize:'none', lineHeight:1.6 }} placeholder="Полный адрес объекта" value={data.address || ''} onChange={e => handleChange('address', e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: ТЕКСТ ── */}
        {activeTab === 'content' && (
          <div className="animate-fade">
            {/* Language switcher row + Gemini button */}
            <div style={{ padding:'20px 32px 0 32px', display:'flex', alignItems:'center', gap:6 }}>
              <div style={{ display:'flex', gap:6, flex:1, flexWrap:'nowrap', overflowX:'auto' }}>
                {LANGUAGES.map(lang => {
                  const isActive = selectedLang === lang.code;
                  return (
                    <button
                      key={lang.code}
                      onClick={() => setSelectedLang(lang.code)}
                      style={{
                        flexShrink: 0,
                        padding: '8px 14px',
                        borderRadius: 10,
                        border: isActive ? '1px solid rgba(212,161,23,0.5)' : '1px solid rgba(255,255,255,0.06)',
                        background: isActive ? 'rgba(212,161,23,0.12)' : 'rgba(0,0,0,0.2)',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        fontSize: 11,
                        fontWeight: 800,
                        letterSpacing: '0.12em',
                        color: isActive ? 'var(--accent-gold)' : 'var(--text-muted)',
                        fontFamily: 'var(--font-main)',
                      }}
                    >
                      {lang.label}
                    </button>
                  );
                })}
              </div>



              {/* 🦩 Ollama AI translate button */}
              <button
                onClick={translateWithGemini}
                disabled={translating}
                title="Перевести описание на все языки (AI)"
                style={{
                  flexShrink: 0,
                  padding: '8px 12px',
                  borderRadius: 10,
                  border: '1px solid rgba(180,120,220,0.4)',
                  background: translating ? 'rgba(180,120,220,0.05)' : 'rgba(180,120,220,0.12)',
                  cursor: translating ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  color: '#b478dc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: translating ? 0.6 : 1,
                }}
              >
                {translating ? <Loader2 className="animate-spin" size={14} /> : <Globe size={14} />}
              </button>
            </div>

            <div className="editor-card">
              <div className="card-label">Контент — {LANGUAGES.find(l => l.code === selectedLang)?.name}</div>
              <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
                <div>
                  <span style={{ fontSize:10, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.15em', color:'var(--text-muted)', marginBottom:8, display:'block' }}>Название</span>
                  <input className="premium-input" style={{ fontSize:16, fontWeight:700 }} value={data[`name_${selectedLang}`] || ''} onChange={e => handleChange(`name_${selectedLang}`, e.target.value)} />
                </div>
                <div>
                  <span style={{ fontSize:10, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.15em', color:'var(--text-muted)', marginBottom:8, display:'block' }}>Описание</span>
                  <textarea className="premium-input" style={{ height:320, resize:'none', lineHeight:1.8, fontSize:14 }} value={data[`desc_${selectedLang}`] || ''} onChange={e => handleChange(`desc_${selectedLang}`, e.target.value)} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: ДОП ── */}
        {activeTab === 'ext' && (
          <div className="animate-fade">
            <div className="editor-card">
              <div className="card-label"><Award size={14}/> Акции и скидки</div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:24 }}>
                <div>
                  <span style={{ fontSize:10, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.15em', color:'var(--text-muted)', marginBottom:8, display:'block' }}>Процент скидки</span>
                  <input className="premium-input" style={{ textAlign:'center', fontSize:22, fontWeight:900, color:'var(--accent-gold)' }} placeholder="0" value={data.ext_2 || ''} onChange={e => handleChange('ext_2', e.target.value)} />
                </div>
                <div>
                  <span style={{ fontSize:10, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.15em', color:'var(--text-muted)', marginBottom:8, display:'block' }}>Действует до</span>
                  <input className="premium-input" style={{ textAlign:'center', fontWeight:700 }} placeholder="31.12.2024" value={data.ext_3 || ''} onChange={e => handleChange('ext_3', e.target.value)} />
                </div>
              </div>

              {/* ── PREMIUM DISCOUNT SELECTOR ── */}
              <div>
                <span style={{ fontSize:10, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.15em', color:'var(--text-muted)', marginBottom:12, display:'block' }}>Тип привилегии</span>

                {/* Toggle button — styled as a premium pill */}
                <div
                  onClick={() => setShowDiscountSelector(v => !v)}
                  style={{
                    display:'flex', alignItems:'center', justifyContent:'space-between',
                    padding:'14px 20px',
                    background: showDiscountSelector ? 'rgba(212,161,23,0.1)' : 'rgba(0,0,0,0.3)',
                    border: showDiscountSelector ? '1px solid rgba(212,161,23,0.4)' : '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 12,
                    cursor: 'pointer',
                    transition: 'all 0.25s',
                    marginBottom: showDiscountSelector ? 8 : 0,
                  }}
                >
                  <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                    {selectedDiscountItem ? (
                      <>
                        <div style={{ width:32, height:32, background:'rgba(212,161,23,0.15)', border:'1px solid rgba(212,161,23,0.3)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:900, color:'var(--accent-gold)' }}>
                          {data.ext_4}
                        </div>
                        <span style={{ fontSize:13, fontWeight:600, color:'var(--text-main)' }}>{selectedDiscountItem.text}</span>
                      </>
                    ) : (
                      <>
                        <div style={{ width:32, height:32, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, color:'var(--text-muted)' }}>?</div>
                        <span style={{ fontSize:13, fontWeight:500, color:'var(--text-muted)' }}>Выбрать тип условия...</span>
                      </>
                    )}
                  </div>
                  <ChevronRight size={16} color="var(--text-muted)" style={{ transform: showDiscountSelector ? 'rotate(90deg)' : 'none', transition:'transform 0.25s' }} />
                </div>

                {showDiscountSelector && (
                  <div style={{ background:'rgba(0,0,0,0.5)', border:'1px solid rgba(212,161,23,0.15)', borderRadius:16, padding:12, maxHeight:280, overflowY:'auto' }} className="animate-fade">
                    {DISCOUNT_CODES.map(item => {
                      const isSelected = data.ext_4 === item.code;
                      return (
                        <div
                          key={item.code}
                          onClick={() => { handleChange('ext_4', item.code); setShowDiscountSelector(false); }}
                          style={{
                            display:'flex', alignItems:'center', gap:16,
                            padding:'12px 16px',
                            borderRadius:12,
                            cursor:'pointer',
                            background: isSelected ? 'rgba(212,161,23,0.12)' : 'transparent',
                            transition:'all 0.2s',
                            marginBottom: 4,
                          }}
                        >
                          <div style={{ width:44, height:44, flexShrink:0, background: isSelected ? 'var(--accent-gold)' : 'rgba(43,31,24,0.8)', border: isSelected ? 'none' : '1px solid rgba(255,255,255,0.08)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:900, color: isSelected ? '#000' : 'var(--accent-gold)', transition:'all 0.2s' }}>
                            {isSelected ? <Check size={18}/> : item.code}
                          </div>
                          <span style={{ fontSize:13, fontWeight:600, color: isSelected ? 'var(--text-main)' : 'var(--text-dim)' }}>{item.text}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              
              {mode === 'services' && (
                <div style={{ marginTop: 24 }}>
                  <span style={{ fontSize:10, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.15em', color:'var(--text-muted)', marginBottom:8, display:'block' }}>Дополнительный комментарий (ext_6)</span>
                  <input className="premium-input" placeholder="Доп. информация по акции" value={data.ext_6 || ''} onChange={e => handleChange('ext_6', e.target.value)} />
                </div>
              )}
            </div>

            <div className="editor-card">
              <div className="card-label"><Tag size={14}/> Удобства и особенности</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                {(mode === 'services' ? SERVICE_AMENITY_OPTIONS : AMENITY_OPTIONS).map(tag => {
                  const isActive = data.ext_5?.split(/[;,]+/).map(x => x.trim()).includes(tag);
                  const label = TAG_LABELS_RU[tag] || tag;
                  return (
                    <div
                      key={tag}
                      onClick={() => toggleAmenity(tag)}
                      title={tag} // show key on hover
                      style={{
                        padding:'7px 14px',
                        borderRadius:100,
                        fontSize:12,
                        fontWeight:600,
                        cursor:'pointer',
                        transition:'all 0.2s',
                        background: isActive ? 'var(--accent-gold)' : 'rgba(0,0,0,0.3)',
                        color: isActive ? '#000' : 'var(--text-dim)',
                        border: isActive ? '1px solid var(--accent-gold)' : '1px solid rgba(255,255,255,0.08)',
                        boxShadow: isActive ? '0 4px 12px rgba(212,161,23,0.2)' : 'none',
                      }}
                    >
                      {label}
                    </div>
                  );
                })}
              </div>
            </div>


            <div className="editor-card">
              
              {/* MALL SELECTOR - Only show for places */}
              {mode !== 'services' && (
                <div style={{ marginBottom: 24 }}>
                  <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <MapPin size={14} color="var(--primary)" />
                    Местоположение (Торговый центр):
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    <div
                      onClick={() => {
                        const current = data.all_tags ? data.all_tags.split(/[;,]+/).map(x => x.trim()).filter(Boolean) : [];
                        const next = current.filter(t => !t.startsWith('mall_'));
                        handleChange('all_tags', next.join('; '));
                      }}
                      style={{
                        padding: '6px 14px',
                        borderRadius: 100,
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        background: !(data.all_tags || '').split(/[;,]+/).some(t => t.trim().startsWith('mall_')) ? 'rgba(122,168,212,0.18)' : 'rgba(0,0,0,0.3)',
                        color: !(data.all_tags || '').split(/[;,]+/).some(t => t.trim().startsWith('mall_')) ? '#7aa8d4' : 'var(--text-dim)',
                        border: !(data.all_tags || '').split(/[;,]+/).some(t => t.trim().startsWith('mall_')) ? '1px solid rgba(122,168,212,0.45)' : '1px solid rgba(255,255,255,0.07)',
                      }}
                    >
                      Отдельное здание
                    </div>
                    {MALL_OPTIONS.map(mall => {
                      const tags = (data.all_tags || '').split(/[;,]+/).map(t => t.trim());
                      const isActive = tags.includes(mall.id);
                      return (
                        <div
                          key={mall.id}
                          onClick={() => {
                            const current = data.all_tags ? data.all_tags.split(/[;,]+/).map(x => x.trim()).filter(Boolean) : [];
                            const filtered = current.filter(t => !t.startsWith('mall_'));
                            const next = [...filtered, mall.id];
                            handleChange('all_tags', next.join('; '));
                          }}
                          style={{
                            padding: '6px 14px',
                            borderRadius: 100,
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            background: isActive ? 'rgba(122,168,212,0.18)' : 'rgba(0,0,0,0.3)',
                            color: isActive ? '#7aa8d4' : 'var(--text-dim)',
                            border: isActive ? '1px solid rgba(122,168,212,0.45)' : '1px solid rgba(255,255,255,0.07)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6
                          }}
                        >
                          {mall.name}
                        </div>
                      );
                    })}
                  </div>
                  <div className="divider" style={{ margin: '24px 0' }} />
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div className="card-label" style={{ margin: 0 }}><Tag size={14} /> Тэги для поиска</div>
              </div>
              <p style={{ fontSize:11, color:'var(--text-muted)', marginBottom:16, lineHeight:1.6 }}>
                Теги из этой колонки используются в поиске. Включайте и публичные особенности, и скрытые технические теги.
              </p>
              <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
                {(() => {
                  // Dynamic grouping based on mode
                  const serviceGroupOrder = ['beauty', 'services', 'edu', 'transport', 'media', 'jewelry', 'food', 'sport'];
                  const placeGroupOrder = ['jewelry', 'food', 'shopping', 'sport', 'media', 'beauty', 'services', 'edu', 'transport'];
                  const order = mode === 'services' ? serviceGroupOrder : placeGroupOrder;
                  
                  const sortedGroups = [...SEARCH_TAG_GROUPS].sort((a, b) => {
                    const idxA = order.indexOf(a.id);
                    const idxB = order.indexOf(b.id);
                    return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
                  });

                  return sortedGroups.map(group => (
                    <div key={group.id}>
                      <div style={{ 
                        fontSize: 10, 
                        fontWeight: 800, 
                        color: mode === 'services' && ['beauty', 'services', 'edu'].includes(group.id) ? '#b478dc' : 'var(--accent-gold)', 
                        marginBottom: 10, 
                        letterSpacing: '0.1em',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8
                      }}>
                        <div style={{ height: 1, flex: 1, background: 'rgba(212,161,23,0.2)' }} />
                        {group.title}
                        <div style={{ height: 1, flex: 1, background: 'rgba(212,161,23,0.2)' }} />
                      </div>
                      <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                        {group.tags.map(tag => {
                          const isActive = data.all_tags?.split(/[;,]+/).map(x => x.trim()).includes(tag);
                          const label = TAG_LABELS_RU[tag] || tag;
                          return (
                            <div
                              key={tag}
                              onClick={() => toggleAllTag(tag)}
                              style={{
                                padding:'6px 14px',
                                borderRadius:100,
                                fontSize:12,
                                fontWeight:600,
                                cursor:'pointer',
                                transition:'all 0.2s',
                                background: isActive ? (mode === 'services' ? 'rgba(180,120,220,0.18)' : 'rgba(122,168,212,0.18)') : 'rgba(0,0,0,0.3)',
                                color: isActive ? (mode === 'services' ? '#b478dc' : '#7aa8d4') : 'var(--text-dim)',
                                border: isActive ? (mode === 'services' ? '1px solid rgba(180,120,220,0.45)' : '1px solid rgba(122,168,212,0.45)') : '1px solid rgba(255,255,255,0.07)',
                                boxShadow: isActive ? '0 4px 12px rgba(122,168,212,0.15)' : 'none',
                              }}
                            >
                              {label}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ));
                })()}

                {/* Others / Static Tags */}
                <div>
                  <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', marginBottom: 10, letterSpacing: '0.1em' }}>ПРОЧЕЕ И УДОБСТВА</div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                    {OLD_STATIC_TAGS.filter(t => !SEARCH_TAG_GROUPS.flatMap(g => g.tags).includes(t)).map(tag => {
                      const isActive = data.all_tags?.split(/[;,]+/).map(x => x.trim()).includes(tag);
                      const label = TAG_LABELS_RU[tag] || tag;
                      return (
                        <div
                          key={tag}
                          onClick={() => toggleAllTag(tag)}
                          style={{
                            padding:'6px 12px',
                            borderRadius:100,
                            fontSize:11,
                            fontWeight:600,
                            cursor:'pointer',
                            transition:'all 0.2s',
                            background: isActive ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.2)',
                            color: isActive ? '#fff' : 'rgba(255,255,255,0.3)',
                            border: isActive ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(255,255,255,0.05)',
                          }}
                        >
                          {label}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ── TAB: СОБЫТИЕ (Только для услуг) ── */}
        {activeTab === 'event' && mode === 'services' && (
          <div className="animate-fade">
            <div className="editor-card">
              <div className="card-label"><Calendar size={14}/> Ближайшее открытое событие</div>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.6 }}>
                Здесь можно указать мероприятие, которое вы проводите (марафон, мастер-класс, открытая тренировка и т.д.)
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-muted)', marginBottom: 8, display: 'block' }}>Наименование события</span>
                  <input className="premium-input" placeholder="Например: Марафон по бегу" value={data.ext_7 || ''} onChange={e => handleChange('ext_7', e.target.value)} />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-muted)', marginBottom: 8, display: 'block' }}>Дата</span>
                    <input 
                      className="premium-input" 
                      type="date"
                      value={(data.ext_8 && typeof data.ext_8 === 'string' && data.ext_8.includes('.')) ? data.ext_8.split('.').reverse().join('-') : (data.ext_8 || '')} 
                      onChange={e => {
                        const val = e.target.value;
                        if (!val) {
                          handleChange('ext_8', '');
                        } else {
                          const [y, m, d] = val.split('-');
                          handleChange('ext_8', `${d}.${m}.${y}`);
                        }
                      }}
                      style={{ colorScheme: 'dark' }}
                    />
                  </div>
                  <div>
                    <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-muted)', marginBottom: 8, display: 'block' }}>Время</span>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <select 
                        className="premium-input" 
                        style={{ flex: 1, padding: '10px' }}
                        value={(data.ext_9 || '09:00').split(':')[0]} 
                        onChange={e => {
                          const mins = (data.ext_9 || '09:00').split(':')[1] || '00';
                          handleChange('ext_9', `${e.target.value}:${mins}`);
                        }}
                      >
                        {Array.from({ length: 24 }).map((_, i) => {
                          const h = i.toString().padStart(2, '0');
                          return <option key={h} value={h} style={{ background: '#2b1f18' }}>{h}</option>;
                        })}
                      </select>
                      <span style={{ color: 'var(--text-muted)', fontWeight: 800 }}>:</span>
                      <select 
                        className="premium-input" 
                        style={{ flex: 1, padding: '10px' }}
                        value={(data.ext_9 || '09:00').split(':')[1] || '00'} 
                        onChange={e => {
                          const hours = (data.ext_9 || '09:00').split(':')[0] || '09';
                          handleChange('ext_9', `${hours}:${e.target.value}`);
                        }}
                      >
                        {['00', '10', '20', '30', '40', '50'].map(m => (
                          <option key={m} value={m} style={{ background: '#2b1f18' }}>{m}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                
                <div>
                  <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-muted)', marginBottom: 8, display: 'block' }}>Место проведения</span>
                  <input className="premium-input" placeholder="Парк им. Горького" value={data.ext_10 || ''} onChange={e => handleChange('ext_10', e.target.value)} />
                </div>
                
                <div>
                  <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-muted)', marginBottom: 8, display: 'block' }}>Условия участия</span>
                  <input className="premium-input" placeholder="Предварительная запись" value={data.ext_11 || ''} onChange={e => handleChange('ext_11', e.target.value)} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: МЕДИА ── */}
        {activeTab === 'media' && (
          <div className="animate-fade">
            <div className="editor-card">
              <div className="card-label"><ImageIcon size={14}/> Фотогалерея</div>
              <textarea className="premium-input" style={{ height:100, resize:'none', lineHeight:1.6, marginBottom:24 }} placeholder="https://url1.jpg, https://url2.jpg..." value={data.images || ''} onChange={e => handleChange('images', e.target.value)} />
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                {data.images?.split(/[,\s\n]+/).filter(Boolean).map((img, i) => (
                  <div key={i} style={{ aspectRatio:'16/9', borderRadius:16, overflow:'hidden', background:'rgba(0,0,0,0.4)', border:'1px solid rgba(255,255,255,0.05)', position:'relative' }}>
                    <img src={img} style={{ width:'100%', height:'100%', objectFit:'cover' }} alt="" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Bottom padding so content isn't hidden behind footer */}
        <div style={{ height:16 }} />
      </div>

      {/* FOOTER — static at bottom, part of flex flow (NOT absolute) */}
      <div style={{
        flexShrink: 0,
        padding: '20px 32px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(20,13,10,0.95)',
        backdropFilter: 'blur(20px)',
        display: 'flex',
        gap: 12,
      }}>
        <button
          onClick={onCancel}
          style={{ flex:1, padding:'14px 20px', borderRadius:12, border:'1px solid rgba(255,255,255,0.1)', background:'transparent', color:'var(--text-muted)', fontSize:12, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.1em', cursor:'pointer', transition:'all 0.2s', fontFamily:'var(--font-main)' }}
        >
          ОТМЕНА
        </button>
        <button
          onClick={() => onSave(data)}
          style={{ flex:2, padding:'14px 20px', borderRadius:12, border:'none', background:'var(--accent-gold)', color:'#000', fontSize:12, fontWeight:900, textTransform:'uppercase', letterSpacing:'0.1em', cursor:'pointer', transition:'all 0.3s', display:'flex', alignItems:'center', justifyContent:'center', gap:10, fontFamily:'var(--font-main)', boxShadow:'0 8px 25px rgba(212,161,23,0.3)' }}
        >
          <Save size={16} /> СОХРАНИТЬ
        </button>
      </div>

    </div>
  );
}
