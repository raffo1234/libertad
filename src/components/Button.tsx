import { useStore } from "@nanostores/react";
import { isLocationModalOpen } from "../hooks/locationModalState";

export default function Button({ children }: { children: React.ReactNode }) {
  const $isLocationModalOpen = useStore(isLocationModalOpen);
  const openModal = () => {
    return isLocationModalOpen.set(!$isLocationModalOpen);
  };

  return (
    <button
      onClick={openModal}
      className="w-16 flex items-center justify-center h-16 rounded-full text-[#ff9100] bg-white absolute right-5 bottom-5"
    >
      {children}
    </button>
  );
}
