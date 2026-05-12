// src/data/typologies.ts
import { UNIT_TYPES, type UnitType } from "../constants/unitTypes";
import type { ImageMetadata } from "astro";
import image1 from "../assets/interior-1.jpg";

export interface TypologyFeature {
  value: string | number;
  label: string;
  isBold?: boolean;
}

export interface Typology {
  type: UnitType;
  title: string;
  subtitle: string;
  area: string;
  floors: string[];
  image: ImageMetadata;
  features: TypologyFeature[];
}

const TYPES = Object.keys(UNIT_TYPES) as Array<keyof typeof UNIT_TYPES>;

export const typologies: Typology[] = [
  {
    type: TYPES[0],
    title: "70m²",
    subtitle: "Tipo 1",
    area: "70m²",
    floors: ["Piso 1"],
    image: image1,
    features: [
      { value: 3, label: "Dorms", isBold: true },
      { value: 2, label: "Baños", isBold: true },
      { value: "Kitchenette", label: "" },
      { value: "Sala / Comedor", label: "" },
      { value: "Centro de lavado", label: "" },
    ],
  },
  {
    type: TYPES[1],
    title: "81m²",
    subtitle: "Tipo 2",
    area: "81m²",
    floors: ["Piso 1"],
    image: image1,
    features: [
      { value: 3, label: "Dorms", isBold: true },
      { value: 2, label: "Baños", isBold: true },
      { value: "Kitchenette", label: "" },
      { value: "Sala / Comedor", label: "" },
      { value: "Centro de lavado", label: "" },
    ],
  },
  {
    type: TYPES[2],
    title: "90m²",
    subtitle: "Tipo 3",
    area: "90m²",
    floors: ["Piso 2", "Pisos 3 - 5, Balcón"],
    image: image1,
    features: [
      { value: 3, label: "Dorms", isBold: true },
      { value: 2, label: "Baños", isBold: true },
      { value: "Kitchenette", label: "" },
      { value: "Sala / Comedor", label: "" },
      { value: "Centro de lavado", label: "" },
    ],
  },
  {
    type: TYPES[3],
    title: "100m²",
    subtitle: "Tipo 4",
    area: "100m²",
    floors: ["Piso 2", "Pisos 3 - 5, Balcón"],
    image: image1,
    features: [
      { value: 3, label: "Dorms", isBold: true },
      { value: 2, label: "Baños", isBold: true },
      { value: "Kitchenette", label: "" },
      { value: "Sala / Comedor", label: "" },
      { value: "Centro de lavado", label: "" },
    ],
  },
];
