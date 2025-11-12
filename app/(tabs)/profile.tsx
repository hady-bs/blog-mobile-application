import baseUrl from "@/constant/api";
import { useAuth } from "@/constant/AuthContext";
import { ProfileResponse } from "@/constant/interfaces";
import { useNotifications } from "@/constant/NotificationContext";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Profile() {
  const router = useRouter();
  const { logout } = useAuth();
  const { scheduleNotification } = useNotifications();
  const [profileData, setProfileData] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [editingBlog, setEditingBlog] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await SecureStore.getItemAsync("token");
      if (!token) {
        const errorMessage = "No token found. Please login again.";
        setError(errorMessage);
        scheduleNotification("Error", errorMessage);
        return;
      }

      const response = await fetch(`${baseUrl}users/api/profile`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log(token);
      if (response.ok) {
        const data: ProfileResponse = await response.json();
        setProfileData(data);
      } else {
        const errorMessage = `Failed to fetch profile: ${response.status}`;
        setError(errorMessage);
        scheduleNotification("Error", errorMessage);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Network error";
      setError(errorMessage);
      scheduleNotification("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProfile().finally(() => setRefreshing(false));
  };

  const handleDeleteBlog = async (blogId: number) => {
    try {
      const token = await SecureStore.getItemAsync("token");
      if (!token) {
        Alert.alert("Error", "No token found. Please login again.");
        return;
      }

      const response = await fetch(`${baseUrl}blogs/api/${blogId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        Alert.alert("Success", "Blog deleted successfully!");
        fetchProfile();
      } else {
        Alert.alert("Error", "Failed to delete blog");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Network error");
    }
  };

  const handleEditBlog = (blogId: number, content: string) => {
    setEditingBlog(blogId);
    setEditContent(content);
  };

  const handleSaveEdit = async () => {
    if (!editingBlog) return;

    try {
      const token = await SecureStore.getItemAsync("token");
      if (!token) {
        Alert.alert("Error", "No token found. Please login again.");
        return;
      }

      const response = await fetch(`${baseUrl}blogs/api/${editingBlog}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: editContent.trim(),
        }),
      });

      if (response.ok) {
        Alert.alert("Success", "Blog updated successfully!");
        setEditingBlog(null);
        setEditContent("");
        fetchProfile();
      } else {
        Alert.alert("Error", "Failed to update blog");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Network error");
    }
  };

  const handleCancelEdit = () => {
    setEditingBlog(null);
    setEditContent("");
  };

  const handleLogout = async () => {
    try {
      const token = await SecureStore.getItemAsync("token");
      if (!token) {
        Alert.alert("Error", "No token found.");
        return;
      }

      const response = await fetch(`${baseUrl}users/api/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        await SecureStore.deleteItemAsync("token");
        setProfileData(null); // Clear profile data
        logout(); // Use logout from context
        Alert.alert("Success", "Logged out successfully!");
        router.replace("/");
      } else {
        Alert.alert("Error", "Failed to logout");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Network error");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>Profile</Text>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#BB86FC" />
              <Text style={styles.loadingText}>Loading profile...</Text>
            </View>
          )}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Error: {error}</Text>
            </View>
          )}
          {!loading && !error && profileData ? (
            <>
              <Text style={styles.text}>ID: {profileData.user.id}</Text>
              <Text style={styles.text}>
                Username: {profileData.user.userName}
              </Text>
              <Text style={styles.text}>
                Blogs Count: {profileData.blogs.length}
              </Text>
              <Text style={styles.subtitle}>Your Blogs:</Text>
              {profileData.blogs.map((blog) => (
                <View key={blog.id} style={styles.blogCard}>
                  {editingBlog === blog.id ? (
                    <>
                      <TextInput
                        style={styles.editInput}
                        value={editContent}
                        onChangeText={setEditContent}
                        multiline
                      />
                      <View style={styles.buttonRow}>
                        <TouchableOpacity
                          style={styles.saveButton}
                          onPress={handleSaveEdit}
                        >
                          <Text style={styles.buttonText}>Save</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.cancelButton}
                          onPress={handleCancelEdit}
                        >
                          <Text style={styles.buttonText}>Cancel</Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  ) : (
                    <>
                      <Text style={styles.blogText}>{blog.content}</Text>
                      <View style={styles.buttonRow}>
                        <TouchableOpacity
                          style={styles.editButton}
                          onPress={() => handleEditBlog(blog.id, blog.content)}
                        >
                          <Text style={styles.buttonText}>Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.deleteButton}
                          onPress={() => handleDeleteBlog(blog.id)}
                        >
                          <Text style={styles.buttonText}>Delete</Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  )}
                </View>
              ))}
            </>
          ) : (
            !loading &&
            !error && <Text style={styles.text}>Failed to load profile.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" },
  scrollContainer: { flexGrow: 1 },
  card: {
    margin: 16,
    padding: 20,
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
  },
  title: { color: "#fff", fontSize: 22, fontWeight: "bold", marginBottom: 8 },
  text: { color: "#ccc", fontSize: 16 },
  subtitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  blogCard: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "#2A2A2A",
    borderRadius: 8,
  },
  blogText: { color: "#ccc", fontSize: 16, marginBottom: 8 },
  editInput: {
    backgroundColor: "#3A3A3A",
    color: "#fff",
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
    fontSize: 16,
  },
  buttonRow: { flexDirection: "row", justifyContent: "space-between" },
  saveButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginRight: 4,
  },
  cancelButton: {
    backgroundColor: "#FF9800",
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginLeft: 4,
  },
  editButton: {
    backgroundColor: "#2196F3",
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginRight: 4,
  },
  deleteButton: {
    backgroundColor: "#F44336",
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginLeft: 4,
  },
  buttonText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  logoutButton: { backgroundColor: "#F44336", padding: 8, borderRadius: 8 },
  logoutText: { color: "#fff", fontWeight: "bold" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
  loadingText: {
    color: "#fff",
    fontSize: 16,
    marginTop: 10,
  },
  errorContainer: {
    padding: 20,
    backgroundColor: "#FF4444",
    borderRadius: 10,
    marginVertical: 10,
  },
  errorText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
  },
});
