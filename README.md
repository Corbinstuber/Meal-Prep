# Meal Prep

A cross-platform (iOS + Android) phone app for planning meals on a calendar,
building recipes, and generating accurate grocery lists with price estimates.

Built with **Expo (React Native) + TypeScript**. See [`PLAN.md`](./PLAN.md) for
the full product plan.

## What's built (v1)

Four tabs, matching the plan:

1. **Planner** — weekly calendar. Tap a day to assign meals to Breakfast /
   Lunch / Dinner / Snack slots. Navigate weeks, jump back to "today".
2. **Meals** — create and edit recipes. Each ingredient is tagged **Buy every
   time** or **Pantry staple** (salt, spices), and staples are kept off the
   grocery list by default.
3. **Grocery List** — pick a date range, and the app aggregates every planned
   meal's ingredients into one list, grouped by aisle, with a running price
   estimate. Check items off, add items by hand, remove manual items, and
   toggle staples on to restock them.
4. **Pantry** — the master ingredient catalog (ships with ~45 common items and
   rough US prices). Edit names, categories, units, staple defaults, and prices;
   add your own ingredients.

### The two things that had to be right

- **Quantities** — every ingredient has a dimension (mass / volume / count) and
  a unit-conversion table, so the same ingredient across multiple meals is
  converted to a common unit and summed correctly, and recipe scaling by
  servings is applied. Incompatible units (e.g. "2 cloves" vs "1 tbsp" garlic)
  are surfaced as separate, flagged lines instead of being mis-merged. The
  engine lives in [`src/features/groceryList.ts`](./src/features/groceryList.ts)
  and [`src/lib/units.ts`](./src/lib/units.ts).
- **Staple vs. shopping ingredients** — defaulted per ingredient in the Pantry,
  overridable per recipe, and filtered out of the list by default.

## Run it

```bash
npm install
npx expo start
```

Then press `i` (iOS simulator), `a` (Android emulator), or scan the QR code
with the **Expo Go** app on your phone to run it on a real device.

To preview it in a desktop browser instead (no phone or simulator needed):

```bash
npx expo start --web
```

## Architecture

```
App.tsx                      app entry + navigation + hydration gate
src/
  types.ts                   domain model
  theme.ts                   colors / spacing / type scale
  lib/
    units.ts                 unit conversion + formatting
    dates.ts                 week / date-key helpers
    id.ts                    id generator
  data/
    seedCatalog.ts           built-in ingredient + price catalog
    store.ts                 Zustand store, persisted to device storage
  features/
    groceryList.ts           aggregation engine (date range -> shopping list)
  components/                reusable UI (Card, Button, Field, Chip, PickerModal)
  navigation/                tab + stack navigators
  screens/                   Planner, Meals, RecipeEdit, Grocery, Pantry
supabase/
  schema.sql                 schema for the cloud-sync milestone (see below)
```

Data is currently stored **locally on the device** (Zustand + AsyncStorage), so
the app is fully usable offline with zero setup. Your data persists between
launches.

## Next milestone: cloud sync + login

You chose cloud sync with accounts. The data layer is structured to make this a
clean drop-in rather than a rewrite:

1. Create a Supabase project and run [`supabase/schema.sql`](./supabase/schema.sql)
   (tables already carry per-user Row Level Security).
2. Add `@supabase/supabase-js` and an auth screen (email magic-link or
   password).
3. Mirror the store's actions to Supabase and rehydrate from it on login —
   because the store already centralizes all reads/writes, only that one file
   changes.

Until then everything works locally on each device.
