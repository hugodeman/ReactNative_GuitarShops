import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [isElectric, setIsElectric] = useState(false);

    useEffect(() => {
        const loadTheme = async () => {
            try {
                const value = await AsyncStorage.getItem("theme");
                if (value !== null) {
                    setIsElectric(JSON.parse(value));
                }
            } catch (e) {
                console.error("Fout bij ophalen thema:", e);
            }
        };
        loadTheme();
    }, []);

    const toggleTheme = async () => {
        try {
            const newTheme = !isElectric;
            setIsElectric(newTheme);
            await AsyncStorage.setItem("theme", JSON.stringify(newTheme));
        } catch (e) {
            console.error("Fout bij opslaan thema:", e);
        }
    };

    return (
        <ThemeContext.Provider value={{ isElectric, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
