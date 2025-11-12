import baseUrl from "@/constant/api";
import Blog, { Blogs } from "@/constant/interfaces";
import { useNotifications } from "@/constant/NotificationContext";
import { useTheme } from "@/constant/ThemeContext";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AllBlogs() {
  const { theme } = useTheme();
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
      const res = await fetch(baseUrl + "blogs/api");
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
        <Text style={styles.title}>All Blogs</Text>
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
    title: {
      fontSize: 24,
      fontWeight: "bold",
      color: theme.text,
      textAlign: "center",
      marginBottom: 20,
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
