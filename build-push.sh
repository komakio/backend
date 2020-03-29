#!/bin/bash

docker build . -t komakio/backend:$1 && docker push komakio/backend:$1