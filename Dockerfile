    FROM node:20-alpine AS builder

    WORKDIR /app
    
    COPY app/package*.json ./
    
    
    RUN npm install
    
    COPY app ./
    
    FROM node:20-alpine
    
    WORKDIR /app
    
    RUN addgroup -S nodegroup && adduser -S nodeuser -G nodegroup
    
    COPY --from=builder /app /app
    USER nodeuser
    
    EXPOSE 3000
    
    ENV NODE_ENV=production
    
    
    HEALTHCHECK --interval=30s --timeout=3s \
      CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1
    
    CMD ["node", "server.js"]