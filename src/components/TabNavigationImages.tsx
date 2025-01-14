import { Icon } from "@iconify/react";
import { useStore } from "@nanostores/react";
import { sharedArea } from "../hooks/states";

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
      <article className="hidden lg:w-1/4 lg:block rounded-[50px] h-[332px] overflow-hidden">
        <a href={hrefs[area]}>
          <img
            src={images[area][0]}
            alt="Libertad"
            className="object-cover w-full h-full object-top"
          />
        </a>
      </article>
      <article className="hidden md:w-1/3 lg:w-1/4 md:block rounded-[50px] h-[332px] overflow-hidden">
        <a href={hrefs[area]}>
          <img
            src={images[area][1]}
            alt="Libertad"
            className="object-cover w-full h-full object-top"
          />
        </a>
      </article>
      <article className="w-1/2 lg:w-1/4 md:w-1/3 rounded-[50px] h-[332px] overflow-hidden">
        <a href={hrefs[area]}>
          <img
            src={images[area][2]}
            alt="Libertad"
            className="object-cover w-full h-full object-top"
          />
        </a>
      </article>
      <article className="w-1/2 md:w-1/3 lg:w-1/4">
        <div className="rounded-[50px] px-4 sm:px-8 py-10 sm:py-11 text-white h-[332px] overflow-hidden bg-[#ff9100] relative">
          <h3 className="text-lg sm:text-2xl mb-5 font-bold">
            Espacios que Conectan
          </h3>
          <p>Diseñadas para inspirar, relajar y crear momentos inolvidables.</p>
          <a
            href={hrefs[area]}
            title="Libertad"
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
