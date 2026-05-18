# TourCity iOS Project Overview & Handover

## 1. Project Goal
TourCity is a premium, multi-language offline city guide application.
- **Key Features**: 3D Map (MapLibre), Services & Masters catalog, Offline access, Localized content (7 languages), and Brand-specific UI (Espresso/Yellow theme).

## 2. Tech Stack
- **Framework**: SwiftUI
- **Map Engine**: MapLibre (Vector tiles with 3D terrain support)
- **Data Source**: Remote Google Sheets (CSV) synced via `UpdateService`.
- **Localization**: Custom `LocalizationManager` (7 languages: RU, EN, VI, KO, ES, ZH, FR).

## 3. Core Architecture & Key Files

### 📂 Models
- `POI.swift`: The main data structure. 
    - **Important**: Includes `extraMetadata` (`ext_1` to `ext_20`) which stores discounts, expiry dates, and custom logos.
    - **Localization**: Uses `localizedTags` and fallback logic for display tags (looks for `tag_` prefix).
    - **Contacts**: Standardized fields for `inst`, `tg`, `wtsp`, and `site`.

### 📂 Services
- `UpdateService.swift`: Handles data synchronization.
    - **Logic**: Fetches CSV from two separate Google Sheets (Locations and Services). 
    - **Robust Parsing**: Uses a flexible header-matching logic. Automatically defaults missing categories to `.service` for the services sheet.
- `LocalizationManager.swift`: Singleton managing the translation dictionary.
    - **Reactivity**: Uses `@Published currentLanguage` to trigger UI updates.
- `TileServer.swift`: Local server for serving map tiles offline.

### 📂 Views
- `OnboardingView.swift`: The entry point.
    - **SplashView**: Espresso background, yellow spinner.
    - **LanguagePickerView**: An infinite 3D carousel of flags. Syncs the entire onboarding UI in real-time as the user scrolls.
    - **Layout**: Uses fixed-height containers (160pt for icons, 180pt for text) to prevent "jitter" when switching between languages of different lengths.
- `MainTabView.swift`: Root navigation (Map, Guide, Services, Settings).

## 4. Design System (Assets & Colors)
- **tcBackground**: Primary dark/espresso color.
- **tcPrimary**: Brand yellow.
- **tcText / tcTextSecondary**: Accessible text colors.
- **POILogos/**: Namespace in Assets for custom venue logos (linked via `ext_6`).

## 5. Critical Logic & "Gotchas" (For the Next Agent)
1. **Localization**: Always use `loc.string(for: "key")` in views for reactive updates, especially in Onboarding.
2. **Data Integrity**: The `ext_` columns in the Google Sheet are brittle. If you change the parser, ensure `extraMetadata` dictionary is fully populated or discounts will break.
3. **Infinite Scroll**: The `LanguagePickerView` uses 3 sets of items to simulate infinity. It recenters silently via a background queue.
4. **Build Issues**: The project often fails to build `MapLibreSwiftMacrosImpl` due to `SwiftSyntaxBuilder` missing in cache. Solution: Xcode -> Product -> Clear All Issues, then "Reset Package Caches".
6. **Partner Mode**: The Partner Portal and Admin Panel now use a `mode` flag (`places` or `services`). 
   - **Backend**: `/pois` endpoint force-detects the mode by comparing the spreadsheet ID.
   - **Frontend**: Dashboard dynamically filters discount codes based on this mode.

## 6. Recent Major Updates (May 2026)
### 🔄 Discount System Standardization
- **Schema Migration**: Moving away from generic `ext_2`, `ext_3`, `ext_4` towards semantic fields: `size_discount`, `exp_discount`, and `info_discount`.
- **Context-Aware Codes**: Implemented a split-logic for discount conditions.
    - **Places**: Long list (~50 codes) for restaurants/cafes.
    - **Services**: Short, specialized list (13 codes) for masters (e.g., "First Lesson Free", "Story Tag Discount").
- **Admin & Partner Sync**: Both `tourcity-admin` and `tourcity-partner` are now synchronized with these new codes (200-213).

### 🔐 Security & Infrastructure
- **History Cleanup**: Git history was scrubbed to remove leaked Google API keys and Service Account credentials.
- **Git Hardening**: `.gitignore` updated to strictly exclude `service-account.json`, `tourcity-admin/`, and `TourCity/` folders from accidental commits.

### 📱 iOS Localization
- `LocalizationManager.swift` updated with full translations (7 languages) for new discount codes: `disc_code_211` (Story tag), `disc_code_212` (Consultation), and `disc_code_213` (Happy hours).

## 7. Pending / Next Steps
- **Data Migration**: Run a global script to map remaining legacy `ext_` coupon data to the new semantic fields in Google Sheets.
- **Verification**: Confirm that the "Mode Indicator" in the Partner Dashboard correctly reflects the active database for all partner accounts.
- **Map Optimization**: Ensure the Map view properly reacts to theme changes (Light/Dark).
