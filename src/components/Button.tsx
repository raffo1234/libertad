export default function Button({ children }: { children: React.ReactNode }) {
  return (
    <button
      aria-label="Ver más"
      className="absolute bottom-5 right-5 flex size-16 items-center justify-center rounded-full bg-white text-[#ff9100]"
    >
      {children}
    </button>
  );
}
