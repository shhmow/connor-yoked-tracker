// App.js (retro fonts: PressStart2P for big/bold; Special Elite for small/body)
import React, { useState, useEffect } from 'react';
import { SafeAreaView, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Pixel font (tabs + big/bold)
import { useFonts as usePixel, PressStart2P_400Regular } from '@expo-google-fonts/press-start-2p';
// Typewriter font (body/small)
import { useFonts as useType, SpecialElite_400Regular } from '@expo-google-fonts/special-elite';

import HomeScreen from './screens/HomeScreen';
import MealsScreen from './screens/MealsScreen';
import WorkoutsScreen from './screens/WorkoutsScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  const [pixelLoaded] = usePixel({ PressStart2P_400Regular });
  const [typeLoaded]  = useType({ SpecialElite_400Regular });


  // Wait for both fonts
  const fontsLoaded = pixelLoaded && typeLoaded;
  useEffect(() => {
    if (!fontsLoaded) return;
    // Set a default for ALL <Text> = typewriter retro
    // (You can still override with style={{ fontFamily: 'PressStart2P_400Regular' }} on big/bold items)
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

  // Starter data (unchanged)
  const [mealsData, setMealsData] = useState([
    { name: 'protein shake', category: 'Breakfast', ingredients: ['protein shake','menthol breeze vape'], favorite: false },
    { name: 'Honey Butter Bread', category: 'Lunch', ingredients: ['flour','yeast','salt','honey','butter'], favorite: false },
    { name: 'boy chow', category: 'Dinner', ingredients: ['1 lb beef','onion','rice','franks red hot'], favorite: false },
  ]);

  const [workoutsData, setWorkoutsData] = useState([
    { name: 'Chest Day', type: 'Chest', activities: ['incline bench','incline dumbbell press','dumbbell pull over'], favorite: false },
  ]);

  const [dayMeals, setDayMeals] = useState({});
  const [dayWorkouts, setDayWorkouts] = useState({});
  const [completedDays, setCompletedDays] = useState([]);
  const [monthlyGoals, setMonthlyGoals] = useState({});

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
            // Pixel font on tab labels (unchanged)
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
