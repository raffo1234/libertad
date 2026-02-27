import { useState, useEffect } from "react";
import { useStore } from "@nanostores/react";
import { sharedArea } from "../stores/states";
import CircleArrow from "./CircleArrow";
import PhotoSwipeLightbox from "photoswipe/lightbox";
import "photoswipe/dist/photoswipe.css";
import { createLightbox } from "../lib/photoswipe";

const Image = ({ src, alt }: { src: string; alt: string }) => {
  const [loading, setLoading] = useState(true);
  return (
    <>
      {loading && <div className="size-full animate-pulse bg-[#EAE8E4]"></div>}
      <img
        loading="lazy"
        src={src}
        alt={alt}
        onLoad={() => setLoading(false)}
        className={`size-full object-cover transition-opacity duration-700 ease-in-out ${loading ? "opacity-0" : "opacity-100"}`}
      />
    </>
  );
};

export default function TabNavigationImages({ images }: { images: string[][]; hrefs: string[] }) {
  const $sharedArea = useStore(sharedArea);
  const areaIndex = Number($sharedArea);
  const currentImages = images[areaIndex] || [];

  useEffect(() => {
    const lightbox = createLightbox("#gallery-areas");

    lightbox.init();
    return () => lightbox.destroy();
  }, [areaIndex]);

  const visibleImages = currentImages.slice(0, 3);
  const hiddenImages = currentImages.slice(3);

  return (
    <div id="gallery-areas" className="-ml-2 flex h-[332px] space-x-2 lg:ml-0">
      {visibleImages.map((img, idx) => (
        <article
          key={`${areaIndex}-${idx}`}
          className={`h-full flex-1 overflow-hidden rounded-[50px] ${idx === 0 ? "hidden lg:block" : ""} ${idx === 1 ? "hidden md:block" : ""} ${idx === 2 ? "block" : ""}`}
        >
          <a
            href={img}
            data-pswp-width="1200"
            data-pswp-height="1600"
            className="pswp-link block size-full"
            target="_blank"
            rel="noreferrer"
          >
            <Image src={img} alt={`Área ${idx + 1}`} />
          </a>
        </article>
      ))}
      <article className="flex-1">
        <div className="relative h-full overflow-hidden rounded-[50px] bg-[#795a45] px-5 py-10 text-white sm:px-12 sm:py-16">
          <h3 className="mb-5 text-xl font-semibold tracking-wider sm:text-2xl">
            Espacios que Conectan
          </h3>
          <p className="text-sm opacity-90 sm:text-base">
            {currentImages.length} fotos disponibles para inspirar tus momentos.
          </p>
          <button
            onClick={() => (document.querySelector(".pswp-link") as HTMLElement)?.click()}
            title="Ver Galería Completa"
            className="absolute bottom-5 right-5"
          >
            <CircleArrow />
          </button>
        </div>
      </article>
      <div className="hidden">
        {hiddenImages.map((img, idx) => (
          <a
            key={`hidden-${idx}`}
            href={img}
            data-pswp-width="1200"
            data-pswp-height="1600"
            className="pswp-link"
          ></a>
        ))}
      </div>
    </div>
  );
}
