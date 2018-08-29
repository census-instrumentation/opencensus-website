---
title: "PyMemache"
date: 2018-08-24T01:00:08-07:00
draft: false
aliases: [/integrations/memcached/python]
logo: /img/memcached-python.png
---

- [Introduction](#introduction)
- [Features](#features)
- [Using it](#using-it)
    - [Git clone it](#git-clone-it)
    - [Build it](#build-it)
- [Problem statement](#problem-statement)
- [Enabling OpenCensus](#enabling-opencensus)
    - [Enabling tracing](#enabling-tracing)
- [End to end example](#end-to-end-example)
- [Examining your traces](#enabling-your-traces)
- [References](#references)

## Introduction
[Memcached](https://memcached.org) is one of the most used server caching and scaling technologies.

It was created by [Brad Fitzpatrick](https://en.wikipedia.org/wiki/Brad_Fitzpatrick) in 2003 as a
solution to scale his social media product [Live Journal](https://www.livejournal.com/)

Pinterest's Python [PyMemcache](https://github.com/pinterest/pymemcache) client has been forked and [instrumented with OpenCensus tracing](https://github.com/opencensus-integrations/pymemcache)

## Features
Trace instrumentation of all the methods

## Using it
To get started with using it, firstly we'll need to git clone the [trace instrumented fork](https://github.com/opencensus-integrations/pymemcache)

### Git clone it
```shell
git clone https://github.com/opencensus-integrations/pymemcache
```

### Build it
Change directory to the newly forked pymemcache repository and in there run
```shell
python setup.py install
```

and then use it normally like you would have used the original package!

However, for a guided example,  please continue reading below.

## Problem statement

Our sample is an application excerpt from a distributed prime factorization engine that needs to calculate square roots of big numbers but would
like to reuse expensively calculated results since square roots of such numbers are CPU intensive.

To share/memoize results amongst our distributed applications, we’ll use Memcache.
However, to examine our changes in a distributed systems deployment with numerous microservices, it is useful to have tracing to verify our optimizations
and inspect the state of the system.

This is what the code original looks like

{{% notice tip %}}
For assistance installing Memcached, please visit the [Memcached Installation wiki](https://github.com/memcached/memcached/wiki/Install)
{{% /notice %}}

Please run your Memcached server, for this example we'll run it locally on port 11211.

{{<highlight python>}}
#!/usr/bin/env python

import math
import os

from pymemcache.client.base import Client as MemcacheClient

def numAsStr(num): return '%f'%(num)

def main():
    mc = MemcacheClient(("localhost", 11211,))

    values = [
        9999999183838328567567689828757567669797060958585737272727311111199911188888889953113,
        9082782799999992727727272727272727272727272727838383285677272727399917272728373799422229,
        987773333733799999999475786161616373683838328567727272739991727272837378888888881322229,
        99999999999999999999998899919191919191919192828727737368383832856772727273999172727283737671626262269222848,
        991818178171928287277373683838328567727272739991727272837377827272727272727272727711119,
    ]

    for value in values:
        for i in range(0, 2):
            sqrt = calculateSQRT(mc, value)
            print("%-100.10f ==> %-100.10f"%(value, sqrt))

        # Afterwards, clean up to ensure repeatability of the test
        mc.delete(numAsStr(value))

def calculateSQRT(mc, num):
    # Firstly check if we've cached it
    numStr = numAsStr(num)
    res = mc.get(numStr)
    if res is not None:
        try: # Try parsing it as a float
            return float(res)
        except ValueError:
            # Failed to parse it
            _ = 0

    # Otherwise this was a cache miss, so go on
    sqrt = math.sqrt(num)

    sqrtStr = numAsStr(sqrt)
    # Now cache it for a cache hit later on
    mc.set(numStr, sqrtStr)
    return sqrt

if __name__ == '__main__':
    main()
{{</highlight>}}

## Enabling OpenCensus
To provide observability, we'll enable tracing by importing OpenCensus Python's tracing package

{{<highlight python>}}
from opencensus.trace.tracer import Tracer

# For demo purposes, we'll always sample
from opencensus.trace.samplers import always_on

tracer = Tracer(sampler=always_on.AlwaysSampler())
{{</highlight>}}

### Enabling tracing
Enabling any of the [Python OpenCensus trace exporters](/guides/exporters/supported-exporters/python/)

For this example, we'll use Stackdriver Tracing and then create a Tracer.

With Memcached now installed and running, we'll use Stackdriver Tracing

{{% notice tip %}}
For assistance setting up Stackdriver, please visit this [Stackdriver setup guided codelab](/codelabs/stackdriver)
{{% /notice %}}

{{<highlight python>}}
from opencensus.trace.exporters import stackdriver_exporter
from opencensus.trace.exporters.transports.background_thread import BackgroundThreadTransport
{{</highlight>}}

## End to end example

{{<highlight python>}}
#!/usr/bin/env python

import math
import os

from pymemcache.client.base import Client as MemcacheClient

# Observability from OpenCensus
from opencensus.trace.samplers import always_on
from opencensus.trace.tracer import Tracer
from opencensus.trace.exporters import stackdriver_exporter
from opencensus.trace.exporters.transports.background_thread import BackgroundThreadTransport

def numAsStr(num): return '%f'%(num)

def main():
    exporter = stackdriver_exporter.StackdriverExporter(
            project_id=os.environ.get('PROJECT_ID', 'census-demos'),
            transport=BackgroundThreadTransport)

    tracer = Tracer(sampler=always_on.AlwaysOnSampler(), exporter=exporter)
    mc = MemcacheClient(("localhost", 11211,))

    with tracer.span(name='MemcachePythonUsage'):
        doWork(tracer, mc)

def doWork(tracer, mc):
    values = [
        9999999183838328567567689828757567669797060958585737272727311111199911188888889953113,
        9082782799999992727727272727272727272727272727838383285677272727399917272728373799422229,
        987773333733799999999475786161616373683838328567727272739991727272837378888888881322229,
        99999999999999999999998899919191919191919192828727737368383832856772727273999172727283737671626262269222848,
        991818178171928287277373683838328567727272739991727272837377827272727272727272727711119,
    ]

    for value in values:
        with tracer.span(name='CalculateSquareRoot-%d'%(value)):
            for i in range(0, 2):
                with tracer.span(name='Round-%d'%(i+1)) as span:
                    sqrt = calculateSQRT(mc, value)
                    print("%-100.10f ==> %-100.10f"%(value, sqrt))

            # Afterwards, clean up to ensure repeatability of the test
            mc.delete(numAsStr(value))

def calculateSQRT(mc, num):
    # Firstly check if we've cached it
    numStr = numAsStr(num)
    res = mc.get(numStr)
    if res is not None:
        try: # Try parsing it as a float
            return float(res)
        except ValueError:
            # Failed to parse it
            _ = 0

    # Otherwise this was a cache miss, so go on
    sqrt = math.sqrt(num)

    sqrtStr = numAsStr(sqrt)
    # Now cache it for a cache hit later on
    mc.set(numStr, sqrtStr)
    return sqrt

if __name__ == '__main__':
    main()
{{</highlight>}}

We'll then run the code by `python main.py` which will produce output such as
```shell
9999999183838328830477549585914919136257122817306613949097784006693497575493559386112.0000000000     ==> 3162277531121885532860585114766575939878912.0000000000                                              
9999999183838328830477549585914919136257122817306613949097784006693497575493559386112.0000000000     ==> 3162277531121885532860585114766575939878912.0000000000                                              
9082782799999992571273946221330069928133619983609556332968382885487451489900307089981440.0000000000  ==> 95303634768040146909822412874821250270101504.0000000000                                             
9082782799999992571273946221330069928133619983609556332968382885487451489900307089981440.0000000000  ==> 95303634768040146909822412874821250270101504.0000000000                                             
987773333733800031722651862358926786090489695103100157824970637048114282057670804373504.0000000000   ==> 31428861476894133536071865177459482504986624.0000000000                                             
987773333733800031722651862358926786090489695103100157824970637048114282057670804373504.0000000000   ==> 31428861476894133536071865177459482504986624.0000000000                                             
99999999999999996881384047029926983435371269061279689406644211752791525136670645395254002395395884805259264.0000000000 ==> 316227766016837944250003086594998818305721102128644096.0000000000                                   
99999999999999996881384047029926983435371269061279689406644211752791525136670645395254002395395884805259264.0000000000 ==> 316227766016837944250003086594998818305721102128644096.0000000000                                   
991818178171928327889547990399264675836644805154307643454461449383681749517143654793216.0000000000   ==> 31493144939366222011734031026709120927399936.0000000000                                             
991818178171928327889547990399264675836644805154307643454461449383681749517143654793216.0000000000   ==> 31493144939366222011734031026709120927399936.0000000000                                             
Sending all pending spans before terminated.
```

## Examining your traces

Please visit https://console.cloud.google.com/traces

Opening our console will produce something like

![All traces](/img/memcache-tracing-python-all_traces.png)

and for the details of a single trace
![Single trace detail](/img/memcache-tracing-python-trace_detail.png)

## References

Resource|URL
---|---
Memcached|https://memcached.org/
OpenCensus Python on Github|https://github.com/census-instrumentation/opencensus-python
Traced PyMemcache on Github|https://github.com/opencensus-integrations/pymemcache
