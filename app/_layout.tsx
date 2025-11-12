import { AuthProvider } from "@/constant/AuthContext";
import { ThemeProvider } from "@/constant/ThemeContext";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />

          <Stack.Screen name="login" />
          <Stack.Screen name="register" />
        </Stack>
      </AuthProvider>
    </ThemeProvider>
  );
}
