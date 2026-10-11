import Link from "next/link"
import { auth } from "@clerk/nextjs/server"

import { createWorkItem, decideWorkItem, submitWorkItem } from "@/actions/work-items"
import { DRAFTIEN_ROLES } from "@/lib/draftien/roles"
import { WORK_STATUS_LABELS } from "@/lib/draftien/workflow"
import { getWorkItemEvents, getWorkItems } from "@/queries/work-items"

const inputClass = "w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
const buttonClass = "rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"

export default async function WorkPage() {
  await auth.protect()
  const [items, events] = await Promise.all([getWorkItems(), getWorkItemEvents()])
  const inReview = items.filter((item) => item.status === "in_review").length

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 p-6 py-10">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Draftien / Operations</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Work &amp; approvals</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Assign work, submit draft deliverables, and review decisions. This first version is human-operated:
            assigning a task does not automatically run an agent or authorize an external action.
          </p>
        </div>
        <Link href="/" className="rounded-md border px-3 py-2 text-sm">Back to headquarters</Link>
      </header>

      <section className="grid gap-3 sm:grid-cols-3" aria-label="Queue summary">
        <div className="rounded-xl border p-5"><p className="text-sm text-muted-foreground">Total tasks</p><p className="mt-2 text-3xl font-semibold">{items.length}</p></div>
        <div className="rounded-xl border p-5"><p className="text-sm text-muted-foreground">Awaiting review</p><p className="mt-2 text-3xl font-semibold">{inReview}</p></div>
        <div className="rounded-xl border p-5"><p className="text-sm text-muted-foreground">Approved internally</p><p className="mt-2 text-3xl font-semibold">{items.filter((item) => item.status === "approved").length}</p></div>
      </section>

      <section className="rounded-xl border p-5 md:p-6">
        <h2 className="text-xl font-semibold">Create a task</h2>
        <p className="mb-5 mt-1 text-sm text-muted-foreground">Start with a focused, measurable outcome that a human can review.</p>
        <form action={createWorkItem} className="grid gap-4">
          <label className="grid gap-1 text-sm font-medium">Task title
            <input className={inputClass} name="title" required minLength={3} maxLength={120} placeholder="Analyze course enrollment drop-offs" />
          </label>
          <label className="grid gap-1 text-sm font-medium">Assigned role
            <select className={inputClass} name="role" defaultValue={DRAFTIEN_ROLES[0].id} required>
              {DRAFTIEN_ROLES.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}
            </select>
          </label>
          <label className="grid gap-1 text-sm font-medium">Brief and expected outcome
            <textarea className={inputClass} name="brief" required minLength={12} maxLength={4000} rows={4} placeholder="What decision should this help us make? What inputs are permitted?" />
          </label>
          <div><button type="submit" className={buttonClass}>Create task</button></div>
        </form>
      </section>

      <section className="flex flex-col gap-4">
        <div><h2 className="text-xl font-semibold">Task queue</h2><p className="text-sm text-muted-foreground">No changes are sent to students, vendors, or production systems.</p></div>
        {items.length === 0 && <p className="rounded-xl border border-dashed p-8 text-sm text-muted-foreground">No tasks yet. Create your first assignment above.</p>}
        {items.map((item) => (
          <article key={item.id} className="rounded-xl border p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{DRAFTIEN_ROLES.find((role) => role.id === item.role)?.name ?? item.role} · {item.createdAt.toLocaleDateString("en-IN")}</p>
              </div>
              <span className="rounded-full border px-3 py-1 text-xs">{WORK_STATUS_LABELS[item.status]}</span>
            </div>
            <p className="my-4 whitespace-pre-wrap text-sm">{item.brief}</p>
            {item.deliverable && <div className="my-4 rounded-lg bg-muted/60 p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide">Draft deliverable</p>
              <p className="whitespace-pre-wrap text-sm">{item.deliverable}</p>
            </div>}
            {item.status === "planned" && (
              <form action={submitWorkItem} className="grid gap-3 border-t pt-4">
                <input type="hidden" name="id" value={item.id} />
                <label className="grid gap-1 text-sm font-medium">Submit a draft for review (manual step)
                  <textarea name="deliverable" className={inputClass} rows={3} minLength={15} maxLength={12000} required placeholder="Paste work product and supporting evidence here..." />
                </label>
                <div><button type="submit" className={buttonClass}>Submit for review</button></div>
              </form>
            )}
            {item.status === "in_review" && (
              <form action={decideWorkItem} className="grid gap-3 border-t pt-4">
                <input type="hidden" name="id" value={item.id} />
                <label className="grid gap-1 text-sm font-medium">Review note (at least 8 characters if rejecting)
                  <textarea name="note" className={inputClass} rows={2} maxLength={1000} placeholder="Rationale or requested changes" />
                </label>
                <div className="flex flex-wrap gap-2">
                  <button type="submit" name="decision" value="approved" className={buttonClass}>Approve internally</button>
                  <button type="submit" name="decision" value="rejected" className="rounded-md border border-destructive px-4 py-2 text-sm font-medium text-destructive">Reject</button>
                </div>
                <p className="text-xs text-muted-foreground">Approval records an internal decision only; it does not publish, spend, email, or trigger agents.</p>
              </form>
            )}
          </article>
        ))}
      </section>
      <section className="rounded-xl border p-5">
        <h2 className="font-semibold">Recent audit activity</h2>
        <div className="mt-3 flex flex-col gap-3">
          {events.length === 0 && <p className="text-sm text-muted-foreground">No audit events yet.</p>}
          {events.map((event) => (
            <div key={event.id} className="flex flex-wrap items-baseline justify-between gap-2 border-b pb-2 text-sm last:border-0">
              <p><span className="font-medium">{event.action.replaceAll("_", " ")}</span><span className="ml-2 text-muted-foreground">{event.note}</span></p>
              <time className="text-xs text-muted-foreground" dateTime={event.createdAt.toISOString()}>{event.createdAt.toLocaleString("en-IN")}</time>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
