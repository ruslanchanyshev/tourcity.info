import Foundation
import Combine

/// Менеджер данных — загрузка, хранение и обновление оффлайн-данных
class DataManager: ObservableObject {
    static let shared = DataManager()
    
    @Published var currentCity: CityData? {
        didSet {
            updateDiscountPartners()
        }
    }
    @Published var discountPartners: [POI] = []
    @Published var services: [POI] = []
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?
    
    private let fileManager = FileManager.default
    
    private init() {
        loadCityData()
        loadServicesData()
        updateDiscountPartners()
    }
    
    // MARK: - Load Data
    
    /// Загружает данные города — сначала из Documents (обновлённые), потом из бандла
    func loadCityData() {
        isLoading = true
        
        // 1. Пытаемся загрузить обновленные данные из Documents
        if let updatedData = loadFromDocuments(filename: "nhatrang.json") {
            print("[DataManager] Found updated data in Documents. Loading...")
            self.currentCity = updatedData
            isLoading = false
            return
        }
        
        // 2. Если нет в Documents, грузим из ресурсов приложения (Bundle)
        if let bundledData = loadFromBundle(filename: "nhatrang") {
            print("[DataManager] No updates in Documents. Loading from Bundle...")
            self.currentCity = bundledData
            isLoading = false
            return
        }
        
        // 3. Крайний случай — грузим из встроенной строки
        if let fallbackData = loadFromFallback() {
            print("[DataManager] Loading fallback data...")
            self.currentCity = fallbackData
            isLoading = false
            return
        }
        
        // 4. Совсем крайний случай — пустые данные
        print("[DataManager] Warning: No data found. Creating default city.")
        self.currentCity = createDefaultNhaTrangData()
        isLoading = false
    }
    
    // MARK: - Bundle Loading
    
    private func loadFromBundle(filename: String) -> CityData? {
        guard let url = Bundle.main.url(forResource: filename, withExtension: "json") else {
            print("[DataManager] Bundle file not found: \(filename).json")
            return nil
        }
        
        return loadJSON(from: url)
    }
    
    // MARK: - Documents Loading
    
    private func loadFromDocuments(filename: String) -> CityData? {
        let documentsURL = getDocumentsDirectory().appendingPathComponent(filename)
        guard fileManager.fileExists(atPath: documentsURL.path) else {
            return nil
        }
        
        return loadJSON(from: documentsURL)
    }
    
    // MARK: - Save Updated Data
    
    func saveUpdatedData(_ cityData: CityData) {
        let encoder = JSONEncoder()
        encoder.dateEncodingStrategy = .iso8601
        encoder.outputFormatting = .prettyPrinted
        
        do {
            let data = try encoder.encode(cityData)
            let url = getDocumentsDirectory().appendingPathComponent("\(cityData.id).json")
            try data.write(to: url)
            self.currentCity = cityData
            print("[DataManager] Saved updated data for \(cityData.name)")
        } catch {
            errorMessage = "Failed to save data: \(error.localizedDescription)"
            print("[DataManager] Error saving: \(error)")
        }
    }
    
    func saveServicesData(_ servicesList: [POI]) {
        let encoder = JSONEncoder()
        encoder.outputFormatting = .prettyPrinted
        
        do {
            let data = try encoder.encode(servicesList)
            let url = getDocumentsDirectory().appendingPathComponent("services.json")
            try data.write(to: url)
            self.services = servicesList
            print("[DataManager] Saved \(servicesList.count) services to Documents")
        } catch {
            print("[DataManager] Error saving services: \(error)")
        }
    }
    
    func loadServicesData() {
        let url = getDocumentsDirectory().appendingPathComponent("services.json")
        if fileManager.fileExists(atPath: url.path) {
            do {
                let data = try Data(contentsOf: url)
                let decoder = JSONDecoder()
                self.services = try decoder.decode([POI].self, from: data)
                print("[DataManager] Loaded \(services.count) services from Documents")
            } catch {
                print("[DataManager] Error loading services: \(error)")
            }
        }
    }
    
