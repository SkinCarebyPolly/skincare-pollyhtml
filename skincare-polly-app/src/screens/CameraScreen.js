import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Dimensions, Alert
} from 'react-native';
import { CameraView, useCameraPermissions, Camera } from 'expo-camera';
import { COLORS } from '../constants/theme';

const { width, height } = Dimensions.get('window');

export default function CameraScreen({ onFotoCapturada, onPular, tipo = 'rosto' }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [faces, setFaces] = useState([]);
  const [brightness, setBrightness] = useState(0);
  const [ready, setReady] = useState(false);
  const cameraRef = useRef(null);

  useEffect(() => {
    if (!permission?.granted) requestPermission();
  }, []);

  function onFacesDetected({ faces: detectedFaces }) {
    setFaces(detectedFaces || []);
    setReady(detectedFaces?.length > 0 && brightness > 40);
  }

  async function tirarFoto() {
    if (!cameraRef.current) return;
    try {
      const foto = await cameraRef.current.takePictureAsync({
        quality: 0.7, base64: true,
      });
      onFotoCapturada(foto);
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível tirar a foto.');
    }
  }

  if (!permission?.granted) {
    return (
      <View style={styles.permContainer}>
        <Text style={styles.permText}>Precisamos da câmera para analisar sua pele</Text>
        <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
          <Text style={styles.permBtnText}>Permitir câmera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const faceDetectado = faces.length > 0;
  const luzOk = brightness > 40;
  const tudoOk = tipo === 'rosto' ? (faceDetectado && luzOk) : true;

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={tipo === 'rosto' ? 'front' : 'back'}
        onFacesDetected={tipo === 'rosto' ? onFacesDetected : undefined}
        faceDetectorSettings={tipo === 'rosto' ? {
          mode: 'fast',
          detectLandmarks: 'none',
          runClassifications: 'all',
          minDetectionInterval: 500,
          tracking: true,
        } : undefined}
      >
        {/* Overlay escuro nas bordas */}
        <View style={styles.overlay} />

        {/* Guia oval */}
        {tipo === 'rosto' && (
          <View style={styles.ovalGuide}>
            <View style={[styles.oval, faceDetectado && styles.ovalDetected]} />
          </View>
        )}

        {/* Indicadores */}
        {tipo === 'rosto' && (
          <View style={styles.indicators}>
            <Indicator
              label="Rosto"
              ok={faceDetectado}
              icon={faceDetectado ? '😊' : '👤'}
            />
            <Indicator
              label="Iluminação"
              ok={luzOk}
              icon={luzOk ? '☀️' : '🔦'}
            />
            <Indicator
              label="Posição"
              ok={faceDetectado}
              icon={faceDetectado ? '✅' : '↕️'}
            />
          </View>
        )}

        {/* Status */}
        <View style={styles.statusBar}>
          {tipo === 'rosto' ? (
            <Text style={[styles.statusText, tudoOk && styles.statusTextOk]}>
              {!faceDetectado ? '👤 Posicione seu rosto no círculo' :
               !luzOk ? '💡 Melhore a iluminação' :
               '✅ Perfeito! Pode fotografar'}
            </Text>
          ) : (
            <Text style={styles.statusTextOk}>📸 Posicione os produtos com os rótulos visíveis</Text>
          )}
        </View>

        {/* Botão de captura */}
        <View style={styles.snapArea}>
          <TouchableOpacity
            style={[styles.snapBtn, tudoOk && styles.snapBtnReady]}
            onPress={tirarFoto}
          >
            <View style={[styles.snapInner, tudoOk && styles.snapInnerReady]} />
          </TouchableOpacity>
        </View>

        {/* Pular */}
        <TouchableOpacity style={styles.skipBtn} onPress={onPular}>
          <Text style={styles.skipText}>Pular</Text>
        </TouchableOpacity>
      </CameraView>
    </View>
  );
}

function Indicator({ label, ok, icon }) {
  return (
    <View style={[styles.indicator, ok && styles.indicatorOk]}>
      <Text style={styles.indicatorIcon}>{icon}</Text>
      <Text style={[styles.indicatorLabel, ok && styles.indicatorLabelOk]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  permContainer: { flex: 1, backgroundColor: COLORS.dark, alignItems: 'center', justifyContent: 'center', padding: 32 },
  permText: { color: COLORS.cream, fontSize: 16, textAlign: 'center', marginBottom: 24 },
  permBtn: { backgroundColor: COLORS.gold, padding: 16, borderRadius: 8 },
  permBtnText: { color: COLORS.dark, fontWeight: '700' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    borderColor: 'rgba(0,0,0,0.5)',
  },
  ovalGuide: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 80,
  },
  oval: {
    width: 220,
    height: 280,
    borderRadius: 130,
    borderWidth: 2.5,
    borderColor: 'rgba(255,255,255,0.6)',
    borderStyle: 'dashed',
  },
  ovalDetected: {
    borderColor: COLORS.gold,
    borderStyle: 'solid',
  },
  indicators: {
    position: 'absolute',
    bottom: 180,
    left: 0, right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 20,
  },
  indicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  indicatorOk: { borderColor: COLORS.gold },
  indicatorIcon: { fontSize: 14 },
  indicatorLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '600' },
  indicatorLabelOk: { color: COLORS.gold },
  statusBar: {
    position: 'absolute',
    top: 60,
    left: 20, right: 20,
    alignItems: 'center',
  },
  statusText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '600',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    overflow: 'hidden',
  },
  statusTextOk: {
    color: COLORS.gold,
    fontSize: 14,
    fontWeight: '600',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    overflow: 'hidden',
  },
  snapArea: {
    position: 'absolute',
    bottom: 60,
    left: 0, right: 0,
    alignItems: 'center',
  },
  snapBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  snapBtnReady: { borderColor: COLORS.gold },
  snapInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  snapInnerReady: { backgroundColor: COLORS.gold },
  skipBtn: {
    position: 'absolute',
    top: 60,
    right: 20,
  },
  skipText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
});
