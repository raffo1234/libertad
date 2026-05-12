// src/components/LeadCTAButton.tsx
export default function LeadCTAButton() {
  return (
    <button className="group relative inline-flex cursor-pointer items-center gap-2.5 overflow-hidden rounded-[10px] bg-[#795a45] px-7 py-3.5 text-[15px] font-medium text-white transition-[transform,background] duration-200 hover:scale-[1.04] hover:bg-[#6a4d3a] active:scale-[0.97]">
      <span className="transition-transform duration-300 group-hover:scale-[1.15] group-hover:-rotate-[8deg]">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M19 12h2l-9 -9l-9 9h2v7a2 2 0 0 0 2 2h5.5" />
          <path d="M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v.5" />
          <path d="M16 19h6" />
          <path d="M19 16v6" />
        </svg>
      </span>
      <span>Me interesa</span>
      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(120deg,transparent_30%,rgba(255,255,255,0.15)_50%,transparent_70%)] transition-transform duration-500 group-hover:translate-x-full" />
    </button>
  );
}
