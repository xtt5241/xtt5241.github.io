import type { CollectionConfig } from "payload";

export const Users: CollectionConfig = {
  slug: "users",
  labels: { singular: "用户", plural: "用户" },
  admin: { useAsTitle: "email", group: "系统" },
  auth: true,
  fields: [
    { name: "name", label: "昵称", type: "text" },
  ],
};
