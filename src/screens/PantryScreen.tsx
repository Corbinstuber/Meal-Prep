import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Button, Chip, Field } from '../components/ui';
import { useStore } from '../data/store';
import { UNITS_BY_DIMENSION } from '../lib/units';
import {
  CATEGORIES,
  Category,
  Dimension,
  Ingredient,
  Unit,
} from '../types';
import { colors, font, radius, spacing } from '../theme';

const DIMENSIONS: Dimension[] = ['mass', 'volume', 'count'];

export default function PantryScreen() {
  const ingredients = useStore((s) => s.ingredients);
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<Ingredient | 'new' | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? ingredients.filter((i) => i.name.toLowerCase().includes(q))
      : ingredients;
    return list.slice().sort((a, b) => a.name.localeCompare(b.name));
  }, [ingredients, query]);

  const byCategory = useMemo(() => {
    return CATEGORIES.map((c) => ({
      category: c,
      items: filtered.filter((i) => i.category === c),
    })).filter((g) => g.items.length);
  }, [filtered]);

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={colors.muted} />
        <TextInput
          placeholder="Search ingredients"
          placeholderTextColor={colors.muted}
          value={query}
          onChangeText={setQuery}
          style={styles.searchInput}
        />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 100 }}>
        {byCategory.map((g) => (
          <View key={g.category}>
            <Text style={styles.catTitle}>{g.category}</Text>
            {g.items.map((i) => (
              <Pressable key={i.id} style={styles.row} onPress={() => setEditing(i)}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{i.name}</Text>
                  <Text style={styles.meta}>
                    ~${i.estPrice}/{i.priceUnit} · sold in {i.defaultUnit}
                  </Text>
                </View>
                {i.isStapleDefault ? (
                  <View style={styles.stapleTag}>
                    <Text style={styles.stapleText}>staple</Text>
                  </View>
                ) : null}
                <Ionicons name="chevron-forward" size={18} color={colors.muted} />
              </Pressable>
            ))}
          </View>
        ))}
      </ScrollView>

      <Pressable style={styles.fab} onPress={() => setEditing('new')}>
        <Ionicons name="add" size={28} color="#fff" />
      </Pressable>

      <IngredientEditor
        target={editing}
        onClose={() => setEditing(null)}
      />
    </View>
  );
}

function IngredientEditor({
  target,
  onClose,
}: {
  target: Ingredient | 'new' | null;
  onClose: () => void;
}) {
  const addIngredient = useStore((s) => s.addIngredient);
  const updateIngredient = useStore((s) => s.updateIngredient);
  const removeIngredient = useStore((s) => s.removeIngredient);

  const isNew = target === 'new';
  const existing = target && target !== 'new' ? target : null;

  // Re-init form whenever target changes via key on the inner component.
  if (!target) return null;

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <EditorForm
          key={existing?.id ?? 'new'}
          existing={existing}
          isNew={isNew}
          onClose={onClose}
          onSave={(data) => {
            if (existing) updateIngredient(existing.id, data);
            else addIngredient(data);
            onClose();
          }}
          onDelete={
            existing
              ? () => {
                  Alert.alert('Delete ingredient?', `Remove ${existing.name}?`, [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Delete',
                      style: 'destructive',
                      onPress: () => {
                        removeIngredient(existing.id);
                        onClose();
                      },
                    },
                  ]);
                }
              : undefined
          }
        />
      </View>
    </Modal>
  );
}

