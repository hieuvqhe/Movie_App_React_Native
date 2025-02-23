import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import MovieCard from '../components/MovieCard';
import { getCategoryMovies } from '../api/movieApi';

const CategoryListScreen = ({ route, navigation }) => {
  const { category, title } = route.params;
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchMovies = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const response = await getCategoryMovies(category, page);
      const newMovies = response.data.items || [];
      if (newMovies.length === 0) {
        setHasMore(false);
      } else {
        setMovies(prev => [...prev, ...newMovies]);
        setPage(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error fetching category movies:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, [category]);

  return (
    <View style={styles.container}>
      <FlatList
        data={movies}
        renderItem={({ item }) => (
          <MovieCard
            movie={item}
            onPress={() => navigation.navigate('MovieDetail', { 
              slug: item.slug,
              title: item.name 
            })}
          />
        )}
        keyExtractor={item => item._id}
        numColumns={2}
        onEndReached={fetchMovies}
        onEndReachedThreshold={0.5}
        ListFooterComponent={() => loading && <ActivityIndicator color="#fff" />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 10,
  },
});

export default CategoryListScreen;
