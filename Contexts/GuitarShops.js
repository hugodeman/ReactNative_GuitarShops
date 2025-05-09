import React, { createContext, useState, useEffect } from "react";
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

const url = Constants.expoConfig?.extra?.GUITARSTORES;

export const GuitarStoresContext = createContext();

export const GuitarStores = ({ children }) => {
    const [guitarStores, setGuitarStores] = useState([]);

    const fetchGuitarStores = async () => {
        try {
            const result = await fetch(url, {
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!result.ok) throw new Error(`HTTP Error: ${result.status}`);

            const jsonData = await result.json();

            if (!jsonData.guitar_stores) throw new Error("Geen 'guitar_stores' gevonden!");

            setGuitarStores(jsonData.guitar_stores);

            await AsyncStorage.setItem("guitarStores", JSON.stringify(jsonData.guitar_stores));
        } catch (e) {
            console.error("Fout bij ophalen data:", e.message);

            // caching
            try {
                const cached = await AsyncStorage.getItem("guitarStores");
                if (cached) {
                    setGuitarStores(JSON.parse(cached));
                    console.log("Offline data geladen uit AsyncStorage");
                }
            } catch (storageError) {
                console.error("Fout bij lezen van cache:", storageError);
            }
        }
    };

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            if (state.isConnected) {
                fetchGuitarStores();
            } else {
                (async () => {
                    const cached = await AsyncStorage.getItem("guitarStores");
                    if (cached) {
                        setGuitarStores(JSON.parse(cached));
                    }
                })();
            }
        });

        return () => unsubscribe();
    }, []);

    return (
        <GuitarStoresContext.Provider value={{ guitarStores }}>
            {children}
        </GuitarStoresContext.Provider>
    );
};
