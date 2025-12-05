import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const nextConfig = {
    turbopack: {
        root: dirname(dirname(__dirname)),
    },
    async rewrites() {
        return {
            beforeFiles: [
                {
                    source: '/api/:path*',
                    destination: 'http://localhost:8000/:path*',
                },
            ],
        };
    }
};

export default nextConfig;