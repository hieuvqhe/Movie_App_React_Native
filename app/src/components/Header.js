import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router'; // Thay đổi import này
import { searchMovies } from '../api/movieApi';

const Header = () => {
  const [showSearch, setShowSearch] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();
  const mounted = useRef(true);

  useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);

  const handleCloseSearch = () => {
    setShowSearch(false);
    setSearchText('');
  };

  const handleSubmitSearch = useCallback(async () => {
    if (searchText.length <= 1) {
      Alert.alert('Thông báo', 'Vui lòng nhập ít nhất 2 ký tự');
      return;
    }

    try {
      setIsSearching(true);
      router.push({
        pathname: '/search',
        params: { keyword: searchText }
      });
      handleCloseSearch();
    } catch (error) {
      Alert.alert('Lỗi Tìm Kiếm', error.message);
    } finally {
      setIsSearching(false);
    }
  }, [searchText, router]);

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
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm phim..."
            placeholderTextColor="#666"
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSubmitSearch}
            autoFocus
          />
          <TouchableOpacity 
            onPress={handleCloseSearch}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
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
});

export default Header;