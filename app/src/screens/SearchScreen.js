import React from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  Image, 
  StyleSheet, 
  TouchableOpacity,
  Dimensions 
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 2;
const ITEM_WIDTH = (width - 40) / COLUMN_COUNT;
const BASE_IMAGE_URL = 'https://phimimg.com';
const DEFAULT_IMAGE = 'https://placehold.co/300x450/000000/FFFFFF/png';

const SearchScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const parseResults = () => {
    try {
      if (!params.results) return [];
      
      if (Array.isArray(params.results)) {
        return params.results;
      }
      
      if (typeof params.results === 'string') {
        return JSON.parse(params.results);
      }
      
      if (typeof params.results === 'object') {
        return Object.values(params.results);
      }
      
      return [];
    } catch (error) {
      console.error('Error parsing results:', error);
      return [];
    }
  };

  const results = parseResults();
  const searchQuery = params.searchQuery || '';
  const totalResults = params.totalResults || 0;

  const getFullImageUrl = (url) => {
    if (!url) return DEFAULT_IMAGE;
    if (url.startsWith('http')) return url;
    return `${BASE_IMAGE_URL}/${url}`;
  };

  const renderMovie = ({ item }) => {
    if (!item) return null;

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
          defaultSource={{ uri: DEFAULT_IMAGE }}
        />
        <View style={styles.movieInfo}>
          <Text style={styles.movieTitle} numberOfLines={2}>
            {item.name || 'Không có tên'}
          </Text>
          {item.origin_name && (
            <Text style={styles.originalTitle} numberOfLines={1}>
              {item.origin_name}
            </Text>
          )}
          <View style={styles.metaInfo}>
            {item.year && (
              <Text style={styles.year}>{item.year}</Text>
            )}
            {item.quality && (
              <Text style={styles.quality}>{item.quality}</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (!results || results.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.noResults}>Không tìm thấy kết quả</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.searchHeader}>
        Kết quả tìm kiếm: "{searchQuery}"
      </Text>
      <Text style={styles.resultCount}>
        Tìm thấy {totalResults} kết quả
      </Text>

      <FlatList
        data={results}
        renderItem={renderMovie}
        keyExtractor={item => item?._id?.toString() || Math.random().toString()}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.centerContent}>
            <Text style={styles.noResults}>Không có kết quả phù hợp</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchHeader: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    padding: 15,
  },
  resultCount: {
    color: '#888',
    fontSize: 14,
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  listContent: {
    padding: 10,
  },
  movieCard: {
    flex: 1,
    margin: 5,
    maxWidth: '50%',
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    overflow: 'hidden',
  },
  movieImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#333',
  },
  movieInfo: {
    padding: 8,
  },
  movieTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  originalTitle: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },
  metaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    alignItems: 'center',
  },
  year: {
    color: '#666',
    fontSize: 12,
  },
  quality: {
    color: '#e50914',
    fontSize: 12,
    fontWeight: 'bold',
    backgroundColor: 'rgba(229, 9, 20, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  noResults: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default SearchScreen;