+++
Description = "java"
Tags = ["Development", "OpenCensus"]
Categories = ["Development", "OpenCensus"]
menu = "main"
type = "leftnav"
title = "Java"
date = "2018-05-18T09:59:40-05:00"
+++

The example demonstrates how to record stats and traces for a video processing system. It records data with the “frontend” tag so that collected data can be broken by the frontend user who initiated the video processing.  

---

#### API Documentation

The OpenCensus Java artifacts are released to Maven Central [maven.org](http://search.maven.org/), each contains the jar file, the associated javadoc, and the associated source code. The OpenCensus Java API artifact (along with the associated javadoc and source) is available on Maven Central here: [Open Census API](https://search.maven.org/#search%7Cga%7C1%7Copencensus%20api)  

---

#### Example

1. Clone the OpenCensus Java GitHub repository:
``` java
git clone https://github.com/census-instrumentation/opencensus-java.git
cd opencensus-java/examples
```

2. Code is in the following directory:
```
src/main/java/io/opencensus/examples/helloworld/
```  

---

#### To Build/Run The Example
Further build instructions can be found in [examples/README.md](https://github.com/census-instrumentation/opencensus-java/blob/master/examples/README.md).

The OpenCensus Java Quickstart example can be built/executed using either gradle, maven, or bazel:  

3. Build the example code e.g.: (assuming current directory is opencensus/examples/)
    * Gradle: ./gradlew installDist
    * Maven: mvn package appassembler:assemble
    * Bazel: bazel build :all  

4. Run the Quickstart example e.g.: (assuming current directory is opencensus/examples/)
	* Gradle: ./build/install/opencensus-examples/bin/QuickStart
	* Maven: ./target/appassembler/bin/QuickStart
	* Bazel: ./bazel-bin/QuickStart  

---

#### The Example Code
``` java
/** Simple program that collects data for video size. **/
public final class QuickStart {
  static Logger logger = Logger.getLogger(
  QuickStart.class.getName());
  static Tagger tagger = Tags.getTagger();
  static ViewManager viewManager = Stats.getViewManager();
  static StatsRecorder statsRecorder = Stats.getStatsRecorder();
  static Tracer tracer = Tracing.getTracer();  
  
  // frontendKey allows us to break down the recorded data
  static final TagKey FRONTEND_KEY = TagKey.create(
  "my.org/keys/frontend");  
  
  // videoSize will measure the size of processed videos.
  static final MeasureLong VIDEO_SIZE = MeasureLong.create(
  "my.org/measure/video_size",
  "size of processed videos",
  "MBy");  
  
  // Create view to see the processed video size distribution broken
  // down by frontend. The view has bucket boundaries (0, 256, 65536)
  // that will group measure values into histogram buckets.
  private static final View.Name VIDEO_SIZE_VIEW_NAME =
  View.Name.create("my.org/views/video_size");
  private static final View VIDEO_SIZE_VIEW = View.create(
  VIDEO_SIZE_VIEW_NAME,
  "processed video size over time",
  VIDEO_SIZE,
  Aggregation.Distribution.create(
   BucketBoundaries.create(Arrays.asList(0.0, 256.0, 65536.0))),
  Collections.singletonList(FRONTEND_KEY),
  Cumulative.create());

  /** Main launcher for the QuickStart example. */
  public static void main(String[] args) throws
  InterruptedException {
  TagContextBuilder tagContextBuilder = tagger.currentBuilder()
   .put(FRONTEND_KEY, TagValue.create("mobile-ios9.3.5"));
  SpanBuilder spanBuilder = tracer.spanBuilder(
   "my.org/ProcessVideo")
   .setRecordEvents(true)
   .setSampler(Samplers.alwaysSample());
  viewManager.registerView(VIDEO_SIZE_VIEW);
  LoggingTraceExporter.register();

  // Process video. Record the processed video size.
  try (Scope scopedTags = tagContextBuilder.buildScoped();
   Scope scopedSpan = spanBuilder.startScopedSpan()) {
    tracer.getCurrentSpan()
    .addAnnotation("Start processing video.");
   // Sleep for [0,10] milliseconds to fake work.
   Thread.sleep(new Random().nextInt(10) + 1);
   statsRecorder.newMeasureMap().put(VIDEO_SIZE, 25648).record();
   tracer.getCurrentSpan()
    .addAnnotation("Finished processing video.");
  } catch (Exception e) {
    tracer.getCurrentSpan()
     .addAnnotation("Exception thrown when processing video.");
    tracer.getCurrentSpan().setStatus(Status.UNKNOWN);
    logger.severe(e.getMessage());
  }

  logger.info("Wait longer than the reporting duration...");
  // Wait for a duration longer than reporting duration (5s) to
  // ensure spans are exported.
  Thread.sleep(5100);
  ViewData viewData = viewManager.getView(VIDEO_SIZE_VIEW_NAME);
  logger.info(
   String.format("Recorded stats for %s:\n %s",
    VIDEO_SIZE_VIEW_NAME.asString(), viewData));
 }
}
```  

---
  
#### The Example Output (Raw)
```
Mar 02, 2018 6:38:26 PM io.opencensus.examples.helloworld.QuickStart main
INFO: Wait longer than the reporting duration...
Mar 02, 2018 6:38:31 PM
io.opencensus.exporter.trace.logging.LoggingTraceExporter
 $LoggingExporterHandler export
INFO:
SpanData{context=SpanContext{traceId=TraceId{traceId=
 6490d4a26cffac83529a7679a0ef978b}, spanId=SpanId{spanId=2e1f17c65921d367}, traceOptions=TraceOptions{sampled=true}}, parentSpanId=null, hasRemoteParent=null, name=my.org/ProcessVideo, startTimestamp=Timestamp{seconds=1520044706, nanos=41005486}, attributes=Attributes{attributeMap={}, droppedAttributesCount=0}, annotations=TimedEvents{events=[TimedEvent{timestamp=Timestamp{seconds=1520044706, nanos=44080800}, event=Annotation{description=Start processing video., attributes={}}}, TimedEvent{timestamp=Timestamp{seconds=1520044706, nanos=53061607}, event=Annotation{description=Finished processing video., attributes={}}}], droppedEventsCount=0}, messageEvents=TimedEvents{events=[], droppedEventsCount=0}, links=Links{links=[], droppedLinksCount=0}, childSpanCount=null, status=Status{canonicalCode=OK, description=null}, endTimestamp=Timestamp{seconds=1520044706, nanos=54084898}}

Mar 02, 2018 6:38:31 PM
io.opencensus.examples.helloworld.QuickStart main INFO:
Recorded stats for my.org/views/video_size: ViewData{view=View{name=Name{asString=my.org/views/video_size}, description=processed video size over time, measure=MeasureLong{name=my.org/measure/video_size, description=size of processed videos, unit=MBy}, aggregation=Distribution{bucketBoundaries=BucketBoundaries{boundaries=[0.0, 256.0, 65536.0]}}, columns=[TagKey{name=my.org/keys/frontend}], window=Cumulative{}}, aggregationMap={[TagValue{asString=mobile-ios9.3.5}]=DistributionData{mean=25648.0, count=1, min=25648.0, max=25648.0, sumOfSquaredDeviations=0.0, bucketCounts=[0, 0, 1, 0]}}, windowData=CumulativeData{start=Timestamp{seconds=1520044706, nanos=28000000}, end=Timestamp{seconds=1520044711, nanos=170000000}}}
```
