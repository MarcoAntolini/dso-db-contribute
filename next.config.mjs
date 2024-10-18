/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		remotePatterns: [{ protocol: "https", hostname: "api.dracania-archives.com", pathname: "/images/**", port: "" }]
	}
};

export default nextConfig;
