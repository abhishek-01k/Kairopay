import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@repo/sdk"],
  outputFileTracingRoot: path.join(__dirname, "../../"),
};

export default nextConfig;
