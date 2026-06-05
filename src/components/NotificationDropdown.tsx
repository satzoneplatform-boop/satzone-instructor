export function NotificationDropdown({ onSeeAll }: { onSeeAll?: () => void }) {
  return (
    <div className="w-[332px] rounded-2xl bg-white p-5 shadow-dropdown">
      <h3 className="mb-4 text-[16px] font-semibold text-ink">Notification</h3>

      <div className="flex flex-col items-center justify-center py-8 text-center">
        <p className="text-[13px] text-slate-400">No notifications yet</p>
      </div>

      <button
        type="button"
        onClick={onSeeAll}
        className="mt-2 w-full rounded-lg border border-violet-100 py-2 text-[13px] font-medium text-primary hover:bg-violet-50"
      >
        See all notifications
      </button>
    </div>
  );
}
