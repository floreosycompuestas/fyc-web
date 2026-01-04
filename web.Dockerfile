#docker build -f web.Dockerfile -t fyc-web-prod:tag .
#example docker build -f web.Dockerfile -t fyc-web-prod:latest .
##tag it
#sudo docker tag fyc-web-prod rgrullon/fyc-web-prod:latest
#
#push it
#sudo docker push rgrullon/fyc-web-prod:latest
#

## Multi-stage Dockerfile for Next.js Frontend
# Production-optimized with security hardening and Kubernetes best practices

FROM node:20.10-alpine AS deps
WORKDIR /fyc-web
COPY package*.json ./
COPY *.js ./
RUN npm ci --only=production

FROM node:20.10-alpine AS builder
WORKDIR /fyc-web
COPY package*.json ./
COPY *.js ./
RUN npm ci
COPY . .
ENV NEXT_PUBLIC_API_BASE_URL=http://fyc-api-lb.fyc:8000
RUN npm run build

FROM node:20.10-alpine AS runner
WORKDIR /fyc-web

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Create necessary runtime directories with proper permissions
RUN mkdir -p /tmp && chmod 1777 /tmp

# Copy built application from builder stage
COPY --from=builder /fyc-web/public ./public
COPY --from=builder /fyc-web/.next/standalone ./
COPY --from=builder /fyc-web/.next/static ./.next/static
COPY --from=builder /fyc-web/node_modules ./node_modules

# Set proper ownership for security
RUN chown -R nextjs:nodejs /fyc-web

# Switch to non-root user
USER nextjs

EXPOSE 3000

ENV NEXT_PUBLIC_API_BASE_URL=http://fyc-api-lb.fyc:8000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0



# Health check for Kubernetes liveness/readiness probes
#HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
#  CMD node -e "require('http').get('http://localhost:3000/', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})" || exit 1

CMD ["node", "server.js"]




