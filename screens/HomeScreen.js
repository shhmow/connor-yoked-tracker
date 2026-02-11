// screens/HomeScreen.js — Retro Square UI (matches Meals/Workouts)
// - Retro tokens (PANEL/BTN) for consistent look
// - Prepped day = darker gray; default = very light; overflow dim
// - Selected & completed = green with blue outline
// - Goal: numeric input on the left, inside calendar box
// - Meal picker: meals first; "Clear <meal>" at bottom
// - Copy this day’s plan → whole week (MEALS ONLY), with overwrite confirmation (yellow button)
// - Overflow days selectable; writes to the correct month via offset
// - Grocery modal respects safe area; Groceries (pink, left) / Complete Day (right)

import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Switch,
  TextInput,
  Keyboard,
  Alert,
} from 'react-native';
import {
  useSafeAreaInsets,
  SafeAreaView as SafeAreaViewEdges,
} from 'react-native-safe-area-context';
import GoonBar from '../components/GoonBar';
import { buildGroceryList } from '../utils/grocery';

const TAB_BAR_HEIGHT = 64; // must match App.js tabBarStyle.height
const COL_PCT = '14.2857%'; // 100 / 7 → exact 7 columns
const CELL_PAD = 1;
const HEADER_PAD = 10;
const GOAL_VPAD = 4;
const GAP_GRID_TO_GOAL = 4;
const GAP_GOAL_TO_PROGRESS = 6;

// Retro style tokens (matching Meals/Workouts)
const PANEL = {
  backgroundColor: '#f8f8f8',
  borderWidth: 3,
  borderColor: '#666',
  borderRadius: 6,
  padding: 12,
};
const PANEL_SURFACE = {
  backgroundColor: '#eeeeee',
  borderWidth: 3,
  borderColor: '#888',
  borderRadius: 6,
  paddingHorizontal: 10,
  paddingVertical: 8,
};
const BTN = {
  backgroundColor: '#dddddd',
  borderWidth: 3,
  borderColor: '#444',
  borderRadius: 6,
  paddingVertical: 8,
  paddingHorizontal: 12,
  alignItems: 'center',
  justifyContent: 'center',
};
const BTN_PRIMARY = { ...BTN, backgroundColor: '#cfe3ff', borderColor: '#446b9f' };
const BTN_SUCCESS = { ...BTN, backgroundColor: '#cfeccf', borderColor: '#3a7a3a' };
const BTN_WARN = { ...BTN, backgroundColor: '#fff6cc', borderColor: '#d1b100' };
const BTN_DANGER = { ...BTN, backgroundColor: '#ffd6d6', borderColor: '#b83a3a' };
const INPUT = {
  backgroundColor: '#fff',
  borderWidth: 3,
  borderColor: '#666',
  borderRadius: 6,
  paddingVertical: 6,
  paddingHorizontal: 10,
  color: '#111',
  textAlign: 'center',
};

// Colors for calendar cells
const COLOR_DEFAULT = '#fafafa';
const COLOR_OVERFLOW = '#f0f0f0';
const COLOR_PREPPED = '#cfcfcf';
const COLOR_PASSED = '#e8e8e8';
const COLOR_COMPLETED = '#66cc66';
const COLOR_SELECTED = '#bcdcff';
const COLOR_SELECTED_OUTLINE = '#3b82f6'; // blue


