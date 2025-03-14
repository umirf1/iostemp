# Mobile App Template

A comprehensive React Native template for iOS apps with built-in onboarding, subscription paywall, and core app structure.

## Project Documentation

- [PeakFocus PRD](docs/peakfocus-prd.md) - Product Requirements Document for the PeakFocus app
- [App Documentation](docs/app-documentation.md) - General app documentation
- [UI Frontend Plan](docs/ui-frontend-plan.md) - UI and frontend implementation details

## Features

- **Onboarding Flow**: Multi-step introduction to your app with customizable content
- **Subscription Paywall**: Ready-to-use subscription screen with monthly and yearly options
- **Tab-based Navigation**: Pre-configured tab navigation with home, collection, and settings screens
- **Camera Integration**: Built-in camera functionality with image capture and gallery selection
- **Modern UI Components**: Clean, customizable UI elements ready for your branding

## Getting Started

### Prerequisites

- Node.js (v14 or newer)
- Yarn or npm
- Expo CLI
- iOS development environment (Xcode)

### Installation

1. Clone this repository:
```bash
git clone https://github.com/yourusername/mobile-app-template.git
cd mobile-app-template
```

2. Install dependencies:
```bash
yarn install
# or
npm install
```

3. Start the development server:
```bash
yarn start
# or
npm start
```

4. Run on iOS:
```bash
yarn ios
# or
npm run ios
```

## Customization

### App Information

Update the app information in `app.json`:

```json
{
  "expo": {
    "name": "Your App Name",
    "slug": "your-app-slug",
    "version": "1.0.0",
    ...
  }
}
```

### Onboarding Content

Modify the onboarding content in `src/app/onboarding.tsx`:

```javascript
const ONBOARDING_STEPS = [
  {
    title: "Your Custom Title",
    description: "Your custom description",
    icon: "icon-name"
  },
  // Add more steps as needed
];
```

### Subscription Plans

Customize subscription plans in `src/app/subscription.tsx`:

```javascript
const SUBSCRIPTION_PLANS = [
  {
    id: "monthly",
    title: "Monthly",
    price: "$X.XX",
    period: "month",
    features: [
      "Feature 1",
      "Feature 2",
      // Add more features
    ]
  },
  // Add more plans as needed
];
```

### Main App Content

Modify the main app screens in the `src/app/(tabs)` directory:
- `index.tsx`: Home screen
- `wardrobe.tsx`: Collection/items screen
- `settings.tsx`: Settings screen

## Project Structure

```
src/
├── app/
│   ├── (tabs)/             # Main app tabs
│   │   ├── index.tsx       # Home screen
│   │   ├── wardrobe.tsx    # Collection screen
│   │   ├── settings.tsx    # Settings screen
│   │   └── _layout.tsx     # Tab navigation layout
│   ├── onboarding.tsx      # Onboarding flow
│   ├── subscription.tsx    # Subscription paywall
│   ├── camera.tsx          # Camera screen
│   └── _layout.tsx         # Main app layout
├── components/             # Reusable components
├── lib/                    # Utilities and helpers
└── assets/                 # Images and other assets
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with [Expo](https://expo.dev/)
- Uses [Expo Router](https://docs.expo.dev/router/introduction/) for navigation


