import { Children, forwardRef, isValidElement, type ReactNode } from "react";
import * as RadixSelect from "@radix-ui/react-select";
import { Icon } from "@iconify/react";

interface OptionProps {
  value: string;
  children: ReactNode;
  disabled?: boolean;
}

// Kept so callers can still write plain <option> children — this is the
// piece that gets pulled out of the tree and never rendered as a DOM node.
export function Option(_props: OptionProps) {
  return null;
}

interface SelectProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  name?: string;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
}

// Radix's accessible Select, adapted to read plain <option> children so the
// ~8 call sites across the CRM didn't need a rewrite — only the native
// browser popup (which CSS can't style) is replaced. Works on touch: Radix
// handles pointer/touch events and flips/clamps the popper so it never gets
// clipped at the viewport edge, including on small screens.
const Select = forwardRef<HTMLButtonElement, SelectProps>(function Select(
  { value, defaultValue, onChange, onBlur, name, disabled, className = "", children },
  ref,
) {
  const options = Children.toArray(children).filter(
    (child): child is React.ReactElement<OptionProps> => isValidElement(child),
  );

  const selected = options.find((o) => o.props.value === value);

  return (
    <RadixSelect.Root
      value={value}
      defaultValue={defaultValue}
      onValueChange={onChange}
      disabled={disabled}
      name={name}
    >
      <RadixSelect.Trigger
        ref={ref}
        onBlur={onBlur}
        className={`inline-flex items-center justify-between gap-2 px-4 py-2 outline-none data-placeholder:text-[#c2bdb6] ${className}`}
      >
        <RadixSelect.Value>{selected?.props.children}</RadixSelect.Value>
        <RadixSelect.Icon>
          <Icon icon="solar:alt-arrow-down-linear" className="h-3 w-3 shrink-0 text-[#9e9890]" />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>

      <RadixSelect.Portal>
        <RadixSelect.Content
          position="popper"
          sideOffset={6}
          collisionPadding={8}
          className="z-50 max-h-[min(20rem,var(--radix-select-content-available-height))] w-(--radix-select-trigger-width) min-w-40 overflow-hidden rounded-lg border border-[#e8e3db] bg-white shadow-lg"
        >
          <RadixSelect.Viewport className="p-1">
            {options.map((option) => (
              <RadixSelect.Item
                key={option.props.value}
                value={option.props.value}
                disabled={option.props.disabled}
                className="font-manrope relative flex cursor-pointer touch-manipulation items-center rounded-md px-3 py-2.5 text-sm text-[#1c1a16] outline-none select-none data-disabled:cursor-not-allowed data-disabled:opacity-40 data-highlighted:bg-[#f0ede8] data-[state=checked]:font-medium"
              >
                <RadixSelect.ItemText>{option.props.children}</RadixSelect.ItemText>
              </RadixSelect.Item>
            ))}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
});

export default Select;
