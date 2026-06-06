import {
  CATEGORIES,
  Category,
  Ingredient,
  ManualItem,
  MealPlanEntry,
  Recipe,
  ShoppingLine,
  Unit,
} from '../types';
import { convert, sameDimension } from '../lib/units';

interface BuildArgs {
  entries: MealPlanEntry[]; // already filtered to the chosen date range
  recipes: Record<string, Recipe>;
  ingredients: Record<string, Ingredient>;
  manualItems: ManualItem[];
  includeStaples: boolean;
}

interface Bucket {
  totalDefault: number; // summed quantity in the ingredient's default unit
  /** Quantities whose unit dimension didn't match the ingredient's. */
  incompatible: { quantity: number; unit: Unit }[];
}

/**
 * Build the aggregated shopping list for a set of planned meals.
 *
 * Quantities for the same ingredient are converted to a common unit and summed.
 * When two meals express the same ingredient in incompatible units (e.g. cloves
 * vs. tablespoons) they can't be merged safely, so they're surfaced as separate
 * lines with a note rather than guessed.
 */
export function buildGroceryList(args: BuildArgs): {
  lines: ShoppingLine[];
  total: number;
} {
  const { entries, recipes, ingredients, manualItems, includeStaples } = args;
  const buckets = new Map<string, Bucket>();

  for (const entry of entries) {
    const recipe = recipes[entry.recipeId];
    if (!recipe) continue;
    const baseServings = recipe.servings > 0 ? recipe.servings : 1;
    const scale = (entry.servings || baseServings) / baseServings;

    for (const item of recipe.items) {
      if (item.isStaple && !includeStaples) continue;
      const ing = ingredients[item.ingredientId];
      if (!ing) continue;

      const qty = item.quantity * scale;
      let bucket = buckets.get(ing.id);
      if (!bucket) {
        bucket = { totalDefault: 0, incompatible: [] };
        buckets.set(ing.id, bucket);
      }

      if (sameDimension(item.unit, ing.defaultUnit)) {
        bucket.totalDefault += convert(qty, item.unit, ing.defaultUnit);
      } else {
        bucket.incompatible.push({ quantity: qty, unit: item.unit });
      }
    }
  }

  const lines: ShoppingLine[] = [];

  for (const [ingId, bucket] of buckets) {
    const ing = ingredients[ingId];
    if (!ing) continue;

    if (bucket.totalDefault > 0) {
      lines.push({
        key: ingId,
        name: ing.name,
        category: ing.category,
        quantity: bucket.totalDefault,
        unit: ing.defaultUnit,
        estCost: estimateCost(bucket.totalDefault, ing),
        source: 'recipe',
      });
    }

    // Merge incompatible entries by unit so duplicates still combine where possible.
    const byUnit = new Map<Unit, number>();
    for (const inc of bucket.incompatible) {
      byUnit.set(inc.unit, (byUnit.get(inc.unit) || 0) + inc.quantity);
    }
    for (const [unit, quantity] of byUnit) {
      lines.push({
        key: `${ingId}:${unit}`,
        name: ing.name,
        category: ing.category,
        quantity,
        unit,
        estCost: sameDimension(unit, ing.priceUnit)
          ? quantity * unitPrice(ing, unit)
          : 0,
        source: 'recipe',
        note: 'Different unit — review before merging',
      });
    }
  }

  // Manual items: estPrice is the estimated cost for the whole line.
  for (const m of manualItems) {
    lines.push({
      key: m.id,
      name: m.name,
      category: m.category,
      quantity: m.quantity,
      unit: m.unit,
      estCost: m.estPrice || 0,
      source: 'manual',
    });
  }

  lines.sort((a, b) => {
    const ca = CATEGORIES.indexOf(a.category);
    const cb = CATEGORIES.indexOf(b.category);
    if (ca !== cb) return ca - cb;
    return a.name.localeCompare(b.name);
  });

  const total = lines.reduce((sum, l) => sum + l.estCost, 0);
  return { lines, total };
}

/** Cost of `quantity` (in the ingredient's default unit) using its est price. */
function estimateCost(quantityInDefault: number, ing: Ingredient): number {
  if (!sameDimension(ing.defaultUnit, ing.priceUnit)) return 0;
  const qtyInPriceUnit = convert(quantityInDefault, ing.defaultUnit, ing.priceUnit);
  return qtyInPriceUnit * ing.estPrice;
}

function unitPrice(ing: Ingredient, unit: Unit): number {
  return ing.estPrice * convert(1, unit, ing.priceUnit);
}

/** Group lines by category, preserving category order, dropping empty groups. */
export function groupByCategory(
  lines: ShoppingLine[]
): { category: Category; lines: ShoppingLine[] }[] {
  const groups: { category: Category; lines: ShoppingLine[] }[] = [];
  for (const category of CATEGORIES) {
    const inCat = lines.filter((l) => l.category === category);
    if (inCat.length) groups.push({ category, lines: inCat });
  }
  return groups;
}
