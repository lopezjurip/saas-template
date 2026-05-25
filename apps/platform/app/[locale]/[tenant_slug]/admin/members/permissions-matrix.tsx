"use client";

import { Badge } from "@packages/ui-common/shadcn/components/ui/badge";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Checkbox } from "@packages/ui-common/shadcn/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@packages/ui-common/shadcn/components/ui/table";
import { useRouter } from "next/navigation";
import { useOptimistic, useState, useTransition } from "react";
import { useRosetta } from "~/hooks/use-rosetta";
import { actionDemoteWildcard, actionRemoveMember, actionTogglePermission } from "./actions";
import { MEMBERS_LOCALES } from "./locales";

interface PermissionRow {
  permission_id: string;
  permission_description: string | null;
}

interface MemberRow {
  profile_id: string;
  profile_name_full: string | null;
  email: string | null;
  permissions: string[];
  has_wildcard: boolean;
  membership_created_at: string;
}

interface Props {
  organization_id: number;
  permissions: PermissionRow[];
  members: MemberRow[];
}

type OptimisticAction =
  | { kind: "toggle"; profile_id: string; permission_id: string; granted: boolean }
  | { kind: "demote_wildcard"; profile_id: string }
  | { kind: "remove"; profile_id: string };

function APPLY_OPTIMISTIC(state: MemberRow[], action: OptimisticAction): MemberRow[] {
  switch (action.kind) {
    case "toggle":
      return state.map((m) => {
        if (m.profile_id !== action.profile_id) return m;
        const set = new Set(m.permissions);
        if (action.granted) set.add(action.permission_id);
        else set.delete(action.permission_id);
        return { ...m, permissions: Array.from(set).sort() };
      });
    case "demote_wildcard":
      return state.map((m) => (m.profile_id === action.profile_id ? { ...m, has_wildcard: false } : m));
    case "remove":
      return state.filter((m) => m.profile_id !== action.profile_id);
  }
}

export function MembersMatrix({ organization_id, permissions, members }: Props) {
  const r = useRosetta(MEMBERS_LOCALES);
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [optimisticMembers, applyOptimistic] = useOptimistic(members, APPLY_OPTIMISTIC);

  const togglePermission = (member: MemberRow, permission_id: string, granted: boolean) => {
    setError(null);
    startTransition(async () => {
      applyOptimistic({ kind: "toggle", profile_id: member.profile_id, permission_id, granted });
      const res = await actionTogglePermission({
        organization_id,
        profile_id: member.profile_id,
        permission_id,
        granted,
      });
      if (res?.serverError) {
        setError(res.serverError);
      }
      router.refresh();
    });
  };

  const demoteWildcard = (member: MemberRow) => {
    setError(null);
    startTransition(async () => {
      applyOptimistic({ kind: "demote_wildcard", profile_id: member.profile_id });
      const res = await actionDemoteWildcard({ organization_id, profile_id: member.profile_id });
      if (res?.serverError) {
        setError(res.serverError);
      }
      router.refresh();
    });
  };

  const removeMember = (member: MemberRow) => {
    const name = member.profile_name_full ?? member.email ?? r.t("matrix_unknown_member");
    if (!window.confirm(r.t("matrix_remove_confirm", { name }))) return;
    setError(null);
    startTransition(async () => {
      applyOptimistic({ kind: "remove", profile_id: member.profile_id });
      const res = await actionRemoveMember({ organization_id, profile_id: member.profile_id });
      if (res?.serverError) {
        setError(res.serverError);
      }
      router.refresh();
    });
  };

  if (optimisticMembers.length === 0) {
    return <p className="text-muted-foreground text-sm">{r.t("matrix_empty")}</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {error && <p className="text-destructive text-xs">{error}</p>}
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="sticky left-0 z-10 bg-background min-w-[14rem]">
                {r.t("matrix_member_column")}
              </TableHead>
              {permissions.map((perm) => (
                <TableHead key={perm["permission_id"]} className="text-center align-bottom">
                  <div className="flex flex-col items-center gap-1">
                    <span className="font-mono text-xs">{perm["permission_id"]}</span>
                  </div>
                </TableHead>
              ))}
              <TableHead className="text-right">{r.t("matrix_actions_column")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {optimisticMembers.map((member) => {
              const memberName = member.profile_name_full ?? member.email ?? member.profile_id.slice(0, 8);
              return (
                <TableRow key={member.profile_id}>
                  <TableCell className="sticky left-0 z-10 bg-background min-w-[14rem]">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{memberName}</span>
                      {member.email && <span className="text-muted-foreground text-xs">{member.email}</span>}
                      {member.has_wildcard && (
                        <Badge variant="default" className="mt-1 w-fit">
                          {r.t("matrix_full_access_badge")}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  {member.has_wildcard ? (
                    <TableCell colSpan={permissions.length} className="text-center text-muted-foreground text-sm">
                      {r.t("matrix_full_access_row")}
                    </TableCell>
                  ) : (
                    permissions.map((perm) => {
                      const slug = perm["permission_id"];
                      const checked = member.permissions.includes(slug);
                      return (
                        <TableCell key={slug} className="text-center">
                          <Checkbox
                            checked={checked}
                            disabled={pending}
                            aria-label={r.t("matrix_aria_cell", { slug, name: memberName })}
                            onCheckedChange={(value) => togglePermission(member, slug, Boolean(value))}
                          />
                        </TableCell>
                      );
                    })
                  )}
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {member.has_wildcard && (
                        <Button size="sm" variant="outline" disabled={pending} onClick={() => demoteWildcard(member)}>
                          {r.t("matrix_demote_button")}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        disabled={pending}
                        onClick={() => removeMember(member)}
                      >
                        {r.t("matrix_remove_button")}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      <p className="text-muted-foreground text-xs">{r.t("matrix_wildcard_footer")}</p>
    </div>
  );
}