    // MARK: - Helpers
    
    private func loadJSON(from url: URL) -> CityData? {
        do {
            let data = try Data(contentsOf: url)
            let decoder = JSONDecoder()
            decoder.dateDecodingStrategy = .iso8601
            return try decoder.decode(CityData.self, from: data)
        } catch {
            print("[DataManager] JSON decode error: \(error)")
            return nil
        }
    }
    
    private func getDocumentsDirectory() -> URL {
        fileManager.urls(for: .documentDirectory, in: .userDomainMask)[0]
    }
    
    // MARK: - Default Data (9 тестовых POI — по 3 в 3 категориях)
    
    private func loadFromFallback() -> CityData? {
        guard let data = bundledJSONFallback.data(using: .utf8) else { return nil }
        do {
            let decoder = JSONDecoder()
            decoder.dateDecodingStrategy = .iso8601
            return try decoder.decode(CityData.self, from: data)
        } catch {
            print("[DataManager] Fallback JSON error: \(error)")
            return nil
        }
    }
    
    private func createDefaultNhaTrangData() -> CityData {
        return CityData(
            id: "nhatrang",
            name: "city_nhatrang",
            nameLocal: "Nha Trang",
            country: "Vietnam",
            description: "city_nhatrang_desc",
            latitude: 12.2388,
            longitude: 109.1967,
            defaultZoom: 13,
            pois: [],
            dataVersion: 1,
            lastUpdated: Date()
        )
    }
    
    private let bundledJSONFallback = """
{
  "id": "nhatrang",
  "name": "city_nhatrang",
  "nameLocal": "Nha Trang",
  "country": "Vietnam",
  "description": "city_nhatrang_desc",
  "latitude": 12.2388,
  "longitude": 109.1967,
  "defaultZoom": 13,
  "dataVersion": 1,
  "lastUpdated": "2026-04-06T12:55:00Z",
  "pois": [
    {
      "id": "beach_city",
      "category": "beach",
      "names": { "ru": "Пляж Нячанга", "en": "Nha Trang Beach", "vi": "Bãi biển Nha Trang" },
      "descriptions": { "ru": "Центральный пляж города", "en": "City central beach" },
      "localizedTags": { "all": ["пляж", "центр", "отдых", "beach", "center"] },
      "latitude": 12.2450,
      "longitude": 109.1960,
      "address": "Tran Phu, Nha Trang",
      "openingHours": "24/7",
      "priceRange": "budget",
      "rating": 4.5,
      "imageNames": ["beach_city"],
      "isFeatured": true,
      "discount": 10,
      "extraMetadata": {}
    }
  ]
}
"""

    // MARK: - Discounts Logic
    
    func updateDiscountPartners() {
        // Берем POI только из основного города (заведения), чтобы скидки мастеров не смешивались
        let cityPois = currentCity?.pois ?? []
        
        // Фильтруем по строгому правилу (>= 1% и наличие даты)
        // Дополнительно страхуемся, чтобы точно не попали категории услуг
        let active = cityPois.filter { $0.isValidDiscount && !$0.category.isService }
        
        self.discountPartners = active
        print("[DataManager] Data refresh complete. Found \(cityPois.count) places total, \(active.count) active valid discounts for places.")
    }
    
    /// Список категорий, которые реально присутствуют в текущих данных (город + услуги)
    var activeCategories: [POICategory] {
        let cityPois = currentCity?.pois ?? []
        let servicePois = services
        
        // Берем уникальные категории из всех точек города и мастеров
        let categoriesInUse = Set((cityPois + servicePois).map { $0.category })
        
        // Возвращаем их в порядке, определенном в POICategory.allCases, но только те, что используются
        return POICategory.allCases.filter { categoriesInUse.contains($0) }
    }
    
    /// Список категорий, которые реально присутствуют в текущих мастерах (Services)
    var activeServiceCategories: [POICategory] {
        let categoriesInUse = Set(services.map { $0.category })
        return POICategory.allCases.filter { categoriesInUse.contains($0) }
    }
}
