import { type ReactNode } from "react";
import { useStore } from "@nanostores/react";
import { sharedArea } from "../hooks/states";

const Button = ({
  isActive,
  onClick,
  children,
}: {
  isActive: boolean;
  children: ReactNode;
  onClick: () => void;
}) => {
  const activeClass = isActive ? "bg-[#EAE8E4]" : "text-[#807357]";

  return (
    <button
      onClick={onClick}
      className={`${activeClass} font-bold py-3 px-3 sm:px-8 rounded-[15px]`}
    >
      {children}
    </button>
  );
};

export default function TabNavigation({ tabs }: { tabs: string[] }) {
  const area = useStore(sharedArea);

  return (
    <div className="bg-[#E0DDD8] rounded-[19px] p-2 flex space-x-2 text-sm">
      {tabs.map((tab, index) => {
        const onClick = () => {
          sharedArea.set(index.toString());
        };
        const isActive = area === index.toString();

        return (
          <Button key={index} isActive={isActive} onClick={onClick}>
            {tab}
          </Button>
        );
      })}
    </div>
  );
}
