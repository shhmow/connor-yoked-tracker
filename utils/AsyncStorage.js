import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { View, TextInput, Text, Button } from 'react-native';

export default function App() {
  const [text, setText] = useState("");

  useEffect(() => {
    // Load saved data when the app starts
    AsyncStorage.getItem("savedText").then(value => {
      if (value) setText(value);
    });
  }, []);

  const saveData = async () => {
    await AsyncStorage.setItem("savedText", text);
  };

  return (
    <View style={{ marginTop: 50, padding: 20 }}>
      <Text>Type something:</Text>
      <TextInput
        value={text}
        onChangeText={setText}
        style={{ borderWidth: 1, padding: 10 }}
      />
      <Button title="Save" onPress={saveData} />
    </View>
  );
}
