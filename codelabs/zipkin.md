author:            Emmanuel Odeke and Henry Ventura
summary:           Setup and configure Zipkin
environments:      Web
id:                zipkin

# Setup and Configure Zipkin

## Overview of the tutorial
Duration: 0:05

This tutorial shows you how to setup and configure Zipkin

![](https://zipkin.io/public/img/zipkin-logo-200x119.jpg)

Zipkin is a distributed tracing system. It helps gather timing data needed to troubleshoot latency problems in microservice architectures.

It manages both the collection and lookup of this data. Zipkin’s design is based on the Google Dapper paper.

Requirements:

* Docker, if you don't already have it, you can learn [How to install Docker](https://docs.docker.com/install/)

## Downloading the Zipkin Docker image
Duration: 0:01

We'll get the Zipkin Docker image from https://hub.docker.com/u/openzipkin/

by

```
docker pull openzipkin/zipkin
```

## Starting Zipkin
Duration: 0.01

```
docker run -d -p 9411:9411 openzipkin/zipkin
```

and now the Zipkin user interface can be opened in your web browser by visiting [http://localhost:9411](http://localhost:9411/)
