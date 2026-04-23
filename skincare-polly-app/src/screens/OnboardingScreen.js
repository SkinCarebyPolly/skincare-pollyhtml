import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  Alert, ActivityIndicator, Image, Modal
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import CameraScreen from './CameraScreen';
import { Storage } from '../services/storage';
import { ClaudeService } from '../services/claude';
import { FirebaseService } from '../services/firebase';
import { COLORS, SPACING } from '../constants/theme';

const PERGUNTAS = [
  {
    id: 'q1', titulo: 'O que mais te incomoda na pele?', multi: true,
    opcoes: [
      { label: 'Acne e espinhas', sub: 'Brilha ao longo do dia' },
      { label: 'Brilho excessivo / oleosidade' },
      { label: 'Poros dilatados' },
      { label: 'Manchas e tom irregular' },
      { label: 'Linhas finas e envelhecimento' },
      { label: 'Ressecamento e descamacao' },
      { label: 'Vermelhidao e sensibilidade' },
    ],
  },
  {
    id: 'q2', titulo: 'Como voce descreveria sua pele?', multi: false,
    opcoes: [
      { label: 'Oleosa', sub: 'Brilha ao longo do dia' },
      { label: 'Mista', sub: 'Oleosa na zona T' },
      { label: 'Seca', sub: 'Sente aperto, descama' },
      { label: 'Sensivel', sub: 'Reage facilmente' },
      { label: 'Normal', sub: 'Equilibrada' },
      { label: 'Nao sei', sub: 'A IA vai descobrir' },
    ],
  },
  {
    id: 'q3', titulo: 'Tem aparelhos de skincare?', multi: true, exclusivo: 'Nao tenho aparelhos',
    opcoes: [
      { label: 'Radiofrequencia', sub: 'Ex: Medicube Age-R, NEWA' },
      { label: 'LED facial', sub: 'Ex: NuFace, GESKE' },
      { label: 'Microcorrente', sub: 'Ex: Foreo' },
      { label: 'Gua sha / rolo' },
      { label: 'Limpeza sonica' },
      { label: 'Nao tenho aparelhos' },
    ],
  },
  {
    id: 'q4', titulo: 'Nivel de investimento?', multi: false,
    opcoes: [
      { label: 'Acessivel - Farmacia' },
      { label: 'Medio - Mix nacional + importado' },
      { label: 'Alto - K-Beauty' },
      { label: 'Premium - Alta performance' },
    ],
  },
  {
    id: 'q5', titulo: 'Habitos do dia a dia', multi: false, subgrupos: true,
    subgrupos_data: [
      { id: 'sol', label: 'Exposicao ao sol', opcoes: [{ label: 'Rara' }, { label: 'Frequente' }, { label: 'Muito intensa' }] },
      { id: 'sono', label: 'Qualidade do sono', opcoes: [{ label: 'Menos de 6h' }, { label: '6 a 8h' }, { label: 'Mais de 8h' }] },
      { id: 'estresse', label: 'Nivel de estresse', opcoes: [{ label: 'Baixo' }, { label: 'Moderado' }, { label: 'Alto' }] },
      { id: 'agua', label: 'Consumo de agua', opcoes: [{ label: 'Menos de 1L' }, { label: '1 a 2L' }, { label: 'Mais de 2L' }] },
      { id: 'sensibilidade', label: 'Sensibilidade', opcoes: [{ label: 'Resistente' }, { label: 'Levemente sensivel' }, { label: 'Muito sensivel' }] },
    ],
  },
  {
    id: 'q6', titulo: 'Tempo para a rotina?', multi: false,
    opcoes: [
      { label: 'Rapida - ate 5 minutos' },
      { label: 'Moderada - 10 a 15 minutos' },
      { label: 'Completa - 20 a 30 minutos' },
      { label: 'Sem limite - adoro skincare!' },
    ],
  },
  {
    id: 'q7', titulo: 'Informacao de seguranca importante', multi: false, isGravida: true,
    opcoes: [
      { label: 'Nao estou gravida nem amamentando' },
      { label: 'Estou gravida', sub: 'Protocolo sem retinol e AHA/BHA' },
      { label: 'Estou amamentando', sub: 'Protocolo com ativos seguros' },
      { label: 'Pos-parto', sub: 'Pele em reequilibrio hormonal' },
    ],
  },
  {
    id: 'q8', titulo: 'Ja usou ativos na pele?', multi: false,
    opcoes: [
      { label: 'Nunca usei', sub: 'So hidratante e protetor solar' },
      { label: 'Uso basico', sub: 'Vitamina C ou Niacinamida' },
      { label: 'Uso intermediario', sub: 'AHA/BHA, Retinol iniciante' },
      { label: 'Uso avancado', sub: 'Retinol, acidos fortes, combinacoes' },
    ],
  },
  {
    id: 'q9', titulo: 'Voce usa maquiagem?', multi: false,
    opcoes: [
      { label: 'Nao uso', sub: 'So em ocasioes especiais' },
      { label: 'Raramente', sub: 'Algumas vezes por semana' },
      { label: 'As vezes', sub: '1-2x por semana' },
      { label: 'Diariamente', sub: 'Todo dia' },
    ],
  },
  {
    id: 'q10', titulo: 'Pratica exercicio fisico?', multi: false,
    opcoes: [
      { label: 'Nao pratico' },
      { label: 'Leve', sub: '1-2x por semana' },
      { label: 'Moderado', sub: '3-4x por semana' },
      { label: 'Intenso', sub: '5x+ por semana' },
    ],
  },
  {
    id: 'q11', titulo: 'Qual o seu sonho para a pele?', multi: true,
    opcoes: [
      { label: 'Pele de vidro', sub: 'Brilho saudavel, poros invisiveis' },
      { label: 'Sem manchas', sub: 'Tom uniforme, sem marcas' },
      { label: 'Sem acne', sub: 'Pele limpa e sem espinhas' },
      { label: 'Anti-idade', sub: 'Firme, sem linhas e com vico' },
      { label: 'Hidratacao profunda', sub: 'Pele macia, sem ressecamento' },
    ],
  },
  {
    id: 'q12', titulo: 'Sua rotina hoje e...', multi: false,
    opcoes: [
      { label: 'Nenhuma', sub: 'Nao faco nada ainda' },
      { label: 'Basica', sub: 'Limpeza + protetor solar' },
      { label: 'Intermediaria', sub: 'Serum + hidratante + protetor' },
      { label: 'Avancada', sub: 'Multiplos passos, ativos, esfoliacao' },
    ],
  },
  {
    id: 'q13', titulo: 'Sua pele muda no mes?', multi: false,
    opcoes: [
      { label: 'Nao, fica igual' },
      { label: 'Sim, fica mais oleosa/com acne', sub: 'Antes da menstruacao' },
      { label: 'Sim, fica mais seca' },
      { label: 'Estou na menopausa' },
      { label: 'Uso anticoncepcional', sub: 'Hormonios regulados' },
    ],
  },
  {
    id: 'q14', titulo: 'Prefere produtos com qual textura?', multi: false,
    opcoes: [
      { label: 'Levissima', sub: 'Gel, agua, serum fluido' },
      { label: 'Leve', sub: 'Locao, emulsao, gel-creme' },
      { label: 'Media', sub: 'Creme fluido, hidratante comum' },
      { label: 'Rica', sub: 'Creme denso, oleo, manteiga' },
    ],
  },
  {
    id: 'q15', titulo: 'Como e sua alimentacao?', multi: false,
    opcoes: [
      { label: 'Muito saudavel', sub: 'Pouco acucar, muita fruta e vegetal' },
      { label: 'Equilibrada', sub: 'Mix de saudavel e processados' },
      { label: 'Muito processada', sub: 'Fast food, muito acucar e sodio' },
    ],
  },
];

