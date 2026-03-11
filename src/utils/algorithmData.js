export const algorithms = [
  {
    id: "hillClimb",
    name: "Hegymászó algoritmus",
    color: "#10B981",
    description: "Egyszerű lokális keresés, amely mindig a legjobb szomszéd felé halad. Gyors, de lokális optimumba ragadhat.",
    pros: ["Gyors végrehajtás", "Kis memóriaigény"],
  },
  {
    id: "simulatedAnnealing",
    name: "Szimulált hűtés",
    color: "#3B82F6",
    description: "A fémek hűtési folyamatát szimulálja. Időnként rosszabb megoldásokat is elfogad, így elkerüli a lokális optimumokat.",
    pros: ["Elkerüli a lokális optimumokat", "Jó minőségű megoldások"],
  },
  {
    id: "genetic",
    name: "Genetikus algoritmus",
    color: "#8B5CF6",
    description: "Evolúciós elveken alapul: populációból indul, szelekció, keresztezés és mutáció révén fejlődik.",
    pros: ["Globális keresés", "Komplex problémákra alkalmas"],
  },
];
