import { createAdminClient } from "@/lib/supabase/server"

type AuditAction = "insert" | "update" | "delete"

export async function writeAuditLog(params: {
  tableName: string
  recordId: string
  action: AuditAction
  oldData?: Record<string, unknown> | null
  newData?: Record<string, unknown> | null
  changedBy: string
}) {
  try {
    const adminClient = createAdminClient()
    await adminClient.from("audit_log").insert({
      table_name: params.tableName,
      record_id: params.recordId,
      action: params.action,
      old_data: params.oldData ?? null,
      new_data: params.newData ?? null,
      changed_by: params.changedBy,
    })
  } catch (error) {
    console.error("Audit log yazılamadı:", error)
  }
}
