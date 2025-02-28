import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#1a1a1a',
        },
        headerTintColor: '#fff',  // Color for the back button and title
        headerBackTitle: 'Quay lại',  // Text for iOS back button
        headerBackImageSource: undefined,  // Use default back image
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{ 
          headerShown: false 
        }} 
      />
      <Stack.Screen 
        name="login" 
        options={{ 
          title: 'Đăng nhập',
        }} 
      />
      <Stack.Screen 
        name="register" 
        options={{ 
          title: 'Đăng ký',
        }} 
      />
       <Stack.Screen 
        name="profile" 
        options={{ 
          title: 'Hồ sơ',
        }} 
      />
      <Stack.Screen 
        name="favorites" 
        options={{ 
          title: 'Phim yêu thích',
        }} 
      />
      <Stack.Screen 
        name="movie-detail" 
        options={{ 
          title: 'Chi tiết phim',
        }} 
      />
      <Stack.Screen 
        name="search" 
        options={{ 
          title: 'Tìm kiếm',
        }} 
      />
    </Stack>
  );
}