/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true }, // ⬅️ вимикає ESLint на прод-білді
  typescript: { ignoreBuildErrors: false }, // типи залишаємо увімкненими
};

module.exports = nextConfig;
