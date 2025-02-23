import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const MovieDetailScreen = ({ route }) => {
  const { slug } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Movie Detail Screen: {slug}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 16,
  },
  text: {
    color: '#fff',
    fontSize: 16,
  },
});

export default MovieDetailScreen;