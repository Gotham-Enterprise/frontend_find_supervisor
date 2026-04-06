/** Past clients section — uses dummy data until the API exposes supervision history. */

interface Client {
  initials: string
  name: string
  email: string
  avatarColor: string
  initialsColor: string
}

const DUMMY_CLIENTS: Client[] = [
  {
    initials: 'JS',
    name: 'John Smith',
    email: 'john@mygmail.com',
    avatarColor: '#DBEAFE',
    initialsColor: '#1D4ED8',
  },
  {
    initials: 'JS',
    name: 'John Smith',
    email: 'john@mygmail.com',
    avatarColor: '#FCE7F3',
    initialsColor: '#BE185D',
  },
  {
    initials: 'JS',
    name: 'John Smith',
    email: 'john@mygmail.com',
    avatarColor: '#FEF9C3',
    initialsColor: '#A16207',
  },
]

function ClientCard({ client }: { client: Client }) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className="flex size-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
        style={{ backgroundColor: client.avatarColor, color: client.initialsColor }}
      >
        {client.initials}
      </div>
      <div>
        <p className="text-sm font-medium text-[#374151]">{client.name}</p>
        <p className="text-xs text-[#6B7280]">{client.email}</p>
      </div>
    </div>
  )
}

export function SupervisorProfilePastClients() {
  return (
    <section className="border-b border-[#E5E7EB] py-8">
      <h2 className="mb-4 text-base font-semibold text-[#181818]">Past Clients</h2>
      <div className="flex flex-wrap gap-6">
        {DUMMY_CLIENTS.map((client, i) => (
          <ClientCard key={i} client={client} />
        ))}
      </div>
    </section>
  )
}
