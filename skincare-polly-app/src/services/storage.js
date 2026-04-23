import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  AUTH: 'sbp_auth',
  USER: 'sbp_user',
  PROTOCOLO: 'sbp_protocolo',
  PERFIL: 'sbp_perfil',
  ATIVO: 'sbp_ativo',
  PLANO: 'sbp_plano',
  EVOLUCAO: 'sbp_evo_historico',
};

export const Storage = {
  async get(key) {
    try {
      const val = await AsyncStorage.getItem(key);
      return val ? JSON.parse(val) : null;
    } catch { return null; }
  },
  async set(key, value) {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch {}
  },
  async remove(key) {
    try { await AsyncStorage.removeItem(key); } catch {}
  },
  async clear() {
    try {
      await AsyncStorage.multiRemove(Object.values(KEYS));
    } catch {}
  },
  KEYS,
};
