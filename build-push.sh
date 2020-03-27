#!/bin/bash

docker build . -t komakapp/backend:$1 && docker push komakapp/backend:$1