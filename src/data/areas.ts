import wall1 from "../assets/wall1.jpg";
import wall2 from "../assets/wall2.jpg";
import wall3 from "../assets/wall3.jpg";
import wall4 from "../assets/wall4.jpg";
import wall5 from "../assets/wall5.jpg";
import wall6 from "../assets/wall6.jpg";
import gym1 from "../assets/gym1.jpg";
import gym2 from "../assets/gym2.jpg";
import gym3 from "../assets/gym3.jpg";
import gym4 from "../assets/gym4.jpg";
import terraza1 from "../assets/terraza1.jpg";
import terraza2 from "../assets/terraza2.jpg";
import terraza3 from "../assets/terraza3.jpg";

const areas = [
  {
    label: "Gimnasio",
    images: [gym1.src, gym2.src, gym3.src, gym4.src],
    href: "/areas-comunes/gimnasio",
  },
  {
    label: "Terraza",
    images: [terraza1.src, terraza2.src, terraza3.src],
    href: "/areas-comunes/terraza",
  },
  {
    label: "Reuniones SUM",
    images: [wall1.src, wall2.src, wall3.src, wall4.src, wall5.src, wall6.src],
    href: "/areas-comunes/reuniones-sum",
  },
];

export default areas;
