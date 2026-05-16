import SwiftUI

struct ServicesListView: View {
    @EnvironmentObject var dataManager: DataManager
    @EnvironmentObject var loc: LocalizationManager
    
    @State private var selectedService: POI? = nil
    @State private var selectedCategory: POICategory? = nil
    @State private var searchText: String = ""
    
    private var filteredServices: [POI] {
        var services = dataManager.services
        
        if let cat = selectedCategory {
            services = services.filter { $0.category == cat }
        }
        
        if !searchText.isEmpty {
            services = services.filter {
                $0.name.localizedCaseInsensitiveContains(searchText) ||
                $0.description.localizedCaseInsensitiveContains(searchText) ||
                $0.category.displayName.localizedCaseInsensitiveContains(searchText) ||
                $0.tags.contains { $0.localized.localizedCaseInsensitiveContains(searchText) }
            }
        }
        
        return services
    }
    
    var body: some View {
        NavigationView {
            ZStack {
                Color.tcBackground.ignoresSafeArea()
                
                if dataManager.services.isEmpty {
                    VStack(spacing: 20) {
                        Image(systemName: "person.2.wave.2.fill")
                            .font(.system(size: 60))
                            .foregroundColor(Color.tcPrimary.opacity(0.3))
                        
                        Text("services_empty".localized)
                            .font(.system(size: 18, weight: .medium))
                            .foregroundColor(Color.tcTextSecondary)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal, 40)
                    }
                } else {
                    VStack(spacing: 0) {
                        // Search Bar for Services
                        searchBar
                            .padding(.top, 60)
                            .padding(.horizontal)
                        
                        // Category Filter (Horizontal)
                        categorySelector
                            .padding(.top, 12)
                            .padding(.bottom, 8)
                        
                        ScrollView {
                            LazyVStack(spacing: 16) {
                                Text("services_title".localized)
                                    .font(.system(size: 28, weight: .bold))
                                    .foregroundColor(Color.tcText)
                                    .frame(maxWidth: .infinity, alignment: .leading)
                                    .padding(.horizontal)
                                
                                ForEach(filteredServices) { service in
                                    ServiceRowView(service: service)
                                        .onTapGesture {
                                            selectedService = service
                                        }
                                }
                            }
                            .padding(.horizontal)
                            .padding(.bottom, 100)
                        }
                    }
                }
            }
            .navigationBarHidden(true)
            .fullScreenCover(item: $selectedService) { service in
                GuideDetailView(poi: service, isService: true)
            }
        }
    }
    
    private var categorySelector: some View {
        let activeCats = dataManager.activeServiceCategories
        
        return ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 12) {
                // "All" button
                categoryButton(title: "filter_all".localized, isSelected: selectedCategory == nil) {
                    withAnimation(.spring(response: 0.3)) {
                        selectedCategory = nil
                    }
                }
                
                ForEach(activeCats) { cat in
                    categoryButton(title: cat.displayName, isSelected: selectedCategory == cat) {
                        withAnimation(.spring(response: 0.3)) {
                            selectedCategory = cat
                        }
                    }
                }
            }
            .padding(.horizontal)
        }
    }
    
    private func categoryButton(title: String, isSelected: Bool, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Text(title)
                .font(.system(size: 14, weight: .semibold))
                .foregroundColor(isSelected ? .white : Color.tcTextSecondary)
                .padding(.horizontal, 16)
                .padding(.vertical, 8)
                .background(
                    Capsule()
                        .fill(isSelected ? Color.tcPrimary : Color.tcSurface)
                        .shadow(color: isSelected ? Color.tcPrimary.opacity(0.3) : Color.black.opacity(0.05), radius: 4, x: 0, y: 2)
                )
        }
        .buttonStyle(PlainButtonStyle())
    }
    
    // MARK: - Search Bar
    
    private var searchBar: some View {
        HStack(spacing: 10) {
            Image(systemName: "magnifyingglass")
                .font(.system(size: 16))
                .foregroundColor(Color.tcPrimary.opacity(0.6))
            
            TextField("search_masters_placeholder".localized, text: $searchText)
                .font(.system(size: 16))
                .foregroundColor(Color.tcText)
                .autocorrectionDisabled()
            
            if !searchText.isEmpty {
                Button(action: { searchText = "" }) {
                    Image(systemName: "xmark.circle.fill")
                        .font(.system(size: 16))
                        .foregroundColor(Color.tcTextSecondary)
                }
            }
        }
        .padding(12)
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(Color.tcSurface)
                .overlay(
                    RoundedRectangle(cornerRadius: 12)
                        .stroke(Color.tcPrimary.opacity(0.15), lineWidth: 1)
                )
        )
    }
}

struct ServiceRowView: View {
    let service: POI
    
    var body: some View {
        HStack(spacing: 16) {
            // Icon
            ZStack {
                RoundedRectangle(cornerRadius: 12)
                    .fill(Color.tcPrimary.opacity(0.1))
                    .frame(width: 60, height: 60)
                
                // Используем иконку категории вместо дефолтной иконки человека
                Image(systemName: service.category.icon)
                    .font(.system(size: 24))
                    .foregroundColor(Color.tcPrimary)
            }
            
            VStack(alignment: .leading, spacing: 4) {
                HStack(spacing: 8) {
                    Text(service.name)
                        .font(.system(size: 18, weight: .bold))
                        .foregroundColor(Color.tcText)
                    
                    if service.isValidDiscount {
                        Text(service.isSpecialOffer ? "GIFT" : "\(service.discount ?? 0)%")
                            .font(.system(size: service.isSpecialOffer ? 10 : 12, weight: .black))
                            .foregroundColor(.white)
                            .padding(.horizontal, 6)
                            .padding(.vertical, 2)
                            .background(Color.tcAccent)
                            .cornerRadius(6)
                    }
                }
                
                Text(service.description)
                    .font(.system(size: 14))
                    .foregroundColor(Color.tcTextSecondary)
                    .lineLimit(2)
            }
            
            Spacer()
            
            Image(systemName: "chevron.right")
                .font(.system(size: 14, weight: .bold))
                .foregroundColor(Color.tcPrimary.opacity(0.5))
        }
        .padding(12)
        .background(Color.tcSurface)
        .cornerRadius(16)
        .shadow(color: Color.black.opacity(0.05), radius: 8, x: 0, y: 4)
    }
}
