import React, { useState, useCallback, useRef } from 'react';
import { 
  View, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  FlatList,
  Text,
  Image,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { searchMovies } from '../api/movieApi';

const BASE_IMAGE_URL = 'https://phimimg.com';

const SearchBar = () => {
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const mounted = useRef(true);
  const searchTimeout = useRef(null);

  const getFullImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${BASE_IMAGE_URL}/${url}`;
  };

  const handleSearch = useCallback(async (text) => {
    setSearchText(text);
    
    // Clear previous timeout if exists
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    // If text is empty, clear results and hide dropdown
    if (!text.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      setIsLoading(false);
      return;
    }

    // Show loading indicator
    setIsLoading(true);

    // Add delay before making API call
    searchTimeout.current = setTimeout(async () => {
      if (text.length > 1) {
        try {
          const response = await searchMovies(text);
          if (mounted.current && response.status === 'success') {
            setSearchResults(response.data.items);
            setShowDropdown(true);
          }
        } catch (error) {
          console.error('Search error:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setSearchResults([]);
        setShowDropdown(false);
        setIsLoading(false);
      }
    }, 500); // 500ms delay
  }, []);

  const handleMovieSelect = (movie) => {
    setShowDropdown(false);
    setSearchText('');
    router.push(`/movie-detail?slug=${movie.slug}`);
  };

  const handleSubmitSearch = useCallback(async () => {
    if (searchText.length <= 1) return;

    try {
      const response = await searchMovies(searchText);
      if (response.status === 'success') {
        router.push({
          pathname: '/search',
          params: {
            searchQuery: searchText,
            results: JSON.stringify(response.data.items),
            totalResults: response.data.params.pagination.totalItems
          }
        });
        setSearchText('');
        setShowDropdown(false);
      } else {
        Alert.alert('Thông báo', 'Không tìm thấy kết quả phù hợp');
      }
    } catch (error) {
      Alert.alert('Lỗi Tìm Kiếm', error.message);
    }
  }, [searchText, router]);

  const renderSearchItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.searchItem} 
      onPress={() => handleMovieSelect(item)}
    >
      <Image 
        source={{ uri: getFullImageUrl(item.thumb_url) }}
        style={styles.searchItemImage}
      />
      <View style={styles.searchItemInfo}>
        <Text style={styles.searchItemTitle} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.searchItemSubtitle} numberOfLines={1}>
          {item.origin_name} ({item.year})
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm phim..."
          placeholderTextColor="#666"
          value={searchText}
          onChangeText={handleSearch}
          onSubmitEditing={handleSubmitSearch}
        />
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="#fff" size="small" />
          </View>
        ) : (
          <TouchableOpacity 
            onPress={handleSubmitSearch}
            style={styles.searchButton}
          >
            <Ionicons name="search" size={24} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      {showDropdown && searchResults.length > 0 && searchText.trim() !== '' && (
        <View style={styles.dropdownContainer}>
          <FlatList
            data={searchResults.slice(0, 5)}
            renderItem={renderSearchItem}
            keyExtractor={item => item._id}
            style={styles.dropdown}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    zIndex: 999,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#333',
    borderRadius: 20,
    paddingHorizontal: 16,
    color: '#fff',
    marginRight: 10,
  },
  searchButton: {
    padding: 8,
    backgroundColor: '#333',
    borderRadius: 20,
  },
  dropdownContainer: {
    position: 'absolute',
    top: 60,
    left: 12,
    right: 12,
    backgroundColor: '#262626',
    borderRadius: 8,
    maxHeight: 300,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  dropdown: {
    borderRadius: 8,
  },
  searchItem: {
    flexDirection: 'row',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  searchItemImage: {
    width: 50,
    height: 70,
    borderRadius: 4,
  },
  searchItemInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  searchItemTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  searchItemSubtitle: {
    color: '#999',
    fontSize: 12,
    marginTop: 4,
  },
  loadingContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#333',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SearchBar; 