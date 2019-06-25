FROM node:10.0 AS node
WORKDIR /app
COPY ./package.json /app
RUN yarn
COPY . /app
EXPOSE 8096
CMD ["npm", "start"]