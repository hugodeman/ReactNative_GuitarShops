import { View, Text, StyleSheet } from "react-native";
import { useContext } from "react";
import { ThemeContext } from "../Contexts/ThemeContext";
import {useTranslation} from "react-i18next";

export default function HomeScreen() {
    const { isElectric } = useContext(ThemeContext);
    const theme = isElectric ? styles.electricTheme : styles.acousticTheme;
    const { t } = useTranslation();

    return (
        <View style={[styles.container, theme.background]}>
            <Text style={[styles.text, theme.textColor]}>{t('home.title')}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },

    acousticTheme: {
        background: { backgroundColor: "#F5E1C8" },
        textColor: { color: "#5A3E2B" },
    },
    electricTheme: {
        background: { backgroundColor: "#181818" },
        textColor: { color: "#E63946" },
    },
    text: {
        fontSize: 18,
    },
});
