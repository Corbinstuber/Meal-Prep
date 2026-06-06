import { Ingredient } from '../types';

/**
 * Built-in starter catalog of common grocery items with rough average US prices.
 * Prices are estimates only and the user can edit any of them in the Pantry tab.
 * Staples (salt, spices, oil, etc.) default to NOT being added to the list.
 */
export const SEED_INGREDIENTS: Ingredient[] = [
  // Produce
  ing('Onion', 'Produce', 'count', 'each', false, 0.7, 'each'),
  ing('Garlic', 'Produce', 'count', 'each', false, 0.5, 'each'),
  ing('Tomato', 'Produce', 'count', 'each', false, 0.6, 'each'),
  ing('Bell Pepper', 'Produce', 'count', 'each', false, 1.0, 'each'),
  ing('Carrot', 'Produce', 'count', 'each', false, 0.25, 'each'),
  ing('Potato', 'Produce', 'count', 'each', false, 0.5, 'each'),
  ing('Spinach', 'Produce', 'mass', 'g', false, 0.012, 'g'),
  ing('Broccoli', 'Produce', 'count', 'each', false, 1.5, 'each'),
  ing('Avocado', 'Produce', 'count', 'each', false, 1.25, 'each'),
  ing('Lemon', 'Produce', 'count', 'each', false, 0.6, 'each'),
  ing('Banana', 'Produce', 'count', 'each', false, 0.3, 'each'),

  // Meat & Seafood
  ing('Chicken Breast', 'Meat & Seafood', 'mass', 'g', false, 0.012, 'g'),
  ing('Ground Beef', 'Meat & Seafood', 'mass', 'g', false, 0.013, 'g'),
  ing('Bacon', 'Meat & Seafood', 'mass', 'g', false, 0.02, 'g'),
  ing('Salmon Fillet', 'Meat & Seafood', 'mass', 'g', false, 0.026, 'g'),
  ing('Shrimp', 'Meat & Seafood', 'mass', 'g', false, 0.022, 'g'),

  // Dairy & Eggs
  ing('Eggs', 'Dairy & Eggs', 'count', 'each', false, 0.3, 'each'),
  ing('Milk', 'Dairy & Eggs', 'volume', 'ml', false, 0.001, 'ml'),
  ing('Butter', 'Dairy & Eggs', 'mass', 'g', false, 0.011, 'g'),
  ing('Cheddar Cheese', 'Dairy & Eggs', 'mass', 'g', false, 0.013, 'g'),
  ing('Greek Yogurt', 'Dairy & Eggs', 'mass', 'g', false, 0.006, 'g'),
  ing('Parmesan', 'Dairy & Eggs', 'mass', 'g', false, 0.025, 'g'),

  // Bakery
  ing('Bread', 'Bakery', 'count', 'each', false, 0.15, 'each'),
  ing('Tortilla', 'Bakery', 'count', 'each', false, 0.25, 'each'),
  ing('Burger Bun', 'Bakery', 'count', 'each', false, 0.4, 'each'),

  // Pantry
  ing('Rice', 'Pantry', 'mass', 'g', false, 0.004, 'g'),
  ing('Pasta', 'Pantry', 'mass', 'g', false, 0.005, 'g'),
  ing('Canned Tomatoes', 'Pantry', 'count', 'each', false, 1.2, 'each'),
  ing('Black Beans', 'Pantry', 'count', 'each', false, 1.0, 'each'),
  ing('Chicken Broth', 'Pantry', 'volume', 'ml', false, 0.002, 'ml'),
  ing('Quinoa', 'Pantry', 'mass', 'g', false, 0.008, 'g'),
  ing('Oats', 'Pantry', 'mass', 'g', false, 0.004, 'g'),

  // Frozen
  ing('Frozen Peas', 'Frozen', 'mass', 'g', false, 0.004, 'g'),
  ing('Frozen Berries', 'Frozen', 'mass', 'g', false, 0.009, 'g'),

  // Beverages
  ing('Orange Juice', 'Beverages', 'volume', 'ml', false, 0.003, 'ml'),
  ing('Coffee', 'Beverages', 'mass', 'g', false, 0.02, 'g'),

  // Spices & Baking — these default to STAPLE (already on hand)
  ing('Salt', 'Spices & Baking', 'mass', 'g', true, 0.002, 'g'),
  ing('Black Pepper', 'Spices & Baking', 'mass', 'g', true, 0.03, 'g'),
  ing('Olive Oil', 'Spices & Baking', 'volume', 'ml', true, 0.012, 'ml'),
  ing('Garlic Powder', 'Spices & Baking', 'mass', 'g', true, 0.03, 'g'),
  ing('Paprika', 'Spices & Baking', 'mass', 'g', true, 0.03, 'g'),
  ing('Cumin', 'Spices & Baking', 'mass', 'g', true, 0.03, 'g'),
  ing('Oregano', 'Spices & Baking', 'mass', 'g', true, 0.04, 'g'),
  ing('Cinnamon', 'Spices & Baking', 'mass', 'g', true, 0.03, 'g'),
  ing('Sugar', 'Spices & Baking', 'mass', 'g', true, 0.002, 'g'),
  ing('Flour', 'Spices & Baking', 'mass', 'g', true, 0.002, 'g'),
  ing('Baking Powder', 'Spices & Baking', 'mass', 'g', true, 0.02, 'g'),
  ing('Soy Sauce', 'Spices & Baking', 'volume', 'ml', true, 0.005, 'ml'),
];

function ing(
  name: Ingredient['name'],
  category: Ingredient['category'],
  dimension: Ingredient['dimension'],
  defaultUnit: Ingredient['defaultUnit'],
  isStapleDefault: boolean,
  estPrice: number,
  priceUnit: Ingredient['priceUnit']
): Ingredient {
  return {
    id: 'seed-' + name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    name,
    category,
    dimension,
    defaultUnit,
    isStapleDefault,
    estPrice,
    priceUnit,
  };
}
