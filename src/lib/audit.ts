// ---------------------------------------------------------------------------
// Audit logging — writes to the `audit_logs` table via Supabase service role.
// ---------------------------------------------------------------------------

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export interface AuditLogParams {
  tenantId: string;
  actorId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
}

/**
 * Lazily-initialised Supabase admin client (service role).
 * Kept module-scoped so it is reused across invocations in the same process.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let adminClient: SupabaseClient<any, "public", any> | null = null;

function getAdminClient() {
  if (adminClient) return adminClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY for audit logging",
    );
  }

  adminClient = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  return adminClient;
}

/**
 * Insert a row into the `audit_logs` table.
 *
 * Fails silently in production (logs to stderr) so that audit issues never
 * block the primary request. In development, throws to surface problems early.
 */
export async function createAuditLog(params: AuditLogParams): Promise<void> {
  const {
    tenantId,
    actorId,
    action,
    entityType,
    entityId,
    details,
    ipAddress,
  } = params;

  try {
    const client = getAdminClient();

    const { error } = await client.from("audit_logs").insert({
      tenant_id: tenantId,
      actor_id: actorId ?? null,
      action,
      entity_type: entityType,
      entity_id: entityId ?? null,
      details: details ?? null,
      ip_address: ipAddress ?? null,
      created_at: new Date().toISOString(),
    });

    if (error) {
      throw error;
    }
  } catch (err) {
    console.error("[audit] Failed to write audit log:", err);
    if (process.env.NODE_ENV !== "production") {
      throw err;
    }
  }
}
