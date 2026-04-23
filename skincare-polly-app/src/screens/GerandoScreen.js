import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS } from '../constants/theme';

const MSGS = [
  'Analisando sua pele...',
  'Cruzando com seus hábitos...',
  'Identificando seus produtos...',
  'Montando rotina manhã e noite...',
  'Criando protocolo semanal...',
  'Finalizando seu protocolo...',
];

export default function GerandoScreen() {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex(i => (i + 1) % MSGS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.brand}>Skincare by Polly</Text>
      <ActivityIndicator color={COLORS.gold} size="large" style={{ marginBottom: 24 }} />
      <Text style={styles.msg}>{MSGS[msgIndex]}</Text>
      <Text style={styles.sub}>Pode demorar até 60 segundos</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0e0c0b', alignItems: 'center', justifyContent: 'center', padding: 32 },
  brand: { fontFamily: 'Georgia', fontSize: 24, fontStyle: 'italic', color: '#c9a96e', marginBottom: 40 },
  msg: { color: '#f5f0e8', fontSize: 16, textAlign: 'center', marginBottom: 12, fontWeight: '500' },
  sub: { color: 'rgba(245,240,232,0.4)', fontSize: 12, textAlign: 'center' },
});
