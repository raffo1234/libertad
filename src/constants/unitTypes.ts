export const UNIT_TYPES = {
  type_1: "Tipo 1",
  type_2: "Tipo 2",
  type_3: "Tipo 3",
  type_4: "Tipo 4",
  parking: "Estacionamiento",
} as const;

export type UnitType = keyof typeof UNIT_TYPES;
export type UnitTypeOrEmpty = UnitType | "";