function EditorForm({
  existing,
  isNew,
  onClose,
  onSave,
  onDelete,
}: {
  existing: Ingredient | null;
  isNew: boolean;
  onClose: () => void;
  onSave: (data: Omit<Ingredient, 'id'>) => void;
  onDelete?: () => void;
}) {
  const [name, setName] = useState(existing?.name ?? '');
  const [category, setCategory] = useState<Category>(existing?.category ?? 'Other');
  const [dimension, setDimension] = useState<Dimension>(existing?.dimension ?? 'count');
  const [defaultUnit, setDefaultUnit] = useState<Unit>(existing?.defaultUnit ?? 'each');
  const [priceUnit, setPriceUnit] = useState<Unit>(existing?.priceUnit ?? 'each');
  const [isStaple, setIsStaple] = useState(existing?.isStapleDefault ?? false);
  const [price, setPrice] = useState(String(existing?.estPrice ?? ''));

  const units = UNITS_BY_DIMENSION[dimension];

  function changeDimension(d: Dimension) {
    setDimension(d);
    const u = UNITS_BY_DIMENSION[d];
    if (!u.includes(defaultUnit)) setDefaultUnit(u[0]);
    if (!u.includes(priceUnit)) setPriceUnit(u[0]);
  }

  function save() {
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      category,
      dimension,
      defaultUnit,
      priceUnit,
      isStapleDefault: isStaple,
      estPrice: parseFloat(price.replace(',', '.')) || 0,
    });
  }

  return (
    <ScrollView
      style={styles.modalSheet}
      contentContainerStyle={{ paddingBottom: spacing.xl }}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.sheetHeader}>
        <Text style={styles.sheetTitle}>{isNew ? 'New ingredient' : 'Edit ingredient'}</Text>
        <Pressable onPress={onClose} hitSlop={10}>
          <Ionicons name="close" size={24} color={colors.muted} />
        </Pressable>
      </View>

      <Field label="Name" value={name} onChangeText={setName} placeholder="e.g. Cherry Tomatoes" />

      <Text style={styles.fieldLabel}>Category (aisle)</Text>
      <View style={styles.wrap}>
        {CATEGORIES.map((c) => (
          <Chip key={c} label={c} selected={category === c} onPress={() => setCategory(c)} />
        ))}
      </View>

      <Text style={styles.fieldLabel}>Measured by</Text>
      <View style={styles.wrap}>
        {DIMENSIONS.map((d) => (
          <Chip key={d} label={d} selected={dimension === d} onPress={() => changeDimension(d)} />
        ))}
      </View>

      <Text style={styles.fieldLabel}>Default unit (how totals show)</Text>
      <View style={styles.wrap}>
        {units.map((u) => (
          <Chip key={u} label={u} selected={defaultUnit === u} onPress={() => setDefaultUnit(u)} />
        ))}
      </View>

      <View style={{ flexDirection: 'row', gap: spacing.md }}>
        <View style={{ flex: 1 }}>
          <Field
            label="Est. price ($)"
            value={price}
            onChangeText={setPrice}
            keyboardType="decimal-pad"
            placeholder="0.00"
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.fieldLabel}>per unit</Text>
          <View style={styles.wrap}>
            {units.map((u) => (
              <Chip key={u} label={u} selected={priceUnit === u} onPress={() => setPriceUnit(u)} />
            ))}
          </View>
        </View>
      </View>

      <Text style={styles.fieldLabel}>Default type</Text>
      <View style={styles.wrap}>
        <Chip label="Buy every time" selected={!isStaple} onPress={() => setIsStaple(false)} />
        <Chip label="Pantry staple" selected={isStaple} onPress={() => setIsStaple(true)} />
      </View>

      <View style={{ marginTop: spacing.md }}>
        <Button title={isNew ? 'Add ingredient' : 'Save'} onPress={save} />
      </View>
      {onDelete ? (
        <View style={{ marginTop: spacing.sm }}>
          <Button title="Delete" variant="danger" onPress={onDelete} />
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchInput: { flex: 1, marginLeft: spacing.sm, fontSize: font.body, color: colors.text },
  catTitle: {
    fontSize: font.small,
    fontWeight: '800',
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  name: { fontSize: font.body, fontWeight: '600', color: colors.text },
  meta: { fontSize: font.small, color: colors.muted, marginTop: 2 },
  stapleTag: {
    backgroundColor: colors.bg,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stapleText: { fontSize: font.tiny, color: colors.staple, fontWeight: '700' },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.xl,
    backgroundColor: colors.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
    maxHeight: '90%',
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sheetTitle: { fontSize: font.h2, fontWeight: '800', color: colors.text },
  fieldLabel: { fontSize: font.small, color: colors.muted, marginBottom: spacing.xs, fontWeight: '600' },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.md },
});
