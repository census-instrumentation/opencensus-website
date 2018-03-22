---
date: "2017-10-10T11:27:27-04:00"
title: "Roadmap"
---

## Languages
<table>
<thead><br>
    <tr>
        <th scope="col">Language</th>
        <th scope="col">Tracing</th>
        <th scope="col">Stats</th>
    </tr>
</thead>
<tbody>
    <tr>
        <td data-label="Language"><a href="https://github.com/census-instrumentation/opencensus-cpp"><span class="gloss1">C++</span></a></td>
        <td data-label="Tracing">Supported</td>
        <td data-label="Stats">Supported</td>
    </tr>
    <tr>
        <td scope="row" data-label="Language"><a href="https://github.com/census-instrumentation/opencensus-erlang"><span class="gloss1">Erlang</span></a></td>
        <td data-label="Tracing">Supported</td>
        <td data-label="Stats">Supported</td>
    </tr>
    <tr>
        <td scope="row" data-label="Language"><a href="https://github.com/census-instrumentation/opencensus-go"><span class="gloss1">Go</span></a></td>
        <td data-label="Tracing">Supported</td>
        <td data-label="Stats">Supported</td>
    </tr>
    <tr>
        <td scope="row" data-label="Language"><a href="https://github.com/census-instrumentation/opencensus-java"><span class="gloss1">Java (JVM, OpenJDK, Android)</span></a></td>
        <td data-label="Tracing">Supported</td>
        <td data-label="Stats">Supported</td>
    </tr>
    <!--
    <tr>
        <td scope="row" data-label="Language">C#/.NET</td>
        <td data-label="Tracing">Planned</td>
        <td data-label="Stats">Planned</td>
    </tr>
    <tr>
        <td scope="row" data-label="Language">Node.js</td>
        <td data-label="Tracing">In Progress</td>
        <td data-label="Stats">In Progress</td>
    </tr> -->
    <tr>
        <td scope="row" data-label="Language"><a href="https://github.com/census-instrumentation/opencensus-php"><span class="gloss1">PHP</span></a></td>
        <td data-label="Tracing">Supported</td>
        <td data-label="Stats">Planned</td>
    </tr>
    <tr>
        <td scope="row" data-label="Language"><a href="https://github.com/census-instrumentation/opencensus-python"><span class="gloss1">Python</span></a></td>
        <td data-label="Tracing">Supported</td>
        <td data-label="Stats">In Progress</td>
    </tr>
    <tr>
        <td scope="row" data-label="Language"><a href="https://github.com/census-instrumentation/opencensus-ruby"><span class="gloss1">Ruby</span></a></td>
        <td data-label="Tracing">Supported</td>
        <td data-label="Stats">Planned</td>
    </tr>
    <!--
    <tr>
        <td scope="row" data-label="Language">Web JS</td>
        <td data-label="Tracing">Planned</td>
        <td data-label="Stats">Planned</td>
    </tr> -->
    </tbody>            
</table>

## Exporters

<table>
<thead><br>
    <tr>
        <th scope="col">Backend</th>
        <th scope="col">Go</th>
        <th scope="col">Java</th>
        <th scope="col">Erlang</th>
        <th scope="col">C++</th>
        <!-- <th scope="col">Node.js</th> -->
        <th scope="col">Python</th>
    </tr>
</thead>
<tbody>
    <tr>
        <td data-label="Backend">SignalFX</td>
        <td data-label="Go" class="tall">No <a href="https://github.com/census-instrumentation/opencensus-go/issues/360"><span class="gloss1">(open issue)</span></a></td>
        <td data-label="Java">Yes</td>
        <td data-label="Erlang">No</td>
        <td data-label="C++">No</td>
        <!-- <td data-label="Node.js">No</td> -->
        <td data-label="Python">No</td>
    </tr>
    <tr>
        <td data-label="Backend">Prometheus</td>
        <td data-label="Go">Yes</td>
        <td data-label="Java">Yes</td>
        <td data-label="Erlang">Yes</td>
        <td data-label="C++">No</td>
        <!-- <td data-label="Node.js">No</td> -->
        <td data-label="Python">No</td>
    </tr>
    <tr>
        <td data-label="Backend">Jaeger</td>
        <td data-label="Go">Yes</td>
        <td data-label="Java">No</span></a></td>
        <td data-label="Erlang">No</td>
        <td data-label="C++">No</td>
        <!-- <td data-label="Node.js">No</td> -->
        <td data-label="Python">No</td>
    </tr>
    <tr>
        <td data-label="Backend">Stackdriver</td>
        <td data-label="Go">Yes</td>
        <td data-label="Java">Yes</td>
        <td data-label="Erlang">Yes (trace only)</td>
        <td data-label="C++">No</td>
        <!-- <td data-label="Node.js">No</td> -->
        <td data-label="Python">Yes</td>
    </tr>
    <tr>
        <td data-label="Backend">Zipkin</td>
        <td data-label="Go">Yes</td>
        <td data-label="Java">Yes</td>
        <td data-label="Erlang">Yes</td>
        <td data-label="C++">No</td>
        <!-- <td data-label="Node.js">No</td> -->
        <td data-label="Python">No</td>
    </tr>
</tbody>
</table>

## How do I contribute?

Contributions are highly appreciated! Please see our [GitHub organization](https://github.com/census-instrumentation).