/** A human-operated review queue: no autonomous or external execution. */
export const WORK_STATUSES = ["planned", "in_review", "approved", "rejected"] as const
export type WorkStatus = (typeof WORK_STATUSES)[number]

export const WORK_STATUS_LABELS: Record<WorkStatus, string> = {
  planned: "Planned",
  in_review: "Awaiting review",
  approved: "Approved (internal)",
  rejected: "Rejected",
}

export function canTransition(from: WorkStatus, to: WorkStatus): boolean {
  return (
    (from === "planned" && to === "in_review") ||
    (from === "in_review" && (to === "approved" || to === "rejected"))
  )
}
