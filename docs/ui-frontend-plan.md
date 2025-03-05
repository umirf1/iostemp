# FitcheckAI UI/Front-End Development Plan

## Overall Design Philosophy

- Minimalist design with bold typography
- Clear visual hierarchy
- Intuitive navigation
- Engaging feedback mechanisms (loading states, animations)
- Consistent color scheme and styling

## App Structure

### 1. Main Navigation Tabs
- **Home** - Main outfit upload and analysis screen
- **Wardrobe** - History of past outfit analyses (replacing Analytics)
- **Settings** - User preferences and account settings

### 2. Core Screens

#### A. Home Screen
- Large, prominent upload button/area
- Recent outfit analyses displayed below
- Daily streak indicator (similar to the "1 Day streak" in reference)
- Quick access to camera and gallery

#### B. Camera/Upload Screen
- Full-screen camera view with outfit framing guides
- Scan tips modal (similar to "Best scanning practices")
- Options for:
  - Take photo
  - Upload from gallery
  - Select outfit category (dropdown or carousel)

#### C. Loading/Analysis Screen
- Progressive loading animation
- Multi-stage process display:
  1. "Analyzing outfit..." (starts at 24%)
  2. "Finalizing results..." (quickly jumps to 99%)
  3. Brief pause at 99% before showing results

#### D. Results Screen
- Large, prominent outfit score (out of 100)
- Breakdown of scoring categories:
  - Style (replacing Protein)
  - Trend-alignment (replacing Carbs)
  - Creativity (replacing Fat)
- Pros and cons list
- Improvement suggestions
- Share button
- "Fix Results" option (for incorrect analyses)

#### E. Wardrobe Screen (History)
- Grid or list view of past outfit analyses
- Sorting options:
  - Recent (default)
  - Oldest to newest
  - Highest to lowest rating
- Filter by outfit category
- Search functionality

#### F. Settings Screen
- User profile information
- Subscription status
- Preferences for:
  - Style preferences
  - Notification settings
  - Theme options
- Referral program (similar to "Refer friends to earn $")

## Detailed Screen Specifications

### 1. Home Screen

**Layout:**
- App logo and name at top left
- Streak counter at top right (flame icon with number)
- Calendar week view showing logged days
- Main stats card showing:
  - Current style score or average
  - Style consistency metrics
- "Recently logged" section showing:
  - Empty state: "You haven't uploaded any outfits"
  - With data: Thumbnail of outfit, score, and timestamp
- Large floating action button ("+") for new outfit upload

**Interactions:**
- Tap "+" to open camera/upload screen
- Tap on recent outfit to view details
- Swipe between stats cards if multiple metrics are shown

### 2. Camera/Upload Screen

**Layout:**
- Full-screen camera view
- Corner brackets forming a frame for outfit positioning
- Close button (X) at top left
- Help button (?) at top right
- Bottom toolbar with:
  - Camera shutter button
  - Gallery access button
  - Outfit category selector

**First-Time User Experience:**
- "Best outfit capture practices" modal showing:
  - Do's and Don'ts with example images
  - Tips like:
    - "Capture your full outfit in good lighting"
    - "Stand against a neutral background"
    - "Include shoes in the frame"
  - Dismissable with "Got it" button

**Interactions:**
- Tap shutter to take photo
- Tap gallery to select from saved photos
- Select outfit category before or after capture
- Long press on camera for focus adjustment

### 3. Loading/Analysis Screen

**Layout:**
- Captured outfit image as background (slightly dimmed)
- Centered circular progress indicator
- Percentage completion prominently displayed
- Status text below ("Analyzing outfit...", "Finalizing results...")
- "We'll notify you when done!" reassurance text

**Animation Sequence:**
1. Start at 0% with "Analyzing outfit..."
2. Progress naturally to 24% (3-4 seconds)
3. Jump to 75% quickly (1-2 seconds)
4. Slow progress to 99% (2-3 seconds)
5. Change text to "Finalizing results..."
6. Hold at 99% (3-5 seconds)
7. Transition to results screen

### 4. Results Screen

**Layout:**
- Outfit image at top
- Outfit name/label with timestamp
- Large score display (e.g., "85/100")
- Three metric cards for:
  - Style: How well the outfit is put together
  - Trend: How on-trend the outfit is
  - Creativity: Uniqueness and personal expression
- Fashion Score with rating bar
- Detailed breakdown section with:
  - Pros list (with green checkmarks)
  - Cons list (with red X marks)
  - Improvement suggestions
- Action buttons:
  - "Fix Results" (for incorrect analyses)
  - "Share" (to social media)
  - "Done" (return to home)

**Interactions:**
- Swipe up for more detailed analysis
- Tap on metrics for expanded explanation
- Tap "Fix Results" to provide feedback on analysis
- Tap "Share" to open sharing options

