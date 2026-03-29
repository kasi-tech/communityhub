import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MembersToolbar } from "./members-toolbar";

const STATUS_VARIANT: Record<string, "success" | "warning" | "danger" | "gray" | "info"> = {
  active: "success",
  expired: "danger",
  suspended: "warning",
  pending: "info",
  applying: "info",
  rejected: "danger",
};

export default async function AdminMembersPage() {
  const supabase = await createClient();

  const { data: members } = await supabase
    .from("members")
    .select("id, name, email, member_number, status, role, tier_id, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  // Fetch tier names
  const { data: tiers } = await supabase
    .from("membership_tiers")
    .select("id, name");

  const tierMap = new Map<string, string>();
  for (const t of tiers ?? []) {
    tierMap.set(t.id, t.name);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Members</h1>
          <p className="mt-1 text-sm text-gray-500">Manage community members</p>
        </div>
      </div>

      <MembersToolbar />

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" aria-label="Members table">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                <th className="px-6 py-3">Member ID</th>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Tier</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Joined</th>
                <th className="px-6 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(!members || members.length === 0) ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                    No members found
                  </td>
                </tr>
              ) : (
                members.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-3 font-mono text-xs text-gray-600">
                      {member.member_number || member.id.slice(0, 8)}
                    </td>
                    <td className="px-6 py-3 font-medium text-gray-900">{member.name}</td>
                    <td className="px-6 py-3 text-gray-700">{member.email}</td>
                    <td className="px-6 py-3 text-gray-700">
                      {tierMap.get(member.tier_id) ?? "—"}
                    </td>
                    <td className="px-6 py-3">
                      <Badge variant={STATUS_VARIANT[member.status] ?? "gray"}>
                        {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="whitespace-nowrap px-6 py-3 text-gray-500">
                      {new Date(member.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3">
                      <a
                        href={`/admin/members/${member.id}`}
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                        aria-label={`View ${member.name}`}
                      >
                        View
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
