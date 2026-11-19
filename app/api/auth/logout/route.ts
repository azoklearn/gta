import { logOut } from "@/lib/server/auth";
import { api } from "@/lib/server/http";

export { OPTIONS } from "@/lib/server/http";

export const POST = api((request) => {
  logOut(request);
  return Response.json({ ok: true });
});
