import './i18n';
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {createStackNavigator} from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import {useContext} from "react";
import { ThemeProvider, ThemeContext } from "./Contexts/ThemeContext";
import { NetworkProvider } from './Contexts/NetworkContext';
import { GuitarStores } from "./Contexts/GuitarShops";
import {useTranslation} from "react-i18next";

import HomeScreen from "./Screens/Home";
import GuitarStoresScreen from "./Screens/GuitarStoresScreen";
import SettingsScreen from "./Screens/SettingsScreen";
import {GuitarStoreDetail} from "./Screens/GuitarStoreDetailScreen";
import {StatusBar} from "react-native";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function MyTabs() {
    const { t } = useTranslation();
    const {isElectric} = useContext(ThemeContext);
    const themeColor = isElectric ? "#282828" : "#D4A373";

    return (
        <Tab.Navigator
            screenOptions={{
                tabBarStyle: {backgroundColor: themeColor},
                headerShown: false,
                tabBarInactiveTintColor: "#888",
            }}
            id={'RootTab'}>

            <Tab.Screen
                name={t('app.home')}
                component={HomeScreen}
                options={{
                    tabBarIcon: ({color, size}) => <Ionicons name="home" size={size} color={color}/>,
                }}
            />
            <Tab.Screen
                name={t('app.shops')}
                component={GuitarStoresScreen}
                options={{
                    tabBarIcon: ({color, size}) => <Ionicons name="list" size={size} color={color}/>,
                }}
            />
            <Tab.Screen
                name={t('app.settings')}
                component={SettingsScreen}
                options={{
                    tabBarIcon: ({color, size}) => <Ionicons name="settings" size={size} color={color}/>,
                }}
            />
        </Tab.Navigator>
    );
}

export default function App() {
    return (
        <NetworkProvider>
        <ThemeProvider>
            <GuitarStores>
                <NavigationContainer>
                    <StatusBar hidden={false} />
                    <Stack.Navigator id={'RootStack'}>
                        <Stack.Screen
                            name="GuitarStores"
                            component={MyTabs}
                            options={{headerShown: false}}
                        />
                        <Stack.Screen
                            name="GuitarStoreDetail"
                            component={GuitarStoreDetail}
                            options={{headerShown: false}}
                        />
                    </Stack.Navigator>
                </NavigationContainer>
            </GuitarStores>
        </ThemeProvider>
        </NetworkProvider>
    );
}