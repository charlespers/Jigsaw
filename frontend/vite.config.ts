import { reactRouter } from "@react-router/dev/vite";
import autoprefixer from "autoprefixer";
import tailwindcss from "tailwindcss";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  css: {
    postcss: {
      plugins: [tailwindcss, autoprefixer],
    },
  },
  plugins: [reactRouter(), tsconfigPaths()],
  build: {
    outDir: "dist", 
    sourcemap: false,
    rollupOptions: {
      onwarn(warning, warn) {
        if (warning.message.includes("sourcemap") || warning.message.includes("Can't resolve original location")) {
          return;
        }
        warn(warning);
      },
    },
  },
});
