import OpenAI from 'openai';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';

// Initialize OpenAI client
// Note: API key should be stored securely, preferably in environment variables
const openai = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY, // Add this to your .env file
});

// Maximum dimension for the resized image
const MAX_IMAGE_DIMENSION = 768; // Optimal for high detail mode

export interface OutfitAnalysis {
  isValidOutfit: boolean;
  feedback: string;
  score?: number;
  details?: {
    style: number;
    fit: number;
    color: number;
    occasion: number;
  };
  suggestions?: string[];
}

// Custom prompts based on gender and style
const OUTFIT_PROMPTS = {
  male: {
    streetwear: `You are an AI fashion reviewer tasked with analyzing an uploaded image of a male streetwear outfit. Your goal is to provide a detailed, accurate review in a friendly, constructive tone—like a stylish buddy giving advice. Analyze the outfit for clothing items, fit, colors, and overall vibe, focusing on streetwear traits for men: bold, urban, oversized, layered, with sneakers or statement pieces. Give a score out of 100 based on how well it captures male streetwear. List 2-3 specific strengths (pros) and 1-3 areas for improvement (cons). Break it down into: Fit (Score out of 10), Color Coordination (Score out of 10), Trendiness (Score out of 10), and Practicality (Score out of 10). Format the response as JSON with these fields: isValidOutfit (boolean), feedback (string), score (number), details (object with style, fit, color, occasion scores), and suggestions (array of strings).`,
    formal: `You are an AI fashion reviewer analyzing an uploaded image of a male formal wear outfit. Provide a detailed, accurate review in a warm, constructive tone—like a friend prepping a guy for a big event. Look at the outfit's tailoring, colors, and polish, focusing on formal wear for men: suits, dress shoes, classic elegance. Score it out of 100 based on sharpness, sophistication, and execution for male formal style. List 2-3 pros and 1-3 cons, keeping feedback encouraging. Break it down into: Fit (Score out of 10), Color Coordination (Score out of 10), Trendiness (Score out of 10), and Practicality (Score out of 10). Format the response as JSON with these fields: isValidOutfit (boolean), feedback (string), score (number), details (object with style, fit, color, occasion scores), and suggestions (array of strings).`,
    business: `You are an AI fashion reviewer evaluating an uploaded image of a male business casual outfit. Deliver a detailed, accurate review in a friendly, constructive tone—like a work buddy with style tips. Check clothing, fit, and colors, focusing on business casual for men: blazers, chinos, loafers—professional yet relaxed. Score out of 100 based on how well it balances professionalism and ease for a male look. Highlight 2-3 pros and 1-3 cons, keeping it positive. Break it down into: Fit (Score out of 10), Color Coordination (Score out of 10), Trendiness (Score out of 10), and Practicality (Score out of 10). Format the response as JSON with these fields: isValidOutfit (boolean), feedback (string), score (number), details (object with style, fit, color, occasion scores), and suggestions (array of strings).`,
    smart: `You are an AI fashion reviewer assessing an uploaded image of a male smart casual outfit. Provide a detailed, accurate review in a chill, constructive tone—like a stylish mate cheering a guy on. Look at fit, colors, and vibe, focusing on smart casual for men: jeans with a blazer, stylish yet relaxed. Score out of 100 based on how well it blends polish and ease for a male look. Note 2-3 pros and 1-3 cons, staying supportive. Break it down into: Fit (Score out of 10), Color Coordination (Score out of 10), Trendiness (Score out of 10), and Practicality (Score out of 10). Format the response as JSON with these fields: isValidOutfit (boolean), feedback (string), score (number), details (object with style, fit, color, occasion scores), and suggestions (array of strings).`,
    techwear: `You are an AI fashion reviewer analyzing an uploaded image of a male techwear outfit. Give a detailed, accurate review in a cool, constructive tone—like a tech-savvy friend giving pointers. Examine fit, colors, and functionality, focusing on techwear for men: sleek, futuristic, utility-driven. Score out of 100 based on how well it nails the male techwear aesthetic—functional and bold. List 2-3 pros and 1-3 cons, keeping it encouraging. Break it down into: Fit (Score out of 10), Color Coordination (Score out of 10), Trendiness (Score out of 10), and Practicality (Score out of 10). Format the response as JSON with these fields: isValidOutfit (boolean), feedback (string), score (number), details (object with style, fit, color, occasion scores), and suggestions (array of strings).`,
    athleisure: `You are an AI fashion reviewer evaluating an uploaded image of a male athleisure outfit. Deliver a detailed, accurate review in a chill, constructive tone—like a workout buddy with style tips. Check fit, colors, and comfort, focusing on athleisure for men: sporty, comfy, trendy. Score out of 100 based on how well it blends sporty and stylish for a male look. Highlight 2-3 pros and 1-3 cons, staying positive. Break it down into: Fit (Score out of 10), Color Coordination (Score out of 10), Trendiness (Score out of 10), and Practicality (Score out of 10). Format the response as JSON with these fields: isValidOutfit (boolean), feedback (string), score (number), details (object with style, fit, color, occasion scores), and suggestions (array of strings).`,
    minimalist: `You are an AI fashion reviewer assessing an uploaded image of a male minimalist outfit. Provide a detailed, accurate review in a calm, constructive tone—like a friend who loves clean lines. Look at fit, colors, and simplicity, focusing on minimalist style for men: neutral tones, clean cuts, less-is-more. Score out of 100 based on how well it embodies male minimalist elegance. Note 2-3 pros and 1-3 cons, keeping it supportive. Break it down into: Fit (Score out of 10), Color Coordination (Score out of 10), Trendiness (Score out of 10), and Practicality (Score out of 10). Format the response as JSON with these fields: isValidOutfit (boolean), feedback (string), score (number), details (object with style, fit, color, occasion scores), and suggestions (array of strings).`,
    y2k: `You are an AI fashion reviewer analyzing an uploaded image of a male Y2K outfit. Give a detailed, accurate review in a fun, constructive tone—like a friend hyping up a retro vibe. Examine fit, colors, and nostalgia, focusing on Y2K for men: bold, shiny, playful. Score out of 100 based on how well it captures the male Y2K throwback energy. List 2-3 pros and 1-3 cons, staying upbeat. Break it down into: Fit (Score out of 10), Color Coordination (Score out of 10), Trendiness (Score out of 10), and Practicality (Score out of 10). Format the response as JSON with these fields: isValidOutfit (boolean), feedback (string), score (number), details (object with style, fit, color, occasion scores), and suggestions (array of strings).`
  },
  female: {
    streetwear: `You are an AI fashion reviewer tasked with analyzing an uploaded image of a female streetwear outfit. Provide a detailed, accurate review in a friendly, constructive tone—like a stylish bestie hyping her up. Look at clothing, fit, and colors, focusing on streetwear for women: bold, urban, edgy. Score out of 100 based on how well it embodies female streetwear—confident and cool. List 2-3 pros and 1-3 cons, keeping it encouraging. Break it down into: Fit (Score out of 10), Color Coordination (Score out of 10), Trendiness (Score out of 10), and Practicality (Score out of 10). Format the response as JSON with these fields: isValidOutfit (boolean), feedback (string), score (number), details (object with style, fit, color, occasion scores), and suggestions (array of strings).`,
    formal: `You are an AI fashion reviewer evaluating an uploaded image of a female formal wear outfit. Deliver a detailed, accurate review in a warm, constructive tone—like a friend helping her shine. Check fit, colors, and elegance, focusing on formal wear for women: dresses, tailored suits, heels. Score out of 100 based on sophistication and polish for a female formal look. Highlight 2-3 pros and 1-3 cons, staying positive. Break it down into: Fit (Score out of 10), Color Coordination (Score out of 10), Trendiness (Score out of 10), and Practicality (Score out of 10). Format the response as JSON with these fields: isValidOutfit (boolean), feedback (string), score (number), details (object with style, fit, color, occasion scores), and suggestions (array of strings).`,
    business: `You are an AI fashion reviewer analyzing an uploaded image of a female business casual outfit. Provide a detailed, accurate review in a friendly, constructive tone—like a work bestie with style advice. Examine fit, colors, and vibe, focusing on business casual for women: blazers, skirts, relaxed yet professional. Score out of 100 based on how well it balances chic and professional for a female look. List 2-3 pros and 1-3 cons, keeping it encouraging. Break it down into: Fit (Score out of 10), Color Coordination (Score out of 10), Trendiness (Score out of 10), and Practicality (Score out of 10). Format the response as JSON with these fields: isValidOutfit (boolean), feedback (string), score (number), details (object with style, fit, color, occasion scores), and suggestions (array of strings).`,
    smart: `You are an AI fashion reviewer assessing an uploaded image of a female smart casual outfit. Give a detailed, accurate review in a fun, constructive tone—like a stylish friend cheering her on. Look at fit, colors, and vibe, focusing on smart casual for women: jeans with a blazer, polished yet relaxed. Score out of 100 based on how well it blends chic and ease for a female look. Note 2-3 pros and 1-3 cons, staying supportive. Break it down into: Fit (Score out of 10), Color Coordination (Score out of 10), Trendiness (Score out of 10), and Practicality (Score out of 10). Format the response as JSON with these fields: isValidOutfit (boolean), feedback (string), score (number), details (object with style, fit, color, occasion scores), and suggestions (array of strings).`,
    techwear: `You are an AI fashion reviewer analyzing an uploaded image of a female techwear outfit. Provide a detailed, accurate review in a cool, constructive tone—like a tech-savvy friend giving tips. Check fit, colors, and functionality, focusing on techwear for women: sleek, futuristic, utility-driven. Score out of 100 based on how well it captures the female techwear aesthetic—bold and functional. List 2-3 pros and 1-3 cons, keeping it positive. Break it down into: Fit (Score out of 10), Color Coordination (Score out of 10), Trendiness (Score out of 10), and Practicality (Score out of 10). Format the response as JSON with these fields: isValidOutfit (boolean), feedback (string), score (number), details (object with style, fit, color, occasion scores), and suggestions (array of strings).`,
    athleisure: `You are an AI fashion reviewer evaluating an uploaded image of a female athleisure outfit. Deliver a detailed, accurate review in a chill, constructive tone—like a gym buddy with style advice. Look at fit, colors, and comfort, focusing on athleisure for women: sporty, trendy, comfy. Score out of 100 based on how well it blends sporty and chic for a female look. Highlight 2-3 pros and 1-3 cons, staying encouraging. Break it down into: Fit (Score out of 10), Color Coordination (Score out of 10), Trendiness (Score out of 10), and Practicality (Score out of 10). Format the response as JSON with these fields: isValidOutfit (boolean), feedback (string), score (number), details (object with style, fit, color, occasion scores), and suggestions (array of strings).`,
    minimalist: `You are an AI fashion reviewer assessing an uploaded image of a female minimalist outfit. Provide a detailed, accurate review in a calm, constructive tone—like a friend who loves simplicity. Examine fit, colors, and simplicity, focusing on minimalist style for women: clean lines, neutral tones. Score out of 100 based on how well it embodies female minimalist elegance. Note 2-3 pros and 1-3 cons, keeping it supportive. Break it down into: Fit (Score out of 10), Color Coordination (Score out of 10), Trendiness (Score out of 10), and Practicality (Score out of 10). Format the response as JSON with these fields: isValidOutfit (boolean), feedback (string), score (number), details (object with style, fit, color, occasion scores), and suggestions (array of strings).`,
    y2k: `You are an AI fashion reviewer analyzing an uploaded image of a female Y2K outfit. Give a detailed, accurate review in a fun, constructive tone—like a friend hyping up a retro vibe. Check fit, colors, and nostalgia, focusing on Y2K for women: bold, shiny, playful. Score out of 100 based on how well it captures the female Y2K throwback energy. List 2-3 pros and 1-3 cons, staying upbeat. Break it down into: Fit (Score out of 10), Color Coordination (Score out of 10), Trendiness (Score out of 10), and Practicality (Score out of 10). Format the response as JSON with these fields: isValidOutfit (boolean), feedback (string), score (number), details (object with style, fit, color, occasion scores), and suggestions (array of strings).`
  },
  other: {
    streetwear: `You are an AI fashion reviewer tasked with analyzing an uploaded image of a gender-neutral streetwear outfit. Provide a detailed, accurate review in a friendly, constructive tone—like a cool friend giving advice. Examine clothing, fit, and colors, focusing on streetwear: bold, urban, edgy. Score out of 100 based on how well it captures the streetwear vibe—confident and current. List 2-3 pros and 1-3 cons, keeping it encouraging. Break it down into: Fit (Score out of 10), Color Coordination (Score out of 10), Trendiness (Score out of 10), and Practicality (Score out of 10). Format the response as JSON with these fields: isValidOutfit (boolean), feedback (string), score (number), details (object with style, fit, color, occasion scores), and suggestions (array of strings).`,
    formal: `You are an AI fashion reviewer evaluating an uploaded image of a gender-neutral formal wear outfit. Deliver a detailed, accurate review in a warm, constructive tone—like a friend prepping for an event. Check fit, colors, and elegance, focusing on formal wear: tailored suits, dresses, polished looks. Score out of 100 based on sophistication and execution for a formal vibe. Highlight 2-3 pros and 1-3 cons, staying positive. Break it down into: Fit (Score out of 10), Color Coordination (Score out of 10), Trendiness (Score out of 10), and Practicality (Score out of 10). Format the response as JSON with these fields: isValidOutfit (boolean), feedback (string), score (number), details (object with style, fit, color, occasion scores), and suggestions (array of strings).`,
    business: `You are an AI fashion reviewer analyzing an uploaded image of a gender-neutral business casual outfit. Provide a detailed, accurate review in a friendly, constructive tone—like a pal with style tips. Examine fit, colors, and vibe, focusing on business casual: blazers, chinos, relaxed yet professional. Score out of 100 based on how well it balances professionalism and ease. List 2-3 pros and 1-3 cons, keeping it encouraging. Break it down into: Fit (Score out of 10), Color Coordination (Score out of 10), Trendiness (Score out of 10), and Practicality (Score out of 10). Format the response as JSON with these fields: isValidOutfit (boolean), feedback (string), score (number), details (object with style, fit, color, occasion scores), and suggestions (array of strings).`,
    smart: `You are an AI fashion reviewer assessing an uploaded image of a gender-neutral smart casual outfit. Give a detailed, accurate review in a chill, constructive tone—like a friend cheering on a cool look. Look at fit, colors, and vibe, focusing on smart casual: jeans with a blazer, polished yet relaxed. Score out of 100 based on how well it blends polish and ease. Note 2-3 pros and 1-3 cons, staying supportive. Break it down into: Fit (Score out of 10), Color Coordination (Score out of 10), Trendiness (Score out of 10), and Practicality (Score out of 10). Format the response as JSON with these fields: isValidOutfit (boolean), feedback (string), score (number), details (object with style, fit, color, occasion scores), and suggestions (array of strings).`,
    techwear: `You are an AI fashion reviewer analyzing an uploaded image of a gender-neutral techwear outfit. Provide a detailed, accurate review in a cool, constructive tone—like a tech-savvy friend giving pointers. Check fit, colors, and functionality, focusing on techwear: sleek, futuristic, utility-driven. Score out of 100 based on how well it captures the techwear aesthetic—bold and functional. List 2-3 pros and 1-3 cons, keeping it positive. Break it down into: Fit (Score out of 10), Color Coordination (Score out of 10), Trendiness (Score out of 10), and Practicality (Score out of 10). Format the response as JSON with these fields: isValidOutfit (boolean), feedback (string), score (number), details (object with style, fit, color, occasion scores), and suggestions (array of strings).`,
    athleisure: `You are an AI fashion reviewer evaluating an uploaded image of a gender-neutral athleisure outfit. Deliver a detailed, accurate review in a chill, constructive tone—like a workout pal with style tips. Look at fit, colors, and comfort, focusing on athleisure: sporty, trendy, comfy. Score out of 100 based on how well it blends sporty and stylish. Highlight 2-3 pros and 1-3 cons, staying encouraging. Break it down into: Fit (Score out of 10), Color Coordination (Score out of 10), Trendiness (Score out of 10), and Practicality (Score out of 10). Format the response as JSON with these fields: isValidOutfit (boolean), feedback (string), score (number), details (object with style, fit, color, occasion scores), and suggestions (array of strings).`,
    minimalist: `You are an AI fashion reviewer assessing an uploaded image of a gender-neutral minimalist outfit. Provide a detailed, accurate review in a calm, constructive tone—like a friend who loves simplicity. Examine fit, colors, and simplicity, focusing on minimalist style: clean lines, neutral tones. Score out of 100 based on how well it embodies minimalist elegance. Note 2-3 pros and 1-3 cons, keeping it supportive. Break it down into: Fit (Score out of 10), Color Coordination (Score out of 10), Trendiness (Score out of 10), and Practicality (Score out of 10). Format the response as JSON with these fields: isValidOutfit (boolean), feedback (string), score (number), details (object with style, fit, color, occasion scores), and suggestions (array of strings).`,
    y2k: `You are an AI fashion reviewer analyzing an uploaded image of a gender-neutral Y2K outfit. Give a detailed, accurate review in a fun, constructive tone—like a friend hyping up a retro vibe. Check fit, colors, and nostalgia, focusing on Y2K: bold, shiny, playful. Score out of 100 based on how well it captures the Y2K throwback energy. List 2-3 pros and 1-3 cons, staying upbeat. Break it down into: Fit (Score out of 10), Color Coordination (Score out of 10), Trendiness (Score out of 10), and Practicality (Score out of 10). Format the response as JSON with these fields: isValidOutfit (boolean), feedback (string), score (number), details (object with style, fit, color, occasion scores), and suggestions (array of strings).`
  }
};

