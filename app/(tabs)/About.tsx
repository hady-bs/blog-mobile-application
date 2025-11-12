import React from "react";
import { Linking, StyleSheet, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const About = () => {
  const openLink = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.text}>developed by Hady</Text>
      <TouchableOpacity
        style={styles.linkButton}
        onPress={() => openLink("https://abd-alhady-alboshy.onrender.com/")}
      >
        <Text style={styles.linkText}>Visit Portiflio</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#333",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: "white",
    fontSize: 18,
    marginBottom: 20,
  },
  linkButton: {
    backgroundColor: "#BB86FC",
    padding: 15,
    borderRadius: 8,
  },
  linkText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default About;
