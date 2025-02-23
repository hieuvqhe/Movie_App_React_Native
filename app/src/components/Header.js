import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  FlatList,
  Image 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { searchMovies } from '../api/movieApi';

const BASE_IMAGE_URL = 'https://phimimg.com';

const Header = () => {
  const [showSearch, setShowSearch] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();
  const mounted = useRef(true);

  useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);

  const getFullImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${BASE_IMAGE_URL}/${url}`;
  };

  const handleSearch = useCallback(async (text) => {
    setSearchText(text);
    if (text.length > 1) {
      setIsSearching(true);
      try {
        const response = await searchMovies(text);
        if (mounted.current && response.status === 'success') {
          setSearchResults(response.data.items);
          setShowDropdown(true);
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchResults([]);
      setShowDropdown(false);
    }
  }, []);

  const handleMovieSelect = (movie) => {
    setShowDropdown(false);
    setShowSearch(false);
    setSearchText('');
    router.push(`/movie-detail?slug=${movie.slug}`);
  };

  const handleSubmitSearch = useCallback(async () => {
    if (searchText.length <= 1) return;

    setIsSearching(true);
    try {
      const response = await searchMovies(searchText);
      if (response.status === 'success') {
        router.push({
          pathname: '/search',
          params: {
            keyword: searchText,
            results: JSON.stringify(response.data.items),
            totalResults: response.data.params.pagination.totalItems
          }
        });
        setShowSearch(false);
        setSearchText('');
        setShowDropdown(false);
      } else {
        Alert.alert('Thông báo', 'Không tìm thấy kết quả phù hợp');
      }
    } catch (error) {
      Alert.alert('Lỗi Tìm Kiếm', error.message);
    } finally {
      setIsSearching(false);
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
      {!showSearch ? (
        <View style={styles.titleContainer}>
          <Text style={styles.logo}>PHIMHAY</Text>
          <TouchableOpacity 
            onPress={() => setShowSearch(true)}
            style={styles.searchButton}
          >
            <Ionicons name="search" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      ) : (
        <View>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm phim..."
              placeholderTextColor="#666"
              value={searchText}
              onChangeText={handleSearch}
              onSubmitEditing={handleSubmitSearch}
              autoFocus
            />
            <TouchableOpacity 
              onPress={() => {
                setShowSearch(false);
                setSearchText('');
                setShowDropdown(false);
              }}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          
          {showDropdown && searchResults.length > 0 && (
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
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e50914',
    letterSpacing: 1,
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
  },
  closeButton: {
    padding: 8,
  },
  dropdownContainer: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    marginHorizontal: 16,
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
});

export default Header;