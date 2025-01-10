import { useStore } from "@nanostores/react";
import { isLocationModalOpen } from "../hooks/locationModalState";

export default function Dialog({ children }: { children: React.ReactNode }) {
  const $isLocationModalOpen = useStore(isLocationModalOpen);

  return $isLocationModalOpen ? (
    <section className="fixed top-0 left-0 z-40 w-full h-full bg-white">
      {children}
      {/* <Image
        src={imageToShow}
        className="relative z-10 animate-scale"
        alt="Esperanza 124, Departamentos en Venta. Huancayo El Tambo Pio Pata"
        title="Esperanza 124, Departamentos en Venta. Huancayo El Tambo Pio Pata"
        layout="fill"
        objectFit="cover"
        quality={100}
      /> */}
      <div className="absolute z-20 flex space-x-3 -translate-x-1/2 left-1/2 bottom-6">
        {/* {images.map((image, index) => (
          <button
            // onClick={() => setImageToShow(image)}
            key={index}
            className={`flex items-center transition hover:bg-opacity-100 duration-500 ease-in-out justify-center w-6 h-6 rounded-full ${
              index === currentIndex ? "bg-warning" : "bg-white bg-opacity-40"
            } `}
          ></button>
        ))} */}
      </div>
      <div className="absolute z-20 flex items-center top-4 right-4">
        <div className="flex items-center h-12 px-4 mr-4 bg-white bg-opacity-20">
          {/* {currentIndex + 1}/{images.length} */}
        </div>
        <button
          className="flex items-center justify-center w-12 h-12 transition-opacity duration-500 ease-in-out rounded-sm opacity-80 hover:opacity-100 bg-warning focus:outline-none focus:ring"
          // onClick={() => setLightboxDisplay(false)}
        >
          {/* <MdClose size={24} /> */}
        </button>
      </div>
      <button
        className="absolute top-0 left-0 z-10 h-full p-4 focus:outline-none group"
        // onClick={showPrev}
      >
        <div className="flex items-center justify-center w-12 h-12 transition-opacity duration-500 ease-in-out rounded-sm group-focus:ring opacity-80 hover:opacity-100 bg-warning">
          {/* <GrLinkPrevious size={24} /> */}
        </div>
      </button>
      <button
        className="absolute top-0 right-0 z-10 h-full p-4 focus:outline-none group"
        // onClick={showNext}
      >
        <div className="flex items-center justify-center w-12 h-12 transition-opacity duration-500 ease-in-out rounded-sm group-focus:ring opacity-80 hover:opacity-100 bg-warning">
          {/* <GrLinkNext size={24} /> */}
        </div>
      </button>
    </section>
  ) : null;
}