export default function HomeScreen({
  mealsData,
  workoutsData,
  dayMeals,
  setDayMeals,
  dayWorkouts,
  setDayWorkouts, // not copied in "copy to week"
  completedDays,
  setCompletedDays,
  monthlyGoals,
  setMonthlyGoals,
  goonLabel = 'Progress',
}) {
  const insets = useSafeAreaInsets();

  const today = new Date();
  const [selectedDay, setSelectedDay] = useState(null); // 1..31
  const [selectedOffset, setSelectedOffset] = useState(0); // -1 prev, 0 current, 1 next
  const [displayedMonth, setDisplayedMonth] = useState(today.getMonth());
  const [displayedYear, setDisplayedYear] = useState(today.getFullYear());
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
  const [sheetType, setSheetType] = useState('');
  const [sheetCategory, setSheetCategory] = useState('');
  const [groceryVisible, setGroceryVisible] = useState(false);
  const [groupGroceries, setGroupGroceries] = useState(true);

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const goalKey = `${displayedYear}-${displayedMonth + 1}`;
  const monthGoal = monthlyGoals[goalKey] ?? 20;

  const firstDayOfMonth = new Date(displayedYear, displayedMonth, 1).getDay();
  const lastDateOfMonth = new Date(displayedYear, displayedMonth + 1, 0).getDate();
  const prevMonthLastDate = new Date(displayedYear, displayedMonth, 0).getDate();

  // Full-week grid (Sun–Sat)
  const calendarCells = useMemo(() => {
    const cells = [];
    // Leading (previous month)
    for (let i = firstDayOfMonth - 1; i >= 0; i--) cells.push({ d: prevMonthLastDate - i, offset: -1 });
    // Current month
    for (let d = 1; d <= lastDateOfMonth; d++) cells.push({ d, offset: 0 });
    // Trailing (next month)
    const lastDow = new Date(displayedYear, displayedMonth, lastDateOfMonth).getDay();
    for (let d = 1; d <= 6 - lastDow; d++) cells.push({ d, offset: 1 });
    return cells;
  }, [displayedMonth, displayedYear, firstDayOfMonth, lastDateOfMonth, prevMonthLastDate]);

  const getDayKey = (d, off = 0) => {
    let m = displayedMonth + off;
    let y = displayedYear;
    if (m < 0) {
      m = 11;
      y -= 1;
    }
    if (m > 11) {
      m = 0;
      y += 1;
    }
    return `${y}-${m + 1}-${d}`;
  };

  const changeMonth = (offset) => {
    let newMonth = displayedMonth + offset;
    let newYear = displayedYear;
    if (newMonth < 0) {
      newMonth = 11;
      newYear -= 1;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear += 1;
    }
    setDisplayedMonth(newMonth);
    setDisplayedYear(newYear);
    setSelectedDay(null);
    setSelectedOffset(0);
  };

  const toggleCompleteDay = () => {
    if (selectedDay == null) return;
    const key = getDayKey(selectedDay, selectedOffset);
    setCompletedDays((prev) => (prev.includes(key) ? prev.filter((d) => d !== key) : [...prev, key]));
  };

  const plannedForKey = (key) => {
    const m = dayMeals[key];
    const w = dayWorkouts[key];
    return Boolean((m && (m.Breakfast || m.Lunch || m.Dinner)) || w);
  };

  const daysCompletedInMonth = useMemo(
    () =>
      completedDays.filter((k) => {
        const [y, m] = k.split('-');
        return Number(y) === displayedYear && Number(m) === displayedMonth + 1;
      }).length,
    [completedDays, displayedMonth, displayedYear]
  );

  const setGoalFromInput = (val) => {
    const n = Math.max(1, parseInt(val, 10) || 1);
    setMonthlyGoals((prev) => ({ ...prev, [goalKey]: n }));
  };

  const openMealPicker = (category) => {
    setSheetType('meal');
    setSheetCategory(category);
    setBottomSheetVisible(true);
  };
  const openWorkoutPicker = () => {
    setSheetType('workout');
    setBottomSheetVisible(true);
  };

  // Grocery list for week of selected day (offset-aware)
  const groceryData = useMemo(() => {
    if (selectedDay == null) return null;
    let m = displayedMonth + selectedOffset;
    let y = displayedYear;
    if (m < 0) {
      m = 11;
      y -= 1;
    }
    if (m > 11) {
      m = 0;
      y += 1;
    }
    const selected = new Date(y, m, selectedDay);
    return buildGroceryList(selected, dayMeals, { groupByCategory: groupGroceries });
  }, [selectedDay, selectedOffset, displayedMonth, displayedYear, dayMeals, groupGroceries]);

  const isSundaySelected = (() => {
    if (selectedDay == null) return false;
    let m = displayedMonth + selectedOffset;
    let y = displayedYear;
    if (m < 0) {
      m = 11;
      y -= 1;
    }
    if (m > 11) {
      m = 0;
      y += 1;
    }
    return new Date(y, m, selectedDay).getDay() === 0;
  })();

  // Copy MEALS ONLY to week (with confirmation for overwrite)
  const copyMealsToWeekWithConfirm = () => {
    if (selectedDay == null) return;
    let m = displayedMonth + selectedOffset;
    let y = displayedYear;
    if (m < 0) {
      m = 11;
      y -= 1;
    }
    if (m > 11) {
      m = 0;
      y += 1;
    }
    const srcDate = new Date(y, m, selectedDay);
    const srcKey = `${y}-${m + 1}-${selectedDay}`;
    const srcMeals = dayMeals[srcKey] || {};

    const start = new Date(srcDate);
    start.setDate(srcDate.getDate() - srcDate.getDay()); // Sunday

    // Check for overwrite
    let willOverwrite = false;
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
      if (dayMeals[key] && Object.keys(dayMeals[key]).length > 0) {
        willOverwrite = true;
        break;
      }
    }

    const performCopy = () => {
      setDayMeals((prev) => {
        const next = { ...prev };
        for (let i = 0; i < 7; i++) {
          const d = new Date(start);
          d.setDate(start.getDate() + i);
          const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
          next[key] = srcMeals ? { ...srcMeals } : {};
        }
        return next;
      });
    };

    if (willOverwrite) {
      Alert.alert(
        'Overwrite meals?',
        'Some days in this week already have meals. Do you want to overwrite them with this day’s plan?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Overwrite', style: 'destructive', onPress: performCopy },
        ]
      );
    } else {
      performCopy();
    }
  };

  // UI
  return (
    <View style={{ flex: 1, backgroundColor: '#d9d9d9', padding: 10 }}>
      {/* Page Scroll */}
      <ScrollView
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: insets.bottom + TAB_BAR_HEIGHT + 32 }}
      >
        {/* Header (retro panel) */}
        <View style={{ ...PANEL, marginBottom: 8 }}>
          {/* Month controls */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => changeMonth(-1)} style={{ ...BTN, paddingHorizontal: 10 }}>
              <Text style={{ fontWeight: 'bold', color: '#111' }}>◀</Text>
            </TouchableOpacity>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {monthNames.map((m, idx) => (
                  <TouchableOpacity
                    key={m}
                    onPress={() => {
                      setDisplayedMonth(idx);
                      setSelectedDay(null);
                      setSelectedOffset(0);
                    }}
                    style={{
                      ...BTN,
                      paddingVertical: 6,
                      paddingHorizontal: 10,
                      marginHorizontal: 4,
                      backgroundColor: displayedMonth === idx ? '#cfe3ff' : '#eee',
                      borderColor: displayedMonth === idx ? '#446b9f' : '#888',
                    }}
                  >
                    <Text style={{ color: '#111' }}>{m}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <TouchableOpacity onPress={() => changeMonth(1)} style={{ ...BTN, paddingHorizontal: 10 }}>
              <Text style={{ fontWeight: 'bold', color: '#111' }}>▶</Text>
            </TouchableOpacity>
          </View>

          <Text style={{ fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginTop: 6, color: '#222', fontFamily: 'Courier' }}>
            {displayedYear}
          </Text>

          {/* Weekday headers */}
          <View style={{ flexDirection: 'row', marginTop: 8, paddingBottom: 6, borderBottomWidth: 3, borderColor: '#aaa' }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <Text key={d} style={{ flex: 1, textAlign: 'center', fontWeight: 'bold', color: '#111' }}>
                {d}
              </Text>
            ))}
          </View>

          {/* Calendar surface (retro) */}
          <View style={{ ...PANEL_SURFACE, marginTop: 8 }}>
            {/* Grid */}
            <View style={{ width: '100%', alignSelf: 'center', marginBottom: 4 }}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {calendarCells.map((cell, idx) => {
                  const key = getDayKey(cell.d, cell.offset);

                  const isToday =
                    cell.offset === 0 &&
                    cell.d === today.getDate() &&
                    displayedMonth === today.getMonth() &&
                    displayedYear === today.getFullYear();

                  const isSelected = selectedDay === cell.d && selectedOffset === cell.offset;
                  const isCompleted = completedDays.includes(key);
                  const prepped = plannedForKey(key);
                  const cellDate = new Date(displayedYear, displayedMonth + cell.offset, cell.d);
                  const hasPassed = cellDate < new Date(today.getFullYear(), today.getMonth(), today.getDate());

                  // Fill color
                  let bg = COLOR_DEFAULT;
                  if (cell.offset !== 0) bg = COLOR_OVERFLOW;
                  if (prepped) bg = COLOR_PREPPED;
                  if (hasPassed && !isCompleted) bg = COLOR_PASSED;
                  if (isCompleted) bg = COLOR_COMPLETED;
                  if (!isCompleted && isSelected) bg = COLOR_SELECTED;

                  // Border rule
                  let borderColor = '#777';
                  let borderWidth = 3; // thicker for retro
                  if (isSelected && isCompleted) {
                    borderColor = COLOR_SELECTED_OUTLINE;
                    borderWidth = 3;
                  }

                  return (
                    <View key={idx} style={{ width: COL_PCT, paddingHorizontal: CELL_PAD, paddingVertical: CELL_PAD }}>
                      <TouchableOpacity
                        onPress={() => {
                          setSelectedDay(cell.d);
                          setSelectedOffset(cell.offset);
                        }}
                        style={{
                          aspectRatio: 1,
                          justifyContent: 'center',
                          alignItems: 'center',
                          backgroundColor: bg,
                          borderWidth: borderWidth,
                          borderColor: borderColor,
                          borderRadius: 6,
                        }}
                      >
                        <Text style={{ color: '#111', fontWeight: isToday ? 'bold' : 'normal' }}>{cell.d}</Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Goal number input (left) */}
            <View style={{ marginTop: GAP_GRID_TO_GOAL, width: '100%', alignItems: 'flex-start' }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#f2f2f2',
                  borderWidth: 3,
                  borderColor: '#777',
                  borderRadius: 6,
                  paddingHorizontal: 8,
                  paddingVertical: GOAL_VPAD,
                }}
              >
                <Text style={{ marginRight: 8, color: '#111' }}>Goal:</Text>
                <TextInput
                  style={{ ...INPUT, width: 64, height: 32, paddingVertical: 0 }}
                  inputMode="numeric"
                  keyboardType="number-pad"
                  returnKeyType="done"
                  value={String(monthGoal)}
                  onChangeText={setGoalFromInput}
                  onSubmitEditing={() => Keyboard.dismiss()}
                />
              </View>
            </View>

            {/* Progress bar */}
            <View style={{ marginTop: GAP_GOAL_TO_PROGRESS, width: '100%', paddingHorizontal: 4 }}>
              <GoonBar label={goonLabel} value={daysCompletedInMonth} goal={monthGoal} />
            </View>
          </View>
        </View>

        {/* Day Details (retro) */}
        {selectedDay != null && (
          <View style={{ ...PANEL, marginTop: 8 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#111' }}>
              Day {selectedDay} Details
            </Text>

            {['Breakfast', 'Lunch', 'Dinner'].map((category) => (
              <TouchableOpacity
                key={category}
                onPress={() => {
                  setSheetType('meal');
                  setSheetCategory(category);
                  setBottomSheetVisible(true);
                }}
                style={{ ...BTN, backgroundColor: '#e6e6e6', borderColor: '#777', marginBottom: 6 }}
              >
                <Text style={{ color: '#111' }}>
                  {category}: {dayMeals[getDayKey(selectedDay, selectedOffset)]?.[category] || 'Select'}
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              onPress={() => {
                setSheetType('workout');
                setBottomSheetVisible(true);
              }}
              style={{ ...BTN, backgroundColor: '#e6e6e6', borderColor: '#777', marginBottom: 6 }}
            >
              <Text style={{ fontWeight: 'bold', color: '#111' }}>
                Workout: {dayWorkouts[getDayKey(selectedDay, selectedOffset)] || 'Select'}
              </Text>
            </TouchableOpacity>

            {/* Copy (MEALS ONLY) — Yellow */}
            <TouchableOpacity
              onPress={copyMealsToWeekWithConfirm}
              style={{ ...BTN_WARN, marginTop: 6 }}
            >
              <Text style={{ fontWeight: 'bold', color: '#5c4a00' }}>
                Copy this day&apos;s plan to the whole week
              </Text>
            </TouchableOpacity>

            {/* Buttons row: Groceries LEFT (pink) / Complete RIGHT */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
              {isSundaySelected ? (
                <TouchableOpacity
                  onPress={() => setGroceryVisible(true)}
                  style={{
                    ...BTN,
                    backgroundColor: '#ff69b4',
                    borderColor: '#8a2a5b',
                  }}
                >
                  <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#fff', fontFamily: 'Courier' }}>Groceries</Text>
                </TouchableOpacity>
              ) : (
                <View style={{ width: 130 }} />
              )}

              <TouchableOpacity onPress={toggleCompleteDay} style={BTN}>
                <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#222', fontFamily: 'Courier' }}>
                  {completedDays.includes(getDayKey(selectedDay, selectedOffset)) ? 'Uncomplete Day' : 'Complete Day'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom sheet (Meals/Workouts pickers) */}
      <Modal
        visible={bottomSheetVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setBottomSheetVisible(false)}
      >
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <View style={{ ...PANEL, borderTopLeftRadius: 15, borderTopRightRadius: 15, maxHeight: '55%' }}>
            <ScrollView>
              {/* Meals FIRST */}
              {sheetType === 'meal' &&
                [...mealsData]
                  .sort((a, b) => (b.favorite ? -1 : 0) - (a.favorite ? -1 : 0))
                  .filter((m) => m.category === sheetCategory)
                  .map((m, idx) => (
                    <TouchableOpacity
                      key={`${m.name}-${idx}`}
                      onPress={() => {
                        if (selectedDay == null) return;
                        const key = getDayKey(selectedDay, selectedOffset);
                        setDayMeals((prev) => ({
                          ...prev,
                          [key]: {
                            ...prev[key],
                            [sheetCategory]: m.name,
                            [`ingredients_${sheetCategory}`]: m.ingredients,
                          },
                        }));
                        setBottomSheetVisible(false);
                      }}
                      style={{ ...BTN, backgroundColor: '#efefef', borderColor: '#777', marginBottom: 6 }}
                    >
                      <Text style={{ color: '#111' }}>
                        {m.name}
                        {m.favorite ? ' ★' : ''}
                      </Text>
                    </TouchableOpacity>
                  ))}

              {/* Workouts */}
              {sheetType === 'workout' &&
                [...workoutsData]
                  .sort((a, b) => (b.favorite ? -1 : 0) - (a.favorite ? -1 : 0))
                  .map((w, idx) => (
                    <TouchableOpacity
                      key={`${w.name}-${idx}`}
                      onPress={() => {
                        if (selectedDay == null) return;
                        const key = getDayKey(selectedDay, selectedOffset);
                        setDayWorkouts((prev) => ({ ...prev, [key]: w.name }));
                        setBottomSheetVisible(false);
                      }}
                      style={{ ...BTN, backgroundColor: '#efefef', borderColor: '#777', marginBottom: 6 }}
                    >
                      <Text style={{ color: '#111' }}>
                        {w.name}
                        {w.favorite ? ' ★' : ''}
                      </Text>
                    </TouchableOpacity>
                  ))}

              {/* CLEAR selection LAST (bottom) */}
              {sheetType === 'meal' && (
                <TouchableOpacity
                  onPress={() => {
                    if (selectedDay == null) return;
                    const key = getDayKey(selectedDay, selectedOffset);
                    setDayMeals((prev) => {
                      const cur = { ...(prev[key] || {}) };
                      delete cur[`${sheetCategory}`];
                      delete cur[`ingredients_${sheetCategory}`];
                      return { ...prev, [key]: cur };
                    });
                    setBottomSheetVisible(false);
                  }}
                  style={{ ...BTN_DANGER, marginTop: 10 }}
                >
                  <Text style={{ fontWeight: 'bold', color: '#6d1515' }}>Clear {sheetCategory}</Text>
                </TouchableOpacity>
              )}
            </ScrollView>

            <TouchableOpacity onPress={() => setBottomSheetVisible(false)} style={{ ...BTN, marginTop: 8 }}>
              <Text style={{ color: 'red', fontWeight: 'bold' }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Grocery modal — safe-area top (no cut-off under notch/clock) */}
      <Modal visible={groceryVisible} animationType="slide" onRequestClose={() => setGroceryVisible(false)}>
        <SafeAreaViewEdges style={{ flex: 1, backgroundColor: '#d9d9d9' }} edges={['top', 'left', 'right']}>
          <View style={{ flex: 1, padding: 10 }}>
            <View style={{ ...PANEL, marginBottom: 8 }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8, color: '#111' }}>
                Grocery List (week of selected Sunday)
              </Text>

              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Text style={{ marginRight: 8, color: '#111' }}>Group by category</Text>
                <Switch value={groupGroceries} onValueChange={setGroupGroceries} />
              </View>

              <ScrollView style={{ maxHeight: '80%' }}>
                {Array.isArray(groceryData) ? (
                  groceryData.map((ing, i) => (
                    <Text key={i} style={{ marginBottom: 4, color: '#111' }}>
                      - { ing }
                    </Text>
                  ))
                ) : groceryData ? (
                  Object.keys(groceryData).map((cat) => (
                    <View key={cat} style={{ marginBottom: 8 }}>
                      <Text style={{ fontWeight: 'bold', marginBottom: 4, color: '#111' }}>{cat}</Text>
                      {groceryData[cat].map((ing, i) => (
                        <Text key={i} style={{ marginLeft: 10, marginBottom: 2, color: '#111' }}>
                          - { ing }
                        </Text>
                      ))}
                    </View>
                  ))
                ) : (
                  <Text style={{ color: '#111' }}>No groceries for this week yet.</Text>
                )}
              </ScrollView>

              <TouchableOpacity onPress={() => setGroceryVisible(false)} style={{ ...BTN, marginTop: 8 }}>
                <Text style={{ fontWeight: 'bold', color: '#222' }}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaViewEdges>
      </Modal>
    </View>
  );
}