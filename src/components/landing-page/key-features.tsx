const features = [
  {
    number: '1',
    title: 'Verified Supervisor Directory',
    description:
      'All supervisors are credential-checked and reviewed by our team.',
  },
  {
    number: '2',
    title: 'AI-Powered Matching',
    description:
      'We match you with supervisors who fit your career path, goals, and required competencies.',
  },
  {
    number: '3',
    title: 'Flexible Options',
    description:
      'Choose between in-person, hybrid, or virtual supervision.',
  },
  {
    number: '4',
    title: 'Transparent Pricing',
    description:
      'No surprises—see supervision rates, payment options, and availability upfront.',
  },
  {
    number: '5',
    title: 'Communication Tools Built In',
    description:
      'Chat, schedule sessions, and track supervision hours—all in one place.',
  },
]

export function KeyFeatures() {
  return (
    <section id="features" className="bg-background py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-12 text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Key Features
        </h2>
        <div className="grid gap-12 lg:grid-cols-2">
          <div className="space-y-6">
            {features.map(({ number, title, description }) => (
              <div key={number} className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {number}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center lg:justify-end">
            <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-background shadow-xl">
              <div className="space-y-4 p-6">
                <div className="border-b pb-3">
                  <div className="h-4 w-28 rounded bg-muted-foreground/15" />
                  <div className="mt-1 h-3 w-40 rounded bg-muted-foreground/10" />
                </div>
                <div className="space-y-3">
                  {[
                    'First Name',
                    'Last Name',
                    'Discipline',
                    'License Type',
                    'Email',
                  ].map((label) => (
                    <div key={label} className="flex flex-col gap-1">
                      <span className="text-[10px] font-medium text-muted-foreground">
                        {label}
                      </span>
                      <div className="h-8 rounded-md border border-border bg-muted/30" />
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 pt-2">
                  <div className="h-9 flex-1 rounded-md border border-border bg-muted/20" />
                  <div className="h-9 flex-1 rounded-md bg-primary" />
                </div>
              </div>
              <div className="absolute -right-2 -top-2 flex items-center gap-1 rounded-full border bg-background px-2.5 py-1 text-[10px] font-medium shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                Example
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
