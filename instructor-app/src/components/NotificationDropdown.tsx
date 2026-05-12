import { NOTIFICATIONS } from "../data/mock";

export function NotificationDropdown({ onSeeAll }: { onSeeAll?: () => void }) {
  return (
    <div className="w-[332px] rounded-2xl bg-white p-5 shadow-dropdown">
      <h3 className="mb-4 text-[16px] font-semibold text-ink">Notification</h3>

      <ul className="flex flex-col gap-3">
        {NOTIFICATIONS.map((n) => (
          <li key={n.id} className="flex items-center gap-3">
            <img
              src={n.avatar}
              alt={n.name}
              className="h-9 w-9 shrink-0 rounded-full object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="text-[13px] leading-5 text-secondary">
                <span className="font-semibold">{n.name}</span> -{" "}
                <span className="text-slate-600">{n.message}</span>
              </p>
              <p className="text-[11px] leading-4 text-slate-400">{n.time}</p>
            </div>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={onSeeAll}
        className="mt-5 w-full rounded-lg border border-violet-100 py-2 text-[13px] font-medium text-primary hover:bg-violet-50"
      >
        See all notification
      </button>
    </div>
  );
}
