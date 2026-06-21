/**
 * MCP tools: organization permission-preset administration (create / update / delete).
 *
 * pg_graphql collection mutations through the authenticated (user-token) graphy client — RLS gates
 * them: the `permission_presets` write policy requires `presets_manage` on the (non-null)
 * organization, and a BEFORE trigger validates that every slug exists in the catalog. Global presets
 * (organization_id IS NULL) stay platform-managed and are not writable here.
 */

import type { VariablesOf } from "@graphql-typed-document-node/core";
import { z } from "zod";
import { gql } from "~/generated/graphql";
import { debug } from "~/lib/debug";
import { getGraphyFromMcpAssert } from "~/lib/mcp/clients";
import { type InferArgs, type McpContext, McpTool, type McpToolStream } from "~/lib/mcp/tool";

const log = debug("app:api:mcp:tools:presets");

const CreatePresetMcpMutation = /*#__PURE__*/ gql(`
  mutation CreatePresetMcp($objects: [PermissionPresetsInsertInput!]!) {
    insertIntoPermissionPresetsCollection(objects: $objects) {
      records { permissionPresetId }
    }
  }
`);

const CreateSchema = {
  organization_id: z.number().int().positive().describe("Organization that will own the preset."),
  permission_preset_name: z.string().min(1).max(100).describe("Display name for the preset."),
  permission_preset_slugs: z.array(z.string().min(1)).describe("Permission slugs bundled by the preset."),
};
type CreateArgs = InferArgs<typeof CreateSchema>;

/**
 * `create_preset` — create an org-scoped permission preset.
 * RLS requires `presets_manage` on the org; the slug-validation trigger rejects unknown slugs.
 *
 * @example
 * await new CreatePresetTool().run({ organization_id: 1, permission_preset_name: "Auditor", permission_preset_slugs: ["tickets_manage"] }, ctx);
 */
export class CreatePresetTool extends McpTool<typeof CreateSchema> {
  readonly name = "create_preset";
  readonly description = [
    "Create an organization-scoped permission preset (a named bundle of permission slugs).",
    "Requires `presets_manage` (or `*`) on the organization (RLS-enforced);",
    "every slug must exist in the catalog. Returns the created preset id.",
  ].join(" ");
  readonly inputSchema = CreateSchema;

  async *handle(args: CreateArgs, ctx: McpContext): McpToolStream {
    const graphy = getGraphyFromMcpAssert(ctx);
    const { data, error } = await graphy.mutate({
      query: CreatePresetMcpMutation,
      variables: {
        objects: [
          {
            organizationId: args["organization_id"],
            permissionPresetName: args["permission_preset_name"],
            permissionPresetSlugs: args["permission_preset_slugs"],
          },
        ],
      },
    });

    if (error) {
      log.error("[create_preset] mutation failed: %o", { args, error: error.message });
      return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
    }

    const record = data?.["insertIntoPermissionPresetsCollection"]?.["records"]?.[0];
    if (!record) {
      return {
        content: [{ type: "text", text: "Forbidden: requires presets_manage on this organization" }],
        isError: true,
      };
    }
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ ok: true, permission_preset_id: record["permissionPresetId"] }, null, 2),
        },
      ],
    };
  }
}

const UpdatePresetMcpMutation = /*#__PURE__*/ gql(`
  mutation UpdatePresetMcp($filter: PermissionPresetsFilter!, $set: PermissionPresetsUpdateInput!, $atMost: Int! = 1000) {
    updatePermissionPresetsCollection(filter: $filter, set: $set, atMost: $atMost) {
      affectedCount
    }
  }
`);

const UpdateSchema = {
  permission_preset_id: z.number().int().positive().describe("Preset to update."),
  permission_preset_name: z.string().min(1).max(100).optional().describe("New name (optional)."),
  permission_preset_slugs: z
    .array(z.string().min(1))
    .optional()
    .describe("New slug set (optional, replaces the list)."),
};
type UpdateArgs = InferArgs<typeof UpdateSchema>;

