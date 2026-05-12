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

const AV = (n: number) => `https://i.pravatar.cc/80?img=${n}`;

export const TXNS_MOCK: TxnRow[] = [
  { id: "ORD-0001", name: "Blonde Drizzle",   userId: "#OS4124", avatar: AV(12), course: "Digital Marketing Fundamentals",    price: "$445.00", method: "mastercard", cardLast4: "1264", status: "completed" },
  { id: "ORD-0002", name: "Kuiper Split",     userId: "#OS4124", avatar: AV(33), course: "Introduction to Python Programming", price: "$345.00", method: "visa",       cardLast4: "3658", status: "cancelled" },
  { id: "ORD-0003", name: "Diva Bliss",       userId: "#OS4124", avatar: AV(47), course: "Machine Learning and Applications", price: "$245.00", method: "paypal",     cardLast4: "1264", status: "completed" },
  { id: "ORD-0004", name: "Kuiper Split",     userId: "#OS4124", avatar: AV(56), course: "Leveraging Data for Decision Making", price: "$545.00", method: "mastercard", cardLast4: "1264", status: "cancelled" },
  { id: "ORD-0005", name: "Kathryn Murphy",   userId: "#OS4124", avatar: AV(15), course: "Digital Marketing Fundamentals",    price: "$445.00", method: "mastercard", cardLast4: "1264", status: "completed" },
  { id: "ORD-0006", name: "Jane Cooper",      userId: "#OS4124", avatar: AV(22), course: "Digital Marketing Fundamentals",    price: "$345.00", method: "mastercard", cardLast4: "1264", status: "completed" },
  { id: "ORD-0007", name: "Jenny Wilson",     userId: "#OS4124", avatar: AV(28), course: "Leveraging Data for Decision Making", price: "$245.00", method: "mastercard", cardLast4: "1264", status: "pending"   },
  { id: "ORD-0008", name: "Floyd Miles",      userId: "#OS4124", avatar: AV(31), course: "Digital Marketing Fundamentals",    price: "$245.00", method: "mastercard", cardLast4: "1264", status: "completed" },
  { id: "ORD-0009", name: "Courtney Henry",   userId: "#OS4124", avatar: AV(39), course: "Digital Marketing Fundamentals",    price: "$245.00", method: "mastercard", cardLast4: "1264", status: "completed" },
  { id: "ORD-0010", name: "Esther Howard",    userId: "#OS4124", avatar: AV(42), course: "Digital Marketing Fundamentals",    price: "$445.00", method: "mastercard", cardLast4: "1264", status: "completed" },
];

export type OrderDetailMock = {
  id: string;
  customer: { name: string; email: string; phone: string; location: string; avatar: string };
  payment: { method: string; transactionId: string; amount: string };
  shipping: { carrier: string; trackingCode: string; date: string };
  billing: {
    firstName: string;
    lastName: string;
    address: string;
    state: string;
    city: string;
    country: string;
    phone: string;
    email: string;
    postcode: string;
  };
  items: { id: string; title: string; thumb: string; price: number; quantity: number }[];
  invoice: {
    number: string;
    date: string;
    company: { name: string; address: string; phone: string; email: string; site: string };
    subtotal: number;
    taxPct: number;
    discount: number;
    total: number;
  };
};

export const ORDER_DETAIL_MOCK: OrderDetailMock = {
  id: "ORD-0001",
  customer: {
    name: "Regina Cooper",
    email: "example@mail.com",
    phone: "+1(070) 4567-8800",
    location: "993 E. Brewer St. Holtsville, NY 11742",
    avatar: AV(36),
  },
  payment: {
    method: "Credit Card",
    transactionId: "000001-TXHQ",
    amount: "$2,500",
  },
  shipping: {
    carrier: "Carrier",
    trackingCode: "FX-012345-6",
    date: "12.09.2023",
  },
  billing: {
    firstName: "Regina",
    lastName: "Cooper",
    address: "993 E. Brewer St. Holtsville",
    state: "New York",
    city: "New York",
    country: "United States",
    phone: "+1(070) 4567-8800",
    email: "example@mail.com",
    postcode: "11742",
  },
  items: [
    {
      id: "li1",
      title: "CompTIA Systems Security+ Professional (CISSP)",
      thumb: "https://picsum.photos/seed/cissp/64/64",
      price: 2500,
      quantity: 1,
    },
  ],
  invoice: {
    number: "#790841",
    date: "September 12, 2023",
    company: {
      name: "UStudy.",
      address: "Russell st. 50, Boston, MA, USA, 02199",
      phone: "+1 (070) 123-4567",
      email: "info@ustudy.com",
      site: "www.ustudy.com",
    },
    subtotal: 6600,
    taxPct: 20,
    discount: 792,
    total: 7128,
  },
};
