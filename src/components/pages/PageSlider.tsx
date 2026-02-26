import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import "@iconify-json/material-symbols-light/icons.json";
import areas from "../../data/areas";
import useSwipe from "../../hooks/useSwipe";
import { firstSliderImage, sharedArea } from "../../stores/states";

export default function PageSlider({ backHref }: { backHref: string }) {
  const images = areas[Number(sharedArea.get())].images;
  const firstImage = Number(firstSliderImage.get());

  const useEscape = (onEscape: () => void) => {
    useEffect(() => {
      const handleEsc = (event: KeyboardEvent) => {
        if (event.key === "Escape") onEscape();
      };
      window.addEventListener("keyup", handleEsc);

      return () => {
        window.removeEventListener("keyup", handleEsc);
      };
    }, [onEscape]);
  };

  const usePrev = (onPrev: () => void) => {
    useEffect(() => {
      const handlePrev = (event: KeyboardEvent) => {
        if (event.key === "ArrowLeft") onPrev();
      };
      window.addEventListener("keyup", handlePrev);

      return () => {
        window.removeEventListener("keyup", handlePrev);
      };
    }, [onPrev]);
  };

  const useNext = (onNext: () => void) => {
    useEffect(() => {
      const handleNext = (event: KeyboardEvent) => {
        if (event.key === "ArrowRight") onNext();
      };
      window.addEventListener("keyup", handleNext, false);

      return () => {
        window.removeEventListener("keyup", handleNext, false);
      };
    }, [onNext]);
  };

  const [imageToShow, setImageToShow] = useState(images[firstImage]);
  let currentIndex = images.indexOf(imageToShow);

  const showPrev = () => {
    if (currentIndex <= 0) {
      setImageToShow(images[images.length - 1]);
    } else {
      let prevImage = images[currentIndex - 1];
      setImageToShow(prevImage);
    }
  };

  const showNext = () => {
    if (currentIndex >= images.length - 1) {
      setImageToShow(images[0]);
    } else {
      let nextImage = images[currentIndex + 1];
      setImageToShow(nextImage);
    }
  };

  useEscape(() => {
    window.location.href = backHref;
  });
  usePrev(() => showPrev());
  useNext(() => showNext());

  const handleSwipe = (direction: "left" | "right" | "up" | "down") => {
    if (direction === "left") showNext();
    if (direction === "right") showPrev();
  };

  useSwipe(handleSwipe, 50);

  useEffect(() => {
    setImageToShow(images[firstImage]);
  }, []);

  useEffect(() => {
    firstSliderImage.set(String(currentIndex));
  }, [imageToShow]);

  return (
    <section className="fixed left-0 top-0 z-40 size-full bg-[#0C0C0C] p-1">
      <img
        loading="lazy"
        src={imageToShow}
        alt="Galvez1519, Departamentos en Venta. Huancayo El Tambo Pio Pata"
        className="size-full animate-scale object-cover transition-opacity duration-700 ease-in-out md:object-contain"
      />
      <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 space-x-3">
        {images.map((image, index) => (
          <button
            aria-label="Ver Imagen"
            onClick={() => setImageToShow(image)}
            key={index}
            className={`flex size-6 items-center justify-center rounded-full transition duration-500 ease-in-out hover:bg-opacity-100 ${
              index === currentIndex ? "bg-custom-orange" : "bg-white bg-opacity-40"
            } `}
          ></button>
        ))}
      </div>
      <div className="absolute right-5 top-5 z-20 flex items-center rounded-[50px] bg-custom-orange p-2">
        <div className="mr-2 flex h-16 items-center rounded-full bg-white bg-opacity-20 px-4 text-xl text-white">
          {currentIndex + 1}&nbsp;/&nbsp;{images.length}
        </div>
        <a
          href={backHref}
          title="Volver al Inicio"
          className="flex size-16 items-center justify-center rounded-full bg-white text-custom-orange"
        >
          <Icon icon="material-symbols-light:close-rounded" width={40} height={40} />
        </a>
      </div>
      <button
        className="group absolute left-0 top-0 z-10 hidden h-full p-4 text-white focus:outline-none sm:block"
        onClick={showPrev}
        aria-label="Imagen Anterior"
      >
        <span className="flex size-16 items-center justify-center rounded-full bg-custom-orange group-focus:ring">
          <Icon icon="material-symbols-light:arrow-back-rounded" width={40} height={40} />
        </span>
      </button>
      <button
        className="group absolute right-0 top-0 z-10 hidden h-full p-4 text-white focus:outline-none sm:block"
        onClick={showNext}
        aria-label="Imagen Siguiente"
      >
        <span className="flex size-16 items-center justify-center rounded-full bg-custom-orange group-focus:ring">
          <Icon icon="material-symbols-light:arrow-forward-rounded" width={40} height={40} />
        </span>
      </button>
    </section>
  );
}
