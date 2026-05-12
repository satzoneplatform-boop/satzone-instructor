export type StudentStatus = "active" | "pending" | "suspend";

export type StudentRow = {
  id: string;
  name: string;
  userId: string;
  avatar: string;
  course: string;
  enrolledDate: string;
  price: string;
  status: StudentStatus;
};

const AV = (n: number) => `https://i.pravatar.cc/80?img=${n}`;

export const STUDENTS_MOCK: StudentRow[] = [
  { id: "1",  name: "Floyd Miles",      userId: "#OS4124", avatar: AV(13), course: "Digital Marketing Fundamentals",  enrolledDate: "05, Jan, 2024", price: "$445.00", status: "active"  },
  { id: "2",  name: "Dianne Russell",   userId: "#OS4124", avatar: AV(34), course: "Introduction to Python Programming", enrolledDate: "05, Jan, 2024", price: "$445.00", status: "suspend" },
  { id: "3",  name: "Courtney Henry",   userId: "#OS4124", avatar: AV(48), course: "Machine Learning and Applications", enrolledDate: "05, Jan, 2024", price: "$445.00", status: "active"  },
  { id: "4",  name: "Guy Hawkins",      userId: "#OS4124", avatar: AV(57), course: "Leveraging Data for Decision Making", enrolledDate: "05, Jan, 2024", price: "$445.00", status: "active"  },
  { id: "5",  name: "Albert Flores",    userId: "#OS4124", avatar: AV(16), course: "Leveraging Data for Decision Making", enrolledDate: "05, Jan, 2024", price: "$445.00", status: "active"  },
  { id: "6",  name: "Brooklyn",         userId: "#OS4124", avatar: AV(23), course: "Leveraging Data for Decision Making", enrolledDate: "05, Jan, 2024", price: "$445.00", status: "pending" },
  { id: "7",  name: "Leslie Alexander", userId: "#OS4124", avatar: AV(29), course: "Leveraging Data for Decision Making", enrolledDate: "05, Jan, 2024", price: "$445.00", status: "active"  },
  { id: "8",  name: "Jenny Wilson",     userId: "#OS4124", avatar: AV(32), course: "Leveraging Data for Decision Making", enrolledDate: "05, Jan, 2024", price: "$445.00", status: "pending" },
  { id: "9",  name: "Darrell Steward",  userId: "#OS4124", avatar: AV(40), course: "Leveraging Data for Decision Making", enrolledDate: "05, Jan, 2024", price: "$445.00", status: "active"  },
  { id: "10", name: "Esther Howard",    userId: "#OS4124", avatar: AV(43), course: "Leveraging Data for Decision Making", enrolledDate: "05, Jan, 2024", price: "$445.00", status: "active"  },
  { id: "11", name: "Savannah",         userId: "#OS4124", avatar: AV(51), course: "Leveraging Data for Decision Making", enrolledDate: "05, Jan, 2024", price: "$445.00", status: "pending" },
];

export type EnrolledCourseRow = {
  id: string;
  title: string;
  code: string;
  level: "Beginner" | "Intermediate" | "Advanced" | "Perfect";
  date: string;
  price: string;
  status: "active" | "pending";
};

export const ENROLLED_COURSES_MOCK: EnrolledCourseRow[] = [
  { id: "c1", title: "Machine Learning Algorithms", code: "#OS4124", level: "Beginner",     date: "5, Jan, 2027", price: "$10", status: "active"  },
  { id: "c2", title: "Recipes for a Balanced Diet", code: "#OS4124", level: "Beginner",     date: "5, Jan, 2027", price: "$20", status: "active"  },
  { id: "c3", title: "Techniques for Reduction",    code: "#OS4124", level: "Perfect",      date: "5, Jan, 2027", price: "$50", status: "active"  },
  { id: "c4", title: "Web Design & Development",    code: "#OS4124", level: "Intermediate", date: "5, Jan, 2027", price: "$30", status: "pending" },
  { id: "c5", title: "Basics to Advanced Formulas", code: "#OS4124", level: "Advanced",     date: "5, Jan, 2027", price: "$60", status: "active"  },
];
