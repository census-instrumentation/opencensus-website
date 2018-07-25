author:            Emmanuel Odeke and Henry Ventura
summary:           Setup and configure Google Stackdriver
environments:      Web
id:                stackdriver

# Setup and Configure Google Stackdriver

## Overview of the tutorial
Duration: 0:01

This tutorial shows you how to setup and configure Google Stackdriver Tracing and Metrics.

Requirements:

* A cloud provider based project; it should support Stackdriver Monitoring and Tracing — we’ll use Google Cloud Platform for this example

## Create a Project on Google Cloud
Duration: 0:02

If you haven't already created a project on Google Cloud, [you can do so here](https://console.cloud.google.com/projectcreate).

## Enable the Stackdriver APIs
Duration: 0:05

You will be enabling these two APIs:

* Stackdriver Monitoring API
* Stackdriver Trace API

[Enable APIs](https://console.cloud.google.com/apis/library?q=stackdriver)

![img](https://cdn-images-1.medium.com/max/2000/1*aLEDq5bHmV5u6WJzDRiF7w.png)
![img](https://cdn-images-1.medium.com/max/1600/1*8K5fzp8T1RQ9YC5PnRUn4Q.png)

## Enable Application Default Credentials
Duration: 0:02

Please make sure to enable Application Default Credentials for authentication. [Click here](https://developers.google.com/identity/protocols/application-default-credentials) to do so.
