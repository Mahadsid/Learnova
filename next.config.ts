import type { NextConfig } from "next";

const nextConfig: NextConfig = {

	images: {
		remotePatterns: [
			{
				hostname: "learnova-lms.t3.storage.dev",
				port: "",
				protocol: "https",
			}
		]
	},
  /* config options here */
    async rewrites() {
    		return [
    			{
    				source: '/api/c15t/:path*',
    				destination: `${process.env.NEXT_PUBLIC_C15T_URL}/:path*`,
    			},
    		];
    	}
};

export default nextConfig;