// Helper function to get the appropriate prompt
function getPrompt(gender: string, category: string): string {
  // Map category to the correct key
  let categoryKey = category;
  if (category === 'formal') categoryKey = 'formal';
  if (category === 'business casual') categoryKey = 'business';
  if (category === 'smart casual') categoryKey = 'smart';
  
  // Define valid gender and category keys
  type GenderKey = 'male' | 'female' | 'other';
  type CategoryKey = 'streetwear' | 'formal' | 'business' | 'smart' | 'techwear' | 'athleisure' | 'minimalist' | 'y2k';
  
  // Default to 'other' gender and 'streetwear' category if not found
  const genderKey = (gender && ['male', 'female', 'other'].includes(gender.toLowerCase())) 
    ? gender.toLowerCase() as GenderKey 
    : 'other';
    
  // Check if the category exists for the gender
  const validCategories: CategoryKey[] = ['streetwear', 'formal', 'business', 'smart', 'techwear', 'athleisure', 'minimalist', 'y2k'];
  const styleKey = (categoryKey && validCategories.includes(categoryKey as CategoryKey)) 
    ? categoryKey as CategoryKey 
    : 'streetwear';
  
  return OUTFIT_PROMPTS[genderKey][styleKey];
}

async function getFileUriFromPhotoUri(uri: string): Promise<string> {
  try {
    if (uri.startsWith('ph://')) {
      // In Expo Go, we might not have full access to photo library assets
      // Instead of trying to get the localUri, we'll use the uri directly
      // and handle it differently
      console.log('Photo library asset detected:', uri);
      
      // Request permission first
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Media library permission not granted');
      }
      
      try {
        // Try to get the asset info
        const asset = await MediaLibrary.getAssetInfoAsync(uri);
        if (asset?.localUri) {
          console.log('Successfully got localUri:', asset.localUri);
          return asset.localUri;
        } else {
          // If we can't get the localUri, we'll try to download the asset
          console.log('No localUri available, using uri directly');
          return uri;
        }
      } catch (assetError) {
        console.log('Error getting asset info:', assetError);
        // If we can't get the asset info, we'll use the uri directly
        return uri;
      }
    }
    return uri;
  } catch (error) {
    console.error('Error in getFileUriFromPhotoUri:', error);
    // Return the original URI as fallback
    return uri;
  }
}

