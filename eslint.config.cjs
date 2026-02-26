const tsParser = require("@typescript-eslint/parser");
const astroParser = require("astro-eslint-parser");
const tailwind = require("eslint-plugin-tailwindcss"); // <--- NUEVO

module.exports = [
  // 1. Configuración de Tailwind (Aplica a todo)
  ...tailwind.configs["flat/recommended"],

  // 2. Reglas para archivos Astro (Hero.astro, etc.)
  {
    files: ["**/*.astro"],
    languageOptions: {
      parser: astroParser,
      parserOptions: {
        parser: tsParser,
        extraFileExtensions: [".astro"],
        sourceType: "module",
      },
    },
    rules: {
      quotes: ["error", "double"],
      "tailwindcss/no-custom-classname": "off",
    },
  },

  // 3. Reglas para archivos TS y React (Componentes .tsx)
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        sourceType: "module",
      },
    },
    rules: {
      quotes: ["error", "double"],
      "tailwindcss/classnames-order": "error", // <--- FUERZA EL ORDEN DE CLASES
    },
  },

  {
    ignores: ["dist/", ".astro/", "node_modules/"],
  },
];
