import re

content = """
  tag_search_manicure: 'маникюр', tag_search_pedicure: 'педикюр', tag_search_extensions: 'наращивание', tag_search_eyelashes: 'ресницы', tag_search_eyebrows: 'брови', tag_search_lamination: 'ламинирование', tag_search_sugaring: 'шугаринг', tag_search_laser: 'лазер', tag_search_botox: 'ботокс', tag_search_lips: 'губы',
  tag_search_haircut: 'стрижка', tag_search_coloring: 'окрашивание', tag_search_blond: 'блонд', tag_search_keratin: 'кератин', tag_search_barbershop: 'барбершоп', tag_search_beard: 'борода',
  tag_search_massage: 'массаж', tag_search_chiropractor: 'мануальщик', tag_search_osteopath: 'остеопат', tag_search_psychologist: 'психолог', tag_search_tarot: 'таролог', tag_search_natal_chart: 'натальная карта',
  tag_search_nanny: 'няня', tag_search_tutor: 'репетитор', tag_search_english: 'английский', tag_search_vietnamese: 'вьетнамский', tag_search_vocals: 'вокал', tag_search_guitar: 'гитара', tag_search_dance: 'танцы',
  tag_search_visarun: 'визаран', tag_search_borderrun: 'бордерран', tag_search_residence_permit: 'внж', tag_search_driving_license: 'права', tag_search_bank_card: 'банковская карта',
  tag_search_cleaning: 'клининг', tag_search_house_cleaning: 'уборка', tag_search_dry_cleaning: 'химчистка', tag_search_laundry: 'стирка', tag_search_ac_repair: 'ремонт кондиционеров', tag_search_electrician: 'электрик', tag_search_plumber: 'сантехник', tag_search_furniture_assembly: 'сборка мебели',
  tag_search_custom_cake: 'торт на заказ', tag_search_cupcakes: 'капкейки', tag_search_flower_delivery: 'доставка цветов', tag_search_balloons: 'шарики', tag_search_animator: 'аниматор', tag_search_photographer: 'фотограф', tag_search_videographer: 'видеограф', tag_search_drone: 'дрон',
  tag_search_bike_rental: 'аренда байка', tag_search_car_rental: 'аренда авто', tag_search_car_wash: 'автомойка', tag_search_taxi: 'такси', tag_search_transfer: 'трансфер', tag_search_cargo: 'карго', tag_search_parcel_delivery: 'доставка посылок',
  tag_search_phone_repair: 'ремонт телефонов', tag_search_apple_repair: 'ремонт apple', tag_search_laptop_repair: 'ремонт ноутбуков',
  tag_search_tattoo: 'тату', tag_search_piercing: 'пирсинг',
  tag_search_real_estate: 'аренда жилья', tag_search_realtor: 'риелтор',
  tag_search_grooming: 'груминг', tag_search_dog_walking: 'выгул собак', tag_search_pet_boarding: 'передержка',
  tag_search_fitness_trainer: 'фитнес тренер', tag_search_personal_trainer: 'персональный тренер', tag_search_gym: 'тренажерный зал', tag_search_yoga: 'йога', tag_search_pilates: 'пилатес', tag_search_boxing: 'бокс', tag_search_muay_thai: 'муай тай', tag_search_stretching: 'растяжка', tag_search_surfing: 'серфинг', tag_search_diving: 'дайвинг'
"""

matches = re.findall(r"(tag_search_[a-zA-Z0-9_]+):\s*'([^']+)'", content)

for tag, ru in matches:
    # Just generating dummy en for now, since we only know RU from the editor.
    # The user just wants it to not look like raw tag_search_... in the UI, and be translated to RU.
    en = tag.replace('tag_search_', '').replace('_', ' ').title()
    print(f'        "{tag}": [.ru: "{ru}", .en: "{en}", .vi: "{en}", .ko: "{en}", .es: "{en}", .zh: "{en}", .fr: "{en}"],')
