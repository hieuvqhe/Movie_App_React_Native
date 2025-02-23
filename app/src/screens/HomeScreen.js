import React, { useEffect } from 'react';
import { View, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import MovieCard from '../components/MovieCard';
import useMovieStore from '../store/movieStore';

const HomeScreen = ({ navigation }) => {
  const { movies, loading, fetchMovies, loadMore } = useMovieStore();

  useEffect(() => {
    fetchMovies();
  }, []);

  const handleLoadMore = () => {
    if (!loading) {
      loadMore();
      fetchMovies();
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={movies}
        renderItem={({ item }) => (
          <MovieCard
            movie={item}
            onPress={() => navigation.navigate('MovieDetail', { slug: item.slug })}
          />
        )}
        keyExtractor={item => item._id}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={() => loading && <ActivityIndicator />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 10,
  },
});

export default HomeScreen;