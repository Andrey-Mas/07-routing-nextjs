/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true }, // вимикаємо ESLint на білді
  typescript: { ignoreBuildErrors: false }, // типи залишаємо увімкненими
};

export default nextConfig;
