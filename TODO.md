# Market Finder - Todo List

## Data improvement Tasks

### Tools for fixing data
- [ ] Increase font size on edit form
- [ ] Consider more fields in edit form
- [ ] Work out best tool for adding location for edit form
- [ ] Work out how to calculate "DataFixPriority": (next market date, gaps, last edited)
- [ ] List view for data maintenance (use priority)
- [ ] Implement fix next data tool

### Fix data

## Active Development Tasks

### Publishing
- [ ] Use Netlify auto-build

### Landing Page (New Screen)
- [ ] Create initial landing page layout
- [ ] Add option to choose search by location (WHERE)
- [ ] Add option to choose search by time (WHEN)
- [ ] Implement navigation flow to List/Map screen based on selection

### Main screen navigation
- [ ] Fix button states when switching between Soon and Week modes
- [ ] Implement filtering by market category (farmers, craft, etc.)
- [ ] Try moving list/map control to bottom

### Soon Mode
- [ ] Extend Soon mode to navigate beyond the first week

### List Component
- [ ] Add pagination or infinite scroll for long market lists

### Map Component
- [ ] Ensure Location lat/long working correctly (caldicot may be wrong?)
- [ ] Improve map marker information display
- [ ] Improve area displayed when switching focus between things
- [ ] Improve accessibility of map controls

### Detail Screen
- [x] Make Edit button and edit form - only accessible to Admin using RLS
- [ ] Implement share functionality for market details

### Rendering across devices
- [x] Dave's phone is  Galaxy S9 - so use Responsively to work for that.
- [x] Research how to make apps work across many devices

### Testing
- [ ] Setup test rig
- [ ] Create tests for openhours
- [ ] Identify critical components to be tested
- [ ] Write tests for critical components

### General Improvements
- [ ] Improve handling for missing market images

## Completed Items
- [x] Create basic map view with market markers
- [x] Implement detail view for individual markets
- [x] Add date filtering functionality
- [x] Add directions to markets via Google Maps/Apple Maps
- [x] Implement state preservation between views
- [x] Create responsive list/map toggle

*Note: To mark a task as complete, change `[ ]` to `[x]`*
