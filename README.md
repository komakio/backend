# Welcome to Komak’s open-source repository 🙏

[![codecov](https://codecov.io/gh/komakio/backend/branch/master/graph/badge.svg)](https://codecov.io/gh/komakio/backend)
[![slackin](https://slack.komak.io/badge.svg)](https://slack.komak.io)

![Type checking](https://github.com/komakio/backend/workflows/Type%20checking/badge.svg)
![Tests](https://github.com/komakio/backend/workflows/Tests/badge.svg)
![Lint](https://github.com/komakio/backend/workflows/Lint/badge.svg)


## What is Komak?

Komak is an app born out of necessity in the wake of the COVID-19 events. There are people in our community more susceptible or already exposed to the effects of the virus than others. The goal of Komak is to provide a digital platform for healthy volunteers to help out those most in need. 

Komak uses geolocation services to send requests for help with groceries, for example, to nearby volunteers that are willing to help out.

Komak is meant to be open-source, as we need all of the help we can get in this hopefully short-lived endeavor. 

## Description

This repo is the backend for Komak project (https://github.com/komakio).

### Technologies implemented:

-   [NestJs-typescript](https://docs.nestjs.com/)
-   [mongoDB](https://www.mongodb.com/)
-   [RabbitMQ](https://www.rabbitmq.com/)
-   [Jest](https://jestjs.io/)
-   [Swagger](https://swagger.io/)
-   [Docker](https://www.docker.com/)

## Prerequisites

-   [Node.js](https://nodejs.org/) (>= 10.8.0)
-   [npm](https://www.npmjs.com/) (>= 6.5.0)

## Installation

```bash
$ npm install
```

## Running the app

```bash
# containers
$ docker-compose up -d

# watch mode on port 3100
$ npm run start:dev

# queue jobs
$ npm run dev:jobs
```

## Test

```bash
# e2e tests
$ npm run test
```

## Other commands

```bash
# formatting code
$ npm run format

# run linter
$ npm run lint

# run typescript compiler
$ npm run tsc
```

## Swagger API docs

This project uses the Nest swagger module for API documentation. [NestJS Swagger](https://github.com/nestjs/swagger) - [www.swagger.io](https://swagger.io/)  
Swagger docs will be available at localhost:3100/docs


We can use all the help we can get. Please send an email and any relevant work you’ve done to komak.contact@gmail.com. 
[Join our open Slack community](https://join.slack.com/t/komak/shared_invite/zt-cv316nyt-JW4Py2oCcxvUfesp7YCqIg).
