import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

const nextConfig = {
    turbopack: {
        root: dirname(dirname(__dirname)),
    },
    async rewrites() {
        return {
            beforeFiles: [
                {
                    source: '/api/:path*',
                    destination: `${apiBaseUrl}/:path*`,
                },
            ],
        };
    }
};

export default nextConfig;