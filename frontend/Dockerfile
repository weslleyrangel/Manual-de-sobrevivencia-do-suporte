FROM node:20-alpine
WORKDIR /app
EXPOSE 5173
COPY package*.json ./
RUN npm install
# Start dev server with host mapping to expose it out of the container
CMD ["npm", "run", "dev", "--", "--host"]
