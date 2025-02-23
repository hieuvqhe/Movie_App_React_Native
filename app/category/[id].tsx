import React, { useEffect } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, Text, TouchableOpacity, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import useMovieStore from '../src/store/movieStore';

const BASE_IMAGE_URL = 'https://phimimg.com';

const CategoryTitles: Record<string, string> = {
  'phim-le': 'Phim Lẻ',
  'phim-bo': 'Phim Bộ',
  'hoat-hinh': 'Hoạt Hình',
  'tv-shows': 'TV Shows',
  'phim-moi-cap-nhat': 'Phim Mới Cập Nhật',
  'phim-vietsub': 'Phim Vietsub',
  'phim-long-tieng': 'Phim Lồng Tiếng'
};

interface Movie {
  _id: string;
  name: string;
  thumb_url: string;
  poster_url: string;
  slug: string;
}

export default function CategoryList() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { loading, categoryMovies, fetchAllCategoryMovies, loadMoreCategoryMovies, hasMore } = useMovieStore();

  useEffect(() => {
    if (id) {
      fetchAllCategoryMovies(id.toString());
    }
  }, [id]);

  const handleLoadMore = () => {
    if (id && !loading && hasMore) {
      loadMoreCategoryMovies(id.toString());
    }
  };

  const getFullImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${BASE_IMAGE_URL}/${url}`;
  };

  const renderMovie = ({ item }: { item: Movie }) => {
    const imageUrl = getFullImageUrl(item.thumb_url || item.poster_url);

    return (
      <TouchableOpacity 
        style={styles.movieCard}
        onPress={() => router.push(`/movie-detail?slug=${item.slug}`)}
      >
        <Image
          source={{ uri: imageUrl }}
          style={styles.movieImage}
          resizeMode="cover"
        />
        <Text style={styles.movieTitle} numberOfLines={2}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.categoryTitle}>
        {CategoryTitles[id.toString()] || 'Danh sách phim'}
      </Text>
      <FlatList
        data={categoryMovies}
        renderItem={renderMovie}
        keyExtractor={item => item._id}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={() => loading && <ActivityIndicator color="#fff" size="large" />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  categoryTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    padding: 15,
  },
  listContent: {
    padding: 10,
  },
  movieCard: {
    flex: 1,
    margin: 5,
    maxWidth: '50%',
  },
  movieImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: '#1a1a1a',
  },
  movieTitle: {
    color: '#fff',
    fontSize: 14,
    marginTop: 5,
    textAlign: 'center',
  },
});