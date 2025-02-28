import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { getFavoriteMovies, removeFavorite } from './src/api/userApi';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width / 2 - 24; // Two cards per row with padding

interface Movie {
  id: string;
  title: string;
  posterUrl: string;
  year: string;
  duration: string;
}

export default function Favorites() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [favorites, setFavorites] = useState<Movie[]>([]);

  useEffect(() => {
    checkAuthAndLoadFavorites();
  }, []);

  const checkAuthAndLoadFavorites = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      
      if (!token) {
        Alert.alert(
          'Thông báo',
          'Vui lòng đăng nhập để xem phim yêu thích',
          [
            { text: 'Đăng nhập', onPress: () => router.replace('/login') },
            { text: 'Hủy', onPress: () => router.back() }
          ]
        );
        return;
      }
      
      // Fetch user's favorite movies
      const favMovies = await getFavoriteMovies();
      setFavorites(favMovies);
    } catch (error) {
      console.error('Error loading favorites:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách phim yêu thích');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    checkAuthAndLoadFavorites();
  };

  const handleRemoveFavorite = async (movieId: string) => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc chắn muốn xóa phim này khỏi danh sách yêu thích?',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xóa', 
          style: 'destructive',
          onPress: async () => {
            try {
              await removeFavorite(movieId);
              // Update local state
              setFavorites(favorites.filter(movie => movie.id !== movieId));
              Alert.alert('Thành công', 'Đã xóa phim khỏi danh sách yêu thích');
            } catch (error) {
              console.error('Error removing favorite:', error);
              Alert.alert('Lỗi', 'Không thể xóa phim khỏi danh sách yêu thích');
            }
          }
        }
      ]
    );
  };

  const renderMovieCard = ({ item }: { item: Movie }) => (
    <View style={styles.cardContainer}>
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push({
          pathname: '/movie-detail',
          params: { id: item.id }
        })}
      >
        <Image
          source={{ uri: item.posterUrl }}
          style={styles.poster}
          resizeMode="cover"
        />
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => handleRemoveFavorite(item.id)}
        >
          <Ionicons name="heart" size={18} color="#e50914" />
        </TouchableOpacity>
        <View style={styles.infoContainer}>
          <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
          <View style={styles.metadata}>
            <Text style={styles.metadataText}>{item.year}</Text>
            {item.duration && (
              <>
                <Text style={styles.metadataDot}>•</Text>
                <Text style={styles.metadataText}>{item.duration}</Text>
              </>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );

  const EmptyFavorites = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="heart-outline" size={60} color="#555" />
      <Text style={styles.emptyTitle}>Không có phim yêu thích</Text>
      <Text style={styles.emptyText}>
        Các phim bạn đánh dấu yêu thích sẽ xuất hiện tại đây
      </Text>
      <TouchableOpacity
        style={styles.browseButton}
        onPress={() => router.replace('/')}
      >
        <Text style={styles.browseButtonText}>Duyệt phim</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e50914" />
        <Text style={styles.loadingText}>Đang tải danh sách phim...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={favorites}
        renderItem={renderMovieCard}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={EmptyFavorites}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#e50914"
            colors={['#e50914']}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
  },
  listContainer: {
    padding: 12,
    paddingBottom: 40,
    flexGrow: 1,
  },
  cardContainer: {
    width: '50%',
    padding: 8,
  },
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    height: 260,
  },
  poster: {
    width: '100%',
    height: 180,
    backgroundColor: '#262626',
  },
  favoriteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    padding: 5,
    zIndex: 10,
  },
  infoContainer: {
    padding: 10,
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4,
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  metadataText: {
    color: '#999',
    fontSize: 12,
  },
  metadataDot: {
    color: '#999',
    fontSize: 12,
    marginHorizontal: 4,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    minHeight: 500,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginBottom: 30,
  },
  browseButton: {
    backgroundColor: '#e50914',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  browseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
