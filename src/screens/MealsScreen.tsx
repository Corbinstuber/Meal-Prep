import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Empty } from '../components/ui';
import { useStore } from '../data/store';
import { RootStackParamList } from '../navigation/types';
import { colors, font, radius, spacing } from '../theme';

export default function MealsScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const recipes = useStore((s) => s.recipes);

  return (
    <View style={styles.container}>
      <FlatList
        data={recipes}
        keyExtractor={(r) => r.id}
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: 100 }}
        ListEmptyComponent={
          <Empty text="No recipes yet. Tap + to create your first meal." />
        }
        renderItem={({ item }) => {
          const shopping = item.items.filter((i) => !i.isStaple).length;
          const staples = item.items.length - shopping;
          return (
            <Pressable
              style={styles.card}
              onPress={() => nav.navigate('RecipeEdit', { recipeId: item.id })}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.meta}>
                  {item.servings} {item.servings === 1 ? 'serving' : 'servings'} ·{' '}
                  {shopping} to buy · {staples} staple{staples === 1 ? '' : 's'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.muted} />
            </Pressable>
          );
        }}
      />
      <Pressable style={styles.fab} onPress={() => nav.navigate('RecipeEdit', {})}>
        <Ionicons name="add" size={28} color="#fff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: { fontSize: font.h3, fontWeight: '700', color: colors.text },
  meta: { fontSize: font.small, color: colors.muted, marginTop: 4 },
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
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
});
