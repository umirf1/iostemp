#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function setup() {
  try {
    console.log("\n🚀 Welcome to the Mobile Template Setup!\n");

    // Get project name
    const projectName = await question("Enter your project name (e.g., My Awesome App): ");
    const slug = projectName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Read app.json
    const appJsonPath = path.join(__dirname, "app.json");
    const appJson = JSON.parse(fs.readFileSync(appJsonPath, "utf8"));

    // Update app.json
    appJson.expo.name = projectName;
    appJson.expo.slug = slug;

    // Update bundle identifiers
    const bundleId = `com.${slug.replace(/-/g, "")}`;
    appJson.expo.ios.bundleIdentifier = bundleId;
    appJson.expo.android.package = bundleId;

    // Write back to app.json
    fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));

    console.log("\n✅ Project setup completed successfully!");
    console.log("\nNext steps:");
    console.log("1. Install dependencies: npm install");
    console.log("2. Start the development server: npm start");
    console.log("3. Run on iOS: npm run ios");
    console.log("4. Run on Android: npm run android\n");

    // Delete the setup script
    const scriptPath = __filename;
    fs.unlinkSync(scriptPath);
    console.log("🧹 Setup script has been removed.\n");
  } catch (error) {
    console.error("❌ Error during setup:", error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

setup();
