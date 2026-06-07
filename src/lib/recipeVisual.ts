import { Recipe } from '../types';
import { accentFor } from '../theme';

// Keyword → emoji guesses so recipes without a chosen emoji still look intentional.
const GUESSES: [RegExp, string][] = [
  [/egg|omelet|scramble/i, '🍳'],
  [/rice|bowl|grain|quinoa/i, '🍚'],
  [/salad|greens/i, '🥗'],
  [/soup|stew|broth/i, '🍲'],
  [/pasta|spaghetti|noodle|mac/i, '🍝'],
  [/taco|burrito|quesadilla/i, '🌮'],
  [/pizza/i, '🍕'],
  [/burger/i, '🍔'],
  [/sandwich|toast|wrap/i, '🥪'],
  [/chicken/i, '🍗'],
  [/beef|steak|meat/i, '🥩'],
  [/fish|salmon|tuna|shrimp|seafood/i, '🐟'],
  [/curry/i, '🍛'],
  [/stir.?fry|wok|asian/i, '🥘'],
  [/pancake|waffle|breakfast/i, '🥞'],
  [/sushi/i, '🍣'],
  [/veg|broccoli|veggie/i, '🥦'],
];

export function emojiFor(recipe: Pick<Recipe, 'emoji' | 'name'>): string {
  if (recipe.emoji) return recipe.emoji;
  for (const [re, e] of GUESSES) if (re.test(recipe.name)) return e;
  return '🍽️';
}

export function recipeAccent(recipe: Pick<Recipe, 'id'>) {
  return accentFor(recipe.id);
}
