import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import {
  Ingredient,
  ManualItem,
  MealPlanEntry,
  MealSlot,
  Recipe,
  RecipeIngredient,
} from '../types';
import { SEED_INGREDIENTS } from './seedCatalog';
import { uid } from '../lib/id';

function seedRecipes(): Recipe[] {
  const find = (n: string) => SEED_INGREDIENTS.find((i) => i.name === n)!.id;
  return [
    {
      id: 'recipe-sample-bowl',
      name: 'Chicken Rice Bowl',
      servings: 2,
      notes: 'Quick weeknight dinner.',
      items: [
        ri(find('Chicken Breast'), 300, 'g', false),
        ri(find('Rice'), 200, 'g', false),
        ri(find('Broccoli'), 1, 'each', false),
        ri(find('Soy Sauce'), 15, 'ml', true),
        ri(find('Olive Oil'), 15, 'ml', true),
        ri(find('Salt'), 3, 'g', true),
      ],
    },
    {
      id: 'recipe-sample-eggs',
      name: 'Scrambled Eggs & Toast',
      servings: 1,
      items: [
        ri(find('Eggs'), 2, 'each', false),
        ri(find('Bread'), 2, 'each', false),
        ri(find('Butter'), 10, 'g', false),
        ri(find('Salt'), 1, 'g', true),
        ri(find('Black Pepper'), 1, 'g', true),
      ],
    },
  ];
}

function ri(
  ingredientId: string,
  quantity: number,
  unit: RecipeIngredient['unit'],
  isStaple: boolean
): RecipeIngredient {
  return { ingredientId, quantity, unit, isStaple };
}

export interface AppState {
  ingredients: Ingredient[];
  recipes: Recipe[];
  plan: MealPlanEntry[];
  manualItems: ManualItem[];
  /** Shopping-line key -> checked off in store. */
  checked: Record<string, boolean>;
  hasHydrated: boolean;

  // Ingredients
  addIngredient: (ing: Omit<Ingredient, 'id'>) => Ingredient;
  updateIngredient: (id: string, patch: Partial<Ingredient>) => void;
  removeIngredient: (id: string) => void;

  // Recipes
  addRecipe: (recipe: Omit<Recipe, 'id'>) => Recipe;
  updateRecipe: (id: string, patch: Partial<Recipe>) => void;
  removeRecipe: (id: string) => void;
  duplicateRecipe: (id: string) => Recipe | undefined;

  // Meal plan
  addMeal: (date: string, slot: MealSlot, recipeId: string, servings?: number) => void;
  removeMeal: (id: string) => void;

  // Manual grocery items
  addManualItem: (item: Omit<ManualItem, 'id'>) => void;
  removeManualItem: (id: string) => void;

  // Check-off
  toggleChecked: (key: string) => void;
  clearChecked: () => void;

  markHydrated: () => void;
  resetAll: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      ingredients: SEED_INGREDIENTS,
      recipes: seedRecipes(),
      plan: [],
      manualItems: [],
      checked: {},
      hasHydrated: false,

      addIngredient: (ing) => {
        const created: Ingredient = { ...ing, id: uid('ing') };
        set((s) => ({ ingredients: [...s.ingredients, created] }));
        return created;
      },
      updateIngredient: (id, patch) =>
        set((s) => ({
          ingredients: s.ingredients.map((i) =>
            i.id === id ? { ...i, ...patch } : i
          ),
        })),
      removeIngredient: (id) =>
        set((s) => ({ ingredients: s.ingredients.filter((i) => i.id !== id) })),

      addRecipe: (recipe) => {
        const created: Recipe = { ...recipe, id: uid('recipe') };
        set((s) => ({ recipes: [...s.recipes, created] }));
        return created;
      },
      updateRecipe: (id, patch) =>
        set((s) => ({
          recipes: s.recipes.map((r) => (r.id === id ? { ...r, ...patch } : r)),
        })),
      removeRecipe: (id) =>
        set((s) => ({
          recipes: s.recipes.filter((r) => r.id !== id),
          plan: s.plan.filter((p) => p.recipeId !== id),
        })),
      duplicateRecipe: (id) => {
        const original = get().recipes.find((r) => r.id === id);
        if (!original) return undefined;
        const copy: Recipe = {
          ...original,
          id: uid('recipe'),
          name: `${original.name} (copy)`,
          items: original.items.map((it) => ({ ...it })),
        };
        set((s) => ({ recipes: [...s.recipes, copy] }));
        return copy;
      },

      addMeal: (date, slot, recipeId, servings) => {
        const recipe = get().recipes.find((r) => r.id === recipeId);
        const entry: MealPlanEntry = {
          id: uid('meal'),
          date,
          slot,
          recipeId,
          servings: servings ?? recipe?.servings ?? 1,
        };
        set((s) => ({ plan: [...s.plan, entry] }));
      },
      removeMeal: (id) =>
        set((s) => ({ plan: s.plan.filter((p) => p.id !== id) })),

      addManualItem: (item) =>
        set((s) => ({
          manualItems: [...s.manualItems, { ...item, id: uid('manual') }],
        })),
      removeManualItem: (id) =>
        set((s) => ({
          manualItems: s.manualItems.filter((m) => m.id !== id),
        })),

      toggleChecked: (key) =>
        set((s) => ({ checked: { ...s.checked, [key]: !s.checked[key] } })),
      clearChecked: () => set({ checked: {} }),

      markHydrated: () => set({ hasHydrated: true }),

      resetAll: () =>
        set({
          ingredients: SEED_INGREDIENTS,
          recipes: seedRecipes(),
          plan: [],
          manualItems: [],
          checked: {},
        }),
    }),
    {
      name: 'mealprep-store-v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        ingredients: s.ingredients,
        recipes: s.recipes,
        plan: s.plan,
        manualItems: s.manualItems,
        checked: s.checked,
      }),
      onRehydrateStorage: () => (state) => {
        state?.markHydrated();
      },
    }
  )
);
