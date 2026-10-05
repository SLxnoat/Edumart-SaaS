FROM node:20-alpine AS build

WORKDIR /app

# Copy the root package files (workspace definition)
COPY package*.json ./
# Install all dependencies (this will populate node_modules in the correct workspace locations)
RUN npm install

# Copy the client source code
COPY . .
# Build only the client workspace
RUN npm run build --workspace client

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
