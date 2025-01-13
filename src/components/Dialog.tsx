import { useState, useEffect } from "react";
import image1 from "../assets/image1.jpg";
import image2 from "../assets/image2.jpg";
import { Icon } from "@iconify/react";
import "@iconify-json/material-symbols-light/icons.json";

export default function Dialog() {
  const useEscape = (onEscape: () => void) => {
    useEffect(() => {
      const handleEsc = (event: KeyboardEvent) => {
        if (event.keyCode === 27) onEscape();
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
        if (event.keyCode === 37) onPrev();
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
        if (event.keyCode === 39) onNext();
      };
      window.addEventListener("keydown", handleNext, false);

      return () => {
        window.removeEventListener("keydown", handleNext, false);
      };
    }, [onNext]);
  };

  const images = [image1.src, image2.src];

  const [lightboxDisplay, setLightboxDisplay] = useState(false);
  const [imageToShow, setImageToShow] = useState(image1.src);
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

  useEscape(() => setLightboxDisplay(false));
  usePrev(() => showPrev());
  useNext(() => showNext());

  return (
    <>
      <button
        className="text-[#ff9100] bg-white h-16 w-16 rounded-full absolute right-5 bottom-5 flex items-center justify-center"
        onClick={() => setLightboxDisplay(true)}
      >
        <Icon
          icon="material-symbols-light:arrow-outward-rounded"
          className="text-[#ff9100]"
          width={40}
          height={40}
        />
      </button>
      {lightboxDisplay ? (
        <section className="fixed top-0 left-0 z-40 w-full h-full bg-white">
          <img
            src={imageToShow}
            className="w-full h-full object-cover object-top"
            alt="Libertad, Departamentos en Venta. Huancayo El Tambo Pio Pata"
            title="Libertad, Departamentos en Venta. Huancayo El Tambo Pio Pata"
          />
          <div className="absolute z-20 flex space-x-3 -translate-x-1/2 left-1/2 bottom-6">
            {images.map((image, index) => (
              <button
                onClick={() => setImageToShow(image)}
                key={index}
                className={`flex items-center transition hover:bg-opacity-100 duration-500 ease-in-out justify-center w-6 h-6 rounded-full ${
                  index === currentIndex
                    ? "bg-[#ff9100]"
                    : "bg-white bg-opacity-40"
                } `}
              ></button>
            ))}
          </div>
          <div className="absolute z-20 flex items-center top-5 right-5 bg-[#ff9100] p-2 rounded-[50px]">
            <div className="flex items-center text-xl h-16 px-4 mr-2 bg-white bg-opacity-20 rounded-full">
              {currentIndex + 1}&nbsp;/&nbsp;{images.length}
            </div>
            <button
              className="flex items-center justify-center rounded-full w-16 h-16 text-[#ff9100] bg-white"
              onClick={() => setLightboxDisplay(false)}
            >
              <Icon
                icon="material-symbols-light:close-rounded"
                width={40}
                height={40}
              />
            </button>
          </div>
          <button
            className="absolute top-0 left-0 z-10 h-full p-4 focus:outline-none group"
            onClick={showPrev}
          >
            <div className="flex items-center justify-center w-16 h-16 rounded-full group-focus:ring bg-[#ff9100]">
              <Icon
                icon="material-symbols-light:arrow-back-rounded"
                width={40}
                height={40}
              />
            </div>
          </button>
          <button
            className="absolute top-0 right-0 z-10 h-full p-4 focus:outline-none group"
            onClick={showNext}
          >
            <div className="flex items-center justify-center w-16 h-16 rounded-full group-focus:ring bg-[#ff9100]">
              <Icon
                icon="material-symbols-light:arrow-forward-rounded"
                width={40}
                height={40}
              />
            </div>
          </button>
        </section>
      ) : null}
    </>
  );
}
