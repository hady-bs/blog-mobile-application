import baseUrl from "@/constant/api";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AddBlog() {
  const router = useRouter();
  const [content, setContent] = useState("");

  const handleAddBlog = async () => {
    if (!content.trim()) {
      Alert.alert("Error", "Please enter some content for the blog");
      return;
    }

    try {
      const token = await SecureStore.getItemAsync("token");
      if (!token) {
        Alert.alert("Error", "No token found. Please login again.");
        return;
      }

      const response = await fetch(`${baseUrl}blogs/api`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: content.trim(),
        }),
      });

      if (response.ok) {
        Alert.alert("Success", "Blog added successfully!");
        setContent("");
        router.replace("/(tabs)/blogs");
      } else {
        Alert.alert("Error", "Failed to add blog");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Network error. Please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.title}>Add New Blog</Text>
        <TextInput
          style={styles.input}
          placeholder="Write your blog content here..."
          placeholderTextColor="#888"
          value={content}
          onChangeText={setContent}
          multiline
          numberOfLines={10}
          textAlignVertical="top"
        />
        <TouchableOpacity style={styles.button} onPress={handleAddBlog}>
          <Text style={styles.buttonText}>Add Blog</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    justifyContent: "center",
    padding: 20,
  },
  form: {
    backgroundColor: "#1E1E1E",
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#2A2A2A",
    color: "#fff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
    height: 200,
  },
  button: {
    backgroundColor: "#BB86FC",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
  },
});
