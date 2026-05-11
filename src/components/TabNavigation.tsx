import { useEffect, useState } from "react";
import { useStore } from "@nanostores/react";
import { sharedArea } from "../stores/states";

export default function TabNavigation({ tabs }: { tabs: string[] }) {
  // 1. Estado de montaje para evitar que el servidor intente adivinar la posición
  const [isMounted, setIsMounted] = useState(false);

  const area = useStore(sharedArea);

  // 2. Solo activamos la lógica en el cliente
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 3. Normalización de índice (siempre seguro)
  const activeIndex = area ? parseInt(area, 10) : 0;
  const totalTabs = tabs.length;

  // 4. Mientras sea SSR, devolvemos un cascarón idéntico pero estático
  // Esto evita que React compare atributos dinámicos como 'left' o 'width'
  if (!isMounted) {
    return (
      <nav className="relative mx-auto flex w-fit items-center rounded-[20px] bg-[#E0DDD8] p-1.5 opacity-0 shadow-inner">
        {tabs.map((tab, index) => (
          <div key={index} className="h-[40px] min-w-[100px] px-4 py-2.5 sm:px-8" />
        ))}
      </nav>
    );
  }

  return (
    <nav className="relative mx-auto flex w-fit items-center rounded-[20px] bg-[#E0DDD8] p-1.5 shadow-inner">
      {/* EL SLIDER (La pastilla) */}
      <div
        className="absolute inset-y-1.5 rounded-[16px] bg-[#F4F2EE] shadow-sm transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{
          width: `calc((100% - 12px) / ${totalTabs})`,
          left: `calc(6px + (${activeIndex} * (100% - 12px) / ${totalTabs}))`,
        }}
      />

      {tabs.map((tab, index) => {
        const isActive = activeIndex === index;
        return (
          <button
            key={index}
            type="button"
            onClick={() => sharedArea.set(index.toString())}
            className={`relative z-10 min-w-[100px] flex-1 px-4 py-2.5 text-sm font-semibold transition-colors duration-500 sm:px-8 ${isActive ? "text-gray-900" : "text-[#807357] hover:text-gray-900"}`}
          >
            {tab}
          </button>
        );
      })}
    </nav>
  );
}
