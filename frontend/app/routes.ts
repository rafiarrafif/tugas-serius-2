import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("logout", "routes/logout.tsx"),
  route("stall", "routes/stall.tsx"),
  route("create/stall", "routes/stall.create.tsx"),
  route("stall/:stall_id", "routes/stall-detail.tsx"),
  route("stall/:stall_id/edit", "routes/stall-edit.tsx"),
  route("auth/login", "routes/auth.login.tsx"),
  route("auth/register", "routes/auth.register.tsx"),
] satisfies RouteConfig;
