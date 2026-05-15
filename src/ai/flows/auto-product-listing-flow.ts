'use server';
/**
 * @fileOverview This file defines a Genkit flow for automatically generating product descriptions and suggesting categories based on a product title and photos.
 *
 * - autoProductListing: A function that initiates the automatic product listing process.
 * - AutoProductListingInput: The input type for the autoProductListing function.
 * - AutoProductListingOutput: The return type for the autoProductListing function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Input Schema
const AutoProductListingInputSchema = z.object({
  title: z.string().describe('A brief title for the product.'),
  photoDataUris: z
    .array(z.string())
    .min(1, 'At least one product photo is required.')
    .max(10, 'A maximum of 10 product photos are allowed.')
    .describe(
      "An array of product photos, each as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AutoProductListingInput = z.infer<typeof AutoProductListingInputSchema>;

// Output Schema
const AutoProductListingOutputSchema = z.object({
  suggestedCategories: z
    .array(z.string())
    .describe(
      'An array of suggested product categories and sub-categories relevant to the product. Aim for a comprehensive list of usual e-commerce categories.'
    ),
  description: z.string().describe('A draft product description, concise and engaging, suitable for an e-commerce listing. Highlight key features and condition.'),
});
export type AutoProductListingOutput = z.infer<typeof AutoProductListingOutputSchema>;

export async function autoProductListing(
  input: AutoProductListingInput
): Promise<AutoProductListingOutput> {
  return autoProductListingFlow(input);
}

const autoProductListingFlow = ai.defineFlow(
  {
    name: 'autoProductListingFlow',
    inputSchema: AutoProductListingInputSchema,
    outputSchema: AutoProductListingOutputSchema,
  },
  async (input) => {
    const mediaParts = input.photoDataUris.map((uri) => ({
      media: { url: uri },
    }));

    const textPart = {
      text: `Analyze the provided product title and images. Based on this information, suggest relevant e-commerce categories (including sub-categories, aim for a comprehensive list) and generate a compelling draft product description.\n\nProduct Title: ${input.title}`,
    };

    const promptParts = [textPart, ...mediaParts];

    const { output } = await ai.generate({
      // Use the default model configured in genkit.ts, which is multimodal (gemini-2.5-flash)
      prompt: promptParts,
      output: { schema: AutoProductListingOutputSchema },
    });

    if (!output) {
      throw new Error('Failed to generate product listing details.');
    }

    return output;
  }
);
