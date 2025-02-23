import React from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import SearchScreen from './src/screens/SearchScreen';

export default function SearchRoute() {
  const params = useLocalSearchParams();
  return (
    <View style={{ flex: 1 }}>
      <SearchScreen {...params} />
    </View>
  );
}
