import { useStore } from "@nanostores/react";
import { sharedArea } from "../stores/states";

export default function TabNavigation({ tabs }: { tabs: string[] }) {
  const area = useStore(sharedArea) || "0";
  const activeIndex = Number(area);
  const totalTabs = tabs.length;

  return (
    <nav className="relative mx-auto flex w-fit items-center rounded-[20px] bg-[#E0DDD8] p-1.5 shadow-inner">
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
