export default function LogoLink() {
  return (
    <a href="/" title="Galvez 1519 - Hogar soñado en el corazón de El Tambo">
      <Logo />
    </a>
  );
}

export function Logo() {
  return (
    <span className="font-tan-pearl flex items-center space-x-1 self-center text-2xl tracking-wider">
      <span className="pt-1">GALVEZ</span>
      <span className="rounded-md bg-[#795a45] px-2 pt-1.5 text-white"> 1519 </span>
    </span>
  );
}
