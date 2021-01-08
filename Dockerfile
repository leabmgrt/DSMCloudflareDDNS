FROM node:14.14.0-alpine
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
ENV PORT=8080
EXPOSE 8080
CMD ["npm", "start"]