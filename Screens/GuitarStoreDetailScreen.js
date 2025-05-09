import {
    ActivityIndicator,
    Keyboard,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
    Share,
    Alert
} from 'react-native';
import {useNavigation, useRoute} from "@react-navigation/native";
import React, {useContext, useEffect, useState} from "react";
import { ThemeContext } from "../Contexts/ThemeContext";
import {GuitarStoresContext} from "../Contexts/GuitarShops";
import MapView, {Marker} from "react-native-maps";
import {Ionicons} from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {useTranslation} from "react-i18next";
import * as LocalAuthentication from 'expo-local-authentication';

export function GuitarStoreDetail(){
    const { t } = useTranslation();
    const route = useRoute()
    const {id} = route.params;
    const { guitarStores } = useContext(GuitarStoresContext);
    const navigation = useNavigation();

    const { isElectric } = useContext(ThemeContext);
    const theme = isElectric ? styles.electricTheme : styles.acousticTheme;

    const [isFavorite, setIsFavorite] = useState(false);
    const [note, setNote] = useState('');
    const [loadingNote, setLoadingNote] = useState(true);

    // via context haalt hij een id op
    const store = guitarStores.find((store) => store.id === id);

    useEffect(() => {
        const loadFavorites = async () => {
            try {
                const storedFavorites = await AsyncStorage.getItem('favorites');
                if (storedFavorites) {
                    const favorites = JSON.parse(storedFavorites);
                    setIsFavorite(favorites.some(favorite => favorite.id === store.id));
                }
            } catch (e) {
                console.error('Error loading favorites:', e);
            }
        };

        loadFavorites();
    }, [store.id]);

    const addFavorite = async () => {
        try {
            const storedFavorites = await AsyncStorage.getItem('favorites');
            const favorites = storedFavorites ? JSON.parse(storedFavorites) : [];

            if (!favorites.some(favorite => favorite.id === store.id)) {
                const updatedFavorites = [...favorites, store];
                await AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites));
                setIsFavorite(true);
            }
        } catch (e) {
            console.error('Error saving favorite:', e);
        }
    };

    const removeFavorite = async () => {
        try {
            const storedFavorites = await AsyncStorage.getItem('favorites');
            const favorites = storedFavorites ? JSON.parse(storedFavorites) : [];

            const updatedFavorites = favorites.filter(favorite => favorite.id !== store.id);
            await AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites));
            setIsFavorite(false);
        } catch (e) {
            console.error('Error removing favorite:', e);
        }
    };

    useEffect(() => {
        const loadNote = async () => {
            try {
                const storedNotes = await AsyncStorage.getItem('notes');
                if (storedNotes) {
                    const notes = JSON.parse(storedNotes);
                    setNote(notes[store.id] || '');
                }
            } catch (e) {
                console.error('Error loading note:', e);
            } finally {
                setLoadingNote(false);
            }
        };

        loadNote();
    }, [store.id]);

    const saveNote = async (text) => {
        try {
            const storedNotes = await AsyncStorage.getItem('notes');
            const notes = storedNotes ? JSON.parse(storedNotes) : {};
            notes[store.id] = text;
            await AsyncStorage.setItem('notes', JSON.stringify(notes));
        } catch (e) {
            console.error('Error saving note:', e);
        }
    };

    const handleSecureShare = async () => {
        try {
            const hasHardware = await LocalAuthentication.hasHardwareAsync();
            const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
            const isEnrolled = await LocalAuthentication.isEnrolledAsync();

            if (!hasHardware || supportedTypes.length === 0 || !isEnrolled) {
                Alert.alert("Beveiliging niet beschikbaar", "Biometrische authenticatie is niet ondersteund op dit apparaat.");
                return;
            }

            const authResult = await LocalAuthentication.authenticateAsync({
                promptMessage: "Bevestig om te delen",
                fallbackLabel: "Gebruik toegangscode",
            });

            if (!authResult.success) {
                Alert.alert("Authenticatie mislukt", "Je bent niet geverifieerd.");
                return;
            }

            const message = `
            ${store.name}
            ${store.address}
            ${note || t('shopDetails.noNote')}
            `;

            await Share.share({ message });
        } catch (error) {
            console.error("Fout bij delen:", error);
            Alert.alert("Fout", "Er ging iets mis bij het delen.");
        }
    };

    return (
        <SafeAreaView style={styles.safeAreaView}>
            <ScrollView>
            <View style={[styles.container, theme.background]}>
                {guitarStores.length === 0 ? (
                    <ActivityIndicator size="large" color="#0000ff" />
                ) : (
                    <View style={styles.content}>
                        <View style={styles.flex}>
                            <Pressable style={[styles.button, theme.button]} onPress={() => navigation.goBack()}>
                                <Ionicons name="arrow-back" size={24} style={styles.icon} />
                                <Text style={ styles.buttonText}>{t('shopDetails.back')}</Text>
                            </Pressable>
                            <Pressable
                                style={[styles.favoriteButton, {backgroundColor: isFavorite ? '#e63946' : '#ccc'}]}
                                onPress={isFavorite ? removeFavorite : addFavorite}
                            >
                                <Ionicons
                                    name={isFavorite ? 'heart' : 'heart-outline'}
                                    size={30}
                                    color={isFavorite ? '#fff' : '#333'}
                                />
                            </Pressable>
                        </View>

                        <View style={styles.storeInfoContainer}>
                            <Text style={[theme.textColor, styles.storeTitle]}>{store.name}</Text>
                            <Text style={[theme.textColor, styles.storeAddress]}>{store.address}</Text>
                        </View>

                        <View style={styles.mapContainer}>
                            <MapView
                                style={styles.map}
                                initialRegion={{
                                    latitude: store.latitude,
                                    longitude: store.longitude,
                                    latitudeDelta: 0.015,
                                    longitudeDelta: 0.015,
                                }}
                            >
                                <Marker
                                    coordinate={{ latitude: store.latitude, longitude: store.longitude }}
                                    title={store.name}
                                    description={store.address}
                                />
                            </MapView>
                        </View>

                        <View>
                            <Text style={[theme.textColor, styles.notes]}>
                                {t('shopDetails.notes')}
                            </Text>

                            <TextInput
                                value={note}
                                onChangeText={(text) => {
                                    setNote(text);
                                    saveNote(text);
                                }}
                                placeholder={t('shopDetails.textarea')}
                                multiline
                                placeholderTextColor={isElectric ? '#aaa' : '#666'}
                                style={[
                                    styles.noteInput,
                                    theme.inputBackground,
                                    theme.inputTextColor,
                                ]}
                                onSubmitEditing={Keyboard.dismiss}
                            />

                            <Pressable
                                onPress={handleSecureShare}
                                style={[styles.shareButton, theme.shareButton]}
                            >
                                <Ionicons name="share-social-outline" size={24} color="white" />
                            </Pressable>
                        </View>
                    </View>
                )}
            </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeAreaView: {
        flex: 1,
    },
    container: {
        flex: 1,
        padding: 20,
    },
    flex: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        marginTop: 20,
        alignSelf: "flex-start",
        borderWidth: 1,
        borderColor: 'transparent',
    },
    icon: {
        marginRight: 10,
        color: 'rgba(255,255,255,0.81)'
    },
    buttonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'rgba(255,255,255,0.81)'
    },
    content: {
        flex: 1,
    },
    storeInfoContainer: {
        marginVertical: 20,
        alignItems: 'center',
        marginBottom: 30,
    },
    storeTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
    },
    storeAddress: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
    },
    favoriteButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 16,
    },
    mapContainer: {
        borderRadius: 5,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 5,
    },
    map: {
        width: '100%',
        height: 400,
        borderRadius: 15,
    },
    electricTheme: {
        background: { backgroundColor: "#181818" },
        textColor: { color: "#E63946" },
        button: {
            backgroundColor: "#E63946",
            borderColor: "#E63946",
        },
        iconColor: "#181818",
        inputBackground: { backgroundColor: '#434242' },
        inputTextColor: { color: '#fff' },
        shareButton: { backgroundColor: '#E63946' },
    },

    acousticTheme: {
        background: { backgroundColor: "#F5E1C8" },
        textColor: { color: "#5A3E2B" },
        button: {
            backgroundColor: "#5A3E2B",
            borderColor: "#5A3E2B",
        },
        iconColor: "#F5E1C8",
        inputBackground: { backgroundColor: '#f6f1ef' },
        inputTextColor: { color: '#000' },
        shareButton: { backgroundColor: '#5A3E2B' },
    },

    notes:{
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 10
    },

    noteInput: {
        padding: 10,
        borderRadius: 8,
        minHeight: 100,
        textAlignVertical: 'top',
        marginTop: 20
    },

    shareButton: {
        marginTop: 10,
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'flex-start',
    },
});