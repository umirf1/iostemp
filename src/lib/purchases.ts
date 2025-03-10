import Purchases, { PurchasesPackage } from 'react-native-purchases';
import { Platform } from 'react-native';

// Your RevenueCat API keys
const API_KEYS = {
  ios: 'appl_dummy_api_key',
  android: 'goog_dummy_api_key',
};

// Initialize RevenueCat
export function initializePurchases() {
  try {
    Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
    
    const apiKey = Platform.select({
      ios: API_KEYS.ios,
      android: API_KEYS.android,
      default: API_KEYS.ios,
    });

    Purchases.configure({ apiKey });
    console.log('RevenueCat initialized successfully');
  } catch (error) {
    console.error('Failed to initialize RevenueCat:', error);
  }
}

// Get available packages
export async function getAvailablePackages(): Promise<PurchasesPackage[]> {
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current?.availablePackages || [];
  } catch (error) {
    console.error('Error getting packages:', error);
    return [];
  }
}

// Purchase a package
export async function purchasePackage(
  pack: PurchasesPackage,
): Promise<boolean> {
  try {
    const { customerInfo } = await Purchases.purchasePackage(pack);
    const isPro = customerInfo.entitlements.active.pro !== undefined;
    return isPro;
  } catch (error) {
    console.error('Error purchasing package:', error);
    throw error;
  }
}

// Check subscription status
export async function checkSubscriptionStatus(): Promise<boolean> {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo.entitlements.active.pro !== undefined;
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return false;
  }
}

// Restore purchases
export async function restorePurchases(): Promise<boolean> {
  try {
    const customerInfo = await Purchases.restorePurchases();
    return customerInfo.entitlements.active.pro !== undefined;
  } catch (error) {
    console.error('Error restoring purchases:', error);
    return false;
  }
} 