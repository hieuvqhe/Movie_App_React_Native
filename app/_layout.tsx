import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          headerShown: false 
        }} 
      />
      <Stack.Screen 
        name="movie-detail" 
        options={{ 
          title: 'Chi tiết phim',
          headerStyle: {
            backgroundColor: '#1a1a1a',
          },
          headerTintColor: '#fff',
        }} 
      />
      <Stack.Screen 
        name="search" 
        options={{ 
          title: 'Tìm kiếm',
          headerStyle: {
            backgroundColor: '#1a1a1a',
          },
          headerTintColor: '#fff',
        }} 
      />
    </Stack>
  );
}