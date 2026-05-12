export const STATS = [
  {
    label: "Total Students",
    value: "72,056",
    delta: "+12.05%",
    deltaUp: true,
    icon: "students" as const,
    bg: "bg-violet-50",
    iconColor: "text-primary",
  },
  {
    label: "Total Course",
    value: "12,056",
    delta: "-12.25%",
    deltaUp: false,
    icon: "book" as const,
    bg: "bg-sky-50",
    iconColor: "text-blue-500",
  },
  {
    label: "Total Video",
    value: "31,056",
    delta: "+25.21%",
    deltaUp: true,
    icon: "video" as const,
    bg: "bg-positive-50",
    iconColor: "text-positive-600",
  },
  {
    label: "Total Earning",
    value: "$8,05,056",
    delta: "+25.21%",
    deltaUp: true,
    icon: "money" as const,
    bg: "bg-warn-50",
    iconColor: "text-amber-500",
  },
];

export const OVERVIEW_DATA = [
  { day: "Sat", teachers: 28, students: 38, other: 16 },
  { day: "Sun", teachers: 42, students: 56, other: 22 },
  { day: "Mon", teachers: 36, students: 48, other: 18 },
  { day: "Tue", teachers: 30, students: 38.7, other: 12 },
  { day: "Wed", teachers: 50, students: 64, other: 28 },
  { day: "Thu", teachers: 44, students: 58, other: 22 },
  { day: "Fri", teachers: 38, students: 52, other: 20 },
];

export const STUDENT_DATA = [
  { day: "Sat", enrolled: 22, left: 18 },
  { day: "Sun", enrolled: 38, left: 26 },
  { day: "Mon", enrolled: 54, left: 32 },
  { day: "Tue", enrolled: 42, left: 28 },
  { day: "Wed", enrolled: 60, left: 36 },
  { day: "Thu", enrolled: 48, left: 30 },
  { day: "Fri", enrolled: 56, left: 38 },
];

export type Txn = {
  id: string;
  name: string;
  avatar: string;
  course: string;
  price: string;
  method: "mastercard" | "visa" | "paypal";
  cardLast4: string;
  status: "completed" | "cancelled";
};

const AVATAR_BASE = "https://i.pravatar.cc/80?img=";

export const TRANSACTIONS: Txn[] = [
  {
    id: "1",
    name: "Blonde Drizzle",
    avatar: AVATAR_BASE + "12",
    course: "Digital Marketing Fundamentals",
    price: "$445.00",
    method: "mastercard",
    cardLast4: "1264",
    status: "completed",
  },
  {
    id: "2",
    name: "Kuiper Spitt",
    avatar: AVATAR_BASE + "33",
    course: "Introduction to Python Programming",
    price: "$345.00",
    method: "visa",
    cardLast4: "3658",
    status: "cancelled",
  },
  {
    id: "3",
    name: "Diva Bliss",
    avatar: AVATAR_BASE + "47",
    course: "Machine Learning and Applications",
    price: "$245.00",
    method: "paypal",
    cardLast4: "1264",
    status: "completed",
  },
  {
    id: "4",
    name: "Kuiper Spitt",
    avatar: AVATAR_BASE + "56",
    course: "Leveraging Data for Decision Making",
    price: "$545.00",
    method: "mastercard",
    cardLast4: "1264",
    status: "cancelled",
  },
];

export type Notif = {
  id: string;
  name: string;
  avatar: string;
  message: string;
  time: string;
};

export const NOTIFICATIONS: Notif[] = [
  {
    id: "1",
    name: "Osman",
    avatar: AVATAR_BASE + "14",
    message: "Enrolled in Python Basics",
    time: "10 minutes ago",
  },
  {
    id: "2",
    name: "Hamza",
    avatar: AVATAR_BASE + "22",
    message: "Enrolled in Python Basics",
    time: "10 minutes ago",
  },
  {
    id: "3",
    name: "Saman",
    avatar: AVATAR_BASE + "31",
    message: "Enrolled in Python Basics",
    time: "10 minutes ago",
  },
];
