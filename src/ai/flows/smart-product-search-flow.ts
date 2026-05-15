'use server';
/**
 * @fileOverview A Genkit flow for a smart product search bar that understands natural language queries.
 *
 * - smartProductSearch - A function that processes a natural language query into structured search parameters.
 * - SmartProductSearchInput - The input type for the smartProductSearch function.
 * - SmartProductSearchOutput - The return type for the smartProductSearch function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SmartProductSearchInputSchema = z.object({
  query: z.string().describe('The natural language search query from the user.'),
});
export type SmartProductSearchInput = z.infer<typeof SmartProductSearchInputSchema>;

const SmartProductSearchOutputSchema = z.object({
  keywords: z.array(z.string()).describe('A list of keywords extracted from the query.'),
  category: z.string().optional().describe('The inferred product category, if any.'),
  condition: z.enum(['new', 'used', 'refurbished']).optional().describe('The condition of the product, if specified (new, used, refurbished).'),
  minPrice: z.number().optional().describe('The minimum price extracted from the query.'),
  maxPrice: z.number().optional().describe('The maximum price extracted from the query.'),
});
export type SmartProductSearchOutput = z.infer<typeof SmartProductSearchOutputSchema>;

const smartProductSearchPrompt = ai.definePrompt({
  name: 'smartProductSearchPrompt',
  input: {schema: SmartProductSearchInputSchema},
  output: {schema: SmartProductSearchOutputSchema},
  prompt: `You are an intelligent product search assistant for an e-commerce platform called SalleDeVente.sn, which sells new and used items.
Your task is to parse a natural language search query and extract structured search parameters.
Identify relevant keywords, potential product categories, desired product conditions (new, used, refurbished), and any price ranges.
Be tolerant of typos and imperfect phrasing. If a piece of information is not explicitly mentioned, omit it from the output.

Here are the available product conditions: 'new', 'used', 'refurbished'.

Examples:
Query: "cherche un iphone d'occasion pas cher"
Output: { "keywords": ["iphone"], "condition": "used" }

Query: "vélos de montagne neufs"
Output: { "keywords": ["vélos", "montagne"], "category": "vélos", "condition": "new" }

Query: "montre intelligente entre 50 et 100 euros"
Output: { "keywords": ["montre", "intelligente"], "minPrice": 50, "maxPrice": 100 }

Query: "tablettes"
Output: { "keywords": ["tablettes"], "category": "tablettes" }

Query: "chaussures nike taille 42"
Output: { "keywords": ["chaussures", "nike", "taille 42"] }

Process the following query:
Query: "{{{query}}}"`,
});

const smartProductSearchFlow = ai.defineFlow(
  {
    name: 'smartProductSearchFlow',
    inputSchema: SmartProductSearchInputSchema,
    outputSchema: SmartProductSearchOutputSchema,
  },
  async (input) => {
    const {output} = await smartProductSearchPrompt(input);
    return output!;
  }
);

export async function smartProductSearch(
  input: SmartProductSearchInput
): Promise<SmartProductSearchOutput> {
  return smartProductSearchFlow(input);
}
