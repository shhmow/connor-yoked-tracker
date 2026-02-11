// screens/WorkoutsScreen.js — Retro Square UI
import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Modal, TextInput, Alert,
  SafeAreaView, KeyboardAvoidingView, Platform
} from 'react-native';

export default function WorkoutsScreen({ workoutsData, setWorkoutsData }) {
  const [editorVisible, setEditorVisible] = useState(false);
  const [editingWorkoutIndex, setEditingWorkoutIndex] = useState(null);
  const [workoutName, setWorkoutName] = useState('');
  const [workoutType, setWorkoutType] = useState('Chest');
  const [activityInput, setActivityInput] = useState('');
  const [activities, setActivities] = useState([]);

  const [startVisible, setStartVisible] = useState(false);
  const [currentWorkoutIndex, setCurrentWorkoutIndex] = useState(null);
  const [activityDone, setActivityDone] = useState([]);

  const types = ['Chest','Back','Legs','Arms','Shoulders','Cardio','Full Body'];

  // ===== Helpers: Retro Styles =====
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
  const CHECKBOX = (checked) => ({
    width: 22, height: 22,
    borderWidth: 3, borderColor: '#333',
    backgroundColor: checked ? '#66cc66' : '#fff',
    alignItems: 'center', justifyContent: 'center'
  });

  // ===== Data Ops =====
  const openNewWorkout = () => {
    setWorkoutName('');
    setWorkoutType('Chest');
    setActivities([]);
    setActivityInput('');
    setEditingWorkoutIndex(null);
    setEditorVisible(true);
  };
  const openEditWorkout = (index) => {
    const w = workoutsData[index];
    setWorkoutName(w.name);
    setWorkoutType(w.type);
    setActivities([...(w.activities || [])]);
    setActivityInput('');
    setEditingWorkoutIndex(index);
    setEditorVisible(true);
  };

  const saveWorkout = () => {
    if (!workoutName.trim()) return Alert.alert('Please enter a workout name');
    if (activities.length === 0) return Alert.alert('Please add at least one activity');
    const baseFav = (editingWorkoutIndex !== null && workoutsData[editingWorkoutIndex]?.favorite) || false;
    const newWorkout = { name: workoutName.trim(), type: workoutType, activities, favorite: baseFav };
    if (editingWorkoutIndex !== null) {
      const updated = [...workoutsData];
      updated[editingWorkoutIndex] = newWorkout;
      setWorkoutsData(updated);
    } else {
      setWorkoutsData([...workoutsData, newWorkout]);
    }
    setEditorVisible(false);
  };

  const addActivity = () => {
    const v = activityInput.trim();
    if (!v) return;
    setActivities(prev => [...prev, v]);
    setActivityInput('');
  };
  const editActivity = (i) => {
    const v = activities[i];
    setActivityInput(v);
    setActivities(prev => prev.filter((_, idx) => idx !== i));
  };
  const deleteActivity = (i) => setActivities(prev => prev.filter((_, idx) => idx !== i));

  const deleteWorkout = (i) =>
    Alert.alert('Delete Workout?', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => setWorkoutsData(workoutsData.filter((_, idx) => idx !== i)) }
    ]);

  const startWorkout = (i) => {
    setCurrentWorkoutIndex(i);
    setActivityDone(Array(workoutsData[i].activities.length).fill(false));
    setStartVisible(true);
  };
  const toggleDone = (i) =>
    setActivityDone(prev => { const u = [...prev]; u[i] = !u[i]; return u; });
  const resetWorkout = () => setActivityDone(prev => Array(prev.length).fill(false));

  const toggleFav = (i) => {
    const updated = [...workoutsData];
    updated[i] = { ...updated[i], favorite: !updated[i].favorite };
    setWorkoutsData(updated);
  };

  const sorted = [...workoutsData].map((w, idx) => ({ w, idx }))
    .sort((a, b) => (b.w.favorite ? -1 : 0) - (a.w.favorite ? -1 : 0));

  // ===== UI =====
  return (
    <View style={{ flex: 1, backgroundColor: '#d9d9d9', padding: 10 }}>
      <ScrollView>
        {/* Header */}
        <View style={{ ...PANEL, marginBottom: 10 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#111' }}>Workouts</Text>
            <TouchableOpacity onPress={openNewWorkout} style={BTN_SUCCESS}>
              <Text style={{ fontWeight: 'bold', color: '#1f4e1f' }}>+ Add</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Workout Cards */}
        {sorted.map(({ w, idx: trueIndex }, i) => (
          <View key={`${w.name}-${i}`} style={{ ...PANEL, marginBottom: 12 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 6 }}>
              {w.name}{w.favorite ? ' ★' : ''} <Text style={{ fontSize: 14, color: '#333' }}>({w.type})</Text>
            </Text>

            {(w.activities || []).map((act, j) => (
              <View key={j} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <View style={{ width: 10, height: 10, backgroundColor: '#333', marginRight: 8 }} />
                <Text style={{ color: '#111' }}>{act}</Text>
              </View>
            ))}

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: 8, rowGap: 8, marginTop: 8 }}>
              <TouchableOpacity onPress={() => openEditWorkout(trueIndex)} style={BTN_PRIMARY}>
                <Text style={{ fontWeight: 'bold', color: '#18324f' }}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteWorkout(trueIndex)} style={BTN_DANGER}>
                <Text style={{ fontWeight: 'bold', color: '#6d1515' }}>Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => startWorkout(trueIndex)} style={BTN_SUCCESS}>
                <Text style={{ fontWeight: 'bold', color: '#1f4e1f' }}>Start</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => toggleFav(trueIndex)} style={BTN_WARN}>
                <Text style={{ fontWeight: 'bold', color: '#5c4a00' }}>{w.favorite ? 'Unfav' : 'Fav'}</Text>
              </TouchableOpacity>
            </View>
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
                    {editingWorkoutIndex !== null ? 'Edit Workout' : 'Add Workout'}
                  </Text>

                  <TextInput
                    style={{ ...INPUT, marginBottom: 10 }}
                    placeholder="Workout Name"
                    value={workoutName}
                    onChangeText={setWorkoutName}
                  />

                  <Text style={{ marginBottom: 6, color: '#111' }}>Type</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 }}>
                    {types.map(t => (
                      <TouchableOpacity key={t} onPress={() => setWorkoutType(t)} style={CHIP(workoutType === t)}>
                        <Text style={{ color: '#111' }}>{t}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={{ marginBottom: 6, color: '#111' }}>Activities</Text>
                  <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                    <TextInput
                      style={{ ...INPUT, flex: 1 }}
                      placeholder="Add Activity"
                      value={activityInput}
                      onChangeText={setActivityInput}
                      onSubmitEditing={addActivity}
                      returnKeyType="done"
                    />
                    <TouchableOpacity onPress={addActivity} style={{ ...BTN_SUCCESS, marginLeft: 8 }}>
                      <Text style={{ fontWeight: 'bold', color: '#1f4e1f' }}>Add</Text>
                    </TouchableOpacity>
                  </View>

                  <ScrollView style={{ maxHeight: 240, marginBottom: 12 }}>
                    {activities.map((act, idx) => (
                      <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                        <View style={CHECKBOX(false)} />
                        <Text style={{ marginLeft: 10, color: '#111' }}>{act}</Text>
                        <View style={{ marginLeft: 'auto', flexDirection: 'row', columnGap: 8 }}>
                          <TouchableOpacity onPress={() => editActivity(idx)} style={BTN_PRIMARY}>
                            <Text style={{ fontWeight: 'bold', color: '#18324f' }}>Edit</Text>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => deleteActivity(idx)} style={BTN_DANGER}>
                            <Text style={{ fontWeight: 'bold', color: '#6d1515' }}>Del</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </ScrollView>

                  <View style={{ flexDirection: 'row', columnGap: 10 }}>
                    <TouchableOpacity onPress={saveWorkout} style={{ ...BTN_SUCCESS, flex: 1 }}>
                      <Text style={{ fontWeight: 'bold', color: '#1f4e1f' }}>
                        {editingWorkoutIndex !== null ? 'Update Workout' : 'Save Workout'}
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

      {/* ===== Start Workout Modal (Retro) ===== */}
      {startVisible && currentWorkoutIndex !== null && (
        <Modal visible animationType="slide">
          <SafeAreaView style={{ flex: 1, backgroundColor: '#d9d9d9' }}>
            <View style={{ flex: 1, padding: 12 }}>
              <View style={{ ...PANEL, marginBottom: 10 }}>
                <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>
                  {workoutsData[currentWorkoutIndex].name}
                </Text>

                <ScrollView style={{ maxHeight: 420, marginBottom: 10 }}>
                  {workoutsData[currentWorkoutIndex].activities.map((act, i) => (
                    <TouchableOpacity
                      key={i}
                      onPress={() => toggleDone(i)}
                      style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}
                    >
                      <View style={CHECKBOX(activityDone[i])}>
                        {activityDone[i] && <Text style={{ color: '#fff', fontWeight: 'bold' }}>✓</Text>}
                      </View>
                      <Text
                        style={{
                          marginLeft: 10,
                          fontSize: 16,
                          color: '#111',
                          textDecorationLine: activityDone[i] ? 'line-through' : 'none'
                        }}
                      >
                        {act}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <View style={{ flexDirection: 'row', columnGap: 10 }}>
                  <TouchableOpacity onPress={resetWorkout} style={{ ...BTN_PRIMARY, flex: 1 }}>
                    <Text style={{ fontWeight: 'bold', color: '#18324f' }}>Reset</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setStartVisible(false)} style={{ ...BTN, flex: 1 }}>
                    <Text style={{ fontWeight: 'bold', color: '#222' }}>Finish Workout</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </SafeAreaView>
        </Modal>
      )}
    </View>
  );
}