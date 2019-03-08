---
title: "Installing it"
weight: 1
aliases: [/agent/install]
date: 2019-02-11T13:42:17-08:00
---

- [Download](#download)
- [Building from source](#building-from-source)
    - [Requirements](#requirements)
    - [Building it](#building-it)
- [Testing it out](#testing-it-out)
- [References](#references)

### Download
For every release of the OpenCensus Agent "ocagent" we upload binaries/executables to:

https://github.com/census-instrumentation/opencensus-service/releases


Please download the appropriate binary for your system of the form
`ocagent_<os>` e.g. for OS X, download `ocagent_darwin`.

### Building from source
For those that would like to build from source, please follow the instructions below:

#### Requirements
At bare minimum, the OpenCensus Agent requires:

Tool|Install URL
---|---
Git|https://git-scm.com/downloads
Go 1.11 and above|https://golang.org/doc/install
GNU Make|https://www.gnu.org/software/make/
Bazaar|http://bazaar.canonical.com/en/

#### Cloning source
To clone the source, we'll git clone and get into the repository by
```shell
git clone https://github.com/census-instrumentation/opencensus-service.git && cd opencensus-service
```

#### Building it
```shell
make agent
```
which will place the binary in the `bin` folder in your current working directory

### Testing it out
We can test ocagent out by running the `version` subcommand.

For example, on my machine:
```shell
$ ./bin/ocagent_darwin version
Version      latest
GitHash      85ab293
Goversion    devel +c75ee696c3 Tue Feb 12 21:22:09 2019 +0000
OS           darwin
Architecture amd64
```

### References

Resource|URL
---|---
OpenCensus Service on Github|[Github repository](https://github.com/census-instrumentation/opencensus-service)
OpenCensus Service releases|https://github.com/census-instrumentation/opencensus-service/releases
