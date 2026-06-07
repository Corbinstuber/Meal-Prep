import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Chip, EmojiBadge, money } from '../components/ui';
import { useStore } from '../data/store';
import { buildGroceryList } from '../features/groceryList';
import { emojiFor, recipeAccent } from '../lib/recipeVisual';
import {
  addDays,
  rangeLabel,
  startOfWeek,
  toKey,
  weekDays,
  weekdayShort,
} from '../lib/dates';
import { MEAL_SLOTS, MealSlot } from '../types';
import { colors, font, radius, shadow, spacing } from '../theme';

export default function PlannerScreen() {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [addFor, setAddFor] = useState<string | null>(null);

  const days = useMemo(() => weekDays(weekStart), [weekStart]);
  const plan = useStore((s) => s.plan);
  const recipesArr = useStore((s) => s.recipes);
  const ingredientsArr = useStore((s) => s.ingredients);
  const removeMeal = useStore((s) => s.removeMeal);

  const recipes = useMemo(
    () => Object.fromEntries(recipesArr.map((r) => [r.id, r])),
    [recipesArr]
  );
  const ingredients = useMemo(
    () => Object.fromEntries(ingredientsArr.map((i) => [i.id, i])),
    [ingredientsArr]
  );

  const weekKeys = days.map(toKey);
  const weekEntries = plan.filter((p) => weekKeys.includes(p.date));
  const { total } = useMemo(
    () =>
      buildGroceryList({
        entries: weekEntries,
        recipes,
        ingredients,
        manualItems: [],
        includeStaples: false,
      }),
    [weekEntries, recipes, ingredients]
  );

  const todayKey = toKey(new Date());

  return (
    <View style={styles.container}>
      <View style={styles.weekBar}>
        <Pressable onPress={() => setWeekStart(addDays(weekStart, -7))} hitSlop={10}>
          <Ionicons name="chevron-back" size={24} color={colors.primary} />
        </Pressable>
        <Pressable onPress={() => setWeekStart(startOfWeek(new Date()))}>
          <Text style={styles.weekLabel}>{rangeLabel(days[0], days[6])}</Text>
        </Pressable>
        <Pressable onPress={() => setWeekStart(addDays(weekStart, 7))} hitSlop={10}>
          <Ionicons name="chevron-forward" size={24} color={colors.primary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 40 }}>
        {/* Weekly summary */}
        <View style={styles.summary}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{weekEntries.length}</Text>
            <Text style={styles.summaryLabel}>
              meal{weekEntries.length === 1 ? '' : 's'} planned
            </Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{money(total)}</Text>
            <Text style={styles.summaryLabel}>est. groceries</Text>
          </View>
        </View>

        {days.map((d) => {
          const key = toKey(d);
          const meals = plan
            .filter((p) => p.date === key)
            .sort((a, b) => MEAL_SLOTS.indexOf(a.slot) - MEAL_SLOTS.indexOf(b.slot));
          const isToday = key === todayKey;
          return (
            <View key={key} style={[styles.dayCard, isToday && styles.dayToday]}>
              <View style={styles.dayHeader}>
                <Text style={[styles.dayName, isToday && { color: colors.primary }]}>
                  {weekdayShort(d)} {d.getDate()}
                  {isToday ? '  · Today' : ''}
                </Text>
                <Pressable onPress={() => setAddFor(key)} hitSlop={8}>
                  <Ionicons name="add-circle" size={26} color={colors.primary} />
                </Pressable>
              </View>

              {meals.length === 0 ? (
                <Pressable onPress={() => setAddFor(key)}>
                  <Text style={styles.noMeals}>+ Add a meal</Text>
                </Pressable>
              ) : (
                meals.map((m) => {
                  const recipe = recipes[m.recipeId];
                  const accent = recipe ? recipeAccent(recipe) : { bg: colors.bg, fg: colors.muted };
                  return (
                    <View key={m.id} style={styles.mealRow}>
                      <EmojiBadge
                        emoji={recipe ? emojiFor(recipe) : '🍽️'}
                        bg={accent.bg}
                        size={34}
                      />
                      <View style={{ flex: 1, marginLeft: spacing.sm }}>
                        <Text style={styles.mealName} numberOfLines={1}>
                          {recipe?.name ?? 'Unknown'}
                        </Text>
                        <Text style={styles.mealSlot}>
                          {m.slot} · {m.servings} serving{m.servings === 1 ? '' : 's'}
                        </Text>
                      </View>
                      <Pressable onPress={() => removeMeal(m.id)} hitSlop={8}>
                        <Ionicons name="close-circle" size={20} color={colors.faint} />
                      </Pressable>
                    </View>
                  );
                })
              )}
            </View>
          );
        })}
      </ScrollView>

      <AddMealModal dateKey={addFor} onClose={() => setAddFor(null)} />
    </View>
  );
}

