FROM node:20-alpine

WORKDIR /usr/src/app

# Install postgres client (for pg_isready)
RUN apk add --no-cache postgresql-client

# Copy package files
COPY package*.json ./

# Install ALL deps (nodemon optional, but safe)
RUN npm install

# Copy app
COPY . .

# Match your Express port
EXPOSE 5000

CMD ["node", "server.js"]