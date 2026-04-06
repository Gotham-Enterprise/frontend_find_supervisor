/** Reusable two-column checkmark list used by Focus Areas and Approaches sections. */

interface CheckListProps {
  title: string
  items: string[]
}

function CheckItem({ label }: { label: string }) {
  return (
    <div className="flex items-start gap-2">
      {/* Green filled circle with check */}
      <svg
        className="mt-0.5 size-4 shrink-0"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="8" cy="8" r="8" fill="#006D36" />
        <path
          d="M4.5 8l2.5 2.5 4.5-4.5"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="text-sm text-[#374151]">{label}</span>
    </div>
  )
}

export function SupervisorProfileCheckList({ title, items }: CheckListProps) {
  if (items.length === 0) return null

  const mid = Math.ceil(items.length / 2)
  const col1 = items.slice(0, mid)
  const col2 = items.slice(mid)

  return (
    <section className="border-b border-[#E5E7EB] py-8">
      <h2 className="mb-4 text-base font-semibold text-[#181818]">{title}</h2>
      <div className="grid grid-cols-1 gap-x-8 gap-y-2.5 sm:grid-cols-2">
        <div className="space-y-2.5">
          {col1.map((item) => (
            <CheckItem key={item} label={item} />
          ))}
        </div>
        {col2.length > 0 && (
          <div className="space-y-2.5">
            {col2.map((item) => (
              <CheckItem key={item} label={item} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
