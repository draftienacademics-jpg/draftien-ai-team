"use server"

import { auth } from "@clerk/nextjs/server"
import { and, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { z } from "zod"

import { db } from "@/db"
import {
  draftienTaskEvents,
  draftienWorkItemInsertSchema,
  draftienWorkItems,
} from "@/db/schema"
import { canTransition } from "@/lib/draftien/workflow"

async function getOwnerId(): Promise<string> {
  const { userId } = await auth()
  if (!userId) throw new Error("Not authenticated")
  return userId
}

const submitSchema = z.object({
  id: z.string().min(1),
  deliverable: z.string().trim().min(15).max(12000),
})

const decisionSchema = z.object({
  id: z.string().min(1),
  decision: z.enum(["approved", "rejected"]),
  note: z.string().trim().max(1000),
})

export async function createWorkItem(formData: FormData): Promise<void> {
  const userId = await getOwnerId()
  const data = draftienWorkItemInsertSchema.parse({
    title: formData.get("title"),
    brief: formData.get("brief"),
    role: formData.get("role"),
  })
  await db.transaction(async (tx) => {
    const [item] = await tx
      .insert(draftienWorkItems)
      .values({ ...data, userId })
      .returning({ id: draftienWorkItems.id })
    await tx.insert(draftienTaskEvents).values({
      workItemId: item.id,
      userId,
      action: "created",
      note: `Assigned to role: ${data.role}`,
    })
  })
  revalidatePath("/work")
}

/** Manually submit a draft. No agent is automatically invoked. */
export async function submitWorkItem(formData: FormData): Promise<void> {
  const userId = await getOwnerId()
  const data = submitSchema.parse({
    id: formData.get("id"),
    deliverable: formData.get("deliverable"),
  })
  if (!canTransition("planned", "in_review")) throw new Error("Invalid status")
  await db.transaction(async (tx) => {
    const [item] = await tx
      .update(draftienWorkItems)
      .set({ status: "in_review", deliverable: data.deliverable, updatedAt: new Date() })
      .where(and(
        eq(draftienWorkItems.id, data.id),
        eq(draftienWorkItems.userId, userId),
        eq(draftienWorkItems.status, "planned")
      ))
      .returning({ id: draftienWorkItems.id })
    if (!item) throw new Error("Work item not found or already submitted")
    await tx.insert(draftienTaskEvents).values({
      workItemId: item.id,
      userId,
      action: "submitted_for_review",
      note: "Deliverable submitted for human review",
    })
  })
  revalidatePath("/work")
}

/** Internal decision only: approval does not trigger publication, spending, or sending. */
export async function decideWorkItem(formData: FormData): Promise<void> {
  const userId = await getOwnerId()
  const data = decisionSchema.parse({
    id: formData.get("id"),
    decision: formData.get("decision"),
    note: formData.get("note") ?? "",
  })
  if (!canTransition("in_review", data.decision)) throw new Error("Invalid status")
  if (data.decision === "rejected" && data.note.length < 8) {
    throw new Error("Provide a rejection reason of at least 8 characters")
  }
  await db.transaction(async (tx) => {
    const [item] = await tx
      .update(draftienWorkItems)
      .set({ status: data.decision, reviewedAt: new Date(), updatedAt: new Date() })
      .where(and(
        eq(draftienWorkItems.id, data.id),
        eq(draftienWorkItems.userId, userId),
        eq(draftienWorkItems.status, "in_review")
      ))
      .returning({ id: draftienWorkItems.id })
    if (!item) throw new Error("Work item not found or already reviewed")
    await tx.insert(draftienTaskEvents).values({
      workItemId: item.id,
      userId,
      action: data.decision,
      note: data.note || "Internal review decision",
    })
  })
  revalidatePath("/work")
}
