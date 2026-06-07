import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { EmojiBadge, Tag } from '../components/ui';
import { useStore } from '../data/store';
import { emojiFor, recipeAccent } from '../lib/recipeVisual';
import { RootStackParamList } from '../navigation/types';
import { RECIPE_TAGS, RecipeTag } from '../types';
import { colors, font, radius, shadow, spacing } from '../theme';

type Filter = 'all' | 'fav' | RecipeTag;
const QUICK_FILTERS: RecipeTag[] = ['Quick', 'Vegetarian', 'High-protein', 'Vegan', 'Low-carb'];

export default function MealsScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const recipes = useStore((s) => s.recipes);
  const toggleFavorite = useStore((s) => s.toggleFavorite);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return recipes.filter((r) => {
      if (q && !r.name.toLowerCase().includes(q)) return false;
      if (filter === 'fav') return r.favorite;
      if (filter !== 'all') return r.tags?.includes(filter);
      return true;
    });
  }, [recipes, query, filter]);

  return (
    <View style={styles.container}>
      <FlatList
        data={filtered}
        keyExtractor={(r) => r.id}
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: 110 }}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View>
            <View style={styles.searchBar}>
              <Ionicons name="search" size={18} color={colors.faint} />
              <TextInput
                placeholder="Search recipes"
                placeholderTextColor={colors.faint}
                value={query}
                onChangeText={setQuery}
                style={styles.searchInput}
                autoCorrect={false}
              />
              {query ? (
                <Pressable onPress={() => setQuery('')} hitSlop={8}>
                  <Ionicons name="close-circle" size={18} color={colors.faint} />
                </Pressable>
              ) : null}
            </View>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={['all', 'fav', ...QUICK_FILTERS] as Filter[]}
              keyExtractor={(f) => f}
              style={{ marginBottom: spacing.sm }}
              renderItem={({ item }) => {
                const label = item === 'all' ? 'All' : item === 'fav' ? '★ Favorites' : item;
                const active = filter === item;
                return (
                  <Pressable
                    onPress={() => setFilter(item)}
                    style={[styles.filterChip, active && styles.filterChipActive]}
                  >
                    <Text style={[styles.filterText, active && styles.filterTextActive]}>
                      {label}
                    </Text>
                  </Pressable>
                );
              }}
            />
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🍳</Text>
            <Text style={styles.emptyTitle}>
              {query || filter !== 'all' ? 'No matching recipes' : 'No recipes yet'}
            </Text>
            <Text style={styles.emptyText}>
              {query || filter !== 'all'
                ? 'Try a different search or filter.'
                : 'Tap the + button to create your first meal.'}
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const shopping = item.items.filter((i) => !i.isStaple).length;
          const accent = recipeAccent(item);
          return (
            <Pressable
              style={styles.card}
              onPress={() => nav.navigate('RecipeEdit', { recipeId: item.id })}
            >
              <EmojiBadge emoji={emojiFor(item)} bg={accent.bg} size={52} />
              <View style={{ flex: 1, marginLeft: spacing.md }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.meta}>
                  {item.prepMinutes ? `${item.prepMinutes} min · ` : ''}
                  {item.servings} {item.servings === 1 ? 'serving' : 'servings'} · {shopping} to buy
                </Text>
                {item.tags?.length ? (
                  <View style={styles.tagRow}>
                    {item.tags.slice(0, 3).map((t) => (
                      <Tag key={t} label={t} color={accent.fg} bg={accent.bg} />
                    ))}
                  </View>
                ) : null}
              </View>
              <Pressable onPress={() => toggleFavorite(item.id)} hitSlop={10} style={styles.star}>
                <Ionicons
                  name={item.favorite ? 'star' : 'star-outline'}
                  size={22}
                  color={item.favorite ? colors.star : colors.faint}
                />
              </Pressable>
            </Pressable>
          );
        }}
      />
      <Pressable style={styles.fab} onPress={() => nav.navigate('RecipeEdit', {})}>
        <Ionicons name="add" size={30} color="#fff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  searchInput: { flex: 1, marginLeft: spacing.sm, fontSize: font.body, color: colors.text },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { fontSize: font.small, fontWeight: '700', color: colors.muted },
  filterTextActive: { color: '#fff' },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadow.card,
  },
  name: { fontSize: font.h3, fontWeight: '700', color: colors.text },
  meta: { fontSize: font.small, color: colors.muted, marginTop: 3 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 2 },
  star: { padding: spacing.xs },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.xl,
    backgroundColor: colors.primary,
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.float,
  },
  empty: { padding: spacing.xl, alignItems: 'center', marginTop: spacing.xl },
  emptyEmoji: { fontSize: 48, marginBottom: spacing.md },
  emptyTitle: { fontSize: font.h3, fontWeight: '800', color: colors.text, marginBottom: spacing.xs },
  emptyText: { color: colors.muted, fontSize: font.body, textAlign: 'center' },
});
