import { useStore } from "@nanostores/react";
import { isLocationModalOpen } from "../stores/states";

export default function DialogCloseButton({ children }: { children: React.ReactNode }) {
  const $isLocationModalOpen = useStore(isLocationModalOpen);
  const closeModal = () => isLocationModalOpen.set(!$isLocationModalOpen);

  return (
    <button
      onClick={closeModal}
      aria-label="Cerrar"
      className="absolute right-5 top-5 z-30 flex size-16 items-center justify-center rounded-full bg-[#ff9100] text-white"
    >
      {children}
    </button>
  );
}
