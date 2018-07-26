author:            Emmanuel Odeke and Henry Ventura
summary:           Setup and configure Jaeger
environments:      Web
id:                jaeger

# Setup and Configure Jaeger

## Overview of the tutorial
Duration: 0:05

This tutorial shows you how to setup and configure Jaeger

![](https://www.jaegertracing.io/img/jaeger-logo.png)

Jaeger, inspired by Dapper and OpenZipkin, is a distributed tracing system released as open source by Uber Technologies. It is used for monitoring and troubleshooting microservices-based distributed systems, including:

Distributed context propagation
Distributed transaction monitoring
Root cause analysis
Service dependency analysis
Performance / latency optimization

Requirements:

* Docker, if you don't already have it, you can learn [How to install Docker](https://docs.docker.com/install/)

## Downloading the Jaeger Docker image
Duration: 0:01

We'll get the Jaeger Docker image from https://hub.docker.com/u/jaegertracing/

by

```
docker pull jaegertracing/all-in-one:latest
```

## Starting Jaeger
Duration: 0.01

```
docker run -d --name jaeger \
  -e COLLECTOR_ZIPKIN_HTTP_PORT=9411 \
  -p 5775:5775/udp \
  -p 6831:6831/udp \
  -p 6832:6832/udp \
  -p 5778:5778 \
  -p 16686:16686 \
  -p 14268:14268 \
  -p 9411:9411 \
  jaegertracing/all-in-one:latest
```

and now the Jaeger user interface can be opened in your web browser by visiting [http://localhost:16686](http://localhost:16686/)
