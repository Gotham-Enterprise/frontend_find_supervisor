import { Calendar, FileCheck, MessageCircle, UserCheck } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'

const cards = [
  {
    icon: FileCheck,
    title: 'Verified, licensed supervisors',
    description: 'Work with fully vetted, qualified professionals.',
    iconColor: 'text-primary',
    iconBg: 'bg-primary/10',
  },
  {
    icon: UserCheck,
    title: 'Specialty-aligned matching',
    description: 'Get paired with supervisors who match your field.',
    iconColor: 'text-primary',
    iconBg: 'bg-primary/10',
  },
  {
    icon: MessageCircle,
    title: 'Transparent rates & availability',
    description: 'View clear pricing and open slots upfront.',
    iconColor: 'text-primary',
    iconBg: 'bg-primary/10',
  },
  {
    icon: Calendar,
    title: 'Virtual or in-person supervision options',
    description: 'Choose online, in-person, or hybrid supervision.',
    iconColor: 'text-primary',
    iconBg: 'bg-primary/10',
  },
]

export function WhySupervisionMatters() {
  return (
    <section className="bg-background py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Why Supervision Matters
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Whether you&apos;re completing clinical hours, starting your first residency, or
            advancing your mental-health career, supervision ensures you&apos;re supported,
            compliant, and empowered.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map(({ icon: Icon, title, description, iconColor, iconBg }) => (
            <Card
              key={title}
              className="border-border bg-card shadow-sm transition-shadow hover:shadow-md"
            >
              <CardContent className="p-6">
                <div className="mb-4 flex justify-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBg}`}
                  >
                    <Icon className={`h-5 w-5 ${iconColor}`} />
                  </div>
                </div>
                <h3 className="mb-2 font-semibold text-foreground text-center">{title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground text-center">
                  {description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
