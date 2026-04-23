import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ScrollView, ActivityIndicator, Alert
} from 'react-native';
import { FirebaseService } from '../services/firebase';
import { Storage } from '../services/storage';
import { COLORS, SPACING } from '../constants/theme';

export default function AuthScreen({ navigation }) {
  const [isLogin, setIsLogin] = useState(false);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSenha, setShowSenha] = useState(false);

  async function handleAuth() {
    if (!email || !senha) { Alert.alert('Atencao', 'Preencha email e senha.'); return; }
    if (!isLogin && !nome) { Alert.alert('Atencao', 'Preencha seu nome.'); return; }
    if (senha.length < 6) { Alert.alert('Atencao', 'Senha minimo 6 caracteres.'); return; }

    setLoading(true);
    try {
      let user;
      if (isLogin) {
        user = await FirebaseService.login(email, senha);
        const dados = await FirebaseService.buscarProtocolo(user.uid);
        if (dados && dados.protocolo) {
          await Storage.set(Storage.KEYS.PROTOCOLO, dados.protocolo);
          await Storage.set(Storage.KEYS.PERFIL, dados.perfil || {});
          await Storage.set(Storage.KEYS.ATIVO, true);
          navigation.replace('Protocol');
          return;
        }
      } else {
        user = await FirebaseService.cadastrar(nome, email, senha);
      }
      await Storage.set(Storage.KEYS.AUTH, user.uid);
      await Storage.set(Storage.KEYS.USER, { nome: nome || email.split('@')[0], email, uid: user.uid });
      navigation.replace('Onboarding');
    } catch (e) {
      const msg =
        e.code === 'auth/email-already-in-use' ? 'Este email ja esta cadastrado.' :
        e.code === 'auth/wrong-password' || e.code === 'auth/invalid-credential' ? 'Email ou senha incorretos.' :
        e.code === 'auth/user-not-found' ? 'Conta nao encontrada.' :
        e.message || 'Erro ao autenticar.';
      Alert.alert('Erro', msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.brand}>Skincare by Polly</Text>
        <Text style={styles.tagline}>A rotina certa para a sua pele</Text>

        <View style={styles.tabs}>
          <TouchableOpacity style={[styles.tab, !isLogin && styles.tabActive]} onPress={() => setIsLogin(false)}>
            <Text style={[styles.tabText, !isLogin && styles.tabTextActive]}>Nova conta</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tab, isLogin && styles.tabActive]} onPress={() => setIsLogin(true)}>
            <Text style={[styles.tabText, isLogin && styles.tabTextActive]}>Ja tenho conta</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          {!isLogin && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Seu nome</Text>
              <TextInput style={styles.input} placeholder="Como quer ser chamada?" placeholderTextColor={COLORS.muted} value={nome} onChangeText={setNome} autoCapitalize="words" />
            </View>
          )}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput style={styles.input} placeholder="seu@email.com" placeholderTextColor={COLORS.muted} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Senha</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TextInput style={[styles.input, { flex: 1 }]} placeholder="Minimo 6 caracteres" placeholderTextColor={COLORS.muted} value={senha} onChangeText={setSenha} secureTextEntry={!showSenha} autoCapitalize="none" />
              <TouchableOpacity style={{ padding: 10 }} onPress={() => setShowSenha(!showSenha)}>
                <Text style={{ fontSize: 18 }}>{showSenha ? '🙈' : '👁'}</Text>
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity style={styles.btn} onPress={handleAuth} disabled={loading}>
            {loading ? <ActivityIndicator color={COLORS.dark} /> : <Text style={styles.btnText}>{isLogin ? 'Entrar' : 'Criar conta'}</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.dark },
  scroll: { flexGrow: 1, padding: SPACING.lg, justifyContent: 'center' },
  brand: { fontSize: 26, fontStyle: 'italic', color: COLORS.gold, textAlign: 'center', marginBottom: 8 },
  tagline: { fontSize: 13, color: COLORS.creamDim, textAlign: 'center', marginBottom: 40 },
  tabs: { flexDirection: 'row', backgroundColor: COLORS.dark2, borderRadius: 8, padding: 4, marginBottom: 24 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 6 },
  tabActive: { backgroundColor: COLORS.gold },
  tabText: { color: COLORS.muted, fontSize: 13, fontWeight: '600' },
  tabTextActive: { color: COLORS.dark },
  form: { gap: 16 },
  inputGroup: { gap: 6 },
  label: { color: COLORS.creamDim, fontSize: 12, letterSpacing: 1, textTransform: 'uppercase' },
  input: { backgroundColor: COLORS.dark2, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: 14, color: COLORS.cream, fontSize: 15 },
  btn: { backgroundColor: COLORS.gold, borderRadius: 8, padding: 16, alignItems: 'center', marginTop: 8 },
  btnText: { color: COLORS.dark, fontSize: 13, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase' },
});
