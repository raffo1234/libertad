import interior1 from "../assets/interior-1.jpg";
import interior2 from "../assets/interior-2.jpg";
import interior3 from "../assets/interior-3.jpg";

const areas = [
  {
    label: "Gimnasio",
    images: [interior1.src, interior3.src, interior2.src],
    href: "/areas-comunes/gimnasio",
  },
  {
    label: "Terraza",
    images: [interior2.src, interior1.src, interior3.src],
    href: "/areas-comunes/terraza",
  },
  {
    label: "Reuniones SUM",
    images: [interior3.src, interior2.src, interior1.src],
    href: "/areas-comunes/reuniones-sum",
  },
];

export default areas;
