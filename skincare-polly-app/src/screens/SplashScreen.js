import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Storage } from '../services/storage';
import { FirebaseService } from '../services/firebase';
import { COLORS } from '../constants/theme';

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      // Primeiro verificar localStorage
      const protocolo = await Storage.get(Storage.KEYS.PROTOCOLO);
      const ativo = await Storage.get(Storage.KEYS.ATIVO);

      if (protocolo && ativo) {
        navigation.replace('Protocol');
        return;
      }

      // Depois verificar Firebase
      const unsubscribe = await FirebaseService.onAuthStateChanged(async (user) => {
        unsubscribe();
        if (user) {
          try {
            const dados = await FirebaseService.buscarProtocolo(user.uid);
            if (dados && dados.protocolo) {
              await Storage.set(Storage.KEYS.PROTOCOLO, dados.protocolo);
              await Storage.set(Storage.KEYS.PERFIL, dados.perfil || {});
              await Storage.set(Storage.KEYS.ATIVO, true);
              navigation.replace('Protocol');
              return;
            }
          } catch (e) {
            console.log('Firebase error:', e);
          }
          navigation.replace('Onboarding');
        } else {
          navigation.replace('Auth');
        }
      });
    } catch (e) {
      console.log('Auth check error:', e);
      navigation.replace('Auth');
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.brand}>Skincare by Polly</Text>
      <Text style={styles.tagline}>O seu protocolo de pele de dorama</Text>
      <ActivityIndicator color={COLORS.gold} style={{ marginTop: 40 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.dark, alignItems: 'center', justifyContent: 'center' },
  brand: { fontSize: 28, fontStyle: 'italic', color: COLORS.gold, marginBottom: 12 },
  tagline: { fontSize: 14, color: COLORS.creamDim, letterSpacing: 1 },
});
