FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
COPY node_modules ./node_modules
COPY . .
RUN addgroup -g 1001 -S nodejs && adduser -S connectmail -u 1001
USER connectmail
EXPOSE 6000
CMD ["npm", "start"]
