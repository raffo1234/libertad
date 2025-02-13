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
      window.addEventListener("keydown", handleEsc);

      return () => {
        window.removeEventListener("keydown", handleEsc);
      };
    }, [onEscape]);
  };

  const usePrev = (onPrev: () => void) => {
    useEffect(() => {
      const handlePrev = (event: KeyboardEvent) => {
        if (event.key === "ArrowLeft") onPrev();
      };
      window.addEventListener("keydown", handlePrev);

      return () => {
        window.removeEventListener("keydown", handlePrev);
      };
    }, [onPrev]);
  };

  const useNext = (onNext: () => void) => {
    useEffect(() => {
      const handleNext = (event: KeyboardEvent) => {
        if (event.key === "ArrowRight") onNext();
      };
      window.addEventListener("keydown", handleNext, false);

      return () => {
        window.removeEventListener("keydown", handleNext, false);
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
    <section className="fixed top-0 left-0 z-40 w-full h-full bg-[#0C0C0C] p-1">
      <img
        loading="lazy"
        src={imageToShow}
        alt="Libertad, Departamentos en Venta. Huancayo El Tambo Pio Pata"
        className="w-full h-full object-cover md:object-contain transition-opacity duration-700 ease-in-out"
      />
      <div className="absolute z-20 flex space-x-3 -translate-x-1/2 left-1/2 bottom-6">
        {images.map((image, index) => (
          <button
            aria-label="Ver Imagen"
            onClick={() => setImageToShow(image)}
            key={index}
            className={`flex items-center transition hover:bg-opacity-100 duration-500 ease-in-out justify-center w-6 h-6 rounded-full ${
              index === currentIndex ? "bg-[#ff9100]" : "bg-white bg-opacity-40"
            } `}
          ></button>
        ))}
      </div>
      <div className="absolute z-20 flex items-center top-5 right-5 bg-[#ff9100] p-2 rounded-[50px]">
        <div className="flex items-center text-xl h-16 px-4 mr-2 bg-white bg-opacity-20 rounded-full text-white">
          {currentIndex + 1}&nbsp;/&nbsp;{images.length}
        </div>
        <a
          href={backHref}
          title="Volver al Inicio"
          className="flex items-center justify-center rounded-full w-16 h-16 text-[#ff9100] bg-white"
        >
          <Icon
            icon="material-symbols-light:close-rounded"
            width={40}
            height={40}
          />
        </a>
      </div>
      <button
        className="hidden sm:block absolute top-0 text-white left-0 z-10 h-full p-4 focus:outline-none group"
        onClick={showPrev}
        aria-label="Imagen Anterior"
      >
        <span className="flex items-center justify-center w-16 h-16 rounded-full group-focus:ring bg-[#ff9100]">
          <Icon
            icon="material-symbols-light:arrow-back-rounded"
            width={40}
            height={40}
          />
        </span>
      </button>
      <button
        className="hidden sm:block absolute text-white top-0 right-0 z-10 h-full p-4 focus:outline-none group"
        onClick={showNext}
        aria-label="Imagen Siguiente"
      >
        <span className="flex items-center justify-center w-16 h-16 rounded-full group-focus:ring bg-[#ff9100]">
          <Icon
            icon="material-symbols-light:arrow-forward-rounded"
            width={40}
            height={40}
          />
        </span>
      </button>
    </section>
  );
}