function AddMealModal({
  dateKey,
  onClose,
}: {
  dateKey: string | null;
  onClose: () => void;
}) {
  const recipes = useStore((s) => s.recipes);
  const addMeal = useStore((s) => s.addMeal);
  const [slot, setSlot] = useState<MealSlot>('Dinner');
  const [servings, setServings] = useState(2);

  return (
    <Modal visible={!!dateKey} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Add a meal</Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={24} color={colors.muted} />
            </Pressable>
          </View>

          <Text style={styles.sheetLabel}>Meal slot</Text>
          <View style={styles.slotRow}>
            {MEAL_SLOTS.map((s) => (
              <Chip key={s} label={s} selected={slot === s} onPress={() => setSlot(s)} />
            ))}
          </View>

          <Text style={styles.sheetLabel}>Servings to make</Text>
          <View style={styles.servingsRow}>
            <Pressable onPress={() => setServings((n) => Math.max(1, n - 1))} hitSlop={8}>
              <Ionicons name="remove-circle-outline" size={32} color={colors.primary} />
            </Pressable>
            <Text style={styles.servingsValue}>{servings}</Text>
            <Pressable onPress={() => setServings((n) => n + 1)} hitSlop={8}>
              <Ionicons name="add-circle-outline" size={32} color={colors.primary} />
            </Pressable>
            <Text style={styles.servingsHint}>scales the grocery list</Text>
          </View>

          <Text style={styles.sheetLabel}>Choose a recipe</Text>
          <ScrollView style={{ maxHeight: 320 }} keyboardShouldPersistTaps="handled">
            {recipes.length === 0 ? (
              <Text style={styles.noMeals}>Create a recipe in the Meals tab first.</Text>
            ) : (
              recipes.map((r) => {
                const accent = recipeAccent(r);
                return (
                  <Pressable
                    key={r.id}
                    style={styles.recipeRow}
                    onPress={() => {
                      if (dateKey) addMeal(dateKey, slot, r.id, servings);
                      setServings(2);
                      onClose();
                    }}
                  >
                    <EmojiBadge emoji={emojiFor(r)} bg={accent.bg} size={40} />
                    <View style={{ flex: 1, marginLeft: spacing.md }}>
                      <Text style={styles.recipeName}>{r.name}</Text>
                      <Text style={styles.recipeMeta}>
                        {r.prepMinutes ? `${r.prepMinutes} min · ` : ''}makes {r.servings}
                      </Text>
                    </View>
                    <Ionicons name="add-circle" size={24} color={colors.primary} />
                  </Pressable>
                );
              })
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  weekBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  weekLabel: { fontSize: font.h3, fontWeight: '800', color: colors.text },
  summary: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadow.card,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.25)' },
  summaryValue: { fontSize: font.h1, fontWeight: '800', color: '#fff' },
  summaryLabel: { fontSize: font.small, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  dayCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadow.card,
  },
  dayToday: { borderColor: colors.primary, borderWidth: 1.5 },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayName: { fontSize: font.body, fontWeight: '800', color: colors.text },
  noMeals: { color: colors.muted, fontSize: font.small, fontWeight: '600', marginTop: spacing.sm },
  mealRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.md,
    marginTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  mealName: { fontSize: font.body, color: colors.text, fontWeight: '700' },
  mealSlot: { fontSize: font.tiny, color: colors.muted, marginTop: 1 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderStrong,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sheetTitle: { fontSize: font.h2, fontWeight: '800', color: colors.text },
  sheetLabel: {
    fontSize: font.small,
    fontWeight: '700',
    color: colors.muted,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  slotRow: { flexDirection: 'row', flexWrap: 'wrap' },
  servingsRow: { flexDirection: 'row', alignItems: 'center' },
  servingsValue: {
    fontSize: font.h2,
    fontWeight: '800',
    color: colors.text,
    marginHorizontal: spacing.lg,
    minWidth: 28,
    textAlign: 'center',
  },
  servingsHint: { fontSize: font.tiny, color: colors.muted, marginLeft: spacing.md, flex: 1 },
  recipeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  recipeName: { fontSize: font.body, fontWeight: '700', color: colors.text },
  recipeMeta: { fontSize: font.small, color: colors.muted, marginTop: 2 },
});
