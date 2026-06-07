import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Button, Chip, Empty, Field, ProgressBar, money } from '../components/ui';
import { useStore } from '../data/store';
import { buildGroceryList, groupByCategory } from '../features/groceryList';
import {
  addDays,
  fromKey,
  monthShort,
  startOfWeek,
  toKey,
  weekdayShort,
} from '../lib/dates';
import { ALL_UNITS, formatQuantity } from '../lib/units';
import { CATEGORIES, Category, Unit } from '../types';
import { colors, font, radius, spacing } from '../theme';

export default function GroceryScreen() {
  const today = new Date();
  const [startKey, setStartKey] = useState(toKey(startOfWeek(today)));
  const [endKey, setEndKey] = useState(toKey(addDays(startOfWeek(today), 6)));
  const [includeStaples, setIncludeStaples] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  const plan = useStore((s) => s.plan);
  const recipesArr = useStore((s) => s.recipes);
  const ingredientsArr = useStore((s) => s.ingredients);
  const manualItems = useStore((s) => s.manualItems);
  const checked = useStore((s) => s.checked);
  const toggleChecked = useStore((s) => s.toggleChecked);
  const removeManualItem = useStore((s) => s.removeManualItem);

  const recipes = useMemo(
    () => Object.fromEntries(recipesArr.map((r) => [r.id, r])),
    [recipesArr]
  );
  const ingredients = useMemo(
    () => Object.fromEntries(ingredientsArr.map((i) => [i.id, i])),
    [ingredientsArr]
  );

  const entries = useMemo(
    () => plan.filter((p) => p.date >= startKey && p.date <= endKey),
    [plan, startKey, endKey]
  );

  const { lines, total } = useMemo(
    () => buildGroceryList({ entries, recipes, ingredients, manualItems, includeStaples }),
    [entries, recipes, ingredients, manualItems, includeStaples]
  );

  const remaining = useMemo(
    () => lines.filter((l) => !checked[l.key]).reduce((s, l) => s + l.estCost, 0),
    [lines, checked]
  );

  const checkedCount = lines.filter((l) => checked[l.key]).length;

  const groups = groupByCategory(lines);

  async function shareList() {
    if (!lines.length) return;
    const s = fromKey(startKey);
    const e = fromKey(endKey);
    const out: string[] = [
      `🛒 Grocery list — ${monthShort(s)} ${s.getDate()} to ${monthShort(e)} ${e.getDate()}`,
    ];
    for (const g of groups) {
      out.push('', g.category.toUpperCase());
      for (const l of g.lines) {
        out.push(`• ${l.name} — ${formatQuantity(l.quantity, l.unit)}  (${money(l.estCost)})`);
      }
    }
    out.push('', `Estimated total: ${money(total)}`);
    try {
      await Share.share({ message: out.join('\n') });
    } catch {
      // user dismissed the share sheet
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 140 }}>
        {/* Date range */}
        <View style={styles.rangeCard}>
          <DateStepper
            label="From"
            value={startKey}
            onChange={(k) => {
              setStartKey(k);
              if (k > endKey) setEndKey(k);
            }}
          />
          <DateStepper
            label="To"
            value={endKey}
            min={startKey}
            onChange={setEndKey}
          />
          <View style={styles.presetRow}>
            <Chip
              label="This week"
              onPress={() => {
                setStartKey(toKey(startOfWeek(today)));
                setEndKey(toKey(addDays(startOfWeek(today), 6)));
              }}
            />
            <Chip
              label="Next week"
              onPress={() => {
                const ns = addDays(startOfWeek(today), 7);
                setStartKey(toKey(ns));
                setEndKey(toKey(addDays(ns, 6)));
              }}
            />
            <Chip
              label="2 weeks"
              onPress={() => {
                setStartKey(toKey(startOfWeek(today)));
                setEndKey(toKey(addDays(startOfWeek(today), 13)));
              }}
            />
          </View>
        </View>

        <View style={styles.controlsRow}>
          <Pressable
            style={styles.staplesToggle}
            onPress={() => setIncludeStaples((v) => !v)}
          >
            <Ionicons
              name={includeStaples ? 'checkbox' : 'square-outline'}
              size={20}
              color={includeStaples ? colors.primary : colors.muted}
            />
            <Text style={styles.staplesText}>Include pantry staples</Text>
          </Pressable>
          <View style={styles.controlsRight}>
            <Text style={styles.mealCount}>
              {entries.length} meal{entries.length === 1 ? '' : 's'}
            </Text>
            {lines.length > 0 ? (
              <Pressable style={styles.shareBtn} onPress={shareList} hitSlop={8}>
                <Ionicons name="share-outline" size={18} color={colors.primary} />
                <Text style={styles.shareText}>Share</Text>
              </Pressable>
            ) : null}
          </View>
        </View>

        {lines.length > 0 ? (
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>
                {checkedCount === lines.length
                  ? '🎉 All done!'
                  : `${checkedCount} of ${lines.length} in the cart`}
              </Text>
              <Text style={styles.progressPct}>
                {Math.round((checkedCount / lines.length) * 100)}%
              </Text>
            </View>
            <ProgressBar value={lines.length ? checkedCount / lines.length : 0} />
          </View>
        ) : null}

        {lines.length === 0 ? (
          <Empty text="Nothing to buy for these dates. Plan some meals or add items by hand." />
        ) : (
          groups.map((g) => (
            <View key={g.category}>
              <Text style={styles.catTitle}>{g.category}</Text>
              {g.lines.map((line) => {
                const isChecked = !!checked[line.key];
                return (
                  <Pressable
                    key={line.key}
                    style={styles.line}
                    onPress={() => toggleChecked(line.key)}
                  >
                    <Ionicons
                      name={isChecked ? 'checkmark-circle' : 'ellipse-outline'}
                      size={22}
                      color={isChecked ? colors.checked : colors.primary}
                    />
                    <View style={{ flex: 1, marginLeft: spacing.sm }}>
                      <Text style={[styles.lineName, isChecked && styles.struck]}>
                        {line.name}
                      </Text>
                      <Text style={styles.lineQty}>
                        {formatQuantity(line.quantity, line.unit)}
                        {line.source === 'manual' ? '  · added by you' : ''}
                      </Text>
                      {line.note ? (
                        <Text style={styles.lineNote}>⚠ {line.note}</Text>
                      ) : null}
                    </View>
                    <Text style={[styles.lineCost, isChecked && styles.struck]}>
                      {money(line.estCost)}
                    </Text>
                    {line.source === 'manual' ? (
                      <Pressable
                        onPress={() => removeManualItem(line.key)}
                        hitSlop={8}
                        style={{ marginLeft: spacing.sm }}
                      >
                        <Ionicons name="trash-outline" size={18} color={colors.danger} />
                      </Pressable>
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
          ))
        )}

        <Pressable style={styles.addRow} onPress={() => setAddOpen(true)}>
          <Ionicons name="add-circle-outline" size={22} color={colors.primary} />
          <Text style={styles.addText}>Add item manually</Text>
        </Pressable>
      </ScrollView>

      <View style={styles.totalBar}>
        <View>
          <Text style={styles.totalLabel}>Estimated total</Text>
          <Text style={styles.totalSub}>Remaining {money(remaining)}</Text>
        </View>
        <Text style={styles.totalValue}>{money(total)}</Text>
      </View>

      <AddItemModal visible={addOpen} onClose={() => setAddOpen(false)} />
    </View>
  );
}

function DateStepper({
  label,
  value,
  onChange,
  min,
}: {
  label: string;
  value: string;
  onChange: (k: string) => void;
  min?: string;
}) {
  const d = fromKey(value);
  return (
    <View style={styles.stepper}>
      <Text style={styles.stepperLabel}>{label}</Text>
      <View style={styles.stepperControls}>
        <Pressable
          onPress={() => {
            const prev = toKey(addDays(d, -1));
            if (!min || prev >= min) onChange(prev);
          }}
          hitSlop={8}
        >
          <Ionicons name="remove-circle-outline" size={26} color={colors.primary} />
        </Pressable>
        <Text style={styles.stepperDate}>
          {weekdayShort(d)} {monthShort(d)} {d.getDate()}
        </Text>
        <Pressable onPress={() => onChange(toKey(addDays(d, 1)))} hitSlop={8}>
          <Ionicons name="add-circle-outline" size={26} color={colors.primary} />
        </Pressable>
      </View>
    </View>
  );
}

function AddItemModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const addManualItem = useStore((s) => s.addManualItem);
  const [name, setName] = useState('');
  const [qty, setQty] = useState('1');
  const [unit, setUnit] = useState<Unit>('each');
  const [category, setCategory] = useState<Category>('Other');
  const [price, setPrice] = useState('');

  function reset() {
    setName('');
    setQty('1');
    setUnit('each');
    setCategory('Other');
    setPrice('');
  }

  function submit() {
    if (!name.trim()) return;
    addManualItem({
      name: name.trim(),
      quantity: parseFloat(qty.replace(',', '.')) || 1,
      unit,
      category,
      estPrice: parseFloat(price.replace(',', '.')) || 0,
    });
    reset();
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <ScrollView
          style={styles.modalSheet}
          contentContainerStyle={{ paddingBottom: spacing.xl }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Add item</Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={24} color={colors.muted} />
            </Pressable>
          </View>

          <Field label="Item" value={name} onChangeText={setName} placeholder="e.g. Paper towels" />
          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <View style={{ width: 90 }}>
              <Field label="Qty" value={qty} onChangeText={setQty} keyboardType="decimal-pad" />
            </View>
            <View style={{ flex: 1 }}>
              <Field
                label="Est. price ($)"
                value={price}
                onChangeText={setPrice}
                keyboardType="decimal-pad"
                placeholder="optional"
              />
            </View>
          </View>

          <Text style={styles.fieldLabel}>Unit</Text>
          <View style={styles.wrap}>
            {ALL_UNITS.map((u) => (
              <Chip key={u} label={u} selected={unit === u} onPress={() => setUnit(u)} />
            ))}
          </View>

          <Text style={styles.fieldLabel}>Category (aisle)</Text>
          <View style={styles.wrap}>
            {CATEGORIES.map((c) => (
              <Chip
                key={c}
                label={c}
                selected={category === c}
                onPress={() => setCategory(c)}
              />
            ))}
          </View>

          <View style={{ marginTop: spacing.md }}>
            <Button title="Add to list" onPress={submit} />
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  rangeCard: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  stepperLabel: { fontSize: font.body, fontWeight: '700', color: colors.muted },
  stepperControls: { flexDirection: 'row', alignItems: 'center' },
  stepperDate: {
    fontSize: font.body,
    fontWeight: '700',
    color: colors.text,
    marginHorizontal: spacing.md,
    minWidth: 120,
    textAlign: 'center',
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  staplesToggle: { flexDirection: 'row', alignItems: 'center' },
  staplesText: { marginLeft: spacing.sm, fontSize: font.small, color: colors.text, fontWeight: '600' },
  mealCount: { fontSize: font.small, color: colors.muted },
  progressCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  progressTitle: { fontSize: font.small, fontWeight: '800', color: colors.text },
  progressPct: { fontSize: font.small, fontWeight: '800', color: colors.primary },
  controlsRight: { flexDirection: 'row', alignItems: 'center' },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: spacing.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    backgroundColor: colors.primaryLight,
  },
  shareText: { color: colors.primary, fontWeight: '700', fontSize: font.small, marginLeft: 4 },
  catTitle: {
    fontSize: font.small,
    fontWeight: '800',
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  line: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  lineName: { fontSize: font.body, fontWeight: '600', color: colors.text },
  lineQty: { fontSize: font.small, color: colors.muted, marginTop: 2 },
  lineNote: { fontSize: font.tiny, color: colors.accent, marginTop: 2 },
  lineCost: { fontSize: font.body, fontWeight: '700', color: colors.text },
  struck: { textDecorationLine: 'line-through', color: colors.checked },
  addRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.lg },
  addText: { color: colors.primary, fontWeight: '700', fontSize: font.body, marginLeft: spacing.sm },
  totalBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: { fontSize: font.small, color: colors.muted, fontWeight: '600' },
  totalSub: { fontSize: font.tiny, color: colors.muted, marginTop: 2 },
  totalValue: { fontSize: font.h1, fontWeight: '800', color: colors.primary },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
    maxHeight: '88%',
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sheetTitle: { fontSize: font.h2, fontWeight: '800', color: colors.text },
  fieldLabel: {
    fontSize: font.small,
    color: colors.muted,
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.md },
});
