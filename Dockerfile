FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build
# The Node adapter's standalone build doesn't bundle every dependency (e.g.
# `devalue`, used for Astro's session/actions serialization, stays an
# external import) — prune to production-only deps and ship node_modules
# alongside dist, or the run stage 404s/crash-loops on ERR_MODULE_NOT_FOUND.
RUN npm prune --omit=dev

FROM node:22-alpine AS run
WORKDIR /app
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4321
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
EXPOSE 4321
CMD ["node", "./dist/server/entry.mjs"]
