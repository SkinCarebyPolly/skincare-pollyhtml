import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Storage } from '../../services/storage';
import { COLORS, SPACING } from '../../constants/theme';

function useProtocolo() {
  const [protocolo, setProtocolo] = React.useState(null);
  const [perfil, setPerfil] = React.useState(null);
  React.useEffect(() => {
    Storage.get(Storage.KEYS.PROTOCOLO).then(setProtocolo);
    Storage.get(Storage.KEYS.PERFIL).then(setPerfil);
  }, []);
  return { protocolo, perfil };
}

function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

function StepItem({ passo, produto, como, icone, tempo }) {
  return (
    <View style={styles.stepItem}>
      <View style={styles.stepNum}><Text style={styles.stepNumText}>{passo}</Text></View>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={{ fontSize: 16 }}>{icone}</Text>
          <Text style={styles.stepProd}>{produto}</Text>
        </View>
        <Text style={styles.stepHow}>{como}</Text>
        {tempo && <Text style={styles.stepTime}>⏱ {tempo}</Text>}
      </View>
    </View>
  );
}

// ══ ADAPTAÇÃO ══
export function AdaptacaoScreen() {
  const { protocolo, perfil } = useProtocolo();
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionLabel}>Bem-vinda</Text>
      <Text style={styles.h1}>Olá, <Text style={styles.gold}>{perfil?.nome || 'cliente'}</Text> 🌸</Text>
      {protocolo?.diagnostico && (
        <Card>
          <Text style={styles.cardLabel}>✦ Diagnóstico da sua pele</Text>
          <Text style={styles.tipoPele}>Tipo: {protocolo.tipo_pele}</Text>
          <Text style={styles.diagnostico}>{typeof protocolo.diagnostico === 'object' ? Object.values(protocolo.diagnostico).join(' ') : protocolo.diagnostico}</Text>
        </Card>
      )}
      {protocolo?.tags?.length > 0 && (
        <View style={styles.tagsRow}>
          {protocolo.tags.map((t, i) => <View key={i} style={styles.tag}><Text style={styles.tagText}>{t}</Text></View>)}
        </View>
      )}
      {protocolo?.fase_adaptacao && (
        <Card style={{ borderColor: 'rgba(201,169,110,0.4)' }}>
          <Text style={styles.cardLabel}>⚠️ Fase de adaptação</Text>
          <Text style={styles.bodyText}>{protocolo.fase_adaptacao}</Text>
        </Card>
      )}
    </ScrollView>
  );
}

// ══ ROTINA ══
export function RotinaScreen() {
  const { protocolo } = useProtocolo();
  const [tab, setTab] = React.useState('manha');
  const hoje = new Date();
  const dias = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
  const diaHoje = dias[hoje.getDay()];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionLabel}>Rotina do dia</Text>
      <Text style={styles.h1}>Rotina de{'\n'}<Text style={styles.gold}>{diaHoje}-feira ✨</Text></Text>

      <View style={styles.tabRow}>
        <TouchableTab label="☀️ Manhã" active={tab === 'manha'} onPress={() => setTab('manha')} />
        <TouchableTab label="🌙 Noite" active={tab === 'noite'} onPress={() => setTab('noite')} />
      </View>

      {tab === 'manha' && protocolo?.rotina_manha?.map((item, i) => (
        <StepItem key={i} {...item} />
      ))}
      {tab === 'noite' && protocolo?.rotina_noite?.map((item, i) => (
        <StepItem key={i} {...item} />
      ))}
    </ScrollView>
  );
}

function TouchableTab({ label, active, onPress }) {
  const { TouchableOpacity } = require('react-native');
  return (
    <TouchableOpacity style={[styles.tab, active && styles.tabActive]} onPress={onPress}>
      <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

// ══ SEMANA ══
export function SemanaScreen() {
  const { protocolo } = useProtocolo();
  const dias = [
    { label: 'Seg / Qui', key: 'seg_qui' },
    { label: 'Ter / Sex', key: 'ter_sex' },
    { label: 'Qua / Sáb', key: 'qua_sab' },
    { label: 'Domingo', key: 'dom' },
  ];
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionLabel}>Calendário semanal</Text>
      <Text style={styles.h1}>Sua <Text style={styles.gold}>semana 🗓</Text></Text>
      {dias.map(d => (
        <Card key={d.key}>
          <Text style={styles.diaLabel}>{d.label}</Text>
          <Text style={styles.bodyText}>{protocolo?.semana?.[d.key] || '—'}</Text>
        </Card>
      ))}
    </ScrollView>
  );
}

// ══ ESPINHA ══
export function EspinhaScreen() {
  const { protocolo } = useProtocolo();
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionLabel}>Situação especial</Text>
      <Text style={styles.h1}>Protocolo <Text style={styles.gold}>Espinha 🔴</Text></Text>
      <Card style={{ borderColor: 'rgba(224,122,122,0.4)', backgroundColor: 'rgba(224,122,122,0.05)' }}>
        <Text style={styles.cardLabel}>🚫 Nunca esprema!</Text>
        <Text style={styles.bodyText}>Espremer rompe o folículo, espalha bactérias e cria marcas que demoram meses para sumir.</Text>
      </Card>
      {protocolo?.protocolo_espinha && (
        <Card><Text style={styles.bodyText}>{protocolo.protocolo_espinha}</Text></Card>
      )}
    </ScrollView>
  );
}

