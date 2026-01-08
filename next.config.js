import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!apiBaseUrl) {
    throw new Error('NEXT_PUBLIC_API_BASE_URL environment variable is not set');
}

export default {
    output: 'standalone',
    // Optimize webpack caching
    onDemandEntries: {
        // Period (in ms) where the server will keep pages in the buffer
        maxInactiveAge: 60 * 60 * 1000, // 1 hour
        // Number of pages that should be kept simultaneously without being disposed
        pagesBufferLength: 5,
    },
    // Optimize Image Optimization
    images: {
        unoptimized: process.env.NODE_ENV === 'development', // Skip optimization in dev for speed
    },
    async rewrites() {
        console.info('API Base URL:', apiBaseUrl);
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

