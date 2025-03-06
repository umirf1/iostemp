import OpenAI from 'openai';

// Initialize OpenAI client
// Note: API key should be stored securely, preferably in environment variables
const openai = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY, // Add this to your .env file
});

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

export async function analyzeOutfitImage(imageUri: string): Promise<OutfitAnalysis> {
  try {
    // Convert local URI to base64 if needed
    // For demo purposes, we'll assume the image is accessible via URL
    // In production, you'll need to handle local file URIs differently

    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this outfit image and provide detailed fashion feedback. First, confirm if this is a clear image of clothing/outfit. Then, rate different aspects like style, fit, color coordination, and occasion appropriateness on a scale of 0-100. Also provide specific suggestions for improvement. Format the response as JSON with these fields: isValidOutfit (boolean), feedback (string), score (number), details (object with style, fit, color, occasion scores), and suggestions (array of strings)."
            },
            {
              type: "image_url",
              image_url: imageUri,
            },
          ],
        },
      ],
      max_tokens: 1000,
    });

    // Parse the response
    const result = response.choices[0]?.message?.content;
    if (!result) {
      throw new Error('No analysis result received');
    }

    try {
      return JSON.parse(result) as OutfitAnalysis;
    } catch (e) {
      // If JSON parsing fails, return a formatted error response
      return {
        isValidOutfit: false,
        feedback: "Failed to analyze image. Please try again with a clearer photo.",
      };
    }
  } catch (error) {
    console.error('Error analyzing outfit:', error);
    return {
      isValidOutfit: false,
      feedback: "An error occurred while analyzing the image. Please try again.",
    };
  }
} 