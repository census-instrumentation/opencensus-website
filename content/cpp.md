+++
title = "C++"
Description = "C++"
Tags = ["Development", "OpenCensus"]
Categories = ["Development", "OpenCensus"]
menu = "main"
type = "leftnav"
date = "2018-05-16T12:02:16-05:00"
+++

Build and run the example:  

```cpp
git clone https://github.com/census-instrumentation/opencensus-cpp.git  

cd opencensus-cpp  
bazel build //examples/helloworld:helloworld  
bazel-bin/opencensus/examples/helloworld/hello_world
```

---

#### Quickstart Example  

The example demonstrates how to record stats and traces for a video processing system. It records data with the “frontend” tag so that collected data can be broken by the frontend user who initiated the video processing.  

In this case we are using stdout exporters which we register at the beginning.

```cpp
// Register stdout exporters.
opencensus::exporters::stats::StdoutExporter::Register();
opencensus::exporters::trace::StdoutExporter::Register();
```  
  
We define a measure for video size which records the sizes in megabytes "MBy".

```cpp
// Call measure so that it is initialized.
VideoSizeMeasure();
```  

We create a view and register it with the local Stdout exporter.

``` cpp
// Create view to see the processed video size distribution broken down
// by frontend. The view has bucket boundaries (0, 256, 65536)
//that will group measure values into histogram buckets.
constopencensus::stats::ViewDescriptor video_size_view =
opencensus::stats::ViewDescriptor()
   .set_name(kVideoSizeViewName)
   .set_description("processed video size over time")
   .set_measure(kVideoSizeMeasureName)
   .set_aggregation(opencensus::stats::Aggregation::Distribution
   (opencensus::stats::BucketBoundaries::Exponential(2, 256, 256)))
   .add_column(kFrontendKey);

// Create the view.
opencensus::stats::View view(video_size_view);

// Register the view for export.
video_size_view.RegisterForExport();
``` 

Example View

```
name: "my.org/views/video_size"
measure: name: "my.org/measure/video_size"; units: "MBy";
description: "size of processed videos"; type: int64
aggregation: Distribution with Buckets:
  0,256,512,1024,2048,4096,8192,16384,32768
aggregation window: Cumulative
columns: my.org/keys/frontend
description: "processed video size over time"
video size : count: 1 mean: 25648 sum of squared deviation: 0 min: 25648 max: 25648
histogram counts: 0, 0, 0, 0, 0, 0, 0, 0, 1, 0
```

In this case the view stores a distribution. The example records 1 video size to the view, which is 25648. This shows up in the histogram, with 1 bucket having a single value in it.

```cpp
opencensus::stats::Record({{VideoSizeMeasure(), 25648}},{{kFrontendKey, "video size"}});
```

Example Span

```
Name: my.org/ProcessVideo
TraceId-SpanId-Options:
  a17625c6ed57d878092ea01fe87ded35-e9ec94e4de02fadb-01
Parent SpanId: 0000000000000000 (remote: false)
Start time: 2018-03-04T22:42:54.492839757-08:00
End time: 2018-03-04T22:42:54.500995971-08:00
Attributes: (0 dropped)
Annotations: (0 dropped)
  2018-03-04T22:42:54.492858312-08:00: Start processing video.
  2018-03-04T22:42:54.500992796-08:00: Finished processing video.
Message events: (0 dropped)
Links: (0 dropped)
Span ended: true
Status: OK
```

Span context information is displayed in hexadecimal on a single line which is the concatenation of TraceId, SpanId, and span options. Parent SpanId is displayed on the following line. In this case there is no parent (root span), so the parent id is 0. There were 2 attributes added. After work has been completed a span must be ended by the user. A span that is still active (i.e. not ended), will not be exported.

```cpp
span.AddAnnotation("Start processing video.");
...
span.AddAnnotation("Finished processing video.");
span.End();
```
