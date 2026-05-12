export type TeacherStatus = "active" | "pending" | "suspend";

export type TeacherRow = {
  id: string;
  name: string;
  userId: string;
  avatar: string;
  course: number;
  joinDate: string;
  earning: string;
  balance: string;
  status: TeacherStatus;
};

const AV = (n: number) => `https://i.pravatar.cc/80?img=${n}`;

export const TEACHERS_MOCK: TeacherRow[] = [
  { id: "1",  name: "Blonde Drizzle",  userId: "#OS4124", avatar: AV(12), course: 10, joinDate: "05, Jan, 2024", earning: "$2345.00", balance: "$445.00", status: "active"  },
  { id: "2",  name: "Kuiper Split",    userId: "#OS4214", avatar: AV(33), course: 40, joinDate: "05, Jan, 2024", earning: "$1345.00", balance: "$445.00", status: "suspend" },
  { id: "3",  name: "Diva Bliss",      userId: "#OS4124", avatar: AV(47), course: 10, joinDate: "05, Jan, 2024", earning: "$2245.00", balance: "$445.00", status: "active"  },
  { id: "4",  name: "Sky Thrift",      userId: "#OS4124", avatar: AV(56), course: 10, joinDate: "05, Jan, 2024", earning: "$5345.00", balance: "$445.00", status: "active"  },
  { id: "5",  name: "Sly Peach",       userId: "#OS4124", avatar: AV(15), course: 10, joinDate: "05, Jan, 2024", earning: "$4350.00", balance: "$445.00", status: "active"  },
  { id: "6",  name: "Leggy Lava",      userId: "#OS4124", avatar: AV(22), course: 20, joinDate: "05, Jan, 2024", earning: "$2240.00", balance: "$445.00", status: "pending" },
  { id: "7",  name: "Tacho Flash",     userId: "#OS4124", avatar: AV(28), course: 10, joinDate: "05, Jan, 2024", earning: "$3245.00", balance: "$445.00", status: "active"  },
  { id: "8",  name: "Pil Monster",     userId: "#OS4124", avatar: AV(31), course: 60, joinDate: "05, Jan, 2024", earning: "$2245.00", balance: "$445.00", status: "pending" },
  { id: "9",  name: "Wormhole Haven",  userId: "#OS4124", avatar: AV(39), course: 60, joinDate: "05, Jan, 2024", earning: "$8245.00", balance: "$445.00", status: "active"  },
  { id: "10", name: "Blonde Drizzle",  userId: "#OS4124", avatar: AV(42), course: 60, joinDate: "05, Jan, 2024", earning: "$4450.00", balance: "$445.00", status: "active"  },
  { id: "11", name: "Gal Inertia",     userId: "#OS4124", avatar: AV(50), course: 60, joinDate: "05, Jan, 2024", earning: "$6245.00", balance: "$445.00", status: "pending" },
];

export const TOP_COURSES_MOCK = [
  { id: "c1", title: "Machine Learning Algorithms",  code: "#OS4124", sale: 10, date: "5, Jan, 2027", price: "$10",  status: "active"  as const },
  { id: "c2", title: "Recipes for a Balanced Diet",  code: "#OS4124", sale: 10, date: "5, Jan, 2027", price: "$20",  status: "active"  as const },
  { id: "c3", title: "Techniques for Reduction",     code: "#OS4124", sale: 10, date: "5, Jan, 2027", price: "$50",  status: "pending" as const },
  { id: "c4", title: "User Interface Design",        code: "#OS4124", sale: 20, date: "5, Jan, 2027", price: "$30",  status: "active"  as const },
  { id: "c5", title: "Web Design & Development",     code: "#OS4124", sale: 10, date: "5, Jan, 2027", price: "$30",  status: "active"  as const },
  { id: "c6", title: "Basics to Advanced Formulas",  code: "#OS4124", sale: 20, date: "5, Jan, 2027", price: "$60",  status: "pending" as const },
  { id: "c7", title: "Understanding the Human...",   code: "#OS4124", sale: 10, date: "5, Jan, 2027", price: "$45",  status: "active"  as const },
  { id: "c8", title: "User Interface Design",        code: "#OS4124", sale: 60, date: "5, Jan, 2027", price: "$25",  status: "active"  as const },
];
