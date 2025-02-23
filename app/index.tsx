import React, { useEffect } from 'react';
import { View, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import Banner from './src/components/Banner';
import CategoryRow from './src/components/CategoryRow';
import Header from './src/components/Header';
import useMovieStore from './src/store/movieStore';

export default function Home() {
  const { 
    fetchNewMovies,
    fetchCategoryMovies,
    newMovies,
    singleMovies,
    seriesMovies,
    animeMovies,
    tvShowMovies,
    vietsubMovies,
    longTiengMovies
  } = useMovieStore();

  useEffect(() => {
    fetchNewMovies();
    fetchCategoryMovies('phim-le');
    fetchCategoryMovies('phim-bo');
    fetchCategoryMovies('hoat-hinh');
    fetchCategoryMovies('tv-shows');
    fetchCategoryMovies('phim-vietsub');
    fetchCategoryMovies('phim-long-tieng');
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Header />
      </View>
      <View style={styles.contentContainer}>
        <ScrollView>
          <Banner movies={newMovies} />
          <CategoryRow 
            title="Phim Mới Cập Nhật" 
            movies={newMovies} 
            category="new-movies"
          />
          <CategoryRow 
            title="Phim Lẻ" 
            movies={singleMovies} 
            category="phim-le"
          />
          <CategoryRow 
            title="Phim Bộ" 
            movies={seriesMovies} 
            category="phim-bo"
          />
          <CategoryRow 
            title="Hoạt Hình" 
            movies={animeMovies} 
            category="hoat-hinh"
          />
          <CategoryRow 
            title="TV Shows" 
            movies={tvShowMovies} 
            category="tv-shows"
          />
          <CategoryRow 
            title="Phim Vietsub" 
            movies={vietsubMovies} 
            category="phim-vietsub"
          />
          <CategoryRow 
            title="Phim Lồng Tiếng" 
            movies={longTiengMovies} 
            category="phim-long-tieng"
          />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  headerContainer: {
    zIndex: 1,
    elevation: 1,
  },
  contentContainer: {
    flex: 1,
  },
});