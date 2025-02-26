import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, SafeAreaView, Animated, StatusBar, Platform } from 'react-native';
import Banner from './src/components/Banner';
import CategoryRow from './src/components/CategoryRow';
import Header from './src/components/Header';
import SearchBar from './src/components/SearchBar';
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

  // Reference to track if dropdown is visible
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  useEffect(() => {
    fetchNewMovies();
    fetchCategoryMovies('phim-le');
    fetchCategoryMovies('phim-bo');
    fetchCategoryMovies('hoat-hinh');
    fetchCategoryMovies('tv-shows');
    fetchCategoryMovies('phim-vietsub');
    fetchCategoryMovies('phim-long-tieng');
  }, []);

  // Adjusted constants for proper positioning
  const SEARCH_BAR_HEIGHT = 60;
  const HEADER_HEIGHT = 60; 
  const STATUS_BAR_HEIGHT = StatusBar.currentHeight || 0;
  const SCROLL_THRESHOLD = 10;

  // Animation values
  const scrollY = useRef(new Animated.Value(0)).current;
  const [isSearchBarVisible, setIsSearchBarVisible] = useState(true);
  const lastScrollY = useRef(0);
  const searchBarTranslateY = useRef(new Animated.Value(0)).current;

  // Derived animated values using interpolation for smoother animations
  const searchBarOpacity = scrollY.interpolate({
    inputRange: [0, SCROLL_THRESHOLD * 2, SCROLL_THRESHOLD * 4],
    outputRange: [1, 0.5, 0],
    extrapolate: 'clamp',
  });

  const searchBarScale = scrollY.interpolate({
    inputRange: [0, SCROLL_THRESHOLD * 2],
    outputRange: [1, 0.95],
    extrapolate: 'clamp',
  });

  // Enhanced scroll handler with modifications to respect dropdown
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { 
      useNativeDriver: false,
      listener: (event: { nativeEvent: { contentOffset: { y: number } } }) => {
        const currentScrollY = event.nativeEvent.contentOffset.y;
        
        // Don't hide search bar if dropdown is visible
        if (isDropdownVisible) {
          if (!isSearchBarVisible) {
            Animated.spring(searchBarTranslateY, {
              toValue: 0,
              useNativeDriver: true,
              bounciness: 0,
              speed: 15,
            }).start();
            setIsSearchBarVisible(true);
          }
          lastScrollY.current = currentScrollY;
          return;
        }

        // Special case: Always show search bar when at or near the top
        if (currentScrollY <= 5) {
          if (!isSearchBarVisible) {
            Animated.spring(searchBarTranslateY, {
              toValue: 0,
              useNativeDriver: true,
              bounciness: 0,
              speed: 15,
            }).start();
            setIsSearchBarVisible(true);
          }
          lastScrollY.current = currentScrollY;
          return;
        }
        
        const scrollDiff = currentScrollY - lastScrollY.current;

        // Only trigger animation if scroll difference exceeds threshold
        if (Math.abs(scrollDiff) > SCROLL_THRESHOLD) {
          if (scrollDiff > 0 && isSearchBarVisible) {
            // Scrolling down - hide search bar with animation
            Animated.spring(searchBarTranslateY, {
              toValue: -SEARCH_BAR_HEIGHT,
              useNativeDriver: true,
              bounciness: 0,
              speed: 12,
            }).start();
            setIsSearchBarVisible(false);
          } else if (scrollDiff < 0 && !isSearchBarVisible) {
            // Scrolling up - show search bar with animation
            Animated.spring(searchBarTranslateY, {
              toValue: 0,
              useNativeDriver: true,
              bounciness: 4,
              speed: 12,
            }).start();
            setIsSearchBarVisible(true);
          }
          lastScrollY.current = currentScrollY;
        }
      }
    }
  );

  // Recalculate proper heights considering status bar
  const safeAreaTopPadding = Platform.OS === 'ios' ? 30 : STATUS_BAR_HEIGHT;
  const totalHeaderHeight = HEADER_HEIGHT + SEARCH_BAR_HEIGHT + safeAreaTopPadding - 40;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      
      {/* Fixed Header with proper positioning */}
      <View style={[
        styles.headerContainer, 
        { 
          top: safeAreaTopPadding,
          height: HEADER_HEIGHT
        }
      ]}>
        <Header />
      </View>

      {/* Search Bar positioned correctly with higher zIndex to support dropdown */}
      <Animated.View 
        style={[
          styles.searchBarContainer,
          { 
            transform: [
              { translateY: searchBarTranslateY },
              { scale: searchBarScale }
            ],
            opacity: searchBarOpacity,
            top: safeAreaTopPadding + HEADER_HEIGHT, // Position below header
            height: SEARCH_BAR_HEIGHT,
            // Make sure this container stays above all other content
            zIndex: isDropdownVisible ? 1002 : 999,
          }
        ]}
      >
        <SearchBar 
          onDropdownVisibilityChange={setIsDropdownVisible} 
        />
      </Animated.View>

      <Animated.ScrollView 
        style={[
          styles.contentContainer,
          // Lower z-index when dropdown is visible
          { zIndex: isDropdownVisible ? 900 : 998 }
        ]}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ 
          paddingTop: totalHeaderHeight, // Use recalculated height
          paddingBottom: 20
        }}
        bounces={true}
        showsVerticalScrollIndicator={false}
      >
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
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  headerContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: '#1a1a1a',
    borderBottomColor: '#333',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  searchBarContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 10,
    paddingVertical: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    // Ensure no extra space
    overflow: 'visible', // <-- Changed to visible to allow dropdown to be seen
  },
  contentContainer: {
    flex: 1,
  },
});