async function imageToBase64(uri: string): Promise<string> {
  try {
    // Get actual file URI if it's a photo library asset
    const fileUri = await getFileUriFromPhotoUri(uri);
    console.log('Converting to base64:', fileUri);
    
    // For Expo Go, we need to handle different URI schemes
    if (fileUri.startsWith('ph://')) {
      // If we still have a photo library URI, we need to use a different approach
      // We'll try to download the asset first
      try {
        const asset = await MediaLibrary.getAssetInfoAsync(fileUri);
        if (asset) {
          // Try to create a temporary file from the asset
          const tempUri = FileSystem.cacheDirectory + 'temp_image_' + Date.now() + '.jpg';
          await FileSystem.copyAsync({
            from: asset.uri,
            to: tempUri
          });
          
          // Now read the temporary file
          const base64 = await FileSystem.readAsStringAsync(tempUri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          return base64;
        }
      } catch (assetError) {
        console.log('Error handling photo library asset:', assetError);
        throw new Error('Unable to process photo library asset');
      }
    }
    
    // Standard file reading for regular URIs
    const base64 = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return base64;
  } catch (error) {
    console.error('Error converting image to base64:', error);
    throw error;
  }
}

async function resizeImage(uri: string): Promise<string> {
  try {
    console.log('Resizing image:', uri);
    
    // Get actual file URI if it's a photo library asset
    const fileUri = await getFileUriFromPhotoUri(uri);
    console.log('Using file URI for resize:', fileUri);
    
    // For Expo Go, we need special handling for photo library URIs
    if (fileUri.startsWith('ph://')) {
      try {
        // Try to get the asset directly
        const asset = await MediaLibrary.getAssetInfoAsync(fileUri);
        if (asset) {
          // Use the asset URI directly with ImageManipulator
          return await performResize(asset.uri);
        }
      } catch (assetError) {
        console.log('Error handling photo library asset for resize:', assetError);
        // Try to use the URI directly as a fallback
        return await performResize(fileUri);
      }
    }
    
    // Standard resize for regular URIs
    return await performResize(fileUri);
  } catch (error) {
    console.error('Error resizing image:', error);
    // Return original URI if resize fails
    return uri;
  }
}

// Helper function to perform the actual resize operation
async function performResize(uri: string): Promise<string> {
  try {
    // Get the image dimensions
    const { width, height } = await ImageManipulator.manipulateAsync(
      uri,
      [], // no operations, just to get info
      { base64: false }
    ).then(result => ({ width: result.width || 0, height: result.height || 0 }));
    
    console.log('Original dimensions:', width, 'x', height);
    
    // Calculate scaling factor to maintain aspect ratio
    const scaleFactor = Math.min(
      MAX_IMAGE_DIMENSION / width,
      MAX_IMAGE_DIMENSION / height,
      1 // Don't upscale images
    );
    
    // Calculate new dimensions
    const newWidth = Math.round(width * scaleFactor);
    const newHeight = Math.round(height * scaleFactor);
    
    console.log('New dimensions:', newWidth, 'x', newHeight);
    
    // Perform the resize operation
    const resizedImage = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: newWidth, height: newHeight } }],
      { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
    );
    
    console.log('Resize successful:', resizedImage.uri);
    return resizedImage.uri;
  } catch (error) {
    console.error('Error in performResize:', error);
    throw error;
  }
}

