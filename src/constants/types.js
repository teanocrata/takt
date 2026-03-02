export const INTERVAL_TYPES = [
  { id: 'paso', label: 'Paso', color: '#5b8a72' },
  { id: 'trote', label: 'Trote', color: '#c87941' },
  { id: 'galope', label: 'Galope', color: '#b85450' },
  { id: 'lateral', label: 'Lateral', color: '#6b7db3' },
  { id: 'descanso', label: 'Descanso', color: '#7a7a6a' },
  { id: 'salto', label: 'Salto', color: '#9b6b9e' },
];

export const TYPE_MAP = Object.fromEntries(
  INTERVAL_TYPES.map((t) => [t.id, t])
);

export const getTypeColor = (typeId) => TYPE_MAP[typeId]?.color || '#8a8580';
export const getTypeLabel = (typeId) => TYPE_MAP[typeId]?.label || typeId;
