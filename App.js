// App.js (retro fonts: PressStart2P for big/bold; Special Elite for small/body)
import React, { useState, useEffect } from 'react';
import { SafeAreaView, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Persistence helpers
import { save, load } from './utils/storage';

// Pixel font (tabs + big/bold)
import {
  useFonts as usePixel,
  PressStart2P_400Regular,
} from '@expo-google-fonts/press-start-2p';

// Typewriter font (body/small)
import {
  useFonts as useType,
  SpecialElite_400Regular,
} from '@expo-google-fonts/special-elite';

import HomeScreen from './screens/HomeScreen';
import MealsScreen from './screens/MealsScreen';
import WorkoutsScreen from './screens/WorkoutsScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  // ---- Load both fonts ----
  const [pixelLoaded] = usePixel({ PressStart2P_400Regular });
  const [typeLoaded] = useType({ SpecialElite_400Regular });
  const fontsLoaded = pixelLoaded && typeLoaded;

  // ---- App state (single source of truth) ----
  // Provide reasonable defaults; they will be replaced by stored values on first effect run.
  const [mealsData, setMealsData] = useState([
    { name: 'protein shake', category: 'Breakfast', ingredients: ['protein shake', 'menthol breeze vape'], favorite: false },
    { name: 'Honey Butter Bread', category: 'Lunch', ingredients: ['flour', 'yeast', 'salt', 'honey', 'butter'], favorite: false },
    { name: 'boy chow', category: 'Dinner', ingredients: ['1 lb beef', 'onion', 'rice', 'franks red hot'], favorite: false },
  ]);

  const [workoutsData, setWorkoutsData] = useState([
    { name: 'Chest Day', type: 'Chest', activities: ['incline bench', 'incline dumbbell press', 'dumbbell pull over'], favorite: false },
  ]);

  const [dayMeals, setDayMeals] = useState({});
  const [dayWorkouts, setDayWorkouts] = useState({});
  const [completedDays, setCompletedDays] = useState([]);
  const [monthlyGoals, setMonthlyGoals] = useState({});

  // ---- Apply default font to all <Text> once fonts are ready ----
  useEffect(() => {
    if (!fontsLoaded) return;

    if (Text && !Text.defaultProps) {
      Text.defaultProps = {};
    }
    if (Text) {
      Text.defaultProps.style = [
        Text.defaultProps.style,
        { fontFamily: 'SpecialElite_400Regular' }, // default body/small font
      ];
    }
  }, [fontsLoaded]);

  // ---- Load all persistent data on first app load (after fonts) ----
  useEffect(() => {
    if (!fontsLoaded) return;
    (async () => {
      // If nothing is stored yet, keep current defaults
      setMealsData(await load('mealsData', mealsData));
      setWorkoutsData(await load('workoutsData', workoutsData));
      setDayMeals(await load('dayMeals', {}));
      setDayWorkouts(await load('dayWorkouts', {}));
      setCompletedDays(await load('completedDays', []));
      setMonthlyGoals(await load('monthlyGoals', {}));
    })();
    // We intentionally omit dependencies so this runs only once after fonts load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fontsLoaded]);

  // ---- Auto-save whenever specific slices change ----
  useEffect(() => { save('mealsData', mealsData); }, [mealsData]);
  useEffect(() => { save('workoutsData', workoutsData); }, [workoutsData]);
  useEffect(() => { save('dayMeals', dayMeals); }, [dayMeals]);
  useEffect(() => { save('dayWorkouts', dayWorkouts); }, [dayWorkouts]);
  useEffect(() => { save('completedDays', completedDays); }, [completedDays]);
  useEffect(() => { save('monthlyGoals', monthlyGoals); }, [monthlyGoals]);

  if (!fontsLoaded) return null; // ensure both fonts are ready

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#d9d9d9' }}>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarStyle: {
              height: 64,
              backgroundColor: '#d7d7d7',
              borderTopWidth: 3,
              borderTopColor: '#7a7a7a',
              paddingBottom: 10,
              paddingTop: 6,
            },
            // Pixel font on tab labels
            tabBarLabelStyle: { fontFamily: 'PressStart2P_400Regular', fontSize: 9 },
            tabBarActiveTintColor: '#000',
            tabBarInactiveTintColor: '#444',
            tabBarHideOnKeyboard: true,
          }}
        >
          <Tab.Screen name="Home">
            {(props) => (
              <HomeScreen
                {...props}
                mealsData={mealsData}
                workoutsData={workoutsData}
                dayMeals={dayMeals} setDayMeals={setDayMeals}
                dayWorkouts={dayWorkouts} setDayWorkouts={setDayWorkouts}
                completedDays={completedDays} setCompletedDays={setCompletedDays}
                monthlyGoals={monthlyGoals} setMonthlyGoals={setMonthlyGoals}
                goonLabel="Progress"
                // pass font names to screens so you can override big/bold items
                pixelFont="PressStart2P_400Regular"
                typeFont="SpecialElite_400Regular"
              />
            )}
          </Tab.Screen>

          <Tab.Screen name="Meals">
            {(props) => (
              <MealsScreen
                {...props}
                mealsData={mealsData}
                setMealsData={setMealsData}
                pixelFont="PressStart2P_400Regular"
                typeFont="SpecialElite_400Regular"
              />
            )}
          </Tab.Screen>

          <Tab.Screen name="Workouts">
            {(props) => (
              <WorkoutsScreen
                {...props}
                workoutsData={workoutsData}
                setWorkoutsData={setWorkoutsData}
                pixelFont="PressStart2P_400Regular"
                typeFont="SpecialElite_400Regular"
              />
            )}
          </Tab.Screen>
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
}
