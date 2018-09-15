---
title: "Go driver"
date: 2018-09-14T23:20:36-06:00
draft: false
logo: /images/mongodb-go.png
---

- [Introduction](#introduction)
    - [Metrics](#metrics)
- [Installing it](#installing-it)
    - [Already installed MongoDB Go](#already-installed-mongodb-go)
    - [Freshly installing](#freshly-installing)
- [Using it](#using-it)
    - [Enabling metrics](#enabling-metrics)
    - [Enabling exporters](#enabling-exporters)
- [References](#references)

### Introduction

The [new MongoDB Go driver](https://github.com/mongodb/mongo-go-driver) has been instrumented with OpenCensus for Tracing and metrics at [https://github.com/opencensus-integrations/mongo-go-driver](https://github.com/opencensus-integrations/mongo-go-driver)

We have spoken to MongoDB about merging these changes upstream into their driver but for now that's stalled
due to the rapid pace of development on their new driver, but also pending an evaluation by their Go driver team.

The OpenCensus instrumented driver is API compatible with the upstream MongoDB Go driver

#### Metrics
The added metrics include

Metric name|Search suffix|Unit
---|---|---
Errors|mongo/client/errors|"1"
Calls|mongo/client/calls|"1"
Bytes written|mongo/client/bytes_written|"By"
Bytes read|mongo/client/bytes_read|"By"
Deletions|mongo/client/deletions|"1"
Insertions|mongo/client/insertions|"1"
Reads|mongo/client/reads|"1"
Updates|mongo/client/updates|"1"
Replaces|mongo/client/replaces|"1"
Writes|mongo/client/writes|"1"
New connections|mongo/client/connections_new|"1"
Reused connections|mongo/client/connections_reused|"1"
Closed connections|mongo/client/connections_closed|"1"
Connection latency|mongo/client/connection_latency|"ms"
Roundtrip latency|mongo/client/roundtrip_latency|"ms"

For now here is how you can install it

### Installing it

For any of these steps, we'll assume you already have and are using [Git](https://git-scm.com/)

#### Already installed MongoDB Go

If you already have the upstream MongoDB Go driver installed, you'll need to change directories into your driver installation
```shell
cd $(go env GOPATH)/src/github.com/mongodb/mongo-go-driver
```

Next we'll have to add the instrumented version's Git repository URL

```shell
git remote add opencensus-instrumented https://github.com/opencensus-integrations/mongo-go-driver.git
```

And finally check it out to a branch
```shell
git fetch opencensus-instrumented && git checkout -b oc-instrumented opencensus-instrumented/master
```

#### Freshly installing
```shell
git clone git@github.com:opencensus-integrations/mongo-go-driver.git $GOPATH/src/github.com/mongodb/mongo-go-driver
```

### Using it

The only updates to make to your code are when initializing OpenCensus in your main function, like you would for any new
OpenCensus instrumentation

#### Enabling metrics
```go
import (
	"log"
)

if err := view.Register(mongo.AllViews...); err != nil {
	log.Fatalf("Failed to register MongoDB views: %v", err)
}
```

#### Enabling exporters

Please select your target Go trace and metrics exporters from [Go exporters](/guides/exporters/supported-exporters/go/)

### Screenshots

### References

Resource|URL
---|---
OpenCensus instrumented MongoDB Go driver|https://github.com/opencensus-integrations/mongo-go-driver
Sample end-to-end instrumented app|https://github.com/orijtech/media-search