export default function OnboardingScreen({ navigation }) {
  const [step, setStep] = useState(0);
  const [consents, setConsents] = useState([false, false, false]);
  const [respostas, setRespostas] = useState({});
  const [fotoRosto, setFotoRosto] = useState(null);
  const [fotoProd, setFotoProd] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cameraVisible, setCameraVisible] = useState(false);
  const [cameraTipo, setCameraTipo] = useState('rosto');

  const pergunta = step >= 1 && step <= 15 ? PERGUNTAS[step - 1] : null;

  function toggleConsent(i) {
    const novo = [...consents];
    novo[i] = !novo[i];
    setConsents(novo);
  }

  function toggleOpcao(qid, opcao, multi, exclusivo) {
    setRespostas(prev => {
      const atual = prev[qid] || [];
      if (!multi) return { ...prev, [qid]: [opcao] };
      if (opcao === exclusivo) return { ...prev, [qid]: [opcao] };
      const semExclusivo = atual.filter(o => o !== exclusivo);
      if (semExclusivo.includes(opcao)) return { ...prev, [qid]: semExclusivo.filter(o => o !== opcao) };
      return { ...prev, [qid]: [...semExclusivo, opcao] };
    });
  }

  function isSelected(qid, opcao) {
    return (respostas[qid] || []).includes(opcao);
  }

  function proximoPasso() {
    if (step === 0) {
      if (!consents.every(Boolean)) { Alert.alert('Atencao', 'Marque os 3 itens para continuar.'); return; }
      setStep(1); return;
    }
    if (step >= 1 && step <= 15) {
      const p = PERGUNTAS[step - 1];
      if (p.subgrupos) {
        const ok = p.subgrupos_data.every(sg => (respostas[sg.id] || []).length > 0);
        if (!ok) { Alert.alert('Atencao', 'Responda todos os subgrupos para continuar.'); return; }
      } else {
        if (!(respostas[p.id] || []).length) { Alert.alert('Atencao', 'Selecione pelo menos uma opcao.'); return; }
      }
      setStep(step + 1); return;
    }
    if (step === 16) { setStep(17); return; }
  }

  function pickImagem(tipo) {
    Alert.alert(
      tipo === 'rosto' ? 'Foto do rosto' : 'Foto dos produtos',
      'Como prefere adicionar?',
      [
        { text: 'Camera', onPress: () => { setCameraTipo(tipo); setCameraVisible(true); } },
        { text: 'Galeria', onPress: () => abrirGaleria(tipo) },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  }

  function onFotoCamera(foto) {
    setCameraVisible(false);
    if (cameraTipo === 'rosto') setFotoRosto(foto);
    else setFotoProd(foto);
  }

  async function abrirGaleria(tipo) {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permissao necessaria', 'Precisamos acesso a galeria.'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: tipo === 'rosto',
      aspect: tipo === 'rosto' ? [1, 1] : undefined,
      quality: 0.7, base64: true,
    });
    if (!result.canceled) {
      if (tipo === 'rosto') setFotoRosto(result.assets[0]);
      else setFotoProd(result.assets[0]);
    }
  }

  async function gerarProtocolo() {
    setLoading(true);
    try {
      let produtosTexto = '';
      if (fotoProd && fotoProd.base64) {
        try {
          const identificados = await ClaudeService.identificarProdutos(fotoProd.base64);
          if (identificados && identificados.produtos && identificados.produtos.length) {
            produtosTexto = identificados.produtos.map(p => p.nome + ' (' + p.categoria + ')').join('\n');
          }
        } catch (e) { console.log('Erro identificar produtos:', e); }
      }

      const userData = await Storage.get(Storage.KEYS.USER);
      const perfil = {
        nome: userData ? userData.nome : 'Cliente',
        tipoPele: respostas.q2 ? respostas.q2[0] : '',
        incomodos: respostas.q1 || [],
        aparelhos: respostas.q3 || [],
        investimento: respostas.q4 ? respostas.q4[0] : '',
        sol: respostas.sol ? respostas.sol[0] : '',
        sono: respostas.sono ? respostas.sono[0] : '',
        estresse: respostas.estresse ? respostas.estresse[0] : '',
        agua: respostas.agua ? respostas.agua[0] : '',
        sensibilidade: respostas.sensibilidade ? respostas.sensibilidade[0] : '',
        rotina: respostas.q6 ? respostas.q6[0] : '',
        gestante: respostas.q7 ? respostas.q7[0] : '',
        ativos: respostas.q8 ? respostas.q8[0] : '',
        maquiagem: respostas.q9 ? respostas.q9[0] : '',
        exercicio: respostas.q10 ? respostas.q10[0] : '',
        objetivo: respostas.q11 || [],
        rotina_atual: respostas.q12 ? respostas.q12[0] : '',
        ciclo: respostas.q13 ? respostas.q13[0] : '',
        textura: respostas.q14 ? respostas.q14[0] : '',
        alimentacao: respostas.q15 ? respostas.q15[0] : '',
      };

      const protocolo = await ClaudeService.gerarProtocolo(perfil, fotoRosto ? fotoRosto.base64 : null, produtosTexto);

      await Storage.set(Storage.KEYS.PROTOCOLO, protocolo);
      await Storage.set(Storage.KEYS.PERFIL, perfil);
      await Storage.set(Storage.KEYS.ATIVO, true);

      const auth = await Storage.get(Storage.KEYS.AUTH);
      if (auth) await FirebaseService.salvarProtocolo(auth, protocolo, perfil);

      navigation.replace('Protocol');
    } catch (e) {
      Alert.alert('Erro', 'Nao foi possivel gerar o protocolo. Verifique sua conexao.\n\n' + e.message);
    } finally {
      setLoading(false);
    }
  }

  // CAMERA MODAL
  if (cameraVisible) {
    return (
      <Modal visible={true} animationType="slide">
        <CameraScreen
          tipo={cameraTipo}
          onFotoCapturada={onFotoCamera}
          onPular={() => setCameraVisible(false)}
        />
      </Modal>
    );
  }

  // LGPD
  if (step === 0) {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.badge}>Antes de comecar</Text>
          <Text style={styles.h1}>Seu consentimento</Text>
          <Text style={styles.italic}>e essencial.</Text>
          <Text style={styles.sub}>Leia e concorde com os 3 pontos abaixo para continuar.</Text>
          {[
            ['Uso de imagem para IA', 'Autorizo o uso das minhas fotos para analise por IA com o objetivo de criar meu protocolo de skincare.'],
            ['Nao e consulta medica', 'Entendo que o Skincare by Polly e um app de estetica, nao substitui consulta medica ou dermatologica.'],
            ['Condicoes de pele', 'Em caso de doencas de pele ou alergias severas, consultarei um dermatologista antes de seguir qualquer protocolo.'],
          ].map(function(item, i) {
            return (
              <TouchableOpacity key={i} style={styles.checkItem} onPress={() => toggleConsent(i)}>
                <View style={[styles.checkbox, consents[i] && styles.checkboxOn]}>
                  {consents[i] ? <Text style={styles.checkmark}>checkmark</Text> : null}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.checkTitle}>{item[0]}</Text>
                  <Text style={styles.checkDesc}>{item[1]}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
          <TouchableOpacity
            style={[styles.btn, !consents.every(Boolean) && styles.btnDim]}
            onPress={proximoPasso}
            disabled={!consents.every(Boolean)}
          >
            <Text style={styles.btnText}>Concordo e quero comecar</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // PERGUNTAS
  if (step >= 1 && step <= 15) {
    const p = PERGUNTAS[step - 1];
    return (
      <View style={styles.container}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: (step / 15 * 100) + '%' }]} />
        </View>
        <Text style={styles.progressLabel}>{step}/15</Text>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.h1}>{p.titulo}</Text>

          {p.isGravida ? (
            <View style={styles.alertGravida}>
              <Text style={styles.alertGravidaTitulo}>Informacao de Seguranca</Text>
              <Text style={styles.alertGravidaTexto}>
                Esta pergunta e fundamental para a sua seguranca. Alguns ativos como Retinol, AHA/BHA e Vitamina A sao contraindicados durante a gravidez e amamentacao. A IA vai adaptar seu protocolo com ativos seguros para voce e seu bebe.
              </Text>
              <Text style={styles.alertGravidaSub}>Responda com honestidade - isso protege voce</Text>
            </View>
          ) : null}

          {p.subgrupos ? (
            p.subgrupos_data.map(function(sg) {
              return (
                <View key={sg.id} style={{ marginBottom: 20 }}>
                  <Text style={styles.subgrupoLabel}>{sg.label}</Text>
                  <View style={styles.subgrupoRow}>
                    {sg.opcoes.map(function(op) {
                      return (
                        <TouchableOpacity
                          key={op.label}
                          style={[styles.chipBtn, isSelected(sg.id, op.label) && styles.chipBtnOn]}
                          onPress={() => setRespostas(prev => ({ ...prev, [sg.id]: [op.label] }))}
                        >
                          <Text style={[styles.chipText, isSelected(sg.id, op.label) && styles.chipTextOn]}>{op.label}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              );
            })
          ) : (
            p.opcoes.map(function(op) {
              return (
                <TouchableOpacity
                  key={op.label}
                  style={[styles.opcao, isSelected(p.id, op.label) && styles.opcaoOn]}
                  onPress={() => toggleOpcao(p.id, op.label, p.multi, p.exclusivo)}
                >
                  <View style={[styles.opcaoCircle, isSelected(p.id, op.label) && styles.opcaoCircleOn]}>
                    {isSelected(p.id, op.label) ? <View style={styles.opcaoDot} /> : null}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.opcaoText, isSelected(p.id, op.label) && styles.opcaoTextOn]}>{op.label}</Text>
                    {op.sub ? <Text style={styles.opcaoSub}>{op.sub}</Text> : null}
                  </View>
                </TouchableOpacity>
              );
            })
          )}

          {p.multi && !p.subgrupos ? <Text style={styles.multiHint}>Pode selecionar mais de um</Text> : null}

          <TouchableOpacity style={styles.btn} onPress={proximoPasso}>
            <Text style={styles.btnText}>Continuar</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // FOTO ROSTO
  if (step === 16) {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.badge}>Analise da pele</Text>
          <Text style={styles.h1}>Foto do rosto</Text>
          <View style={styles.dicasBox}>
            <Text style={styles.dicasTitle}>Dicas para melhor analise</Text>
            <Text style={styles.dica}>Puxe o cabelo para tras</Text>
            <Text style={styles.dica}>Remova a maquiagem</Text>
            <Text style={styles.dica}>Boa iluminacao - luz natural</Text>
            <Text style={styles.dica}>Expressao neutra</Text>
            <Text style={styles.dica}>Sem oculos</Text>
          </View>
          {fotoRosto ? <Image source={{ uri: fotoRosto.uri }} style={styles.fotoPreview} /> : (
            <View style={styles.fotoPlaceholder}>
              <Text style={{ fontSize: 48 }}>camera</Text>
              <Text style={styles.fotoPlaceholderText}>Nenhuma foto selecionada</Text>
            </View>
          )}
          <TouchableOpacity style={styles.btn} onPress={() => pickImagem('rosto')}>
            <Text style={styles.btnText}>{fotoRosto ? 'Trocar foto' : 'Adicionar foto'}</Text>
          </TouchableOpacity>
          {fotoRosto ? (
            <TouchableOpacity style={[styles.btn, styles.btnSecondary, { marginTop: 8 }]} onPress={proximoPasso}>
              <Text style={styles.btnTextSecondary}>Continuar</Text>
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity onPress={proximoPasso} style={{ marginTop: 16, alignItems: 'center' }}>
            <Text style={{ color: COLORS.muted, fontSize: 13 }}>Pular esta etapa</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // FOTO PRODUTOS
  if (step === 17) {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.badge}>Seus produtos</Text>
          <Text style={styles.h1}>Tem produtos em casa?</Text>
          <Text style={styles.sub}>A IA vai identificar os produtos pelos rotulos e montar a rotina com eles.</Text>
          {fotoProd ? <Image source={{ uri: fotoProd.uri }} style={styles.fotoPreview} /> : (
            <View style={styles.fotoPlaceholder}>
              <Text style={{ fontSize: 48 }}>produtos</Text>
              <Text style={styles.fotoPlaceholderText}>Fotografe os rotulos dos seus produtos</Text>
            </View>
          )}
          <TouchableOpacity style={styles.btn} onPress={() => pickImagem('produtos')}>
            <Text style={styles.btnText}>{fotoProd ? 'Trocar foto' : 'Fotografar produtos'}</Text>
          </TouchableOpacity>
          {fotoProd && !loading ? (
            <TouchableOpacity style={[styles.btn, styles.btnSecondary, { marginTop: 8 }]} onPress={gerarProtocolo}>
              <Text style={styles.btnTextSecondary}>Gerar meu protocolo</Text>
            </TouchableOpacity>
          ) : null}
          {!loading ? (
            <TouchableOpacity onPress={gerarProtocolo} style={{ marginTop: 16, alignItems: 'center' }}>
              <Text style={{ color: COLORS.muted, fontSize: 13 }}>Nao tenho produtos - comecar do zero</Text>
            </TouchableOpacity>
          ) : null}
          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator color={COLORS.gold} size="large" />
              <Text style={styles.loadingText}>Criando seu protocolo personalizado...</Text>
              <Text style={styles.loadingSubText}>Pode demorar ate 60 segundos</Text>
            </View>
          ) : null}
        </ScrollView>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.dark },
  scroll: { padding: SPACING.lg, paddingTop: 50, paddingBottom: 40 },
  progressBar: { height: 3, backgroundColor: COLORS.dark2, marginTop: 40 },
  progressFill: { height: 3, backgroundColor: COLORS.gold },
  progressLabel: { color: COLORS.muted, fontSize: 11, letterSpacing: 2, textAlign: 'right', paddingHorizontal: SPACING.lg, paddingVertical: 4 },
  badge: { fontSize: 10, letterSpacing: 4, color: COLORS.gold, textTransform: 'uppercase', marginBottom: 8 },
  h1: { fontSize: 24, color: COLORS.cream, marginBottom: 4 },
  italic: { fontSize: 24, color: COLORS.gold, fontStyle: 'italic', marginBottom: 16 },
  sub: { fontSize: 14, color: COLORS.creamDim, lineHeight: 22, marginBottom: 20 },
  checkItem: { flexDirection: 'row', gap: 14, padding: 16, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, marginBottom: 12, alignItems: 'flex-start', backgroundColor: COLORS.dark2 },
  checkbox: { width: 24, height: 24, borderRadius: 4, borderWidth: 1.5, borderColor: COLORS.muted, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  checkboxOn: { backgroundColor: COLORS.gold, borderColor: COLORS.gold },
  checkmark: { color: COLORS.dark, fontSize: 14, fontWeight: 'bold' },
  checkTitle: { color: COLORS.cream, fontWeight: '600', fontSize: 14, marginBottom: 4 },
  checkDesc: { color: COLORS.creamDim, fontSize: 13, lineHeight: 20 },
  alertGravida: { backgroundColor: 'rgba(255,50,50,0.08)', borderWidth: 2, borderColor: 'rgba(255,100,100,0.5)', borderRadius: 14, padding: 18, marginBottom: 20 },
  alertGravidaTitulo: { color: '#FF6B6B', fontSize: 16, fontWeight: '700', marginBottom: 10 },
  alertGravidaTexto: { color: 'rgba(255,220,220,0.9)', fontSize: 14, lineHeight: 22, marginBottom: 10 },
  alertGravidaSub: { color: '#FF9999', fontSize: 13, textAlign: 'center', fontStyle: 'italic' },
  opcao: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, marginBottom: 10, backgroundColor: COLORS.dark2 },
  opcaoOn: { borderColor: COLORS.gold, backgroundColor: 'rgba(201,169,110,0.1)' },
  opcaoCircle: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: COLORS.muted, alignItems: 'center', justifyContent: 'center' },
  opcaoCircleOn: { borderColor: COLORS.gold },
  opcaoDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.gold },
  opcaoText: { color: COLORS.creamDim, fontSize: 15 },
  opcaoTextOn: { color: COLORS.gold, fontWeight: '600' },
  opcaoSub: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  multiHint: { color: COLORS.muted, fontSize: 12, marginBottom: 16, textAlign: 'center' },
  subgrupoLabel: { color: COLORS.gold, fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10, fontWeight: '600' },
  subgrupoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chipBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.dark2 },
  chipBtnOn: { borderColor: COLORS.gold, backgroundColor: 'rgba(201,169,110,0.15)' },
  chipText: { color: COLORS.muted, fontSize: 13 },
  chipTextOn: { color: COLORS.gold, fontWeight: '600' },
  btn: { backgroundColor: COLORS.gold, borderRadius: 8, padding: 16, alignItems: 'center', marginTop: 16 },
  btnDim: { opacity: 0.4 },
  btnText: { color: COLORS.dark, fontSize: 12, fontWeight: '700', letterSpacing: 3, textTransform: 'uppercase' },
  btnSecondary: { backgroundColor: 'transparent', borderWidth: 1, borderColor: COLORS.gold },
  btnTextSecondary: { color: COLORS.gold, fontSize: 12, fontWeight: '700', letterSpacing: 3, textTransform: 'uppercase' },
  fotoPreview: { width: '100%', height: 280, borderRadius: 12, marginVertical: 16, resizeMode: 'cover' },
  fotoPlaceholder: { width: '100%', height: 180, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center', marginVertical: 16, backgroundColor: COLORS.dark2 },
  fotoPlaceholderText: { color: COLORS.muted, marginTop: 8, fontSize: 13, textAlign: 'center' },
  dicasBox: { backgroundColor: COLORS.dark2, borderRadius: 10, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border },
  dicasTitle: { color: COLORS.gold, fontSize: 12, fontWeight: '600', marginBottom: 8 },
  dica: { color: COLORS.creamDim, fontSize: 13, marginBottom: 4 },
  loadingBox: { marginTop: 24, alignItems: 'center', gap: 12 },
  loadingText: { color: COLORS.gold, fontSize: 15, fontWeight: '600', textAlign: 'center' },
  loadingSubText: { color: COLORS.muted, fontSize: 12, textAlign: 'center', lineHeight: 20 },
});
