import { atom  } from "nanostores";
import { persistentAtom } from '@nanostores/persistent';

export const isLocationModalOpen = atom(false);

export const sharedArea = persistentAtom<string>("sharedArea", "0")
export const firstSliderImage = persistentAtom<string>("firstSliderImage", "0")