// ══ PRAIA ══
export function PraiaScreen() {
  const { protocolo } = useProtocolo();
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionLabel}>Situação especial</Text>
      <Text style={styles.h1}>Protocolo <Text style={styles.gold}>Praia 🏖</Text></Text>
      {protocolo?.protocolo_praia && (
        <Card><Text style={styles.bodyText}>{protocolo.protocolo_praia}</Text></Card>
      )}
    </ScrollView>
  );
}

// ══ MAKE ══
export function MakeScreen() {
  const { protocolo } = useProtocolo();
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionLabel}>Situação especial</Text>
      <Text style={styles.h1}>Protocolo <Text style={styles.gold}>Make 💄</Text></Text>
      {protocolo?.dicas_maquiagem && (
        <Card><Text style={styles.bodyText}>{protocolo.dicas_maquiagem}</Text></Card>
      )}
    </ScrollView>
  );
}

// ══ SUGESTÕES ══
export function SugestoesScreen() {
  const { protocolo } = useProtocolo();
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionLabel}>Lista de compras</Text>
      <Text style={styles.h1}>Sugestões <Text style={styles.gold}>⭐</Text></Text>
      {protocolo?.lista_compras?.map((item, i) => (
        <Card key={i}>
          <Text style={styles.bodyText}>• {item}</Text>
        </Card>
      ))}
    </ScrollView>
  );
}

// ══ EVOLUÇÃO ══
export function EvolucaoScreen() {
  const [historico, setHistorico] = React.useState([]);
  React.useEffect(() => {
    Storage.get(Storage.KEYS.EVOLUCAO).then(h => setHistorico(h || []));
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionLabel}>Acompanhamento</Text>
      <Text style={styles.h1}>Evolução <Text style={styles.gold}>📸</Text></Text>
      <Card>
        <Text style={styles.bodyText}>Em breve — registo fotográfico mensal com análise de IA para acompanhar a transformação da sua pele.</Text>
      </Card>
      {historico.length === 0 && (
        <Text style={{ color: COLORS.muted, textAlign: 'center', marginTop: 20 }}>Nenhuma foto registada ainda.</Text>
      )}
    </ScrollView>
  );
}

// ══ CONFIG ══
export function ConfigScreen({ navigation }) {
  const { perfil } = useProtocolo();
  const { TouchableOpacity } = require('react-native');

  async function handleLogout() {
    await Storage.clear();
    navigation?.replace('Auth');
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionLabel}>Configurações</Text>
      <Text style={styles.h1}>Config <Text style={styles.gold}>⚙️</Text></Text>
      {perfil && (
        <Card>
          <Text style={styles.cardLabel}>Perfil</Text>
          <Text style={styles.bodyText}>Nome: {perfil.nome}</Text>
          <Text style={styles.bodyText}>Tipo de pele: {perfil.tipoPele}</Text>
        </Card>
      )}
      <TouchableOpacity style={[styles.card, { borderColor: 'rgba(224,122,122,0.3)', marginTop: 16 }]} onPress={handleLogout}>
        <Text style={{ color: '#e07a7a', fontSize: 14, fontWeight: '600', textAlign: 'center' }}>Sair da conta</Text>
      </TouchableOpacity>
      <Text style={{ color: COLORS.muted, fontSize: 11, textAlign: 'center', marginTop: 24 }}>
        Suporte: skincarepolly@gmail.com
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.dark },
  content: { padding: SPACING.lg, paddingTop: 60, paddingBottom: 100 },
  sectionLabel: { fontSize: 10, letterSpacing: 3, color: COLORS.gold, textTransform: 'uppercase', marginBottom: 6 },
  h1: { fontSize: 26, color: COLORS.cream, fontFamily: 'Georgia', marginBottom: 20, lineHeight: 34 },
  gold: { color: COLORS.gold, fontStyle: 'italic' },
  card: { backgroundColor: COLORS.dark2, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, padding: 16, marginBottom: 12 },
  cardLabel: { fontSize: 10, letterSpacing: 2, color: COLORS.gold, textTransform: 'uppercase', marginBottom: 10 },
  tipoPele: { fontSize: 13, color: COLORS.gold, fontWeight: '600', marginBottom: 8 },
  diagnostico: { fontSize: 14, color: COLORS.creamDim, lineHeight: 22 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  tag: { backgroundColor: COLORS.goldDim, borderWidth: 1, borderColor: COLORS.border, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
  tagText: { color: COLORS.gold, fontSize: 11, fontWeight: '600' },
  bodyText: { color: COLORS.creamDim, fontSize: 14, lineHeight: 22 },
  stepItem: { flexDirection: 'row', gap: 14, marginBottom: 16, padding: 14, backgroundColor: COLORS.dark2, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border },
  stepNum: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.gold, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  stepNumText: { color: COLORS.dark, fontWeight: '700', fontSize: 13 },
  stepProd: { color: COLORS.cream, fontWeight: '600', fontSize: 14, flex: 1 },
  stepHow: { color: COLORS.creamDim, fontSize: 13, lineHeight: 20, marginTop: 6 },
  stepTime: { color: COLORS.gold, fontSize: 11, marginTop: 6, fontWeight: '600' },
  diaLabel: { color: COLORS.gold, fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: 8 },
  tabRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  tab: { flex: 1, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center' },
  tabActive: { backgroundColor: COLORS.gold, borderColor: COLORS.gold },
  tabText: { color: COLORS.muted, fontSize: 13, fontWeight: '600' },
  tabTextActive: { color: COLORS.dark },
});
