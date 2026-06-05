import { Stack } from 'expo-router';
import { useNotifications } from '@/hooks/useNotifications';

export default function AppLayout() {
  // Initialize notification listeners and permissions
  useNotifications();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="products/[id]"
        options={{ headerShown: true, title: 'Editar Produto' }}
      />
      <Stack.Screen
        name="products/new"
        options={{ headerShown: true, title: 'Novo Produto' }}
      />
    </Stack>
  );
}
