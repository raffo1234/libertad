import { useStore } from "@nanostores/react";
import { sharedArea } from "../stores/states";

export default function TabNavigation({ tabs }: { tabs: string[] }) {
  const area = useStore(sharedArea);

  return (
    <div className="bg-[#E0DDD8] rounded-[19px] p-2 flex space-x-2 text-sm">
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
            className={`${activeClass} font-bold py-3 px-3 sm:px-8 rounded-[15px]`}
            onClick={onClick}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );
}
