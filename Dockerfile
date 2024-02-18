FROM node:16-alpine
RUN apk --no-cache add git
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY package.json /usr/src/app/
RUN npm install
COPY . /usr/src/app
EXPOSE 7001
CMD npx egg-scripts start --title=egg-server-z-cli-api --sticky