### 5. Wardrobe Screen (History)

**Layout:**
- Search bar at top
- Sorting/filtering options below search
- Grid view of outfit cards showing:
  - Outfit thumbnail
  - Date/time
  - Score
  - Key metrics (style, trend, creativity)
- Empty state with prompt to upload first outfit

**Interactions:**
- Tap outfit card to view full details
- Pull down to refresh
- Use sort/filter controls to organize view
- Long press for multi-select options

### 6. Settings Screen

**Layout:**
- User profile section at top
- Subscription status card
- Customization section with:
  - Personal style preferences
  - Favorite brands/designers
  - Body type information (optional)
- Preferences section with toggles for:
  - Notifications
  - Dark/light mode
  - Privacy settings
- Referral program card

**Interactions:**
- Tap sections to expand/edit
- Toggle switches for binary options
- Tap referral card to share app

## UI Components Library

### 1. Common Components

**Buttons:**
- Primary (black background, white text)
- Secondary (white background, black border, black text)
- Tertiary (text only, no background)
- Icon buttons (circular)
- Floating action button ("+")

**Cards:**
- Stat cards (rounded corners, light background)
- Outfit cards (image thumbnail with metadata)
- Info cards (for tips and guidance)

**Progress Indicators:**
- Circular progress (for analysis loading)
- Linear progress bars (for metrics)
- Skeleton loaders (for content loading)

**Typography:**
- Large bold headings (for scores and main titles)
- Medium weight for section headers
- Regular weight for body text
- Small captions for metadata

### 2. Custom Components

**Outfit Frame Guide:**
- Corner brackets that help position the outfit in camera view

**Score Display:**
- Large circular or rectangular display for the main outfit score

**Category Selector:**
- Horizontal scrollable list of outfit categories:
  - Streetwear
  - Formalwear
  - Business Casual
  - Smart Casual
  - Techwear
  - Athleisure
  - Minimalist
  - Y2K/Trendy

**Metric Gauges:**
- Circular progress indicators for style metrics

**Pros/Cons List:**
- Custom list items with appropriate icons

## Color Scheme

**Primary Colors:**
- Black (#000000) - Primary text, buttons
- White (#FFFFFF) - Backgrounds, button text
- Light Gray (#F5F5F5) - Secondary backgrounds, cards

**Accent Colors:**
- Flame Orange (#FF6B00) - For streak indicators, highlights
- Success Green (#4CAF50) - For pros, positive metrics
- Error Red (#F44336) - For cons, negative metrics
- Info Blue (#2196F3) - For tips, information

## Implementation Phases

### Phase 1: Basic Navigation & Structure
- Set up tab navigation
- Create screen shells
- Implement basic routing

### Phase 2: Camera & Upload Functionality
- Implement camera access
- Create upload from gallery option
- Build framing guides and capture UI

### Phase 3: Mock Analysis Flow
- Create loading/analysis animations
- Implement timed transitions
- Build results display with mock data

### Phase 4: Wardrobe History
- Create outfit cards
- Implement sorting and filtering
- Build empty and populated states

### Phase 5: Settings & Profile
- Build user settings interface
- Create preference toggles
- Implement mock subscription status

### Phase 6: Polish & Refinement
- Add transitions and animations
- Implement dark/light mode
- Refine typography and spacing
- Add haptic feedback

## Mock Data Structure

We'll need to create mock data for:

1. **Outfit Analysis Results:**
```
{
  id: "outfit123",
  imageUri: "path/to/image.jpg",
  timestamp: "2023-06-15T14:30:00Z",
  category: "Streetwear",
  overallScore: 85,
  metrics: {
    style: 80,
    trend: 90,
    creativity: 85
  },
  feedback: {
    pros: [
      "Great color coordination",
      "Well-fitted silhouette",
      "Excellent accessory choices"
    ],
    cons: [
      "Shoes don't match the overall style",
      "Too many competing patterns"
    ],
    suggestions: [
      "Try a more minimal shoe to balance the outfit",
      "Consider a solid-colored top to let the patterned bottom stand out"
    ]
  }
}
```

2. **User Preferences:**
```
{
  userId: "user456",
  stylePreferences: ["Streetwear", "Minimalist"],
  favoriteColors: ["Black", "White", "Earth tones"],
  bodyType: "Athletic",
  notifications: {
    dailyReminders: true,
    weeklyRecaps: true,
    trendAlerts: false
  }
}
```

## Next Steps After Plan Approval

1. Set up the basic project structure
2. Create the navigation framework
3. Build the home screen UI
4. Implement the camera/upload functionality
5. Create the loading/analysis animation sequence
6. Build the results display with mock data
7. Develop the wardrobe history screen
8. Implement the settings screen
9. Add polish and refinements 