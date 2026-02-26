import { useState } from "react";
import { Icon } from "@iconify/react";
import { useStore } from "@nanostores/react";
import { sharedArea, firstSliderImage } from "../stores/states";

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

export default function TabNavigationImages({
  images,
  hrefs,
}: {
  images: string[][];
  hrefs: string[];
}) {
  const $sharedArea = useStore(sharedArea);
  const area = Number($sharedArea);

  return (
    <div className="-ml-2 flex space-x-2 lg:ml-0">
      <article className="hidden h-[332px] flex-1 overflow-hidden rounded-[50px] lg:block">
        <a
          href={hrefs[area]}
          onClick={() => firstSliderImage.set("0")}
          title="Ver todas Las Imágenes"
        >
          <Image src={images[area][0]} alt="Libertad" />
        </a>
      </article>
      <article className="hidden h-[332px] flex-1 overflow-hidden rounded-[50px] md:block">
        <a
          href={hrefs[area]}
          onClick={() => firstSliderImage.set("1")}
          title="Ver todas Las Imágenes"
        >
          <Image src={images[area][1]} alt="Libertad" />
        </a>
      </article>
      <article className="h-[332px] flex-1 overflow-hidden rounded-[50px]">
        <a
          href={hrefs[area]}
          onClick={() => firstSliderImage.set("2")}
          title="Ver todas Las Imágenes"
        >
          <Image src={images[area][2]} alt="Libertad" />
        </a>
      </article>
      <article className="flex-1">
        <div className="relative h-[332px] overflow-hidden rounded-[50px] bg-[#795a45] px-5 py-10 text-white sm:px-12 sm:py-16">
          <h3 className="mb-5 text-xl font-semibold tracking-wider sm:text-2xl">
            Espacios que Conectan
          </h3>
          <p>Diseñadas para inspirar, relajar y crear momentos inolvidables.</p>
          <a
            href={hrefs[area]}
            onClick={() => firstSliderImage.set("0")}
            title="Ver todas Las Imágenes"
            className="absolute bottom-5 right-5 flex size-16 items-center justify-center rounded-full bg-white"
          >
            <Icon
              icon="material-symbols-light:arrow-outward-rounded"
              className="text-[#795a45]"
              width={40}
              height={40}
            />
          </a>
        </div>
      </article>
    </div>
  );
}
