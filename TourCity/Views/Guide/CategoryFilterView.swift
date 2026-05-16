import SwiftUI

struct CategoryFilterView: View {
    @Binding var selectedCategories: Set<POICategory>
    @EnvironmentObject var loc: LocalizationManager
    @EnvironmentObject var dataManager: DataManager
    @Environment(\.dismiss) private var dismiss
    
    var activeCategories: [POICategory] {
        dataManager.activeCategories
    }
    
    var body: some View {
        NavigationView {
            ScrollView {
                LazyVStack(spacing: 8) {
                    // Select All / None
                    HStack(spacing: 12) {
                        Button("filter_all".localized) {
                            withAnimation(.spring(response: 0.3)) {
                                selectedCategories = Set(activeCategories)
                            }
                        }
                        .buttonStyle(FilterActionButtonStyle(isActive: selectedCategories.count == activeCategories.count))
                        
                        Button("filter_reset".localized) {
                            withAnimation(.spring(response: 0.3)) {
                                selectedCategories.removeAll()
                            }
                        }
                        .buttonStyle(FilterActionButtonStyle(isActive: selectedCategories.isEmpty))
                    }
                    .padding(.horizontal, 20)
                    .padding(.top, 8)
                    
                    Divider()
                        .background(Color.tcDivider)
                        .padding(.horizontal, 20)
                        .padding(.vertical, 4)
                    
                    // Category list
                    ForEach(activeCategories) { category in
                        CategoryRow(
                            category: category,
                            isSelected: selectedCategories.contains(category),
                            action: {
                                withAnimation(.spring(response: 0.2)) {
                                    if selectedCategories.contains(category) {
                                        selectedCategories.remove(category)
                                    } else {
                                        selectedCategories.insert(category)
                                    }
                                }
                            }
                        )
                    }
                }
                .padding(.bottom, 20)
            }
            .id(loc.currentLanguage)
            .background(Color.tcBackground)
            .navigationTitle("filter_title".localized)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("filter_done".localized) {
                        dismiss()
                    }
                    .foregroundColor(Color.tcPrimary)
                    .fontWeight(.semibold)
                }
            }
        }
    }
}

// MARK: - Category Row

struct CategoryRow: View {
    let category: POICategory
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            HStack(spacing: 14) {
                ZStack {
                    Circle()
                        .fill(isSelected ? Color.tcPrimary.opacity(0.2) : Color.tcSurface)
                        .frame(width: 42, height: 42)
                    CategoryIconView(category: category, size: 18)
                        .foregroundColor(isSelected ? Color.tcPrimary : Color.tcTextSecondary)
                }
                
                Text(category.displayName)
                    .font(.system(size: 16, weight: .medium))
                    .foregroundColor(isSelected ? Color.tcText : Color.tcTextSecondary)
                
                Spacer()
                
                Image(systemName: isSelected ? "checkmark.circle.fill" : "circle")
                    .font(.system(size: 22))
                    .foregroundColor(isSelected ? Color.tcPrimary : Color.tcTextSecondary.opacity(0.4))
            }
            .padding(.horizontal, 20)
            .padding(.vertical, 8)
        }
        .buttonStyle(PlainButtonStyle())
    }
}

// MARK: - Button Style

struct FilterActionButtonStyle: ButtonStyle {
    let isActive: Bool
    
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.system(size: 14, weight: .semibold))
            .foregroundColor(isActive ? Color.tcBackground : Color.tcTextSecondary)
            .padding(.horizontal, 20)
            .padding(.vertical, 10)
            .background(
                Capsule()
                    .fill(isActive ? Color.tcPrimary : Color.tcSurface)
            )
            .scaleEffect(configuration.isPressed ? 0.95 : 1.0)
    }
}

// MARK: - Category Icon View

/// Иконка категории: сначала проверяем кастомный ассет (cat_beach и т.д.),
/// при отсутствии — SF Symbol фолбэк. Раскрашивается через .foregroundColor снаружи.
struct CategoryIconView: View {
    let category: POICategory
    var size: CGFloat = 18
    
    var body: some View {
        if UIImage(named: category.assetName) != nil {
            Image(category.assetName)
                .resizable()
                .renderingMode(.template)
                .scaledToFit()
                .frame(width: size, height: size)
        } else {
            Image(systemName: category.icon)
                .font(.system(size: size))
        }
    }
}

// MARK: - POI Logo View

/// Универсальный логотип для конкретной локации.
/// Приоритет отображения:
///   1. Кастомный логотип заведения (Assets.xcassets/POILogos/<имя>.imageset)
///   2. Кастомная иконка категории (Assets.xcassets/cat_<category>.imageset)
///   3. SF Symbol фолбэк
///
/// Использование:
///   POILogoView(poi: poi, size: 32)
///
/// Для добавления логотипа конкретной локации:
///   1. Создай папку `<имя>.imageset` внутри Assets.xcassets/POILogos/
///   2. Добавь PNG/PDF в эту папку и пропиши в Contents.json
///   3. В базе данных (Supabase) заполни поле ext_6 = "<имя>" для нужного POI
struct POILogoView: View {
    let poi: POI
    var size: CGFloat = 32
    
    /// Используется ли кастомный лого (не фолбэк)
    var hasCustomLogo: Bool {
        if let assetName = poi.customLogoAssetName {
            return UIImage(named: assetName) != nil
        }
        return false
    }
    
    var body: some View {
        Group {
            if let assetName = poi.customLogoAssetName, UIImage(named: assetName) != nil {
                // 1. Кастомный логотип заведения
                Image(assetName)
                    .resizable()
                    .scaledToFit()
                    .frame(width: size, height: size)
            } else {
                // 2. Иконка категории (кастомная или SF Symbol)
                CategoryIconView(category: poi.category, size: size)
            }
        }
    }
}

