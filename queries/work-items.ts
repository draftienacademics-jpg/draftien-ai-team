import { auth } from "@clerk/nextjs/server"
import { desc, eq } from "drizzle-orm"

import { db } from "@/db"
import { draftienTaskEvents, draftienWorkItems } from "@/db/schema"

export async function getWorkItems() {
  const { userId } = await auth()
  if (!userId) throw new Error("Not authenticated")
  return db.query.draftienWorkItems.findMany({
    where: eq(draftienWorkItems.userId, userId),
    orderBy: desc(draftienWorkItems.createdAt),
  })
}

export async function getWorkItemEvents() {
  const { userId } = await auth()
  if (!userId) throw new Error("Not authenticated")
  return db.query.draftienTaskEvents.findMany({
    where: eq(draftienTaskEvents.userId, userId),
    orderBy: desc(draftienTaskEvents.createdAt),
    limit: 30,
  })
}
