import type { NextConfig } from "next";
//@ts-ignore
import {PrismaPlugin} from "@prisma/nextjs-monorepo-workaround-plugin"

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
	webpack: (config, { isServer }) => {
    if (isServer) {
      config.plugins = [...config.plugins, new PrismaPlugin()]
    }

    return config
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
