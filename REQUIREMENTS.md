# Market Finder App - Current Implementation & Roadmap

## Purpose
Market Finder provides a simple, intuitive experience for finding local markets, with a focus on when they're open and where they're located. The app helps users discover markets that are open today, tomorrow, or in the coming days.

## Current Implementation

### 1. Core Features

#### Date Filtering
- Default view shows markets open today
- Filter options include: Today, Tomorrow, and the next 5 days individually
- "Next 14 days" option to see all upcoming markets
- Two filtering modes available:
  - **Soon Mode**: Filter by specific dates (today, tomorrow, etc.)
  - **Week Mode**: Filter by days of the week (e.g., show markets open on Mondays and Wednesdays)
- Date filters persist when navigating between views

#### View Modes
- **List View**: Scrollable list of markets with details
- **Map View**: Interactive map showing market locations
- **Detail View**: Comprehensive information about a selected market
- State preservation when navigating between views (filter selections and scroll position)

#### Market Information
- Market name and description
- Opening hours and next opening date
- Location (address and map coordinates)
- Market categories with icons
- Market images
- Distance calculation from user's location
- Directions to markets (Google Maps and Apple Maps integration)
- Next three upcoming market dates on the detail page

### Data Scope
- Initially we will restrict to markets in England and Wales
(If we need to expand to include Sctoland & Northern Ireland we will need to deal with "regions" because bank holidays are different in each region)
Governement API: https://www.gov.uk/bank-holidays.json could be used)

### 2. User Interface

#### List View
- Markets displayed in cards with consistent styling
- Each card shows:
  - Market name in larger font
  - Market image (90×90px)
  - Category icons (30×30px)
  - Next opening date/time
  - Distance from user location

#### Map View
- Interactive Mapbox implementation
- Markers for all markets matching the current filter
- User location marker shown on the map
- GeoLocation control for finding user's current position
- Navigation controls for zooming and panning
- Device-appropriate interactions:
  - Desktop: Hover tooltips show market names, clicking opens popup with details
  - Mobile: Tapping markers opens popup with market details (hover tooltips disabled)
- "View Market Details" button in popups for navigation to detail view

#### Detail View
- Large market image
- Complete market information organized in three sections:
  - WHERE: Address, postcode, and directions buttons
  - WHEN: Opening hours and next three upcoming market dates
  - WHAT: Website, description, market image, and categories
- Category icons with capitalized labels
- Opening hours in human-readable format
- Website link when available
- Direction links to Google Maps and Apple Maps
- Back button that returns to previous view (list or map) and restores scroll position

### 3. Technical Implementation

#### Data Management
- Supabase backend for market data storage
- Single shared Supabase client instance to prevent duplicate connections
- Market images stored in the "market-photos" bucket with the naming pattern "[market_ref]-main.png" in the "main" subfolder
- Centralized image URL construction with the DRY principle
- Environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) for Supabase configuration

#### Map Integration
- Mapbox for mapping functionality
- Custom marker styling and interactions
- Responsive design for both desktop and mobile devices

#### State Management
- React state for UI components
- Preserved state when navigating between views:
  - Selected date filter
  - List/map view mode selection
  - Exact scroll position in the list view
  - Selected weekdays in Week mode
- Debug mode toggle for development and troubleshooting

## Future Development Roadmap

### 1. Enhanced User Experience
- User accounts and favorites
- Personalized recommendations based on visit history
- Notifications for favorite markets' opening days
- Offline support for basic functionality

### 2. Additional Features
- Search functionality by market name or product type
- Filtering by market categories (e.g., farmers, craft, food)
- User reviews and ratings
- Market vendor information and stall details
- Social sharing options

### 3. Technical Improvements
- Performance optimizations for faster loading
- Enhanced caching strategy
- Automated testing suite
- Progressive Web App (PWA) implementation
- Analytics to track user behavior and improve the app

### 4. Content Expansion
- More detailed market descriptions
- Photo galleries for each market
- Special events calendar
- Seasonal product availability information
