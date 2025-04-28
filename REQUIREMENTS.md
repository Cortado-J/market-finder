# Market Finder Search Screen Specification (Mobile First)

Purpose:
Provide a simple, intuitive search experience for finding markets, focusing on core user needs: finding markets today, tomorrow, this week, or in a particular week.

**1. Grouping and Ordering of List**

Group by date:

Each date (e.g., "Monday 28 April", "Tuesday 29 April") forms a separate group.

Order groups:

Chronological, earliest date first.

**2. Ordering Within a Group**

Order markets within each date group by distance from the user's home location, nearest first.

**3. Displaying Markets That Occur on Multiple Days**

Each market appears only once in each filtered list view.

A market that runs on multiple days (e.g., Tuesday through Thursday) should appear in all relevant day filters (e.g., "Tuesday", "Wednesday", "Thursday", and "Next 14 Days").

Tag is shown indicating additional days when the market is also held.

Example display: "City Market (Also on Wed, Thu)"

**4. User Experience Principles**

Emphasize simplicity and clarity.

Default filter: Show today's markets when the user opens the screen.

Filters available:
- Today (blue button)
- Tomorrow (blue button)
- Next 5 days shown individually (Thu, Fri, Sat, Sun, Mon) (blue buttons)
- Next 14 days (blue button)

**5. Map Marker Colour Scheme**

Marker colours:

Markets Today: Blue

Markets Tomorrow: Light Blue

Markets Later This Week: Grey

Selected Market: Yellow or Highlighted Outline

**6. Mobile-First Layout**

Toggle between List and Map views (default view is List).

List View:
- Markets displayed in dark grey boxes, one below the other (scrollable)
- Each box contains:
  - Market name in a larger font
  - Next open date/time below the name
  - Standard opening times below that

Map View:
- Fullscreen map
- An overlaid dark grey box (same style as list view) near the bottom of the screen shows details of the selected market
- Displayed market defaults to the earliest market (based on opening time)
- The box contains:
  - Market name in a larger font
  - Next open date/time
  - Standard opening times
- The currently selected market is highlighted on the map

**7. Interaction Between List and Map**

Selecting a market from the list view should:

Toggle to map view (optional - to be confirmed) or

Highlight the corresponding marker.

Selecting a marker on the map should:

Update the overlaid market information box.

Highlight the selected market.


