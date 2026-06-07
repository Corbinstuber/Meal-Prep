import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { colors } from '../theme';
import GroceryScreen from '../screens/GroceryScreen';
import MealsScreen from '../screens/MealsScreen';
import PantryScreen from '../screens/PantryScreen';
import PlannerScreen from '../screens/PlannerScreen';
import RecipeEditScreen from '../screens/RecipeEditScreen';
import { RootStackParamList, TabsParamList } from './types';

const Tab = createBottomTabNavigator<TabsParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: colors.bg },
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: '800', fontSize: 22 },
        headerTitleAlign: 'left',
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.faint,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          height: 88,
          paddingTop: 8,
          paddingBottom: 28,
        },
        tabBarIcon: ({ color, size }) => {
          const icons: Record<keyof TabsParamList, keyof typeof Ionicons.glyphMap> = {
            Planner: 'calendar-outline',
            Meals: 'restaurant-outline',
            Grocery: 'cart-outline',
            Pantry: 'file-tray-stacked-outline',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Planner" component={PlannerScreen} />
      <Tab.Screen name="Meals" component={MealsScreen} />
      <Tab.Screen name="Grocery" component={GroceryScreen} options={{ title: 'Grocery List' }} />
      <Tab.Screen name="Pantry" component={PantryScreen} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: '800' },
        headerTintColor: colors.primary,
      }}
    >
      <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
      <Stack.Screen
        name="RecipeEdit"
        component={RecipeEditScreen}
        options={{ presentation: 'modal', title: 'Recipe' }}
      />
    </Stack.Navigator>
  );
}
