const axios = require('axios');

async function run() {
  try {
    const iresort = {
      id: "iresort_nha_trang",
      category: "medical",
      name_ru: "I-Resort Nha Trang",
      name_en: "I-Resort Nha Trang",
      name_vi: "I-Resort Nha Trang",
      name_ko: "아이리조트 나트랑",
      name_es: "I-Resort Nha Trang",
      name_zh: "I-Resort 泥浴",
      name_fr: "I-Resort Nha Trang",
      desc_ru: "Современный комплекс с грязевыми ваннами и минеральными бассейнами в окружении тропической зелени. Отличное место для релакса.",
      desc_en: "A modern complex with mud baths and mineral pools surrounded by tropical greenery. A perfect spot for relaxation.",
      desc_vi: "Một khu phức hợp hiện đại với bùn khoáng và hồ bơi khoáng nóng được bao quanh bởi cây xanh nhiệt đới. Nơi hoàn hảo để thư giãn.",
      desc_ko: "열대 식물로 둘러싸인 머드 배스와 미네랄 풀이 있는 현대적인 복합 단지. 휴식을 위한 완벽한 장소입니다.",
      desc_es: "Un complejo moderno con baños de lodo y piscinas minerales rodeado de vegetación tropical. Un lugar perfecto para la relajación.",
      desc_zh: "被热带绿植环绕的现代泥浴和矿泉池中心。放松身心的完美去处。",
      desc_fr: "Un complexe moderne avec des bains de boue et des piscines minérales entouré de verdure tropicale. Un endroit parfait pour la détente.",
      lat: "12.2731916",
      lon: "109.1757778",
      address: "19 Vĩnh Ngọc, Nha Trang",
      price: "budget",
      rating: "4.5",
      ext_1: "https://www.google.com/maps/place/Hot+mineral+springs+I-Resort+Nha+Trang/@12.2731916,109.1757778,15z",
      ext_5: "spa; mineral; pool; mud bath; relax"
    };

    const vorota = {
      id: "gates_nha_trang",
      category: "sight",
      name_ru: "Ворота (Достопримечательность)",
      name_en: "The Gates Landmark",
      name_vi: "Cổng Landmark",
      name_ko: "더 게이츠 랜드마크",
      name_es: "Las Puertas (Atracción)",
      name_zh: "大门地标",
      name_fr: "Les Portes",
      desc_ru: "Красивые въездные ворота, часто используемые в качестве ориентира.",
      desc_en: "Beautiful entrance gates, often used as a landmark.",
      desc_vi: "Cổng vào đẹp, thường được dùng làm cột mốc.",
      desc_ko: "아름다운 입구 문으로 종종 랜드마크로 사용됩니다.",
      desc_es: "Hermosas puertas de entrada, a menudo utilizadas como punto de referencia.",
      desc_zh: "漂亮的入口大门，通常用作地标。",
      desc_fr: "Belles portes d'entrée, souvent utilisées comme point de repère.",
      lat: "12.2555679",
      lon: "109.0909266",
      price: "budget",
      ext_1: "https://www.google.com/maps/place/%D0%92%D0%BE%D1%80%D0%BE%D1%82%D0%B0/@12.2555856,109.090305,18.85z"
    };

    console.log("Adding iResort...");
    await axios.post('http://localhost:3001/api/pois', iresort);
    console.log("Adding Vorota...");
    await axios.post('http://localhost:3001/api/pois', vorota);
    console.log("Done!");
    
    // Now trigger the CSV generation script to sync local project files
  } catch (err) {
    console.error(err.response ? err.response.data : err.message);
  }
}
run();
