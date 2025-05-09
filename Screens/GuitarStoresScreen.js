import React, {useContext, useEffect, useRef, useState} from 'react';
import {ActivityIndicator, FlatList, Pressable, SafeAreaView, StyleSheet, Switch, Text, View, Modal} from 'react-native';
import MapView, {Marker} from 'react-native-maps';
import {GuitarStoresContext} from "../Contexts/GuitarShops";
import {ThemeContext} from "../Contexts/ThemeContext";
import { NetworkContext } from '../Contexts/NetworkContext';
import {useNavigation} from "@react-navigation/native";
import * as Location from 'expo-location';
import AsyncStorage from "@react-native-async-storage/async-storage";
import {Ionicons} from "@expo/vector-icons";
import {useTranslation} from "react-i18next";

export default function GuitarStoresScreen() {
    const { t } = useTranslation();
    const { guitarStores } = useContext(GuitarStoresContext);
    const { isOffline } = useContext(NetworkContext);
    const navigation = useNavigation();
    const { isElectric } = useContext(ThemeContext);
    const theme = isElectric ? styles.electricTheme : styles.acousticTheme;

    const [location, setLocation] = useState(null);
    const [track, setTrack] = useState([]);
    const mapRef = useRef(null);

    const [isList, setIsList] = useState(true)
    const [favorites, setFavorites] = useState([]);

    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        setModalVisible(isOffline);
    }, [isOffline]);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.log('Toegang tot locatie geweigerd');
                return;
            }

            await Location.watchPositionAsync(
                { accuracy: Location.Accuracy.High, distanceInterval: 10 },
                (newLocation) => {
                    const { latitude, longitude } = newLocation.coords;
                    setLocation({ latitude, longitude });

                    if (mapRef.current) {
                        mapRef.current.animateToRegion({
                            ...location,
                            latitudeDelta: 0.05,
                            longitudeDelta: 0.05,
                        }, 1000);
                    }

                    setTrack((prevTrack) => [
                        ...prevTrack,
                        { latitude, longitude, id: prevTrack.length }
                    ]);
                }
            );
        })();
    }, []);

    useEffect(() => {
        const loadPreference = async () => {
            try {
                const value = await AsyncStorage.getItem("preference");
                if (value !== null) {
                    setIsList(JSON.parse(value));
                }
            } catch (e) {
                console.error("Fout bij ophalen thema:", e);
            }
        };
        loadPreference();
    }, []);

    const togglePreference = async () => {
        try {
            const newPreference = !isList;
            setIsList(newPreference);
            await AsyncStorage.setItem("preference", JSON.stringify(newPreference));
        } catch (e) {
            console.error("Fout bij opslaan thema:", e);
        }
    };

    useEffect(() => {
        const loadFavorites = async () => {
            try {
                const storedFavorites = await AsyncStorage.getItem('favorites');
                if (storedFavorites) {
                    setFavorites(JSON.parse(storedFavorites));
                }
            } catch (e) {
                console.error('Error loading favorites:', e);
            }
        };
        // focus -> actief bij nieuw scherm
        return navigation.addListener('focus', loadFavorites);
    }, [navigation]);

    // some -> kijkt of minimaal 1 argument overeenkomt
    const isFavorite = (id) => favorites.some(fav => fav.id === id);

    return (
        <SafeAreaView style={styles.safeAreaView}>
            {isOffline && (
                <Modal
                    transparent={true}
                    animationType="slide"
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalText}>
                                {t('shops.offline')}
                            </Text>
                            <Pressable onPress={() => setModalVisible(false)} style={styles.modalButton}>
                                <Text style={styles.modalButtonText}>OK</Text>
                            </Pressable>
                        </View>
                    </View>
                </Modal>
            )}

            <View style={[styles.container, theme.background]}>
                <View>
                    <Text style={[theme.textColor, styles.title]}>{t('shops.title')}</Text>
                </View>

                <View style={styles.switchContainer}>
                    <Text style={[styles.switchText, theme.textColor]}>{t('shops.map')}</Text>
                    <Switch
                        value={isList}
                        onValueChange={togglePreference}
                        thumbColor={isList ? "rgb(84,105,244)" : "#64e1d3"}
                        trackColor={{ false: "#bbbbbb", true: "#444444" }}
                    />
                    <Text style={[styles.switchText, theme.textColor]}>{t('shops.list')}</Text>
                </View>

                {isList ? (
                    <FlatList
                        data={guitarStores}
                        keyExtractor={(item) => item.id.toString()}
                        ListEmptyComponent={<ActivityIndicator size="large" color="#0000ff" />}
                        renderItem={({ item }) => (
                            <Pressable
                                style={styles.listItem}
                                onPress={() => navigation.navigate('GuitarStoreDetail', { id: item.id })}
                            >
                                <View>
                                    <Text style={[styles.listText, { color: '#333' }]}>{item.name}</Text>
                                    <Text style={{ color: isElectric ? '#f38282' : '#555' }}>{item.address}</Text>
                                </View>

                                <View style={[
                                    styles.favoriteButton,
                                    { backgroundColor: isFavorite(item.id) ? '#e63946' : '#ccc' }
                                ]}>
                                    <Ionicons
                                        name={isFavorite(item.id) ? 'heart' : 'heart-outline'}
                                        size={30}
                                        color={isFavorite(item.id) ? '#fff' : '#333'}
                                    />
                                </View>
                            </Pressable>
                        )}
                    />
                ) : (
                    <View style={styles.mapContainer}>
                        <MapView
                            ref={mapRef}
                            style={styles.map}
                            initialRegion={{
                                latitude: 52.0400,
                                longitude: 4.4950,
                                latitudeDelta: 0.8,
                                longitudeDelta: 1.2,
                            }}
                        >
                            {guitarStores.length > 0 &&
                                guitarStores.map((item) => (
                                    <Marker
                                        key={item.id}
                                        coordinate={{ latitude: item.latitude, longitude: item.longitude }}
                                        title={item.name}
                                        description={item.address}
                                        pinColor="red"
                                    />
                                ))}

                            {location && (
                                <Marker coordinate={location} title={t('shops.location')} pinColor="blue" />
                            )}

                            {track.map((marker) => (
                                <Marker
                                    key={marker.id}
                                    coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
                                    title={t('shops.location')}
                                    pinColor="blue"
                                />
                            ))}
                        </MapView>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeAreaView: {
        flex: 1,
    },
    container: {
        flex: 1,
        padding: 10,
    },
    flex: {
        flexDirection: "row",
    },
    favoriteButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ccc',
        position: 'absolute',
        right: 10,
        top: '50%',
        marginTop: -10,
        zIndex: 10,
    },
    acousticTheme: {
        background: { backgroundColor: "#F5E1C8" },
        textColor: { color: "#5A3E2B" },
    },
    electricTheme: {
        background: { backgroundColor: "#181818" },
        textColor: { color: "#E63946" },
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
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    switchContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginVertical: 10,
    },
    switchText: {
        fontSize: 14,
        marginHorizontal: 10,
        fontWeight: '500',
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 10,
        textAlign: "center",
    },
    listText: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 10,
    },
    listItem: {
        backgroundColor: '#e1eae3',
        padding: 15,
        marginVertical: 6,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
        width: '80%',
    },
    modalText: {
        fontSize: 16,
        marginBottom: 10,
    },
    modalButton: {
        backgroundColor: '#2196F3',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 5,
    },
    modalButtonText: {
        color: 'white',
    },
});