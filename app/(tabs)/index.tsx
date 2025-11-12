import baseUrl from "@/constant/api";
import { useAuth } from "@/constant/AuthContext";
import Blog, { Blogs } from "@/constant/interfaces";
import { useNotifications } from "@/constant/NotificationContext";
import { useTheme } from "@/constant/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const { theme, toggleTheme, colorScheme } = useTheme();
  const [data, setData] = useState<Blogs | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { scheduleNotification } = useNotifications();

  const styles = getStyles(theme);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(baseUrl + "blogs/api?page=1&limit=3");
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setData(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      scheduleNotification("Error", `Failed to fetch blogs: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBlogs().finally(() => setRefreshing(false));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.hero}>
          <TouchableOpacity style={styles.themeToggle} onPress={toggleTheme}>
            <Ionicons
              name={colorScheme === "dark" ? "sunny" : "moon"}
              size={24}
              color={theme.text}
            />
          </TouchableOpacity>
          <Text style={styles.heroTitle}>Welcome to Our Blog</Text>
          <Text style={styles.heroSubtitle}>
            Discover amazing stories and insights from our community
          </Text>
          {!isLoggedIn && (
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.button}
                onPress={() => router.push("/login")}
              >
                <Text style={styles.buttonText}>Login</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.registerButton]}
                onPress={() => router.push("/register")}
              >
                <Text style={styles.registerButtonText}>Register</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.text} />
            <Text style={styles.loadingText}>Loading blogs...</Text>
          </View>
        )}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Error: {error}</Text>
          </View>
        )}
        {!loading &&
          !error &&
          data?.blogs?.map((item: Blog) => (
            <View key={item.id} style={styles.blogCard}>
              <Text style={[styles.userName, { textAlign: "left" as const }]}>
                {item.User?.userName}
              </Text>
              <Text style={[styles.content, { textAlign: "left" as const }]}>
                {item.content}
              </Text>
              <Text style={styles.date}>
                {new Date(item.createdAt).toLocaleDateString()}
              </Text>
            </View>
          ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    scrollContainer: {
      padding: 10,
    },
    hero: {
      backgroundColor: theme.surface,
      padding: 30,
      marginBottom: 20,
      borderRadius: 15,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 5,
    },
    themeToggle: {
      position: "absolute",
      top: 10,
      right: 10,
      padding: 10,
      borderRadius: 20,
      backgroundColor: theme.surface,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 3,
      elevation: 2,
    },
    heroTitle: {
      fontSize: 28,
      fontWeight: "bold" as const,
      color: theme.text,
      marginBottom: 10,
      textAlign: "center" as const,
    },
    heroSubtitle: {
      fontSize: 16,
      color: theme.textSecondary,
      marginBottom: 20,
      textAlign: "center" as const,
      opacity: 0.9,
    },
    buttonContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
      width: "100%",
    },
    button: {
      backgroundColor: theme.primary,
      paddingVertical: 15,
      paddingHorizontal: 30,
      borderRadius: 25,
      minWidth: 120,
      alignItems: "center",
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 3,
    },
    buttonText: {
      color: theme.background,
      fontSize: 16,
      fontWeight: "bold" as const,
    },
    registerButton: {
      backgroundColor: "transparent",
      borderWidth: 2,
      borderColor: theme.primary,
    },
    registerButtonText: {
      color: theme.primary,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 50,
    },
    loadingText: {
      color: theme.text,
      fontSize: 16,
      marginTop: 10,
    },
    errorContainer: {
      padding: 20,
      backgroundColor: theme.error,
      borderRadius: 10,
      marginVertical: 10,
    },
    errorText: {
      color: theme.text,
      fontSize: 16,
      textAlign: "center",
    },
    blogCard: {
      backgroundColor: theme.surface,
      padding: 15,
      marginVertical: 8,
      borderRadius: 10,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 4,
    },
    userName: {
      fontSize: 18,
      fontWeight: "bold" as const,
      marginBottom: 5,
      color: theme.text,
    },
    content: {
      fontSize: 16,
      marginBottom: 10,
      color: theme.textSecondary,
      lineHeight: 22,
    },
    date: {
      fontSize: 12,
      color: theme.textSecondary,
      textAlign: "right" as const,
    },
  });
