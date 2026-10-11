import Link from "next/link"
import { auth } from "@clerk/nextjs/server"
import { ArrowRightIcon, PlusIcon, ShieldCheckIcon } from "lucide-react"

import { BotDialog } from "@/components/bot-dialog"
import { DRAFTIEN_ROLES } from "@/lib/draftien/roles"
import { getBots } from "@/queries/bots"

export default async function HeadquartersPage() {
  await auth.protect()
  const bots = await getBots()
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 p-6 py-12">
      <header className="rounded-2xl border bg-card p-6 md:p-9">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Draftien / AI operations</p>
        <h1 className="mt-4 max-w-2xl text-4xl font-semibold tracking-tight">AI Headquarters</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Governed AI teamwork for Draftien. Define clear responsibilities, assign reviewable work,
          and keep people in control of business decisions.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/work" className="inline-flex items-center gap-2 rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background">
            Open work queue <ArrowRightIcon className="size-4" />
          </Link>
          <BotDialog><PlusIcon className="size-4" /> Create AI teammate</BotDialog>
        </div>
      </header>
      <section className="grid gap-3 md:grid-cols-3" aria-label="Headquarters overview">
        <div className="rounded-xl border p-5"><p className="text-sm text-muted-foreground">AI teammates created</p><p className="mt-2 text-3xl font-semibold">{bots.length}</p></div>
        <div className="rounded-xl border p-5"><p className="text-sm text-muted-foreground">Starter roles</p><p className="mt-2 text-3xl font-semibold">{DRAFTIEN_ROLES.length}</p></div>
        <div className="rounded-xl border p-5"><p className="text-sm text-muted-foreground">External business actions</p><p className="mt-2 text-sm font-semibold">Not connected</p></div>
      </section>
      <section>
        <h2 className="text-xl font-semibold">Starter AI workforce</h2>
        <p className="mt-1 text-sm text-muted-foreground">Select a role when creating a teammate. Role instructions do not grant API permissions.</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {DRAFTIEN_ROLES.map((role) => (
            <article key={role.id} className="rounded-xl border p-5">
              <h3 className="font-semibold">{role.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{role.job}</p>
              <p className="mt-4 text-sm">Outcome: {role.outcome}</p>
            </article>
          ))}
        </div>
      </section>
      <aside className="flex gap-3 rounded-xl border p-5 text-sm">
        <ShieldCheckIcon className="mt-0.5 size-5 shrink-0" />
        <div>
          <p className="font-semibold">Governance first</p>
          <p className="mt-1 text-muted-foreground">Tasks and approvals are recorded internally. No agent is connected to Draftien's production API, student records, payments, or publishing tools.</p>
        </div>
      </aside>
    </main>
  )
}
