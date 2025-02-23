import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, ImageBackground, TouchableOpacity, FlatList } from 'react-native';
import { useRouter } from 'expo-router';

const { width: screenWidth } = Dimensions.get('window');

const Banner = ({ movies }) => {
  const router = useRouter();
  const flatListRef = useRef(null);
  const carouselMovies = movies?.slice(0, 5) || [];

  // Auto scroll
  useEffect(() => {
    let currentIndex = 0;
    const intervalId = setInterval(() => {
      if (currentIndex === carouselMovies.length - 1) {
        currentIndex = 0;
      } else {
        currentIndex += 1;
      }

      flatListRef.current?.scrollToIndex({
        index: currentIndex,
        animated: true
      });
    }, 5000);

    return () => clearInterval(intervalId);
  }, [carouselMovies.length]);

  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity
        onPress={() => router.push(`/movie-detail?slug=${item.slug}`)}
        activeOpacity={0.9}
        style={styles.slideContainer}
      >
        <ImageBackground
          source={{ uri: item.poster_url || item.thumb_url }}
          style={styles.bannerImage}
          resizeMode="cover"
        >
          <View style={styles.overlay}>
            <View style={styles.textContainer}>
              <Text style={styles.title} numberOfLines={2}>
                {item.name}
              </Text>
              <Text style={styles.year}>{item.year}</Text>
            </View>
          </View>
        </ImageBackground>
      </TouchableOpacity>
    );
  };

  if (!movies || movies.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={carouselMovies}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item._id}
        onScrollToIndexFailed={info => {
          const wait = new Promise(resolve => setTimeout(resolve, 500));
          wait.then(() => {
            flatListRef.current?.scrollToIndex({
              index: info.index,
              animated: true
            });
          });
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 250,
    backgroundColor: '#000',
  },
  slideContainer: {
    width: screenWidth,
    height: 250,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '100%',
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  textContainer: {
    padding: 20,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  year: {
    color: '#ccc',
    fontSize: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
});

export default Banner;