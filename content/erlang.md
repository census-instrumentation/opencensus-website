+++
Description = "erlang"
Tags = ["Development", "OpenCensus"]
Categories = ["Development", "OpenCensus"]
menu = "main"
type = "leftnav"

title = "Erlang"
date = "2018-05-17T15:41:51-05:00"
+++


The example demonstrates how to record stats and traces for a video processing system. It records data with the "frontend" tag so that collected data can be broken by the frontend user who initiated the video processing. Code for this example can be found under the {{< sc_code >}}examples/helloworld{{< /sc_code >}} directory of the [{{< sc_gloss1 >}}OpenCensus Erlang repo{{< /sc_gloss1 >}}](https://github.com/census-instrumentation/opencensus-erlang).  
&nbsp;  

---
  
&nbsp; 
#### API Documentation

The OpenCensus Erlang API artifact is available [{{< sc_gloss1 >}}here{{< /sc_gloss1 >}}](https://hexdocs.pm/opencensus/0.3.0/index.html).  
&nbsp;  

---
  
&nbsp; 
#### Example

**Prerequisite**  
[{{< sc_gloss1 >}}Erlang/OTP 20{{< /sc_gloss1 >}}](http://www.erlang.org/) and [{{< sc_gloss1 >}}rebar3{{< /sc_gloss1 >}}](http://www.rebar3.org/) are required.  
&nbsp;

**Using**  
Create a new Erlang application with {{< sc_code >}}rebar3 new{{< /sc_code >}} named {{< sc_code >}}helloworld{{< /sc_code >}}:

```erlang
$ rebar3 new app helloworld
===> Writing helloworld/src/helloworld_app.erl
===> Writing helloworld/src/helloworld_sup.erl
===> Writing helloworld/src/helloworld.app.src
===> Writing helloworld/rebar.config
===> Writing helloworld/.gitignore
===> Writing helloworld/LICENSE
===> Writing helloworld/README.md
$ cd helloworld
```  
&nbsp;

Add {{< sc_code >}}opencensus{{< /sc_code >}} as a dependency in {{< sc_code >}}rebar.config{{< /sc_code >}}. For development purposes it is also useful to include the {{< sc_code >}}shell{{< /sc_code >}} section of the config which tells rebar3 to boot the application and load configuration when running {{< sc_code >}}rebar3 shell{{< /sc_code >}}:  
&nbsp;

```erlang
{erl_opts, [debug_info]}.
{deps, [opencensus]}.

{shell, [{apps, [helloworld]},
	  {config, "config/sys.config"}]}.
```  
&nbsp;

```erlang
[
{opencensus, [{sampler, {oc_sampler_always, []}},
              {reporter, {oc_reporter_stdout, []}},
              {stat, [{exporters, [{oc_stat_exporter_stdout, []}]}]}
].
```  
&nbsp;  

{{< sc_code >}}opencensus{{< /sc_code >}} is a runtime dependency so it is added to the applications list in {{< sc_code >}}src/helloworld.app.src{{< /sc_code >}}, ensuring it is included and started in a release of {{< sc_code >}}helloworld{{< /sc_code >}}:  

```erlang
{application, helloworld,
 [{description, "Example OpenCensus application"},
  {vsn, "0.1.0"},
  {registered, []},
  {mod, { helloworld_app, []}},
  {applications,
   [kernel,
    stdlib,
    opencensus
   ]},
  {env,[]},
  {modules, []},

  {maintainers, []},
  {licenses, ["Apache 2.0"]},
  {links, []}
]}.
```  
&nbsp;

Building the application with {{< sc_code >}}rebar3 compile{{< /sc_code >}} will fetch the OpenCensus Erlang library and its dependencies.  
&nbsp;

When our application starts it needs to create and subscribe to the statistics that we'll record. So a call to {{< sc_code >}}subscribe_views/0{{< /sc_code >}} is added to the application start function, {{< sc_code >}}helloworld_app:start/2{{< /sc_code >}}:  

```erlang
subscribe_views() ->
    oc_stat_view:subscribe(#{name => "video_size",
                 description => "size of processed videos",
                 tags => ['frontend'],
                 measure => 'my.org/measure/video_size',
                 aggregation => default_size_distribution()}).

default_size_distribution() ->
    {oc_stat_aggregation_distribution,
     [{buckets, [0, 1 bsl 16, 1 bsl 32]}]}.
```  
&nbsp;  

The main module called to actually do the video processing is {{< sc_code >}}helloworld{{< /sc_code >}}. It creates a tag for who made the process request to include with the record statistic and creates a span for the duration of the video processing (a random sleep between 0 and 10 seconds):

```erlang
-module(helloworld).

-export([process/0]).

process() ->
   %% create a tag for who sent the request and start a child span
   Tags = oc_tags:new(#{'frontend' => "mobile-ios9.3.5"}),
   ocp:with_child_span(<<"my.org/ProcessVideo">>),

   %% sleep for 0-10 seconds to simulate processing time
   timer:sleep(timer:seconds(rand:uniform(10))),

   %% finish the span
   ocp:finish_span(),

   %% record the size of the video
   oc_stat:record(Tags, 'my.org/measure/video_size', 25648).
```  
&nbsp;  

Run the application with {{< sc_code >}}rebar3 shell{{< /sc_code >}} and see the stats and span reported to the console:  


```erlang
$ rebar3 shell
…
===> Booted opencensus
===> Booted helloworld
> helloworld:process().
ok
{span,<<“my.org/ProcessVideo”>>,1201374966367397737078249396493886473,
   10421649746227310879,undefined,1,
   {-576460748652616660,2097430124176280981},
   {-576460740651723247,2097430124176280981},
   #{},undefined,[],[],undefined,undefined,undefined}
video_size: #{rows =>
    [#{tags => #{“frontend” => “mobile-ios9.3.5”},
     value =>
      #{buckets =>
       [{0,0},{65536,1},{4294967296,0},{infinity,0}],
        count => 1,mean => 25648.0,sum => 25648}}],
   type => distribution}
```
