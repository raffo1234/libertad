import { useStore } from "@nanostores/react";
import { isLocationModalOpen } from "../stores/states";

export default function DialogCloseButton({
  children,
}: {
  children: React.ReactNode;
}) {
  const $isLocationModalOpen = useStore(isLocationModalOpen);
  const closeModal = () => isLocationModalOpen.set(!$isLocationModalOpen);

  return (
    <button
      onClick={closeModal}
      aria-label="Cerrar"
      className="absolute top-5 z-30 right-5 w-16 flex items-center justify-center h-16 rounded-full bg-[#ff9100] text-white "
    >
      {children}
    </button>
  );
}
