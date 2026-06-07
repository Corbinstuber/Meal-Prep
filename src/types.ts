// Core domain types for the Meal Prep app.

/** Dimensions an ingredient can be measured in. */
export type Dimension = 'mass' | 'volume' | 'count';

/** Supported units. Each maps to a base unit within its dimension. */
export type Unit =
  // mass (base: g)
  | 'g'
  | 'kg'
  | 'oz'
  | 'lb'
  // volume (base: ml)
  | 'ml'
  | 'l'
  | 'tsp'
  | 'tbsp'
  | 'cup'
  | 'floz'
  // count (base: each)
  | 'each'
  | 'dozen';

/** Grocery aisle / category, used to group the shopping list. */
export type Category =
  | 'Produce'
  | 'Meat & Seafood'
  | 'Dairy & Eggs'
  | 'Bakery'
  | 'Pantry'
  | 'Frozen'
  | 'Spices & Baking'
  | 'Beverages'
  | 'Household'
  | 'Other';

export const CATEGORIES: Category[] = [
  'Produce',
  'Meat & Seafood',
  'Dairy & Eggs',
  'Bakery',
  'Pantry',
  'Frozen',
  'Spices & Baking',
  'Beverages',
  'Household',
  'Other',
];

export type MealSlot = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';

export const MEAL_SLOTS: MealSlot[] = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

/** A reusable ingredient in the master pantry/catalog. */
export interface Ingredient {
  id: string;
  name: string;
  category: Category;
  dimension: Dimension;
  /** Friendly unit used when displaying aggregated totals. */
  defaultUnit: Unit;
  /** True when this is a pantry staple (salt, spices) not bought every time. */
  isStapleDefault: boolean;
  /** Estimated price per `priceUnit`. */
  estPrice: number;
  priceUnit: Unit;
}

/** An ingredient line within a recipe. */
export interface RecipeIngredient {
  ingredientId: string;
  quantity: number;
  unit: Unit;
  /** Per-recipe override of staple vs. shopping ingredient. */
  isStaple: boolean;
}

export interface Recipe {
  id: string;
  name: string;
  servings: number;
  notes?: string;
  items: RecipeIngredient[];
  /** Emoji shown as the recipe's avatar (visual identity). */
  emoji?: string;
  /** Marked as a favorite. */
  favorite?: boolean;
  /** Approximate prep + cook time in minutes. */
  prepMinutes?: number;
  /** Diet / cuisine tags for filtering. */
  tags?: RecipeTag[];
}

export type RecipeTag =
  | 'Quick'
  | 'Vegetarian'
  | 'Vegan'
  | 'High-protein'
  | 'Low-carb'
  | 'Gluten-free'
  | 'Budget'
  | 'Meal-prep';

export const RECIPE_TAGS: RecipeTag[] = [
  'Quick',
  'Vegetarian',
  'Vegan',
  'High-protein',
  'Low-carb',
  'Gluten-free',
  'Budget',
  'Meal-prep',
];

export const RECIPE_EMOJIS: string[] = [
  '🍽️', '🍚', '🍳', '🥗', '🍜', '🌮', '🍝', '🍲', '🥘', '🍔',
  '🍕', '🥪', '🌯', '🍖', '🥩', '🍗', '🐟', '🍤', '🥦', '🥑',
  '🍅', '🥕', '🧀', '🥞', '🧇', '🍣', '🍛', '🫕', '🥟', '🍱',
];


/** A meal assigned to a specific day + slot on the planner. */
export interface MealPlanEntry {
  id: string;
  /** ISO date, YYYY-MM-DD. */
  date: string;
  slot: MealSlot;
  recipeId: string;
  /** Planned servings; defaults to the recipe's serving count. */
  servings: number;
}

/** An item added to the grocery list by hand (not from a recipe). */
export interface ManualItem {
  id: string;
  name: string;
  quantity: number;
  unit: Unit;
  category: Category;
  estPrice: number;
}

/** A single computed line on the grocery list. */
export interface ShoppingLine {
  /** Stable key for check-off state (ingredient id or manual item id). */
  key: string;
  name: string;
  category: Category;
  quantity: number;
  unit: Unit;
  estCost: number;
  source: 'recipe' | 'manual';
  /** Set when units across meals couldn't be merged automatically. */
  note?: string;
}
