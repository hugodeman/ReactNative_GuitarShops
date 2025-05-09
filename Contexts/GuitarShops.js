import React, { createContext, useState, useEffect } from "react";
import Constants from 'expo-constants';

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

            if (!result.ok) {
                throw new Error(`HTTP Error! Status: ${result.status}`);
            }

            const text = await result.text();

            const jsonData = JSON.parse(text);
            if (!jsonData.guitar_stores) {
                throw new Error("JSON structuur klopt niet, 'guitar_stores' ontbreekt!");
            }

            setGuitarStores(jsonData.guitar_stores);
        } catch (e) {
            console.error("JSON Parse Error:", e.message);
        }
    };

    useEffect(() => {
        fetchGuitarStores();
    }, []);

    return (
        <GuitarStoresContext.Provider value={{ guitarStores }}>
            {children}
        </GuitarStoresContext.Provider>
    );
}

