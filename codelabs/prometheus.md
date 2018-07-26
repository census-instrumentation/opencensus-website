author:            Emmanuel Odeke and Henry Ventura
summary:           Setup and configure Prometheus
environments:      Web
id:                prometheus

# Setup and Configure Prometheus

## Overview of the tutorial
Duration: 0:01

This tutorial shows you how to setup and configure Prometheus

![](https://upload.wikimedia.org/wikipedia/en/thumb/3/38/Prometheus_software_logo.svg/115px-Prometheus_software_logo.svg.png)

Prometheus is a monitoring system that collects metrics from systems, by scraping exposed endpoints at
a regular interval. It evaluates rule expressions and displays results. It can also trigger alerts if
alert conditions are met.

Requirements:

* An installation of Prometheus which you can get from here [Install Prometheus](https://prometheus.io/docs/introduction/first_steps/)

## Configure Prometheus
Duration: 0:02

Prometheus Monitoring requires a system configuration usually in the form a ".yaml" file. For example, here is
a sample "prometheus.yaml" file to scrape from our servers running at `localhost:9888`, `localhost:9988` and `localhost:9989`

```
global:
  scrape_interval: 10s

  external_labels:
    monitor: 'media_search' 

scrape_configs:
  - job_name: 'media_search'

    scrape_interval: 10s

    static_configs:
      - targets: ['localhost:9888', 'localhost:9988', 'localhost:9989']
```

## Starting Prometheus
Duration: 0.05

Having successfully downloaded Prometheus and setup your config.yaml file, you should now be able to run
```shell
prometheus --config.file=prometheus.yaml
```

## Viewing Prometheus output
Duration: 0.01

You should now be able to navigate to [http://localhost:9090/](http://localhost:9090/)