export async function analyzeOutfitImage(imageUri: string, gender: string = 'other', category: string = 'streetwear'): Promise<OutfitAnalysis> {
  try {
    console.log('Processing image:', imageUri);
    console.log('Gender:', gender, 'Category:', category);
    
    // Get the appropriate prompt
    const prompt = getPrompt(gender, category);
    
    let processedImageUri: string;
    let base64Image: string;
    
    try {
      // Resize the image while maintaining aspect ratio
      processedImageUri = await resizeImage(imageUri);
      console.log('Resized image:', processedImageUri);
      
      // Convert the image to base64
      base64Image = await imageToBase64(processedImageUri);
      console.log('Converted to base64, length:', base64Image.length);
    } catch (processingError) {
      console.error('Error processing image:', processingError);
      
      // If we can't process the image, try using a direct approach with the original URI
      if (imageUri.startsWith('ph://')) {
        try {
          // Try to get the asset directly
          const asset = await MediaLibrary.getAssetInfoAsync(imageUri);
          if (asset?.uri) {
            // Use the asset URI directly
            processedImageUri = asset.uri;
            
            // Try to convert to base64 directly
            base64Image = await FileSystem.readAsStringAsync(asset.uri, {
              encoding: FileSystem.EncodingType.Base64,
            });
            console.log('Used direct asset URI approach, base64 length:', base64Image.length);
          } else {
            throw new Error('Could not get asset URI');
          }
        } catch (assetError) {
          console.error('Error with direct asset approach:', assetError);
          throw new Error('Failed to process image after multiple attempts');
        }
      } else {
        // For non-photo library URIs, try using the original URI directly
        processedImageUri = imageUri;
        base64Image = await FileSystem.readAsStringAsync(imageUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        console.log('Used original URI directly, base64 length:', base64Image.length);
      }
    }

    // Make the OpenAI API call
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                  detail: "high"
                }
              },
            ],
          },
        ],
        max_tokens: 1000,
      });

      console.log('Received OpenAI response');

      // Parse the response
      const result = response.choices[0]?.message?.content;
      if (!result) {
        throw new Error('No analysis result received');
      }

      try {
        // Try to parse the response as JSON
        let parsedResult: OutfitAnalysis;
        
        try {
          // First try direct parsing
          parsedResult = JSON.parse(result) as OutfitAnalysis;
        } catch (directParseError) {
          // If direct parsing fails, try to extract JSON from the text
          const jsonMatch = result.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            try {
              const extractedJson = jsonMatch[0];
              console.log('Extracted JSON:', extractedJson);
              parsedResult = JSON.parse(extractedJson) as OutfitAnalysis;
            } catch (extractError) {
              console.error('Failed to parse extracted JSON:', extractError);
              throw extractError; // Re-throw to be caught by outer catch
            }
          } else {
            throw directParseError; // Re-throw if no JSON pattern found
          }
        }
        
        // Ensure all metrics are scaled as percentages (0-100)
        if (parsedResult.details) {
          // Convert any 0-10 scale metrics to 0-100
          const details = parsedResult.details;
          
          if (details.style !== undefined && details.style <= 10) {
            details.style = Math.round(details.style * 10);
          }
          
          if (details.fit !== undefined && details.fit <= 10) {
            details.fit = Math.round(details.fit * 10);
          }
          
          if (details.color !== undefined && details.color <= 10) {
            details.color = Math.round(details.color * 10);
          }
          
          if (details.occasion !== undefined && details.occasion <= 10) {
            details.occasion = Math.round(details.occasion * 10);
          }
        }
        
        return parsedResult;
      } catch (parseError) {
        console.error('Failed to parse OpenAI response:', parseError);
        console.log('Raw response:', result);
        
        // If we still can't parse it, return a formatted response
        return {
          isValidOutfit: true,
          feedback: result.substring(0, 500), // Use the first 500 chars as feedback
          score: estimateScoreFromText(result),
        };
      }
    } catch (apiError) {
      console.error('Error calling OpenAI API:', apiError);
      throw apiError;
    }
  } catch (error) {
    console.error('Error analyzing outfit:', error);
    return {
      isValidOutfit: false,
      feedback: "An error occurred while analyzing the image. Please try again.",
    };
  }
}

// Helper function to estimate a score from text if JSON parsing fails
function estimateScoreFromText(text: string): number {
  // Look for numbers that might be scores
  const scoreMatches = text.match(/\b([0-9]{1,3})\/100\b|\b([0-9]{1,3}) out of 100\b|\bscore of ([0-9]{1,3})\b|\brating of ([0-9]{1,3})\b/i);
  
  if (scoreMatches) {
    // Find the first captured group that has a value
    for (let i = 1; i < scoreMatches.length; i++) {
      if (scoreMatches[i]) {
        const score = parseInt(scoreMatches[i], 10);
        if (!isNaN(score) && score >= 0 && score <= 100) {
          return score;
        }
      }
    }
  }
  
  // Default score if we can't find one
  return 75;
} 