import { useEffect, useRef, useState } from "react";
import { useStore } from "@nanostores/react";
import { sharedArea } from "../stores/states";
import CircleArrow from "./CircleArrow";
import PhotoSwipeLightbox from "photoswipe/lightbox";
import "photoswipe/dist/photoswipe.css";

// Sub-componente para gestionar el fundido de cada imagen al cargar
const FadeInImage = ({ src, alt }: { src: string; alt: string }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <img
      src={src}
      alt={alt}
      onLoad={() => setIsLoaded(true)}
      className={`size-full object-cover transition-all duration-1000 ease-out ${isLoaded ? "scale-100 opacity-100 blur-0" : "blur-xs scale-105 opacity-0"}`}
    />
  );
};

export default function TabNavigationImages({ images }: { images: string[][] }) {
  const $sharedArea = useStore(sharedArea);
  const areaIndex = Number($sharedArea || 0);

  const [displayIndex, setDisplayIndex] = useState(areaIndex);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const currentImages = images[displayIndex] || [];
  const lightbox = useRef<PhotoSwipeLightbox | null>(null);

  useEffect(() => {
    if (areaIndex !== displayIndex) {
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setDisplayIndex(areaIndex);
        setIsTransitioning(false);
      }, 350); // Tiempo para el fade-out
      return () => clearTimeout(timer);
    }
  }, [areaIndex, displayIndex]);

  useEffect(() => {
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
  }, [displayIndex]);

  const openFirst = () => {
    const firstLink = document.querySelector("#gallery-areas .pswp-link") as HTMLElement;
    firstLink?.click();
  };

  return (
    <div id="gallery-areas" className="flex h-[332px] w-full gap-3">
      {currentImages.slice(0, 3).map((img, idx) => (
        <article
          key={`${displayIndex}-${idx}`}
          className={`relative flex-1 overflow-hidden rounded-[50px] transition-all duration-500 ease-in-out ${idx === 0 ? "hidden lg:block" : ""} ${idx === 1 ? "hidden md:block" : ""} ${isTransitioning ? "scale-[0.98] animate-pulse bg-[#EAE8E4]" : "scale-100 bg-[#EAE8E4]"} `}
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
            className="absolute bottom-5 right-5 transition-transform hover:scale-110 active:scale-95"
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
