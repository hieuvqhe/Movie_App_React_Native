import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

const MovieCard = ({ movie, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image
        source={{ uri: movie.thumb_url }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>{movie.name}</Text>
        <Text style={styles.originalTitle} numberOfLines={1}>{movie.origin_name}</Text>
        <Text style={styles.year}>{movie.year}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#1a1a1a',
    marginVertical: 5,
    borderRadius: 8,
  },
  image: {
    width: 100,
    height: 150,
    borderRadius: 8,
  },
  info: {
    flex: 1,
    marginLeft: 10,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  originalTitle: {
    fontSize: 14,
    color: '#999',
    marginBottom: 5,
  },
  year: {
    fontSize: 14,
    color: '#666',
  },
});

export default MovieCard; 