# Meal Prep & Grocery List App — Build Plan

A cross-platform phone app for planning meals on a calendar, building recipes,
and generating accurate grocery lists with estimated prices.

## Decisions locked in

| Question | Choice |
|----------|--------|
| Platform | **iOS + Android, one codebase** |
| Price estimates | **Rough built-in estimates** (ships with average US prices) |
| Data & sync | **Cloud sync with login** (multi-device, backed up) |

## Tech stack

- **App:** Expo (React Native) + TypeScript — one codebase ships to both iOS and Android.
- **Navigation:** Expo Router (tab-based, matches the three main sections).
- **Backend / sync / auth:** Supabase (hosted Postgres + Auth). Email login, rows scoped per-user, syncs across devices automatically.
- **Server data layer:** TanStack Query (caching, offline-friendly refetch).
- **UI kit:** React Native Paper for clean, consistent, accessible components — keeps the interface "very straightforward" without custom design work.
- **Local cache:** AsyncStorage so the app opens instantly and tolerates spotty connectivity.

Why this stack: fastest path to a polished iOS+Android app for one developer, with real cloud sync and login out of the box, and no app-store friction during development (test on your own phone via Expo Go).

---

## The four core screens

### 1. Planner (calendar)
- Weekly view by default (clear on a phone), with a month view toggle.
- Tap a day → add one or more meals to it. Optional meal slots: Breakfast / Lunch / Dinner / Snack.
- Each day shows the meals assigned to it as chips.
- This is the source of truth that feeds the shopping list.

### 2. Meals (recipes)
- List of your saved recipes; create / edit / duplicate.
- Each recipe has a name, serving count, optional notes, and an ingredient list.
- **Two ingredient types per recipe** (your key requirement):
  - **Shopping ingredients** — bought every time (chicken, rice, veggies).
  - **Pantry staples** — already on hand, rarely repurchased (salt, pepper, most spices, oil).
- Each ingredient row = ingredient + quantity + unit + a staple/shopping toggle.
- An ingredient defaults to "staple" based on the master pantry setting, but you can override it per recipe.

### 3. Grocery list
- Pick a **date range** (e.g. this week, or any custom start–end).
- App gathers every meal in that range, pulls their shopping ingredients (staples excluded by default), and **aggregates quantities correctly** (see below).
- Grouped by aisle/category (Produce, Meat, Dairy, …) for easy in-store shopping.
- Each line shows total quantity + estimated price; bottom shows the **estimated total**.
- **Manually add or remove items** at any time; check items off as you shop.
- Toggle to "include staples" if you want to restock them.

### 4. Pantry / Ingredients (master list)
- Central library of ingredients reused across recipes.
- Per ingredient: name, category/aisle, default unit, **default staple flag**, and a **built-in estimated price** (per unit), which you can override.
- Editing a price here updates future estimates everywhere.

Plus **Auth screens** (sign up / log in / log out) for cloud sync.

---

## Getting quantities right (the hard part)

This is where most meal-prep apps fail, so it gets explicit design:

- Every ingredient has a **canonical unit** and a **dimension** (mass, volume, or count).
- A **unit-conversion table** per dimension (g↔kg↔oz↔lb, ml↔cup↔tbsp↔tsp↔L, each/dozen).
- When aggregating, all quantities for the same ingredient convert to the canonical unit, sum, then convert back to a friendly display unit.
- If two meals use the **same ingredient in incompatible units** the app can't auto-merge (e.g. "2 cloves garlic" vs "1 tbsp minced garlic"), it shows them as separate lines with a merge prompt rather than guessing wrong.
- Servings scaling: planning 2× a recipe scales its ingredient quantities accordingly.

## Price estimates

- Ship a seed table of common grocery items with average US prices per unit.
- Estimate = sum over list of (quantity in price-unit × unit price).
- Clearly labeled as an estimate; you can edit any item's price and it sticks.

---

## Data model (Supabase / Postgres)

- `profiles` — one row per auth user.
- `ingredients` — id, user_id, name, category, canonical_unit, dimension, is_staple_default, est_price, price_unit.
- `recipes` — id, user_id, name, servings, notes.
- `recipe_ingredients` — id, recipe_id, ingredient_id, quantity, unit, is_staple (per-recipe override).
- `meal_plan_entries` — id, user_id, date, meal_slot, recipe_id.
- `manual_list_items` — id, user_id, name, quantity, unit, category, est_price (for ad-hoc additions).
- Row-Level Security on every table so each user sees only their own data.

The shopping list itself is **computed** from `meal_plan_entries` + `recipe_ingredients` over the chosen date range (not stored), merged with `manual_list_items` and check-off state.

---

## Build order (milestones)

1. **Project setup** — Expo + TypeScript app, Supabase project, auth flow, tab navigation shell.
2. **Pantry/Ingredients** — master ingredient CRUD with staple flag + seed price table. (Foundation for everything else.)
3. **Meals/Recipes** — recipe CRUD with ingredient rows and per-recipe staple toggle.
4. **Planner** — calendar UI, assign meals to days/slots.
5. **Grocery list engine** — date-range selection, aggregation + unit conversion, staple filtering, category grouping.
6. **Prices + manual edits** — estimated totals, add/remove items, check-off.
7. **Polish** — empty states, loading, offline cache, friendly units, simple onboarding.
8. **Ship** — TestFlight (iOS) + Google Play internal testing via EAS Build.

## What I'd build first to de-risk

A thin vertical slice: log in → create one recipe with a staple + a shopping ingredient → put it on two days → generate a grocery list for the week and watch the quantities aggregate with the staple excluded. That proves the whole concept end-to-end before polishing.

---

## Open questions for later (not blockers)

- Meal slots: do you want Breakfast/Lunch/Dinner separation, or just "meals on a day"?
- Do you want recipe photos?
- Share a list / plan with a partner (multi-user household)?
