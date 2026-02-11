// screens/MealsScreen.js — Retro Square UI
import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Modal, TextInput,
  Alert, KeyboardAvoidingView, Platform, SafeAreaView
} from 'react-native';

export default function MealsScreen({ mealsData, setMealsData }) {
  const [editorVisible, setEditorVisible] = useState(false);
  const [editingMealIndex, setEditingMealIndex] = useState(null);
  const [mealName, setMealName] = useState('');
  const [mealCategory, setMealCategory] = useState('Breakfast');
  const [ingredientInput, setIngredientInput] = useState('');
  const [ingredients, setIngredients] = useState([]);

  const [open, setOpen] = useState({ Breakfast: true, Lunch: true, Dinner: true });

  const categories = ['Breakfast', 'Lunch', 'Dinner'];

  // ===== Retro style tokens (match Workouts screen vibe) =====
  const PANEL = {
    backgroundColor: '#f8f8f8',
    borderWidth: 3, borderColor: '#666',
    borderRadius: 6, padding: 12
  };
  const BTN = {
    backgroundColor: '#dddddd',
    borderWidth: 3, borderColor: '#444',
    borderRadius: 6, paddingVertical: 8, paddingHorizontal: 12,
    alignItems: 'center', justifyContent: 'center'
  };
  const BTN_PRIMARY = { ...BTN, backgroundColor: '#cfe3ff', borderColor: '#446b9f' };
  const BTN_SUCCESS = { ...BTN, backgroundColor: '#cfeccf', borderColor: '#3a7a3a' };
  const BTN_WARN    = { ...BTN, backgroundColor: '#fff6cc', borderColor: '#d1b100' };
  const BTN_DANGER  = { ...BTN, backgroundColor: '#ffd6d6', borderColor: '#b83a3a' };
  const CHIP = (active) => ({
    paddingVertical: 6, paddingHorizontal: 10,
    backgroundColor: active ? '#cfe3ff' : '#eee',
    borderWidth: 3, borderColor: active ? '#446b9f' : '#888',
    borderRadius: 6, marginRight: 6, marginBottom: 6
  });
  const INPUT = {
    backgroundColor: '#fff',
    borderWidth: 3, borderColor: '#666',
    borderRadius: 6, paddingVertical: 8, paddingHorizontal: 10
  };

  // ===== Data helpers =====
  const openNewMeal = (cat) => {
    setMealName('');
    setMealCategory(cat || 'Breakfast');
    setIngredients([]);
    setIngredientInput('');
    setEditingMealIndex(null);
    setEditorVisible(true);
  };

  const openEditMeal = (index) => {
    const meal = mealsData[index];
    setMealName(meal.name);
    setMealCategory(meal.category);
    setIngredients([...(meal.ingredients || [])]);
    setIngredientInput('');
    setEditingMealIndex(index);
    setEditorVisible(true);
  };

  const saveMeal = () => {
    if (!mealName.trim()) return Alert.alert('Please enter a meal name');
    if (ingredients.length === 0) return Alert.alert('Please add at least one ingredient');
    const baseFav = (editingMealIndex !== null && mealsData[editingMealIndex]?.favorite) || false;
    const newMeal = { name: mealName.trim(), category: mealCategory, ingredients, favorite: baseFav };

    if (editingMealIndex !== null) {
      const updated = [...mealsData];
      updated[editingMealIndex] = newMeal;
      setMealsData(updated);
    } else {
      setMealsData([...mealsData, newMeal]);
    }
    setEditorVisible(false);
  };

  const addIngredient = () => {
    const v = ingredientInput.trim();
    if (!v) return;
    setIngredients(prev => [...prev, v]);
    setIngredientInput('');
  };

  const editIngredient = (i) => {
    const v = ingredients[i];
    setIngredientInput(v);
    setIngredients(prev => prev.filter((_, idx) => idx !== i));
  };

  const deleteIngredient = (i) => {
    setIngredients(prev => prev.filter((_, idx) => idx !== i));
  };

  const deleteMeal = (i) => {
    Alert.alert('Delete Meal?', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: () => setMealsData(mealsData.filter((_, idx) => idx !== i))
      }
    ]);
  };

  const toggleFav = (i) => {
    const updated = [...mealsData];
    updated[i] = { ...updated[i], favorite: !updated[i].favorite };
    setMealsData(updated);
  };

  // Sort favorites first, but keep original index for edit/delete operations
  const sorted = mealsData
    .map((m, idx) => ({ m, idx }))
    .sort((a, b) => (b.m.favorite ? -1 : 0) - (a.m.favorite ? -1 : 0));

  // ===== UI =====
  return (
    <View style={{ flex: 1, backgroundColor: '#d9d9d9', padding: 10 }}>
      <ScrollView style={{ flex: 1 }}>
        {/* Header panel */}
        <View style={{ ...PANEL, marginBottom: 10 }}>
          <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#111' }}>Meals</Text>
        </View>

        {/* Category sections */}
        {categories.map(cat => (
          <View key={cat} style={{ marginVertical: 8 }}>
            {/* Section header: retro toggle + add */}
            <View style={{ ...PANEL, paddingVertical: 8, paddingHorizontal: 10 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <TouchableOpacity
                  onPress={() => setOpen(prev => ({ ...prev, [cat]: !prev[cat] }))}
                  style={{ ...BTN, paddingVertical: 6, paddingHorizontal: 10 }}
                >
                  <Text style={{ fontWeight: 'bold', color: '#111' }}>
                    {open[cat] ? '▾ ' : '▸ '}{cat}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => openNewMeal(cat)} style={BTN_SUCCESS}>
                  <Text style={{ fontWeight: 'bold', color: '#1f4e1f' }}>+ Add</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Section body */}
            {open[cat] && (
              sorted
                .filter(({ m }) => m.category === cat)
                .map(({ m, idx: trueIndex }, i) => (
                  <View key={`${m.name}-${i}`} style={{ ...PANEL, marginTop: 8 }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>
                      {m.name}{m.favorite ? ' ★' : ''}
                    </Text>

                    <ScrollView style={{ maxHeight: 120 }}>
                      {(m.ingredients || []).map((ing, j) => (
                        <View key={j} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                          <View style={{ width: 10, height: 10, backgroundColor: '#333', marginRight: 8 }} />
                          <Text style={{ color: '#111' }}>- {ing}</Text>
                        </View>
                      ))}
                    </ScrollView>

                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: 8, rowGap: 8, marginTop: 10 }}>
                      <TouchableOpacity onPress={() => openEditMeal(trueIndex)} style={BTN_PRIMARY}>
                        <Text style={{ fontWeight: 'bold', color: '#18324f' }}>Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => deleteMeal(trueIndex)} style={BTN_DANGER}>
                        <Text style={{ fontWeight: 'bold', color: '#6d1515' }}>Delete</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => toggleFav(trueIndex)} style={BTN_WARN}>
                        <Text style={{ fontWeight: 'bold', color: '#5c4a00' }}>{m.favorite ? 'Unfav' : 'Fav'}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
            )}
          </View>
        ))}
      </ScrollView>

      {/* ===== Editor Modal (Retro) ===== */}
      {editorVisible && (
        <Modal visible animationType="slide">
          <SafeAreaView style={{ flex: 1, backgroundColor: '#d9d9d9' }}>
            <KeyboardAvoidingView
              style={{ flex: 1, paddingHorizontal: 12, paddingTop: 12 }}
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
              <ScrollView>
                <View style={{ ...PANEL, marginBottom: 10 }}>
                  <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>
                    {editingMealIndex !== null ? 'Edit Meal' : 'Add Meal'}
                  </Text>

                  <TextInput
                    style={{ ...INPUT, marginBottom: 10 }}
                    placeholder="Meal Name"
                    value={mealName}
                    onChangeText={setMealName}
                  />

                  <Text style={{ marginBottom: 6, color: '#111' }}>Category</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 }}>
                    {categories.map(cat => (
                      <TouchableOpacity
                        key={cat}
                        onPress={() => setMealCategory(cat)}
                        style={CHIP(mealCategory === cat)}
                      >
                        <Text style={{ color: '#111' }}>{cat}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={{ marginBottom: 6, color: '#111' }}>Ingredients</Text>
                  <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                    <TextInput
                      style={{ ...INPUT, flex: 1 }}
                      placeholder="Add Ingredient"
                      value={ingredientInput}
                      onChangeText={setIngredientInput}
                      onSubmitEditing={addIngredient}
                      returnKeyType="done"
                    />
                    <TouchableOpacity onPress={addIngredient} style={{ ...BTN_SUCCESS, marginLeft: 8 }}>
                      <Text style={{ fontWeight: 'bold', color: '#1f4e1f' }}>Add</Text>
                    </TouchableOpacity>
                  </View>

                  <ScrollView style={{ maxHeight: 220, marginBottom: 12 }}>
                    {ingredients.map((ing, idx) => (
                      <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                        <View style={{ width: 10, height: 10, backgroundColor: '#333', marginRight: 8 }} />
                        <Text style={{ color: '#111' }}>{ing}</Text>
                        <View style={{ marginLeft: 'auto', flexDirection: 'row', columnGap: 8 }}>
                          <TouchableOpacity onPress={() => editIngredient(idx)} style={BTN_PRIMARY}>
                            <Text style={{ fontWeight: 'bold', color: '#18324f' }}>Edit</Text>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => deleteIngredient(idx)} style={BTN_DANGER}>
                            <Text style={{ fontWeight: 'bold', color: '#6d1515' }}>Del</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </ScrollView>

                  <View style={{ flexDirection: 'row', columnGap: 10 }}>
                    <TouchableOpacity onPress={saveMeal} style={{ ...BTN_SUCCESS, flex: 1 }}>
                      <Text style={{ fontWeight: 'bold', color: '#1f4e1f' }}>
                        {editingMealIndex !== null ? 'Update Meal' : 'Save Meal'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setEditorVisible(false)} style={{ ...BTN, flex: 1 }}>
                      <Text style={{ fontWeight: 'bold', color: '#222' }}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </Modal>
      )}
    </View>
  );
}