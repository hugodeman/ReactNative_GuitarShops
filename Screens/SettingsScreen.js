import {View, Text, Switch, Image, StyleSheet, ScrollView} from "react-native";
import {useContext, useEffect, useState} from "react";
import { ThemeContext } from "../Contexts/ThemeContext";
import { Picker } from '@react-native-picker/picker';
import {useTranslation} from "react-i18next";

export default function SettingsScreen() {
    const { isElectric, toggleTheme } = useContext(ThemeContext);
    const theme = isElectric ? styles.electricTheme : styles.acousticTheme;
    const { t, i18n } = useTranslation();
    const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);

    const handleLanguageChange = (lang) => {
        i18n.changeLanguage(lang);
        setSelectedLanguage(lang);
    };

    useEffect(() => {
        setSelectedLanguage(i18n.language);
    }, [i18n.language]);

    return (
        <ScrollView>
            <View style={[styles.container, theme.background]}>
                <Text style={[styles.title, theme.textColor]}>{t('settings.title')}</Text>

                <View style={styles.switchContainer}>
                    <Text style={[styles.switchText, theme.textColor]}>{t('settings.acoustic')}</Text>
                    <Switch
                        value={isElectric}
                        onValueChange={toggleTheme}
                        thumbColor={isElectric ? "#ff0000" : "#d2691e"}
                        trackColor={{ false: "#bbbbbb", true: "#444444" }}
                    />
                    <Text style={[styles.switchText, theme.textColor]}>{t('settings.electric')}</Text>
                </View>

                <Image
                    style={styles.image}
                    source={{
                        uri: isElectric
                            ? "https://pngimg.com/d/electric_guitar_PNG24185.png"
                            : "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/8407de2e-d655-43dc-9ee6-512733bc0df1/dfm4ad0-2eb5d2dc-0bcc-438e-90bc-4d2a236dfb5e.png/v1/fill/w_721,h_720/martin_12_string_acoustic_guitar__png__by_nes2155884_dfm4ad0-fullview.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9NzIwIiwicGF0aCI6IlwvZlwvODQwN2RlMmUtZDY1NS00M2RjLTllZTYtNTEyNzMzYmMwZGYxXC9kZm00YWQwLTJlYjVkMmRjLTBiY2MtNDM4ZS05MGJjLTRkMmEyMzZkZmI1ZS5wbmciLCJ3aWR0aCI6Ijw9NzIxIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmltYWdlLm9wZXJhdGlvbnMiXX0.avpSPOVu12hj5tqEDnYcRrii1_4HCe8FVA5jqQnV_cc",
                    }}
                />
                <Text style={[styles.label, theme.textColor]}>{t('settings.language')}</Text>
                <Picker
                    selectedValue={selectedLanguage}
                    onValueChange={(itemValue) => handleLanguageChange(itemValue)}
                    style={[styles.picker, theme.picker]}
                    itemStyle={theme.pickerItem}
                >
                    <Picker.Item label="Nederlands" value="nl" />
                    <Picker.Item label="Engels" value="en" />
                    <Picker.Item label="Frans" value="fr" />
                    <Picker.Item label="Duits" value="de" />
                    <Picker.Item label="Russisch" value="ru" />
                </Picker>

            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
    },

    electricTheme: {
        background: { backgroundColor: "#181818" },
        textColor: { color: "#E63946" },
        picker: {
            color: "#E63946",
            backgroundColor: "#434242",
        },
        pickerItem: {
            color: "#E63946",
        },
    },

    acousticTheme: {
        background: { backgroundColor: "#F5E1C8" },
        textColor: { color: "#5A3E2B" },
        picker: {
            color: "#5A3E2B",
            backgroundColor: "#c5734f",
        },
        pickerItem: {
            color: "#5A3E2B",
        },
    },

    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 10,
        textAlign: "center",
    },

    image: {
        width: 400,
        height: 500,
        resizeMode: "cover",
        margin: 20 - 10
    },

    switchContainer: {
        flexDirection: "row",
        alignItems: "center",
    },

    switchText: {
        fontSize: 14,
        marginHorizontal: 10,
    },

    label: {
        fontSize: 16,
        marginBottom: 10,
        marginTop: 10
    },

    picker: {
        height: 50,
        width: 180,  // Pas de breedte aan op basis van je layout
        color: 'black', // Kies een kleur die goed zichtbaar is
    },
});
