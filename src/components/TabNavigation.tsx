import { type ReactNode } from "react";
import { useStore } from "@nanostores/react";
import { sharedAreaTabs } from "../hooks/states";

const Button = ({
  isActive,
  children,
  onClick,
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

export default function TabNavigation() {
  const $sharedAreaTabs = useStore(sharedAreaTabs);

  const buttons = ["Gimnasio", "Terraza", "Reuniones SUM"];

  return (
    <div className="bg-[#E0DDD8] rounded-[19px] p-2 flex space-x-2 text-sm">
      {buttons.map((button, index) => {
        return (
          <Button
            key={index}
            onClick={() => sharedAreaTabs.set(index)}
            isActive={$sharedAreaTabs === index}
          >
            {button}
          </Button>
        );
      })}
    </div>
  );
}
