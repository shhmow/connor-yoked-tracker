
// components/GoonBar.js
import React from 'react';
import { View, Text } from 'react-native';

export default function GoonBar({ label='Progress', value=0, goal=20 }) {
  const pct = Math.max(0, Math.min(100, Math.round((value/Math.max(goal,1))*100)));
  return (
    <View style={{ marginTop: 8 }}>
      <Text style={{ marginBottom: 4 }}>{label}: {pct}%</Text>
      <View style={{ height: 14, backgroundColor: '#dddddd', borderWidth: 3, borderColor: '#777', borderRadius: 6 }}>
        <View style={{ width: `${pct}%`, height: '100%', backgroundColor: '#66aaff', borderRightWidth: 2, borderRightColor: '#0055cc' }} />
      </View>
    </View>
  );
}
