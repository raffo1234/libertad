interface Props {
  isDark?: boolean;
}

export default function CircleArrow({ isDark }: Props) {
  const boutiqueEase = "cubic-bezier(0.34, 1.56, 0.64, 1)";

  const containerClasses = isDark ? "bg-amber-700 text-white" : "bg-white text-amber-700";

  return (
    <span
      className={` ${containerClasses} group flex size-16 items-center justify-center rounded-full transition-all duration-500 hover:scale-110 active:scale-90`}
      style={{ transitionTimingFunction: boutiqueEase }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="40"
        height="40"
        viewBox="0 0 24 24"
        className="transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
      >
        <path
          fill="currentColor"
          d="m16.289 7.208l-9.766 9.746q-.14.14-.344.13q-.204-.009-.345-.15t-.14-.334t.14-.334L15.582 6.5H6.789q-.213 0-.357-.144t-.143-.357t.143-.356t.357-.143h9.692q.343 0 .575.232t.233.576V16q0 .213-.145.356t-.356.144t-.356-.144t-.144-.356z"
        />
      </svg>
    </span>
  );
}
