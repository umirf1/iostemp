# Delay Screen Implementation Plan

This document outlines the steps needed to implement and test the delay screen functionality in the iOS Screen Time extension.

## Step 1: Ensure You're in the Bare Workflow or Using a Custom Development Client

Expo's managed workflow doesn't fully support custom native code like a Screen Time extension. You need to use the bare workflow or a custom development client.

```bash
# Check if you've ejected to the bare workflow
# If you haven't ejected, run:
bun run expo eject

# Alternatively, use a custom development client:
bun install expo-dev-client

# Build the app with the development client (to be done in Step 8):
bun run expo run:ios --device
```

## Step 2: Configure Entitlements in app.json

The app needs Family Controls and App Groups entitlements for both the main app and the extension.

```json
{
  "expo": {
    "name": "MobileAppTemplate",
    "slug": "mobile-app-template",
    "ios": {
      "bundleIdentifier": "com.yourcompany.apptemplate",
      "entitlements": {
        "com.apple.security.application-groups": [
          "group.com.yourcompany.apptemplate"
        ],
        "com.apple.developer.family-controls": true
      }
    }
  }
}
```

After updating app.json, regenerate the native project:

```bash
bun run expo prebuild --clean
```

## Step 3: Verify and Update ShieldConfigurationExtension.swift

Ensure the ShieldConfigurationExtension.swift file contains the correct code:

```swift
import ManagedSettings
import DeviceActivity
import FamilyControls
import UIKit

class ShieldConfigurationExtension: ShieldConfigurationDataSource {
    override func configuration(shielding application: Application) -> ShieldConfiguration {
        return delayScreenConfiguration(for: application.bundleIdentifier ?? "this app")
    }
    
    override func configuration(shielding category: ActivityCategory) -> ShieldConfiguration {
        return delayScreenConfiguration(for: "this category")
    }
    
    private func delayScreenConfiguration(for name: String) -> ShieldConfiguration {
        let appGroupId = "group.com.yourcompany.apptemplate"
        let delayDuration = UserDefaults(suiteName: appGroupId)?.integer(forKey: "delayDuration") ?? 30
        
        return ShieldConfiguration(
            backgroundBlurStyle: .dark,
            backgroundColor: .black.withAlphaComponent(0.7),
            icon: .init(systemName: "hourglass"),
            title: .init(text: "Taking a Break", color: .white),
            subtitle: .init(text: "You're trying to open \(name). Let's pause for a moment.", color: .white),
            primaryButtonLabel: .init(text: "Wait \(delayDuration) seconds", color: .white),
            primaryButtonBackgroundColor: .systemBlue,
            secondaryButtonLabel: .init(text: "Cancel", color: .white)
        )
    }
}
```

## Step 4: Verify the Info.plist for ShieldConfigurationExtension

The Info.plist file must have the correct NSExtension keys:

```xml
<key>NSExtension</key>
<dict>
    <key>NSExtensionPointIdentifier</key>
    <string>com.apple.screen-time.shield-configuration</string>
    <key>NSExtensionPrincipalClass</key>
    <string>$(PRODUCT_MODULE_NAME).ShieldConfigurationExtension</string>
</dict>
```

## Step 5: Verify Entitlements in Xcode

- Open Xcode with ios/MobileAppTemplate.xcworkspace
- For MobileAppTemplate target:
  - Go to "Signing & Capabilities" tab
  - Ensure App Groups (group.com.yourcompany.apptemplate) and Family Controls are enabled
- For ShieldConfigurationExtension target:
  - Go to "Signing & Capabilities" tab
  - Ensure App Groups (group.com.yourcompany.apptemplate) and Family Controls are enabled

## Step 6: Verify Frameworks for ShieldConfigurationExtension in Xcode

- Select the ShieldConfigurationExtension target
- Go to "Build Phases" tab
- Under "Link Binary With Libraries", ensure these frameworks are included:
  - ManagedSettings.framework
  - DeviceActivity.framework
  - FamilyControls.framework
  - ManagedSettingsUI.framework (optional)

## Step 7: Update the Podfile

Update the Podfile to include the ShieldConfigurationExtension target:

```ruby
require_relative '../node_modules/react-native/scripts/react_native_pods'
require_relative '../node_modules/@react-native-community/cli-platform-ios/native_modules'

platform :ios, '16.6'

target 'MobileAppTemplate' do
  config = use_native_modules!

  use_react_native!(
    :path => '../node_modules/react-native',
    :hermes_enabled => false
  )

  target 'ShieldConfigurationExtension' do
    inherit! :search_paths
  end
end
```

Run pod install:

```bash
cd ios
pod install
```

## Step 8: Clean and Rebuild the Project

- In Xcode: Product > Clean Build Folder (or Shift+Command+K)
- Delete Derived Data:
  - Xcode > Settings > Locations
  - Click the arrow next to "Derived Data" to open in Finder
  - Delete the DerivedData folder
  - Reopen Xcode with ios/MobileAppTemplate.xcworkspace

Rebuild the project:

```bash
bun run expo run:ios --device
```

## Step 9: Test the App on a Physical Device

Create a native module for authorization (ScreenTimeModule.swift):

```swift
import Foundation
import FamilyControls

@objc(ScreenTimeModule)
class ScreenTimeModule: NSObject {
    @objc
    func requestAuthorization(_ callback: @escaping RCTResponseSenderBlock) {
        Task {
            do {
                try await AuthorizationCenter.shared.requestAuthorization(for: .individual)
                callback([nil, true])
            } catch {
                callback([error.localizedDescription, false])
            }
        }
    }

    @objc
    func setDelayDuration(_ duration: Int) {
        let appGroupId = "group.com.yourcompany.apptemplate"
        if let sharedDefaults = UserDefaults(suiteName: appGroupId) {
            sharedDefaults.set(duration, forKey: "delayDuration")
            sharedDefaults.synchronize()
        }
    }

    @objc
    static func requiresMainQueueSetup() -> Bool {
        return true
    }
}
```

Create a corresponding Objective-C bridging header (ScreenTimeModule-Bridging-Header.h):

```objc
#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(ScreenTimeModule, NSObject)

RCT_EXTERN_METHOD(requestAuthorization:(RCTResponseSenderBlock)callback)
RCT_EXTERN_METHOD(setDelayDuration:(int)duration)

@end
```

Update React Native code to use the native module:

```javascript
import { NativeModules } from 'react-native';

const { ScreenTimeModule } = NativeModules;

// Request Family Controls authorization
ScreenTimeModule.requestAuthorization((error, success) => {
  if (error) {
    console.error('Authorization failed:', error);
  } else {
    console.log('Authorization succeeded:', success);
  }
});

// Set the delay duration
ScreenTimeModule.setDelayDuration(45);
```

## Testing the Shield Configuration

1. Restrict an app or category using the Screen Time API
2. Try to open the restricted app on your iPhone
3. The custom shield screen should appear with the message "Taking a Break" and a "Wait X seconds" button 