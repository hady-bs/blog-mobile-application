import * as SecureStore from "expo-secure-store";
import { StatusBar } from "expo-status-bar";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Appearance, ColorSchemeName } from "react-native";
export interface ThemeColors {
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  primary: string;
  error: string;
  border: string;
}

export const lightTheme: ThemeColors = {
  background: "#FFFFFF",
  surface: "#F5F5F5",
  text: "#000000",
  textSecondary: "#666666",
  primary: "#BB86FC",
  error: "#FF4444",
  border: "#CCCCCC",
};

export const darkTheme: ThemeColors = {
  background: "#121212",
  surface: "#1E1E1E",
  text: "#FFFFFF",
  textSecondary: "#CCCCCC",
  primary: "#BB86FC",
  error: "#FF4444",
  border: "#333333",
};

interface ThemeContextType {
  theme: ThemeColors;
  colorScheme: ColorSchemeName;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: darkTheme,
  colorScheme: "dark",
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [colorScheme, setColorScheme] = useState<ColorSchemeName>(
    Appearance.getColorScheme()
  );

  useEffect(() => {
    const loadTheme = async () => {
      const storedScheme = await SecureStore.getItemAsync("colorScheme");
      if (storedScheme) {
        setColorScheme(storedScheme as ColorSchemeName);
      } else {
        setColorScheme(Appearance.getColorScheme());
      }
    };
    loadTheme();

    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setColorScheme(colorScheme);
    });

    return () => subscription?.remove();
  }, []);

  const toggleTheme = async () => {
    const newScheme = colorScheme === "dark" ? "light" : "dark";
    setColorScheme(newScheme);
    await SecureStore.setItemAsync("colorScheme", newScheme || "dark");
  };

  const theme = colorScheme === "dark" ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, colorScheme, toggleTheme }}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      {children}
    </ThemeContext.Provider>
  );
};
