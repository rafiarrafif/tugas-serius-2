import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const environment = loadEnv(mode, process.cwd(), "");
  if (!process.env.AUTH_SESSION_SECRET && environment.AUTH_SESSION_SECRET) {
    process.env.AUTH_SESSION_SECRET = environment.AUTH_SESSION_SECRET;
  }

  return {
    envPrefix: ["VITE_", "BACKEND_ENDPOINT"],
    plugins: [tailwindcss(), reactRouter()],
    resolve: {
      tsconfigPaths: true,
    },
  };
});
