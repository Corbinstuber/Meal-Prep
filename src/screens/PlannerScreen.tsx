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
import { Chip, Empty } from '../components/ui';
import { useStore } from '../data/store';
import {
  addDays,
  rangeLabel,
  startOfWeek,
  toKey,
  weekDays,
  weekdayShort,
} from '../lib/dates';
import { MEAL_SLOTS, MealSlot } from '../types';
import { colors, font, radius, spacing } from '../theme';

export default function PlannerScreen() {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [addFor, setAddFor] = useState<string | null>(null); // date key

  const days = useMemo(() => weekDays(weekStart), [weekStart]);
  const plan = useStore((s) => s.plan);
  const recipes = useStore((s) => s.recipes);
  const removeMeal = useStore((s) => s.removeMeal);

  const recipeName = (id: string) => recipes.find((r) => r.id === id)?.name ?? 'Unknown';
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
                  <Ionicons name="add-circle" size={24} color={colors.primary} />
                </Pressable>
              </View>

              {meals.length === 0 ? (
                <Text style={styles.noMeals}>No meals planned</Text>
              ) : (
                meals.map((m) => (
                  <View key={m.id} style={styles.mealRow}>
                    <View style={styles.slotTag}>
                      <Text style={styles.slotText}>{m.slot}</Text>
                    </View>
                    <Text style={styles.mealName} numberOfLines={1}>
                      {recipeName(m.recipeId)}
                    </Text>
                    <Text style={styles.servings}>{m.servings}×</Text>
                    <Pressable onPress={() => removeMeal(m.id)} hitSlop={8}>
                      <Ionicons name="close-circle" size={20} color={colors.staple} />
                    </Pressable>
                  </View>
                ))
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

  return (
    <Modal visible={!!dateKey} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
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

          <Text style={styles.sheetLabel}>Choose a recipe</Text>
          <ScrollView style={{ maxHeight: 320 }}>
            {recipes.length === 0 ? (
              <Empty text="Create a recipe in the Meals tab first." />
            ) : (
              recipes.map((r) => (
                <Pressable
                  key={r.id}
                  style={styles.recipeRow}
                  onPress={() => {
                    if (dateKey) addMeal(dateKey, slot, r.id);
                    onClose();
                  }}
                >
                  <Text style={styles.recipeName}>{r.name}</Text>
                  <Text style={styles.recipeMeta}>{r.servings} servings</Text>
                </Pressable>
              ))
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
  dayCard: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  dayToday: { borderColor: colors.primary, borderWidth: 1.5 },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  dayName: { fontSize: font.body, fontWeight: '800', color: colors.text },
  noMeals: { color: colors.muted, fontSize: font.small, fontStyle: 'italic' },
  mealRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  slotTag: {
    backgroundColor: colors.primaryLight,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    marginRight: spacing.sm,
  },
  slotText: { fontSize: font.tiny, fontWeight: '700', color: colors.primary },
  mealName: { flex: 1, fontSize: font.body, color: colors.text, fontWeight: '600' },
  servings: { fontSize: font.small, color: colors.muted, marginRight: spacing.sm },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
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
  recipeRow: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  recipeName: { fontSize: font.body, fontWeight: '600', color: colors.text },
  recipeMeta: { fontSize: font.small, color: colors.muted, marginTop: 2 },
});
