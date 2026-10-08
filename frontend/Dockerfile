# ---- build ----
FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# The source calls http://localhost:5000/api/... ; make every call relative (/api/...)
# so nginx can proxy it to the backend container, on any machine.
RUN grep -rl "http://localhost:5000" src | xargs sed -i 's#http://localhost:5000##g'
RUN npm run build

# ---- serve ----
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
