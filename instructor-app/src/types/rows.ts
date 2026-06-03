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
  progress: number;
};

export type EnrolledCourseRow = {
  id: string;
  title: string;
  code: string;
  level: "Beginner" | "Intermediate" | "Advanced" | "Perfect";
  date: string;
  price: string;
  status: "active" | "pending";
  progress: number;
};

export type TxnStatus = "completed" | "cancelled" | "pending";
export type TxnMethod = "mastercard" | "visa" | "paypal";

export type TxnRow = {
  id: string;
  name: string;
  userId: string;
  avatar: string;
  course: string;
  price: string;
  method: TxnMethod;
  cardLast4: string;
  status: TxnStatus;
};

export type Txn = {
  id: string;
  name: string;
  avatar: string;
  course: string;
  price: string;
  method: TxnMethod;
  cardLast4: string;
  status: "completed" | "cancelled";
};
