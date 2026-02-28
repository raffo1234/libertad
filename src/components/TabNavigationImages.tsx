import { useEffect, useRef, useState } from "react";
import { useStore } from "@nanostores/react";
import { sharedArea } from "../stores/states";
import CircleArrow from "./CircleArrow";
import PhotoSwipeLightbox from "photoswipe/lightbox";
import "photoswipe/dist/photoswipe.css";

const FadeInImage = ({ src, alt }: { src: string; alt: string }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <img
      src={src}
      alt={alt}
      onLoad={() => setIsLoaded(true)}
      className={`hover-boutique size-full object-cover transition-all duration-1000 ease-out ${isLoaded ? "scale-100 opacity-100 blur-0" : "scale-105 opacity-0 blur-sm"}`}
    />
  );
};

export default function TabNavigationImages({ images }: { images: string[][] }) {
  // 1. Control de hidratación para evitar el error de Next.js/Astro
  const [isMounted, setIsMounted] = useState(false);
  const $sharedArea = useStore(sharedArea);

  // Normalizamos el índice (siempre base 10)
  const areaIndex = $sharedArea ? parseInt($sharedArea, 10) : 0;

  const [displayIndex, setDisplayIndex] = useState(areaIndex);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const lightbox = useRef<PhotoSwipeLightbox | null>(null);

  // Marcar como montado al entrar al cliente
  useEffect(() => {
    setIsMounted(true);
    setDisplayIndex(areaIndex);
  }, []);

  // Sincronizar cambios de pestaña con transición
  useEffect(() => {
    if (isMounted && areaIndex !== displayIndex) {
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setDisplayIndex(areaIndex);
        setIsTransitioning(false);
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [areaIndex, displayIndex, isMounted]);

  // Inicializar PhotoSwipe
  useEffect(() => {
    if (!isMounted) return;

    lightbox.current = new PhotoSwipeLightbox({
      gallery: "#gallery-areas",
      children: "a.pswp-link",
      pswpModule: () => import("photoswipe"),
    });
    lightbox.current.init();

    return () => {
      lightbox.current?.destroy();
      lightbox.current = null;
    };
  }, [displayIndex, isMounted]);

  const openFirst = () => {
    const firstLink = document.querySelector("#gallery-areas .pswp-link") as HTMLElement;
    firstLink?.click();
  };

  // Mientras no esté montado, renderizamos un contenedor vacío con la misma altura
  // Esto evita que el servidor mande datos que choquen con el cliente (Hydration Error)
  if (!isMounted) {
    return <div className="h-[332px] w-full animate-pulse rounded-[50px] bg-[#EAE8E4]" />;
  }

  const currentImages = images[displayIndex] || [];

  return (
    <div id="gallery-areas" className="flex h-[332px] w-full gap-3">
      {currentImages.slice(0, 3).map((img, idx) => (
        <article
          key={`${displayIndex}-${idx}`}
          className={`relative flex-1 overflow-hidden rounded-[50px] transition-all duration-500 ease-in-out ${idx === 0 ? "hidden lg:block" : ""} ${idx === 1 ? "hidden md:block" : ""} ${isTransitioning ? "scale-[0.98] animate-pulse bg-[#EAE8E4]" : "scale-100 bg-[#F4F2EE]"} `}
        >
          <a
            href={img}
            data-pswp-width="1200"
            data-pswp-height="1600"
            className={`pswp-link group block size-full transition-opacity duration-300 ${isTransitioning ? "opacity-0" : "opacity-100"}`}
          >
            <FadeInImage src={img} alt="Área común" />
          </a>
        </article>
      ))}

      <article
        className={`flex-1 transition-all duration-500 ${isTransitioning ? "scale-[0.98] opacity-80" : "scale-100 opacity-100"}`}
      >
        <div className="relative flex h-full flex-col justify-center overflow-hidden rounded-[50px] bg-[#795a45] p-8 text-white shadow-lg">
          <h3 className="mb-2 text-xl font-semibold sm:text-2xl">Espacios que Conectan</h3>
          <p className="mb-6 text-sm opacity-80">{currentImages.length} fotos disponibles</p>
          <button
            onClick={openFirst}
            className="absolute bottom-5 right-5 transition-transform duration-500 hover:scale-110 active:scale-90"
            style={{ transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)" }}
          >
            <CircleArrow />
          </button>
        </div>
      </article>

      <div className="hidden">
        {currentImages.slice(3).map((img, idx) => (
          <a
            key={idx}
            href={img}
            data-pswp-width="1200"
            data-pswp-height="1600"
            className="pswp-link"
          />
        ))}
      </div>
    </div>
  );
}
