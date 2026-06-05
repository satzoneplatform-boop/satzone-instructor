import { AppShell } from "../components/AppShell";
import { Mail, Phone, Send } from "lucide-react";

const CONTACTS = [
  {
    icon: Send,
    label: "Telegram",
    value: "@satzoneplatform",
    description: "Chat with us directly on Telegram",
    action: () => window.open("https://t.me/satzoneplatform", "_blank", "noopener,noreferrer"),
    btnLabel: "Open Telegram",
    btnClass: "bg-[#2AABEE] hover:bg-[#1d96d4] text-white",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "+998 90 000 00 00",
    description: "Call or message us during business hours",
    action: () => window.open("tel:+998900000000"),
    btnLabel: "Call Now",
    btnClass: "bg-positive-500 hover:bg-positive-600 text-white",
  },
  {
    icon: Mail,
    label: "Email",
    value: "satzoneplatform@gmail.com",
    description: "Send us an email and we'll respond within 24 hours",
    action: () =>
      window.open(
        "https://mail.google.com/mail/?view=cm&to=satzoneplatform@gmail.com",
        "_blank",
        "noopener,noreferrer"
      ),
    btnLabel: "Open Gmail",
    btnClass: "bg-[#EA4335] hover:bg-[#d33828] text-white",
  },
];

export function ContactsPage() {
  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-[20px] font-bold text-ink">Contact Us</h1>
        <p className="mt-1 text-[14px] text-slate-600">
          Reach out through any of the channels below — we're happy to help.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {CONTACTS.map((c) => (
          <section
            key={c.label}
            className="flex flex-col items-center gap-5 rounded-2xl bg-white p-8 shadow-sm text-center"
          >
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-violet-50">
              <c.icon size={28} className="text-primary" />
            </div>

            <div className="flex flex-col gap-1">
              <h2 className="text-[18px] font-semibold text-ink">{c.label}</h2>
              <p className="text-[14px] font-medium text-primary">{c.value}</p>
              <p className="mt-1 text-[13px] leading-relaxed text-slate-500">{c.description}</p>
            </div>

            <button
              type="button"
              onClick={c.action}
              className={`mt-auto w-full rounded-xl py-3 text-[14px] font-semibold transition hover:opacity-90 ${c.btnClass}`}
            >
              {c.btnLabel}
            </button>
          </section>
        ))}
      </div>

      <div className="mt-8 rounded-2xl bg-violet-50 p-6 text-center">
        <p className="text-[14px] text-slate-600">
          Support hours: <span className="font-medium text-secondary">Mon – Fri, 9:00 – 18:00 (UZT)</span>
        </p>
      </div>
    </AppShell>
  );
}
