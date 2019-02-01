---
title: "mongostatusd"
date: 2018-09-14T23:20:36-06:00
draft: false
logo: /images/mongo-pulse-opencensus.jpeg
aliases: [/guides/integrations/mongodb/mongostatusd]
---

- [Introduction](#introduction)
- [Installing it](#installing-it)
- [Configuring it](#configuring-it)
- [Samples](#samples)
    - [On Prometheus](#on-prometheus)
    - [On Stackdriver Monitoring](#on-stackdriver-monitoring)
- [References](#references)

### Introduction

mongostatusd is a MongoDB server status daemon. It operates by fetching
the status of your MongoDB server installation as per [MongoDB stats](https://docs.mongodb.com/manual/reference/method/db.stats/).

It parses the returned stats and then exports them to any the stats backends below:

- Prometheus
- DataDog
- Google Stackdriver Monitoring

It reads its configurations for the toggled backends from a YAML file.

### Installing it
Installing it requires you to have [Go](https://golang.org/doc/install)

With Go installed and `go get` properly installed, you can then do

```shell
go get -u -v github.com/opencensus-integrations/mongostatusd/cmd/mongostatusd
```

and now you should be able to start it, but first please see [Configuring it](#configuring-it)

### Configuring it

It reads its configuration for the exporters as well as MongoDB server URL, in a file
saved as `config.yaml`, for example:
```yaml
metrics_report_period: 62s

stackdriver:
    project_id: census-demos
    metric_prefix: mongostatusd

mongodb_uri: mongodb://localhost:27017
mongodb_name: test

prometheus:
    port: 8787
```

### Running it
With the `config.yaml` file in the current working directory as well as the properly installed `mongostatusd`.

{{% notice tip %}}
If you are unable to install Go or if your installation fails, there are binaries attached to the releases at https://github.com/opencensus-integrations/mongostatusd/releases
{{% /notice %}}

With `mongostatusd` now downloaded/properly installed and your `config.yaml` file in the same working directory, we can now run it as

```shell
mongostatusd
```

### Samples

#### On Prometheus
* All stats
![](/images/mongostatusd-prometheus-stats.png)

* WiredTiger Cache count stats
![](/images/mongostatusd-prometheus-server_wiredtiger_cachecount.png)

* Memstats
![](/images/mongostatusd-prometheus-memstats.png)

* Server op counters
![](/images/mongostatusd-prometheus-serverop_counters.png)

#### On Stackdriver Monitoring
* All stats
![](/images/mongostatusd-sd-stats-p1.png)
![](/images/mongostatusd-sd-stats-p2.png)

* Server requests
![](/images/mongostatusd-sd-server_requests.png)

* Network
![](/images/mongostatusd-sd-network.png)

### References

Resource|URL
---|---
Mongostatusd project home|https://github.com/opencensus-integrations/mongostatusd
Mongostatusd releases and binaries|https://github.com/opencensus-integrations/mongostatusd/releases
Monitoring for MongoDB|https://docs.mongodb.com/manual/administration/monitoring/
