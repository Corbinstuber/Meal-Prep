import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useLayoutEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Button, Chip, Field } from '../components/ui';
import { PickerModal } from '../components/PickerModal';
import { useStore } from '../data/store';
import { RootStackParamList } from '../navigation/types';
import { RecipeIngredient, Unit } from '../types';
import { UNITS_BY_DIMENSION } from '../lib/units';
import { colors, font, radius, spacing } from '../theme';

export default function RecipeEditScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'RecipeEdit'>>();
  const editingId = route.params?.recipeId;

  const catalog = useStore((s) => s.ingredients);
  const existing = useStore((s) =>
    editingId ? s.recipes.find((r) => r.id === editingId) : undefined
  );
  const addRecipe = useStore((s) => s.addRecipe);
  const updateRecipe = useStore((s) => s.updateRecipe);
  const removeRecipe = useStore((s) => s.removeRecipe);
  const duplicateRecipe = useStore((s) => s.duplicateRecipe);

  const [name, setName] = useState(existing?.name ?? '');
  const [servings, setServings] = useState(String(existing?.servings ?? 2));
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [items, setItems] = useState<RecipeIngredient[]>(existing?.items ?? []);
  const [pickerOpen, setPickerOpen] = useState(false);

  const ingById = (id: string) => catalog.find((i) => i.id === id);

  useLayoutEffect(() => {
    nav.setOptions({ title: editingId ? 'Edit Recipe' : 'New Recipe' });
  }, [nav, editingId]);

  function addIngredient(ingredientId: string) {
    const ing = ingById(ingredientId);
    if (!ing) return;
    setItems((prev) => [
      ...prev,
      {
        ingredientId,
        quantity: 1,
        unit: ing.defaultUnit,
        isStaple: ing.isStapleDefault,
      },
    ]);
    setPickerOpen(false);
  }

  function patchItem(index: number, patch: Partial<RecipeIngredient>) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function save() {
    if (!name.trim()) {
      Alert.alert('Name required', 'Give your recipe a name.');
      return;
    }
    const payload = {
      name: name.trim(),
      servings: Math.max(1, parseInt(servings, 10) || 1),
      notes: notes.trim() || undefined,
      items,
    };
    if (editingId) updateRecipe(editingId, payload);
    else addRecipe(payload);
    nav.goBack();
  }

  function confirmDelete() {
    Alert.alert('Delete recipe?', 'This also removes it from any planned days.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          if (editingId) removeRecipe(editingId);
          nav.goBack();
        },
      },
    ]);
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 120 }}>
        <Field label="Recipe name" value={name} onChangeText={setName} placeholder="e.g. Taco Night" />
        <Field
          label="Servings this recipe makes"
          value={servings}
          onChangeText={setServings}
          keyboardType="number-pad"
        />

        <Text style={styles.section}>Ingredients</Text>
        <Text style={styles.hint}>
          Mark each as “Buy every time” or a “Pantry staple” (salt, spices) you
          already keep on hand. Staples are left off the grocery list by default.
        </Text>

        {items.map((item, index) => {
          const ing = ingById(item.ingredientId);
          if (!ing) return null;
          const units = UNITS_BY_DIMENSION[ing.dimension];
          return (
            <View key={index} style={styles.itemCard}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemName}>{ing.name}</Text>
                <Pressable onPress={() => removeItem(index)} hitSlop={8}>
                  <Ionicons name="trash-outline" size={20} color={colors.danger} />
                </Pressable>
              </View>

              <View style={styles.qtyRow}>
                <QuantityInput
                  value={item.quantity}
                  onChange={(q) => patchItem(index, { quantity: q })}
                />
                <View style={styles.unitWrap}>
                  {units.map((u) => (
                    <Chip
                      key={u}
                      label={u}
                      selected={item.unit === u}
                      onPress={() => patchItem(index, { unit: u as Unit })}
                    />
                  ))}
                </View>
              </View>

              <View style={styles.toggleRow}>
                <Chip
                  label="Buy every time"
                  selected={!item.isStaple}
                  onPress={() => patchItem(index, { isStaple: false })}
                />
                <Chip
                  label="Pantry staple"
                  selected={item.isStaple}
                  onPress={() => patchItem(index, { isStaple: true })}
                />
              </View>
            </View>
          );
        })}

        <Pressable style={styles.addRow} onPress={() => setPickerOpen(true)}>
          <Ionicons name="add-circle-outline" size={22} color={colors.primary} />
          <Text style={styles.addText}>Add ingredient</Text>
        </Pressable>

        <Field
          label="Notes (optional)"
          value={notes}
          onChangeText={setNotes}
          placeholder="Prep tips, swaps, etc."
          multiline
        />

        <View style={{ marginTop: spacing.md }}>
          <Button title={editingId ? 'Save changes' : 'Create recipe'} onPress={save} />
        </View>
        {editingId ? (
          <View style={{ marginTop: spacing.sm }}>
            <Button
              title="Duplicate recipe"
              variant="secondary"
              onPress={() => {
                const copy = duplicateRecipe(editingId);
                if (copy) nav.replace('RecipeEdit', { recipeId: copy.id });
              }}
            />
          </View>
        ) : null}
        {editingId ? (
          <View style={{ marginTop: spacing.sm }}>
            <Button title="Delete recipe" variant="danger" onPress={confirmDelete} />
          </View>
        ) : null}
      </ScrollView>

      <PickerModal
        visible={pickerOpen}
        title="Add ingredient"
        options={catalog
          .slice()
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((i) => ({
            id: i.id,
            label: i.name,
            sublabel: `${i.category}${i.isStapleDefault ? ' · staple' : ''}`,
          }))}
        onSelect={addIngredient}
        onClose={() => setPickerOpen(false)}
      />
    </KeyboardAvoidingView>
  );
}

function QuantityInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  const [text, setText] = useState(String(value));
  return (
    <TextInput
      value={text}
      onChangeText={(t) => {
        setText(t);
        const n = parseFloat(t.replace(',', '.'));
        if (!Number.isNaN(n)) onChange(n);
      }}
      onBlur={() => setText(String(value))}
      keyboardType="decimal-pad"
      style={styles.qtyInput}
    />
  );
}

const styles = StyleSheet.create({
  section: {
    fontSize: font.h3,
    fontWeight: '800',
    color: colors.text,
    marginTop: spacing.md,
  },
  hint: {
    fontSize: font.small,
    color: colors.muted,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
    lineHeight: 19,
  },
  itemCard: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  itemName: { fontSize: font.body, fontWeight: '700', color: colors.text },
  qtyRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.sm },
  qtyInput: {
    width: 64,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    fontSize: font.body,
    color: colors.text,
    marginRight: spacing.sm,
    backgroundColor: colors.bg,
    textAlign: 'center',
  },
  unitWrap: { flexDirection: 'row', flexWrap: 'wrap', flex: 1 },
  toggleRow: { flexDirection: 'row' },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  addText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: font.body,
    marginLeft: spacing.sm,
  },
});
