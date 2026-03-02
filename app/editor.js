import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSessions } from '../src/context/SessionContext';
import { INTERVAL_TYPES } from '../src/constants/types';
import { getTotalMinutes } from '../src/utils/formatTime';
import IntervalItem from '../src/components/IntervalItem';
import TypeBadge from '../src/components/TypeBadge';
import { colors, fonts, spacing, radius } from '../src/constants/theme';

const QUICK_ADD = [
  { name: 'Paso', minutes: 5, type: 'paso' },
  { name: 'Trote', minutes: 5, type: 'trote' },
  { name: 'Galope', minutes: 3, type: 'galope' },
  { name: 'Lateral', minutes: 3, type: 'lateral' },
  { name: 'Descanso', minutes: 2, type: 'descanso' },
  { name: 'Salto', minutes: 5, type: 'salto' },
];

export default function EditorScreen() {
  const { sessionId } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { getSession, addSession, updateSession } = useSessions();

  const isEditing = !!sessionId;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [intervals, setIntervals] = useState([]);
  const [selectedType, setSelectedType] = useState('paso');

  // Load existing session if editing
  useEffect(() => {
    if (sessionId) {
      const existing = getSession(sessionId);
      if (existing) {
        setName(existing.name);
        setDescription(existing.description || '');
        setIntervals([...existing.intervals]);
      }
    }
  }, [sessionId]);

  const addInterval = (template) => {
    setIntervals((prev) => [...prev, { ...template }]);
  };

  const addCustomInterval = () => {
    const type = INTERVAL_TYPES.find((t) => t.id === selectedType);
    setIntervals((prev) => [
      ...prev,
      { name: type.label, minutes: 3, type: selectedType },
    ]);
  };

  const updateInterval = (index, updated) => {
    setIntervals((prev) => prev.map((item, i) => (i === index ? updated : item)));
  };

  const deleteInterval = (index) => {
    setIntervals((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Introduce un nombre para la sesion');
      return;
    }
    if (intervals.length === 0) {
      Alert.alert('Error', 'Agrega al menos un intervalo');
      return;
    }

    const sessionData = {
      name: name.trim(),
      description: description.trim() || undefined,
      intervals,
    };

    if (isEditing) {
      updateSession(sessionId, sessionData);
    } else {
      addSession(sessionData);
    }

    router.back();
  };

  const totalMin = Math.round(getTotalMinutes(intervals));

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>Cancelar</Text>
        </Pressable>
        <Text style={styles.title}>
          {isEditing ? 'Editar sesion' : 'Nueva sesion'}
        </Text>
        <Pressable onPress={handleSave} style={styles.saveBtn}>
          <Text style={styles.saveText}>Guardar</Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Session info */}
        <TextInput
          style={styles.nameInput}
          value={name}
          onChangeText={setName}
          placeholder="Nombre de la sesion"
          placeholderTextColor={colors.textMuted}
        />
        <TextInput
          style={styles.descInput}
          value={description}
          onChangeText={setDescription}
          placeholder="Descripcion (opcional)"
          placeholderTextColor={colors.textMuted}
        />

        {/* Quick add buttons */}
        <Text style={styles.sectionLabel}>Agregar rapido</Text>
        <View style={styles.quickAdd}>
          {QUICK_ADD.map((item, idx) => (
            <Pressable
              key={idx}
              style={[
                styles.quickBtn,
                { borderColor: INTERVAL_TYPES.find((t) => t.id === item.type).color },
              ]}
              onPress={() => addInterval(item)}
            >
              <Text
                style={[
                  styles.quickBtnText,
                  {
                    color: INTERVAL_TYPES.find((t) => t.id === item.type).color,
                  },
                ]}
              >
                {item.name} {item.minutes}m
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Custom add */}
        <Text style={styles.sectionLabel}>Agregar por tipo</Text>
        <View style={styles.typeSelector}>
          {INTERVAL_TYPES.map((type) => (
            <TypeBadge
              key={type.id}
              label={type.label}
              color={type.color}
              selected={selectedType === type.id}
              onPress={() => setSelectedType(type.id)}
            />
          ))}
        </View>
        <Pressable style={styles.addBtn} onPress={addCustomInterval}>
          <Text style={styles.addBtnText}>+ Agregar intervalo</Text>
        </Pressable>

        {/* Interval list */}
        {intervals.length > 0 && (
          <>
            <View style={styles.intervalHeader}>
              <Text style={styles.sectionLabel}>
                Intervalos ({intervals.length})
              </Text>
              <Text style={styles.totalMin}>{totalMin} min</Text>
            </View>
            {intervals.map((interval, index) => (
              <IntervalItem
                key={index}
                interval={interval}
                index={index}
                onUpdate={(updated) => updateInterval(index, updated)}
                onDelete={() => deleteInterval(index)}
              />
            ))}
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  backBtn: {
    paddingVertical: spacing.xs,
  },
  backText: {
    fontFamily: fonts.sans,
    fontSize: 16,
    color: colors.textMuted,
  },
  title: {
    fontFamily: fonts.sansMedium,
    fontSize: 18,
    color: colors.text,
  },
  saveBtn: {
    paddingVertical: spacing.xs,
  },
  saveText: {
    fontFamily: fonts.sansMedium,
    fontSize: 16,
    color: colors.accent,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
  },
  nameInput: {
    fontFamily: fonts.sansMedium,
    fontSize: 20,
    color: colors.text,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  descInput: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 14,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: spacing.xxl,
    marginBottom: spacing.md,
  },
  quickAdd: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  quickBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  quickBtnText: {
    fontFamily: fonts.sansMedium,
    fontSize: 13,
  },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  addBtn: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  addBtnText: {
    fontFamily: fonts.sansMedium,
    fontSize: 14,
    color: colors.accent,
  },
  intervalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalMin: {
    fontFamily: fonts.mono,
    fontSize: 14,
    color: colors.textMuted,
    marginTop: spacing.xxl,
    marginBottom: spacing.md,
  },
});
