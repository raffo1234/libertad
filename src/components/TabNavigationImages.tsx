import { useState } from "react";
import { Icon } from "@iconify/react";
import { useStore } from "@nanostores/react";
import { sharedArea, firstSliderImage } from "../stores/states";

const Image = ({ src, alt }: { src: string; alt: string }) => {
  const [loading, setLoading] = useState(true);

  return (
    <>
      {loading && (
        <div className="animate-pulse w-full h-full bg-[#EAE8E4]"></div>
      )}
      <img
        loading="lazy"
        src={src}
        alt={alt}
        onLoad={() => setLoading(false)}
        className={`object-cover w-full h-full transition-opacity duration-700 ease-in-out ${loading ? "opacity-0" : "opacity-100"}`}
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
    <div className="flex space-x-2 -ml-2 lg:ml-0">
      <article className="flex-1 hidden lg:block rounded-[50px] h-[332px] overflow-hidden">
        <a
          href={hrefs[area]}
          onClick={() => firstSliderImage.set("0")}
          title="Ver todas Las Imágenes"
        >
          <Image src={images[area][0]} alt="Libertad" />
        </a>
      </article>
      <article className="flex-1 hidden md:block rounded-[50px] h-[332px] overflow-hidden">
        <a
          href={hrefs[area]}
          onClick={() => firstSliderImage.set("1")}
          title="Ver todas Las Imágenes"
        >
          <Image src={images[area][1]} alt="Libertad" />
        </a>
      </article>
      <article className="flex-1 rounded-[50px] h-[332px] overflow-hidden">
        <a
          href={hrefs[area]}
          onClick={() => firstSliderImage.set("2")}
          title="Ver todas Las Imágenes"
        >
          <Image src={images[area][2]} alt="Libertad" />
        </a>
      </article>
      <article className="flex-1">
        <div className="rounded-[50px] px-4 sm:px-8 py-10 sm:py-11 text-white h-[332px] overflow-hidden bg-[#ff9100] relative">
          <h3 className="text-lg sm:text-2xl mb-5 font-bold">
            Espacios que Conectan
          </h3>
          <p>Diseñadas para inspirar, relajar y crear momentos inolvidables.</p>
          <a
            href={hrefs[area]}
            onClick={() => firstSliderImage.set("0")}
            title="Ver todas Las Imágenes"
            className="w-16 flex items-center justify-center h-16 rounded-full
          text-[#ff9100] bg-white absolute right-5 bottom-5"
          >
            <Icon
              icon="material-symbols-light:arrow-outward-rounded"
              className="text-[#ff9100]"
              width={40}
              height={40}
            />
          </a>
        </div>
      </article>
    </div>
  );
}
