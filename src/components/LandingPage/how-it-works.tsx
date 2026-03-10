function StepVisual({ index }: { index: number }) {
  if (index === 0) {
    return (
      <div className="space-y-3 rounded-lg border bg-muted/20 p-4">
        <div className="space-y-2">
          {['Discipline', 'License Type', 'Supervision Requirements'].map(
            (label) => (
              <div key={label} className="flex flex-col gap-1">
                <span className="text-xs font-medium text-muted-foreground">
                  {label} *
                </span>
                <div className="h-9 rounded-md border border-border bg-background" />
              </div>
            )
          )}
        </div>
        <div className="h-9 w-full rounded-md bg-primary/20" />
      </div>
    )
  }
  if (index === 1) {
    return (
      <div className="space-y-3 rounded-lg border bg-muted/20 p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">
            Select date
          </span>
          <div className="h-6 w-20 rounded border border-border" />
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-muted-foreground">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, index) => (
            <div key={`day-${index}`}>{d}</div>
          ))}
          {Array.from({ length: 28 }).map((_, i) => (
            <div
              key={i}
              className={`rounded py-1 ${
                i === 14 ? 'bg-primary text-primary-foreground' : ''
              }`}
            >
              {i + 1}
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <div className="h-9 flex-1 rounded-md border border-border" />
          <div className="h-9 flex-1 rounded-md border border-border" />
        </div>
      </div>
    )
  }
  return (
    <div className="space-y-3 rounded-lg border bg-muted/20 p-4">
      <div className="flex gap-2">
        <div className="h-8 w-8 shrink-0 rounded-full bg-primary/20" />
        <div className="min-w-0 flex-1 space-y-1">
          <div className="h-2 w-24 rounded bg-muted-foreground/20" />
          <div className="h-2 w-16 rounded bg-muted-foreground/10" />
        </div>
      </div>
      <div className="space-y-2 rounded-md border bg-background p-3">
        <div className="h-2 w-full rounded bg-muted-foreground/15" />
        <div className="h-2 w-[80%] rounded bg-muted-foreground/10" />
      </div>
      <div className="flex gap-2">
        <div className="h-9 flex-1 rounded-md border border-border" />
        <div className="h-9 w-20 rounded-md bg-primary/20" />
      </div>
    </div>
  )
}

const steps = [
  {
    title: 'Create Your Profile',
    description:
      'Tell us your discipline, license type, and supervision requirements.',
    visualLabel: 'Create Your Profile',
  },
  {
    title: 'Match with Qualified Supervisors',
    description:
      'Browse vetted professionals based on specialty, location, schedule, and budget.',
    visualLabel: 'Schedule a Session',
  },
  {
    title: 'Connect & Start Supervision',
    description:
      'Message supervisors, set up consultations, and track your hours right from your dashboard.',
    visualLabel: 'Connect & Start',
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-muted/30 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            How It Works
          </h2>
        </div>
        <div className="space-y-16">
          {steps.map((step, index) => {
            const textFirst = index % 2 === 0
            return (
            <div
              key={step.title}
              className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12"
            >
              <div className={textFirst ? 'lg:order-1' : 'lg:order-2'}>
                <h3 className="text-xl font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-3 text-muted-foreground">{step.description}</p>
              </div>
              <div
                className={`rounded-xl border bg-background p-6 shadow-sm ${
                  textFirst ? 'lg:order-2' : 'lg:order-1'
                }`}
              >
                <p className="mb-4 text-sm font-medium text-muted-foreground">
                  {step.visualLabel}
                </p>
                <StepVisual index={index} />
              </div>
            </div>
            );
          })}
        </div>
      </div>
    </section>
  )
}
