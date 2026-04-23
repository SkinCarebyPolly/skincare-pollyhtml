import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

import SplashScreen from '../screens/SplashScreen';
import AuthScreen from '../screens/AuthScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import { AdaptacaoScreen, RotinaScreen, SemanaScreen, EspinhaScreen, PraiaScreen, MakeScreen, SugestoesScreen, EvolucaoScreen, ConfigScreen } from '../screens/protocol/index';

import { COLORS } from '../constants/theme';

const Stack = createStackNavigator();
const Tab = createMaterialTopTabNavigator();

function ProtocolTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarScrollEnabled: true,
        tabBarStyle: { backgroundColor: COLORS.dark2, elevation: 0, shadowOpacity: 0 },
        tabBarIndicatorStyle: { backgroundColor: COLORS.gold, height: 2 },
        tabBarActiveTintColor: COLORS.gold,
        tabBarInactiveTintColor: COLORS.muted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', letterSpacing: 0.5 },
        tabBarItemStyle: { width: 'auto', paddingHorizontal: 12 },
      }}
    >
      <Tab.Screen name="🌱 Adaptação" component={AdaptacaoScreen} />
      <Tab.Screen name="⭐ Sugestões" component={SugestoesScreen} />
      <Tab.Screen name="✨ Rotina" component={RotinaScreen} />
      <Tab.Screen name="🗓 Semana" component={SemanaScreen} />
      <Tab.Screen name="🔴 Espinha" component={EspinhaScreen} />
      <Tab.Screen name="🏖 Praia" component={PraiaScreen} />
      <Tab.Screen name="💄 Make" component={MakeScreen} />
      <Tab.Screen name="📸 Evolução" component={EvolucaoScreen} />
      <Tab.Screen name="⚙️ Config" component={ConfigScreen} />
    </Tab.Navigator>
  );
}

export default function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Auth" component={AuthScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Protocol" component={ProtocolTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
