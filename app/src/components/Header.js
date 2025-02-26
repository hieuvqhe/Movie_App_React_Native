import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const Header = () => {
  const [showMenu, setShowMenu] = useState(false);
  const router = useRouter();

  const menuItems = [
    {
      id: 1,
      title: 'Hồ sơ',
      icon: 'person-outline',
      onPress: () => {
        router.push('/profile');
        setShowMenu(false);
      }
    },
    {
      id: 2,
      title: 'Phim yêu thích',
      icon: 'heart-outline',
      onPress: () => {
        router.push('/favorites');
        setShowMenu(false);
      }
    },
    {
      id: 3,
      title: 'Đăng xuất',
      icon: 'log-out-outline',
      onPress: () => {
        // Xử lý đăng xuất ở đây
        setShowMenu(false);
      }
    }
  ];

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.logo}>PHIMHAY</Text>
        <TouchableOpacity 
          onPress={() => setShowMenu(!showMenu)}
          style={styles.menuButton}
        >
          <Ionicons name="menu" size={30} color="#fff" />
        </TouchableOpacity>
      </View>

      {showMenu && (
        <View style={styles.dropdown}>
          {menuItems.map(item => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <Ionicons name={item.icon} size={20} color="#fff" style={styles.menuIcon} />
              <Text style={styles.menuText}>{item.title}</Text>
            </TouchableOpacity>
          ))}
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
    zIndex: 1000,
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
  menuButton: {
    padding: 8,
  },
  dropdown: {
    position: 'absolute',
    top: 60,
    right: 16,
    backgroundColor: '#262626',
    borderRadius: 8,
    padding: 8,
    minWidth: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  menuIcon: {
    marginRight: 12,
  },
  menuText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default Header;