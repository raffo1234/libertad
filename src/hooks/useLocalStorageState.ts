import { useState, useEffect } from "react";

export const useLocalStorageState = (key: string, defaultValue = "") => {
  const [state, setState] = useState(
    () => window.localStorage.getItem(key) || defaultValue
  );

  useEffect(() => window.localStorage.setItem(key, state), [key, state]);

  return [state, setState] as const;
};