export default function Button({ children }: { children: React.ReactNode }) {
  return (
    <button className="w-16 flex items-center justify-center h-16 rounded-full text-[#ff9100] bg-white absolute right-5 bottom-5">
      {children}
    </button>
  );
}
