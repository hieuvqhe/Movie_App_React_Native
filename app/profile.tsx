import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { getUserProfile, updateUserProfile } from './src/api/userApi';

// Feedback notification component
const FeedbackNotification = ({ message, type, onDismiss }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Fade in
    Animated.timing(opacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    
    // Auto dismiss after 3 seconds
    const timer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        onDismiss && onDismiss();
      });
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <Animated.View 
      style={[
        styles.notificationContainer,
        type === 'success' ? styles.successNotification : styles.errorNotification,
        { opacity }
      ]}
    >
      <Ionicons 
        name={type === 'success' ? 'checkmark-circle-outline' : 'alert-circle-outline'} 
        size={22} 
        color={type === 'success' ? '#4caf50' : '#f44336'} 
      />
      <Text style={styles.notificationText}>{message}</Text>
      <TouchableOpacity onPress={onDismiss}>
        <Ionicons name="close" size={20} color="#888" />
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function Profile() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<{
    name: string;
    dateJoined?: string;
    favoriteCount?: number;
    avatar?: string;
    favoriteMovies?: any[];  // Add explicit type for favoriteMovies
  } | null>(null);
  
  const [isChangePasswordVisible, setIsChangePasswordVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  
  // Add state for feedback notifications
  const [notification, setNotification] = useState({
    visible: false,
    message: '',
    type: 'success', // 'success' or 'error'
  });
  
  const scrollViewRef = useRef<ScrollView>(null);

  // Check authentication and load user data on mount
  useEffect(() => {
    checkAuthAndLoadProfile();
  }, []);

  // Show feedback notification
  const showNotification = (message, type = 'success') => {
    setNotification({
      visible: true,
      message,
      type,
    });
  };

  // Hide feedback notification
  const hideNotification = () => {
    setNotification(prev => ({
      ...prev,
      visible: false,
    }));
  };

  const checkAuthAndLoadProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      
      if (!token) {
        Alert.alert(
          'Thông báo',
          'Vui lòng đăng nhập để xem trang hồ sơ',
          [
            { text: 'Đăng nhập', onPress: () => router.replace('/login') },
            { text: 'Hủy', onPress: () => router.back() }
          ]
        );
        return;
      }
      
      // Fetch user profile data
      const response = await getUserProfile();
      
      if (response.success && response.user) {
        // Calculate favoriteCount from favoriteMovies array
        const favCount = response.user.favoriteMovies ? response.user.favoriteMovies.length : 0;
        
        // Set user data with calculated favoriteCount
        setUserData({
          ...response.user,
          favoriteCount: favCount
        });
        
        setNewUserName(response.user.name || '');
        showNotification('Đã tải thông tin hồ sơ');
      } else {
        throw new Error(response.message || 'Không thể tải thông tin');
      }
    } catch (error) {
      // Check if the error is due to an invalid token
      if (error instanceof Error && error.message && (
          error.message.includes('token') || 
          error.message.includes('unauthorized') ||
          error.message.includes('unauthenticated')
        )) {
        // Clear invalid token
        await AsyncStorage.removeItem('accessToken');
        
        Alert.alert(
          'Phiên đăng nhập hết hạn',
          'Vui lòng đăng nhập lại',
          [{ text: 'OK', onPress: () => router.replace('/login') }]
        );
      } else {
        showNotification('Không thể tải thông tin hồ sơ', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    // Basic validation
    if (!currentPassword) {
      showNotification('Vui lòng nhập mật khẩu hiện tại', 'error');
      return;
    }
    
    if (!newPassword) {
      showNotification('Vui lòng nhập mật khẩu mới', 'error');
      return;
    }

    if (newPassword.length < 6) {
      showNotification('Mật khẩu mới phải có ít nhất 6 ký tự', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      // Send password update data
      await updateUserProfile({
        currentPassword,
        newPassword,
      });
      
      // Show success feedback
      showNotification('Mật khẩu đã được cập nhật thành công');
      
      // Clear form fields and hide form
      setIsChangePasswordVisible(false);
      setCurrentPassword('');
      setNewPassword('');
    } catch (error) {
      // Show specific error message
      const errorMsg = error instanceof Error 
        ? error.message 
        : 'Không thể cập nhật mật khẩu';
      
      showNotification(errorMsg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!newUserName.trim()) {
      showNotification('Tên người dùng không được để trống', 'error');
      return;
    }

    try {
      // Show loading state
      setIsSubmitting(true);
      
      // Send just the name update
      const response = await updateUserProfile({ 
        name: newUserName 
      });
      
      // Show success feedback
      showNotification('Cập nhật thông tin thành công');
      
      // Hide the editing form
      setIsEditingProfile(false);
      
      // Update local userData state with the updated user info
      if (response.user) {
        setUserData(prevData => ({
          ...prevData,
          name: response.user.name,
        }));
      } else {
        // If response doesn't contain user data, refresh the profile
        checkAuthAndLoadProfile();
      }
    } catch (error) {
      // Show specific error message
      const errorMsg = error instanceof Error 
        ? error.message 
        : 'Không thể cập nhật thông tin';
        
      showNotification(errorMsg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMenuPress = (type: 'profile' | 'password') => {
    setIsEditingProfile(type === 'profile');
    setIsChangePasswordVisible(type === 'password');
    
    // Scroll to form after a short delay
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  // Navigate to favorites screen
  const handleNavigateToFavorites = () => {
    router.push('/favorites');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e50914" />
        <Text style={styles.loadingText}>Đang tải thông tin...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {/* Show the notification if visible */}
      {notification.visible && (
        <FeedbackNotification
          message={notification.message}
          type={notification.type}
          onDismiss={hideNotification}
        />
      )}
      
      <ScrollView 
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContainer}
      >
        <View style={styles.profileHeader}>
          <TouchableOpacity 
            style={styles.avatarContainer}
            onPress={() => {
              Alert.alert('Thông báo', 'Chức năng đang phát triển');
            }}
          >
            {userData?.avatar ? (
              <Image 
                source={{ uri: userData.avatar }} 
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {userData?.name ? userData.name.charAt(0).toUpperCase() : '?'}
                </Text>
              </View>
            )}
            <View style={styles.editAvatarBadge}>
              <Ionicons name="camera" size={14} color="#fff" />
            </View>
          </TouchableOpacity>
          
          <Text style={styles.username}>{userData?.name}</Text>
          
          {userData?.dateJoined && (
            <Text style={styles.joinDate}>
              Tham gia từ: {new Date(userData.dateJoined).toLocaleDateString('vi-VN')}
            </Text>
          )}
        </View>
        
        {/* Make the stats container clickable */}
        <TouchableOpacity 
          style={styles.statsContainer}
          onPress={handleNavigateToFavorites}
          activeOpacity={0.7}
        >
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{userData?.favoriteCount || 0}</Text>
            <Text style={styles.statLabel}>Phim yêu thích</Text>
            <Ionicons name="chevron-forward" size={16} color="#666" style={styles.statIcon} />
          </View>
        </TouchableOpacity>
        
        <View style={styles.menuContainer}>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => handleMenuPress('profile')}
          >
            <Ionicons name="person-outline" size={24} color="#e50914" style={styles.menuIcon} />
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Chỉnh sửa thông tin</Text>
              <Text style={styles.menuDescription}>Cập nhật tên người dùng</Text>
            </View>
            <Ionicons 
              name={isEditingProfile ? "chevron-up-outline" : "chevron-down-outline"} 
              size={20} 
              color="#888" 
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => handleMenuPress('password')}
          >
            <Ionicons name="key-outline" size={24} color="#e50914" style={styles.menuIcon} />
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Đổi mật khẩu</Text>
              <Text style={styles.menuDescription}>Cập nhật mật khẩu tài khoản</Text>
            </View>
            <Ionicons 
              name={isChangePasswordVisible ? "chevron-up-outline" : "chevron-down-outline"} 
              size={20} 
              color="#888" 
            />
          </TouchableOpacity>
          
          {isEditingProfile && (
            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color="#888" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Tên người dùng"
                  placeholderTextColor="#888"
                  value={newUserName}
                  onChangeText={setNewUserName}
                />
              </View>

              <TouchableOpacity 
                style={styles.button}
                onPress={handleUpdateProfile}
              >
                <Text style={styles.buttonText}>Cập nhật thông tin</Text>
              </TouchableOpacity>
            </View>
          )}

          {isChangePasswordVisible && (
            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#888" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Mật khẩu hiện tại"
                  placeholderTextColor="#888"
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry={!showCurrentPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity 
                  style={styles.passwordIcon} 
                  onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  <Ionicons 
                    name={showCurrentPassword ? "eye-off-outline" : "eye-outline"} 
                    size={20} 
                    color="#888" 
                  />
                </TouchableOpacity>
              </View>
              
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#888" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Mật khẩu mới"
                  placeholderTextColor="#888"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showNewPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity 
                  style={styles.passwordIcon} 
                  onPress={() => setShowNewPassword(!showNewPassword)}
                >
                  <Ionicons 
                    name={showNewPassword ? "eye-off-outline" : "eye-outline"} 
                    size={20} 
                    color="#888" 
                  />
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity 
                style={styles.button}
                onPress={handleChangePassword}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Cập nhật mật khẩu</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 30,
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
  profileHeader: {
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#262626',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e50914',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editAvatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#e50914',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1a1a1a',
  },
  avatarText: {
    color: '#fff',
    fontSize: 40,
    fontWeight: 'bold',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  joinDate: {
    fontSize: 14,
    color: '#888',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  statItem: {
    alignItems: 'center',
    flexDirection: 'row', // Changed to row for the icon
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#e50914',
    marginRight: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#888',
  },
  statIcon: {
    marginLeft: 8,
  },
  menuContainer: {
    padding: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  menuIcon: {
    marginRight: 16,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  menuDescription: {
    color: '#888',
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#262626',
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
  },
  passwordIcon: {
    padding: 5,
  },
  button: {
    backgroundColor: '#e50914',
    borderRadius: 8,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  formContainer: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 16,
  },
  // Add styles for notifications
  notificationContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 0 : 0,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  successNotification: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  errorNotification: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(244, 67, 54, 0.3)',
  },
  notificationText: {
    flex: 1,
    marginLeft: 8,
    color: '#fff',
    fontSize: 14,
  },
});

