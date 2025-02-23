import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';

const BASE_IMAGE_URL = 'https://phimimg.com';

const CategoryRow = ({ title, movies, category }) => {
  const router = useRouter();

  const getCategorySlug = (cat) => {
    switch (cat) {
      case 'new-movies':
        return 'phim-moi-cap-nhat';
      case 'phim-le':
      case 'phim-bo':
      case 'hoat-hinh':
      case 'tv-shows':
      case 'phim-vietsub':
      case 'phim-long-tieng':
        return cat;
      default:
        return cat;
    }
  };

  const getFullImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${BASE_IMAGE_URL}/${url}`;
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.movieCard}
      onPress={() => router.push(`/movie-detail?slug=${item.slug}`)}
    >
      <Image
        source={{ uri: getFullImageUrl(item.thumb_url || item.poster_url) }}
        style={styles.movieImage}
        resizeMode="cover"
      />
      <Text style={styles.movieTitle} numberOfLines={2}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <TouchableOpacity 
          onPress={() => router.push(`/category/${getCategorySlug(category)}`)}
          style={styles.viewAll}
        >
          <Text style={styles.viewAllText}>Xem tất cả</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={movies}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  viewAll: {
    padding: 5,
  },
  viewAllText: {
    color: '#e50914',
    fontSize: 14,
  },
  listContent: {
    paddingHorizontal: 10,
  },
  movieCard: {
    width: 120,
    marginHorizontal: 5,
  },
  movieImage: {
    width: 120,
    height: 180,
    borderRadius: 8,
    backgroundColor: '#1a1a1a', // Màu nền khi ảnh đang load
  },
  movieTitle: {
    color: '#fff',
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center',
  },
});

export default CategoryRow;