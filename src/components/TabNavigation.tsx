import { useStore } from "@nanostores/react";
import { sharedArea } from "../stores/states";

export default function TabNavigation({ tabs }: { tabs: string[] }) {
  const area = useStore(sharedArea);

  return (
    <div className="flex space-x-2 rounded-[19px] bg-[#E0DDD8] p-2 text-sm">
      {tabs.map((tab, index) => {
        const onClick = () => {
          sharedArea.set(index.toString());
        };
        const isActive = area === index.toString();
        const activeClass = isActive ? "bg-[#EAE8E4]" : "text-[#807357]";

        return (
          <button
            aria-label="Ver más"
            key={index}
            title={tab}
            className={`${activeClass} rounded-[15px] p-3 font-bold sm:px-8`}
            onClick={onClick}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );
}
