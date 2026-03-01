export type Job = {
    id: string;
    title: string;
    company: string;
    tags: string[];
  };
  
  export const jobs: Job[] = [
    {
      id: "1",
      title: "Pomoc kuchenna (weekendy)",
      company: "Bistro Oliwa",
      tags: ["Bez doświadczenia", "Przyuczenie", "Bez CV"],
    },
    {
      id: "2",
      title: "Pracownik magazynu",
      company: "LogiTrans",
      tags: ["Bez doświadczenia", "Przyuczenie", "Bez CV"],
    },
    {
      id: "3",
      title: "Obsługa klienta – od zaraz",
      company: "CallCenter24",
      tags: ["Bez doświadczenia", "Bez CV"],
    },
    {
      id: "4",
      title: "Pomoc na eventach (weekend)",
      company: "EventTeam",
      tags: ["Bez doświadczenia", "Przyuczenie", "Bez CV"],
    },
  ];
  