/**
 * `update_preset` — rename a preset and/or replace its slug list.
 * RLS requires `presets_manage` on the preset's org; the slug-validation trigger applies.
 *
 * @example
 * await new UpdatePresetTool().run({ permission_preset_id: 5, permission_preset_slugs: ["members_manage"] }, ctx);
 */
export class UpdatePresetTool extends McpTool<typeof UpdateSchema> {
  readonly name = "update_preset";
  readonly description = [
    "Rename an organization preset and/or replace its permission slug list.",
    "Requires `presets_manage` (or `*`) on the preset's organization (RLS-enforced).",
    "Global presets are platform-managed and cannot be edited here.",
  ].join(" ");
  readonly inputSchema = UpdateSchema;

  async *handle(args: UpdateArgs, ctx: McpContext): McpToolStream {
    const set: VariablesOf<typeof UpdatePresetMcpMutation>["set"] = {};
    if (args["permission_preset_name"] !== undefined) set.permissionPresetName = args["permission_preset_name"];
    if (args["permission_preset_slugs"] !== undefined) set.permissionPresetSlugs = args["permission_preset_slugs"];

    if (Object.keys(set).length === 0) {
      return { content: [{ type: "text", text: "Nothing to update: provide a name and/or slugs." }], isError: true };
    }

    const graphy = getGraphyFromMcpAssert(ctx);
    const { data, error } = await graphy.mutate({
      query: UpdatePresetMcpMutation,
      variables: { filter: { permissionPresetId: { eq: args["permission_preset_id"] } }, set },
    });

    if (error) {
      log.error("[update_preset] mutation failed: %o", { args, error: error.message });
      return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
    }

    const changed = (data?.["updatePermissionPresetsCollection"]?.["affectedCount"] ?? 0) > 0;
    return { content: [{ type: "text", text: JSON.stringify({ ok: true, changed }, null, 2) }] };
  }
}

const DeletePresetMcpMutation = /*#__PURE__*/ gql(`
  mutation DeletePresetMcp($filter: PermissionPresetsFilter!, $atMost: Int! = 1000) {
    deleteFromPermissionPresetsCollection(filter: $filter, atMost: $atMost) {
      affectedCount
    }
  }
`);

const DeleteSchema = {
  permission_preset_id: z.number().int().positive().describe("Preset to delete."),
};
type DeleteArgs = InferArgs<typeof DeleteSchema>;

/**
 * `delete_preset` — delete an org-scoped permission preset.
 * RLS requires `presets_manage` on the preset's org. Presets carry no enforcement, so this
 * only removes the UX bundle; it never changes any member's actual grants.
 *
 * @example
 * await new DeletePresetTool().run({ permission_preset_id: 5 }, ctx);
 */
export class DeletePresetTool extends McpTool<typeof DeleteSchema> {
  readonly name = "delete_preset";
  readonly description = [
    "Delete an organization-scoped permission preset (the named bundle only — no member grants change).",
    "Requires `presets_manage` (or `*`) on the preset's organization (RLS-enforced).",
  ].join(" ");
  readonly inputSchema = DeleteSchema;

  async *handle(args: DeleteArgs, ctx: McpContext): McpToolStream {
    const graphy = getGraphyFromMcpAssert(ctx);
    const { data, error } = await graphy.mutate({
      query: DeletePresetMcpMutation,
      variables: { filter: { permissionPresetId: { eq: args["permission_preset_id"] } } },
    });

    if (error) {
      log.error("[delete_preset] mutation failed: %o", { args, error: error.message });
      return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
    }

    const deleted = (data?.["deleteFromPermissionPresetsCollection"]?.["affectedCount"] ?? 0) > 0;
    return { content: [{ type: "text", text: JSON.stringify({ ok: true, deleted }, null, 2) }] };
  }
}
