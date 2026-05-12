export type CourseStatus = "published" | "pending" | "trial" | "public" | "draft";

export type CourseRow = {
  id: string;
  title: string;
  code: string;
  thumb: string;
  instructor: { name: string; avatar: string };
  sale: number;
  price: string;
  lessons: number;
  totalTime: string;
  status: CourseStatus;
};

const THUMB = (n: number) => `https://picsum.photos/seed/c${n}/64/64`;
const AV = (n: number) => `https://i.pravatar.cc/40?img=${n}`;

const ANNETE = { name: "Annette Black", avatar: AV(45) };

export const COURSES_MOCK: CourseRow[] = [
  { id: "1",  title: "Machine Learning Algorithms",          code: "#0124124", thumb: THUMB(1),  instructor: ANNETE, sale: 62, price: "$62", lessons: 16, totalTime: "24:8 Hours", status: "published" },
  { id: "2",  title: "Recipes for a Balanced Diet",          code: "#0124124", thumb: THUMB(2),  instructor: ANNETE, sale: 62, price: "$62", lessons: 16, totalTime: "24:8 Hours", status: "published" },
  { id: "3",  title: "Techniques for Reduction",             code: "#0124124", thumb: THUMB(3),  instructor: ANNETE, sale: 62, price: "$62", lessons: 16, totalTime: "24:8 Hours", status: "trial"     },
  { id: "4",  title: "User Interface Design",                code: "#0124124", thumb: THUMB(4),  instructor: ANNETE, sale: 62, price: "$62", lessons: 16, totalTime: "24:8 Hours", status: "published" },
  { id: "5",  title: "Web Design & Development",             code: "#0124124", thumb: THUMB(5),  instructor: ANNETE, sale: 62, price: "$62", lessons: 16, totalTime: "24:8 Hours", status: "public"    },
  { id: "6",  title: "Psychology the Human Mind",            code: "#0124124", thumb: THUMB(6),  instructor: ANNETE, sale: 62, price: "$62", lessons: 16, totalTime: "24:8 Hours", status: "published" },
  { id: "7",  title: "Leveraging Data for Decision",         code: "#0124124", thumb: THUMB(7),  instructor: ANNETE, sale: 62, price: "$62", lessons: 16, totalTime: "24:8 Hours", status: "pending"   },
  { id: "8",  title: "Building Modern Production",           code: "#0124124", thumb: THUMB(8),  instructor: ANNETE, sale: 62, price: "$62", lessons: 16, totalTime: "24:8 Hours", status: "published" },
  { id: "9",  title: "Digital Marketing Fundamentals",       code: "#0124124", thumb: THUMB(9),  instructor: ANNETE, sale: 62, price: "$62", lessons: 16, totalTime: "24:8 Hours", status: "published" },
  { id: "10", title: "Python Programming",                   code: "#0124124", thumb: THUMB(10), instructor: ANNETE, sale: 62, price: "$62", lessons: 16, totalTime: "24:8 Hours", status: "published" },
  { id: "11", title: "Recipes for a Balanced Diet",          code: "#0124124", thumb: THUMB(11), instructor: ANNETE, sale: 62, price: "$62", lessons: 16, totalTime: "24:8 Hours", status: "published" },
];

export const CURRICULUM_MOCK = [
  {
    id: "s1",
    title: "Section 1 | Intro",
    completed: true,
    lessons: [{ id: "l1", title: "1 video | 20 min" }],
  },
  {
    id: "s2",
    title: "Section 2 | Intro",
    completed: false,
    lessons: [
      { id: "l2", title: "Getting started lessons" },
      { id: "l3", title: "Overview about basic terms" },
      { id: "l4", title: "Overview about basic terms" },
      { id: "l5", title: "Overview about basic terms" },
    ],
  },
  { id: "s3", title: "Introduction",         completed: false, lessons: [{ id: "l6", title: "1 video | 20 min" }] },
  { id: "s4", title: "Understanding Art",    completed: false, lessons: [{ id: "l7", title: "1 video | 20 min" }] },
  { id: "s5", title: "Using Colors & Graphics", completed: false, lessons: [{ id: "l8", title: "1 video | 20 min" }] },
  { id: "s6", title: "Creating Tool Sty",    completed: false, lessons: [{ id: "l9", title: "1 video | 20 min" }] },
];

export const RATING_BREAKDOWN = [
  { star: 5, pct: 57 },
  { star: 4, pct: 38 },
  { star: 3, pct: 5 },
  { star: 2, pct: 1 },
  { star: 1, pct: 0 },
];

export const REVIEWS_MOCK = [
  {
    id: "r1",
    name: "Kenny White",
    avatar: "https://i.pravatar.cc/80?img=22",
    rating: 5,
    text: "I have learn how much time and the opportunity to go outside learning this class.",
  },
];

export const FAQS_MOCK = [
  { q: "How does the free trial work?" },
  { q: "How do you weigh different criteria in process?" },
  { q: "What does talents look for in a founding team?" },
  {
    q: "How quick is talents in repeatedness in cubicates use does desizes su huge nuts pursins. Excepteur sit occurses cupids non proteint, sunt in culpa qui officia desentent.",
    open: true,
  },
  { q: "What do you look for in a founding team?" },
  { q: "What do you look for in a founding team?" },
];

export const COURSE_OVERVIEW = `Welcome to "Mastering Excel: From Basics to Advanced Formulas"! This course is your passport to unlocking the full potential of Microsoft Excel, whether you're a beginner taking your first steps or an experienced user looking to enhance your skills.`;

export const COURSE_FEATURES = [
  { title: "Excel Essentials:", body: "Navigate the interface, master basic functions, and manage data effortlessly." },
  { title: "Intermediate Skills:", body: "Create dynamic charts, apply advanced formatting, and validate data." },
  { title: "Advanced Formulas:", body: "Dive into powerful tools like VLOOKUP, INDEX-MATCH, SUMIFS, for sophisticated data manipulation." },
  { title: "Data Analysis Techniques:", body: "Explore pivot tables, sorting, filtering, and formatting for insights." },
  { title: "Optimization:", body: "Discover shortcuts and automation to streamline your workflow." },
];
