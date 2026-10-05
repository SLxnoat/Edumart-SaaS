FROM node:20-alpine AS build

WORKDIR /app

# Copy the entire project
COPY . .
# Install all dependencies (this will populate the root node_modules)
RUN npm install

# Change to client directory and build
WORKDIR /app/client
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
