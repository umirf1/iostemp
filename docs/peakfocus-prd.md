# Product Requirements Document (PRD) for PeakFocus

## 1. Introduction

### 1.1 Purpose
The purpose of PeakFocus is to enhance user productivity by reducing distractions from selected apps. It achieves this by implementing a delay screen before access, tracking usage streaks with a calendar, measuring and displaying hours saved, and offering flashcard questions as an optional challenge to bypass delays.

### 1.2 Scope
PeakFocus will be a mobile application available on iOS and Android platforms. It will allow users to:

- Select specific apps to apply a delay screen.
- Track streaks of meeting usage goals via a calendar.
- View time saved from reduced app usage.
- Answer flashcard questions to gain immediate access to delayed apps.

The app will require permissions to monitor app usage and will prioritize an intuitive, user-friendly experience.

## 2. Features and Functional Requirements

### 2.1 App Selection
**Description**: Users can choose which apps they want PeakFocus to control, such as social media, games, or other distractions.

**Requirements**:
- Display a list of installed apps for users to select from.
- Allow users to add or remove apps from the controlled list at any time.

### 2.2 Delay Screen
**Description**: When a user attempts to open a selected app, a delay screen appears to discourage impulsive usage.

**Requirements**:
- Display a countdown timer based on a user-defined delay duration (e.g., 30 seconds, 1 minute, 5 minutes).
- Include customizable delay time options.
- Show motivational quotes or productivity reminders during the delay.
- Grant access to the app once the delay period ends.

### 2.3 Streak Function with Calendar
**Description**: Tracks consecutive days where users meet predefined app usage goals, displayed on a calendar.

**Requirements**:
- Allow users to set daily goals (e.g., "use selected apps less than 30 minutes" or "no usage during work hours").
- Increment the streak by one for each day the goal is met.
- Reset the streak to zero if the goal is not met.
- Provide a calendar view showing successful days with visual markers (e.g., green dots).

### 2.4 Hours Saved Measurement
**Description**: Calculates and displays the time users save by reducing usage of selected apps.

**Requirements**:
- Establish a baseline of app usage (e.g., through a calibration period or historical data).
- Compare current usage with the baseline to compute time saved.
- Display daily, weekly, and total hours saved in the app interface.

### 2.5 Flashcard Questions
**Description**: Offers an optional feature where users can answer flashcard questions to bypass the delay screen and access apps immediately.

**Requirements**:
- Provide a library of predefined flashcard questions (e.g., productivity tips, general knowledge).
- Allow users to create custom flashcard sets.
- Require one correct answer to bypass the delay.
- Limit bypass attempts (e.g., 3 per day) to maintain the delay's effectiveness.
- If the answer is incorrect, enforce the full delay or prompt a retry (with limits).

### 2.6 Settings and Customization
**Description**: Enables users to tailor the app to their preferences.

**Requirements**:
- Allow adjustments to delay times, daily goals, and flashcard settings.
- Provide options to enable/disable the flashcard feature.
- Permit updates to the list of selected apps.

### 2.7 Statistics and Insights
**Description**: Offers users insights into their progress and usage patterns.

**Requirements**:
- Display streak details (current streak, longest streak, total successful days).
- Show time saved metrics in a clear, visual format (e.g., charts or graphs).
- Present usage history for selected apps.

## 3. Non-Functional Requirements

### 3.1 Performance
- The app must launch quickly and impose minimal impact on device performance.
- Delay screens should activate instantly when a selected app is opened.

### 3.2 Security and Privacy
- Request only necessary permissions (e.g., app usage tracking) with clear user consent.
- Store all user data securely on the device, avoiding external sharing without permission.

### 3.3 Usability
- Feature an intuitive, clean interface suitable for all users.
- Include an onboarding tutorial to guide new users through setup and core features.

## 4. User Stories
- As a user, I want to choose specific apps to delay so I can focus on minimizing distractions from apps I overuse.
- As a user, I want a delay screen before accessing apps to help me reconsider unnecessary usage.
- As a user, I want to track my streaks on a calendar to stay motivated by seeing my consistency.
- As a user, I want to know how many hours I've saved to feel rewarded for my efforts.
- As a user, I want to answer flashcard questions to skip delays when I need quick access, adding a fun challenge.
- As a user, I want customizable settings to adjust the app to my personal productivity goals.

## 5. Assumptions and Constraints

### Assumptions:
- Users will grant app usage tracking permissions for accurate functionality.
- The app's success depends on users' commitment to their goals.

### Constraints:
- Technical feasibility may differ between iOS and Android due to platform-specific limitations (e.g., iOS Screen Time API vs. Android UsageStatsManager).
- Initial development will focus on core features, with advanced options considered for later updates.

## 6. Future Enhancements
- Integration: Sync with calendars or other productivity tools.
- Social Features: Share streaks or compete with friends.
- Advanced Analytics: Offer deeper insights or personalized recommendations.
- Flashcard Expansion: Integrate with external flashcard platforms or add themed question sets.

## 7. Summary
- **Product Name**: PeakFocus
- **Tagline**: Take control of your apps, boost your focus.
- **Description**: PeakFocus is a productivity app that adds a delay screen to selected apps, tracks streaks with a calendar, measures hours saved, and challenges users with flashcard questions to bypass delays. It empowers users to reduce distractions and build better habits.
- **Target Audience**: Individuals aiming to improve focus, reduce app-related distractions, and enhance productivity.
- **Platforms**: iOS and Android.
- **Monetization**: Hard pay wall. 