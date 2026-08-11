import config from "@payload-config";
import "@payloadcms/next/css";
import { GRAPHQL_POST } from "@payloadcms/next/routes";

export const POST = GRAPHQL_POST(config);
