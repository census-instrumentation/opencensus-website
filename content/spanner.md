+++
Description = "spanner"
Tags = ["Development", "OpenCensus"]
Categories = ["Development", "OpenCensus"]
menu = "main"

title = "Spanner"
date = "2018-05-30T16:50:51-05:00"
+++

{{% sc_spanner %}}

#### Instrumented by OpenCensus and exported to Stackdriver
&nbsp;  

In this post, we’ll explore the power of OpenCensus’ exporters, using the Google Cloud Spanner package for both the Go and Java programming languages.  
&nbsp;  
                    
The Cloud Spanner package has already been instrumented using OpenCensus. Our mission is to add a few lines to already running code to harness this instrumentation, to extract metrics and traces. We’ll then export them to Stackdriver for recording, root cause analyses, visualization and other analyses — a typical task that Application Performance Management teams would perform.  
&nbsp;  

The example is an excerpt of a microservice from a fictional athletics startup, ZeuSports. It is their database microservice(dBmus). dBmus is in charge of adding newly subscribed players to the app. In this demo we’ll visualize some metrics and traces, to see how long Cloud Spanner calls take thus harnessing the power of the instrumentation already in the Cloud Spanner package, leveraged by the respective exporters.  
&nbsp;  

---
&nbsp;  

__Requirements__  
&nbsp;  

{{% sc_ulist %}}Go1.8 and greater, or Java SE 7 and greater{{% /sc_ulist %}}
{{% sc_ulist %}}A cloud provider based project; it should support Stackdriver Monitoring and Tracing — we’ll use Google Cloud Platform for this example{{% /sc_ulist %}}
{{% sc_ulist %}}Enable Stackdriver Monitoring and Tracing on the project{{% /sc_ulist %}}
&nbsp;  

---
&nbsp;  

__Step 1: Enable the Stackdriver APIs__  
&nbsp;  

Assuming you have an account on a cloud provider that supports Stackdriver Monitoring and Tracing; for this example we’ll use Google Cloud Platform. Let’s go ahead and firstly search for, then enable the APIs on our project, if they are not yet enabled.  
&nbsp;  

{{% sc_spanner2 %}}
![search for stackdriver APIs](https://cdn-images-1.medium.com/max/800/1*hirr5OnW9Ta6e8HDPA-vpA.png)
{{% sc_center %}}search for stackdriver APIs{{% /sc_center %}}
{{% /sc_spanner %}}

{{% sc_spanner2 %}}
![Enable Stackdriver Monitoring API](https://cdn-images-1.medium.com/max/800/1*dFRIVQVEhz0AN127dzzoUA.png)
{{% sc_center %}}Enable Stackdriver Monitoring API{{% /sc_center %}}
{{% /sc_spanner %}}

{{% sc_spanner2 %}}
![Stackdriver Monitoring API enabled](https://cdn-images-1.medium.com/max/800/1*8R7AXsSbLkajTaKBAiEWhQ.png)
{{% sc_center %}}Stackdriver Monitoring API enabled{{% /sc_center %}}
{{% /sc_spanner %}}

{{% sc_spanner2 %}}
![Enable Stackdriver Trace API](https://cdn-images-1.medium.com/max/800/1*aLEDq5bHmV5u6WJzDRiF7w.png)
{{% sc_center %}}Enable Stackdriver Trace API{{% /sc_center %}}
{{% /sc_spanner %}}

{{% sc_spanner2 %}}
![Stackdriver Trace API enabled](https://cdn-images-1.medium.com/max/800/1*8K5fzp8T1RQ9YC5PnRUn4Q.png)
{{% sc_center %}}Stackdriver Trace API enabled{{% /sc_center %}}
{{% /sc_spanner %}}

---
&nbsp;  

__Step 2a: Operational details__  
&nbsp;  

Our microservice receives new players’ information and adds them to a Cloud Spanner table “players” where the schema looks like this  
&nbsp;  

{{% sc_spanner2 %}}![Players table schema](https://cdn-images-1.medium.com/max/800/1*Q6_lk7pd7K0zNmYYIJwCUw.png)
{{% sc_center %}}Players table schema{{% /sc_center %}}{{% /sc_spanner2 %}}  

__Step 2b: Method of attack:__  
&nbsp;  

In order for the instrumented Cloud Spanner package to export traces and metrics to Stackdriver, we need to:  
&nbsp;  

{{% sc_indent %}} a) Create an OpenCensus Stackdriver Monitoring/Stats exporter instance{{% /sc_indent %}}

{{% sc_indent %}} b) Create an OpenCensus Stackdriver Trace exporter instance{{% /sc_indent %}}

{{% sc_indent %}} c) Create the Cloud Spanner client{{% /sc_indent %}}

{{% sc_indent %}} d) Enable a trace sampler to capture a percentage of traces. Please note that for this demo we are always sampling and that is very high. More realistically perhaps tracing 1 in 10,000 might be suffice{{% /sc_indent %}}

{{% sc_indent %}} e) Subscribe to the respective gRPC metrics that we would like to track, in this case we’ll subscribe to: RoundTrip latency, Per-Minute Error count, Number of requests{{% /sc_indent %}}  
<hr >
<br />
<br />

__Step 3: Show me the code:__  
&nbsp;  

The Go code:  

```
package main

import (
	"fmt"
	"log"
	"time"

	"cloud.google.com/go/spanner"
	"golang.org/x/net/context"

	"go.opencensus.io/exporter/stackdriver"
	"go.opencensus.io/plugin/ocgrpc"
	"go.opencensus.io/stats/view"
	"go.opencensus.io/trace"
)

type Player struct {
	FirstName string `spanner:"first_name"`
	LastName  string `spanner:"last_name"`
	UUID      string `spanner:"uuid"`
	Email     string `spanner:"email"`
}

func main() {
	projectID := "census-demos"
	se, err := stackdriver.NewExporter(stackdriver.Options{ProjectID: projectID})
	if err != nil {
		log.Fatalf("StatsExporter err: %v", err)
	}
	// Let's ensure that data is uploaded before the program exits
	defer se.Flush()

	// Enable tracing on the exporter
	trace.RegisterExporter(se)

	// Enable metrics collection
	view.RegisterExporter(se)

	// Views that we are interested in
	views := []*view.View{
		ocgrpc.ClientErrorCountView,
		ocgrpc.ClientRoundTripLatencyView,
		ocgrpc.ClientRequestBytesView,
	}

	for i, v := range views {
		if err := v.Subscribe(); err != nil {
			log.Printf("Views.Subscribe (#%d) err: %v", i, err)
		}
		defer v.Unsubscribe()
	}

	// Enable the trace sampler.
	// We are always sampling for demo purposes only: it is very high
	// depending on the QPS, but sufficient for the purpose of this quick demo.
	// More realistically perhaps tracing 1 in 10,000 might be more useful
	trace.SetDefaultSampler(trace.AlwaysSample())

	ctx := context.Background()

	// The database must exist
	databaseName := "projects/census-demos/instances/census-demos/databases/demo1"
	sessionPoolConfig := spanner.SessionPoolConfig{MinOpened: 5, WriteSessions: 1}
	client, err := spanner.NewClientWithConfig(ctx, databaseName, spanner.ClientConfig{SessionPoolConfig: sessionPoolConfig})
	if err != nil {
		log.Fatalf("SpannerClient err: %v", err)
	}
	defer client.Close()

	// Warm up the spanner client session. In normal usage
	// you'd have hit this point after the first operation.
	_, _ = client.Single().ReadRow(ctx, "Players", spanner.Key{"foo@gmail.com"}, []string{"email"})

	for i := 0; i < 3; i++ {
		ctx, span := trace.StartSpan(ctx, "create-players")

		players := []*Player{
			{FirstName: "Poke", LastName: "Mon", Email: "poke.mon@example.org", UUID: "f1578551-eb4b-4ecd-aee2-9f97c37e164e"},
			{FirstName: "Go", LastName: "Census", Email: "go.census@census.io", UUID: "540868a2-a1d8-456b-a995-b324e4e7957a"},
			{FirstName: "Quick", LastName: "Sort", Email: "q.sort@gmail.com", UUID: "2b7e0098-a5cc-4f32-aabd-b978fc6b9710"},
		}
		up := fmt.Sprintf("%d-%d.", i, time.Now().Unix())
		for _, player := range players {
			player.Email = up + player.Email
		}

		if err := newPlayers(ctx, client, players...); err != nil {
			log.Printf("Creating newPlayers err: %v", err)
		}
		span.End()
	}
}

func newPlayers(ctx context.Context, client *spanner.Client, players ...*Player) error {
	var ml []*spanner.Mutation
	for _, player := range players {
		m, err := spanner.InsertStruct("Players", player)
		if err != nil {
			return err
		}
		ml = append(ml, m)
	}
	_, err := client.Apply(ctx, ml)
	return err
}
```  

{{< sc_center >}}the entirety of the source code in Go{{< /sc_center >}}  
&nbsp;  
&nbsp;  

__The equivalent Java code is:__  

```
package com.opencensus.examples;

import com.google.cloud.spanner.DatabaseClient;
import com.google.cloud.spanner.DatabaseId;
import com.google.cloud.spanner.Key;
import com.google.cloud.spanner.Mutation;
import com.google.cloud.spanner.ResultSet;
import com.google.cloud.spanner.Spanner;
import com.google.cloud.spanner.SpannerOptions;
import com.google.cloud.spanner.Statement;

import io.opencensus.common.Scope;
import io.opencensus.contrib.grpc.metrics.RpcViews;
import io.opencensus.exporter.stats.stackdriver.StackdriverStatsExporter;
import io.opencensus.exporter.trace.stackdriver.StackdriverExporter;
import io.opencensus.trace.Tracing;
import io.opencensus.trace.samplers.Samplers;

import java.util.Arrays;
import java.util.List;

public class ZeuSportsDB {
    private DatabaseClient dbClient;
    private Spanner spanner;

    private static String parentSpanName = "create-players";
    public ZeuSportsDB(String instanceId, String databaseId) throws Exception {
      // Instantiate the client.
      SpannerOptions options = SpannerOptions.getDefaultInstance();
      this.spanner = options.getService();

      // And then create the Spanner database client.
      this.dbClient = this.spanner.getDatabaseClient(DatabaseId.of(
          options.getProjectId(), instanceId, databaseId));

      // Next up let's  install the exporter for Stackdriver tracing.
      StackdriverExporter.createAndRegister();
      Tracing.getExportComponent().getSampledSpanStore().registerSpanNamesForCollection(
      Arrays.asList(parentSpanName));

      // Then the exporter for Stackdriver monitoring/metrics.
      StackdriverStatsExporter.createAndRegister();
      RpcViews.registerAllCumulativeViews();
    }

    public void close() {
      this.spanner.close();
    }

    public void warmUpRead() {
      this.dbClient.singleUse().readRow("Players", Key.of("foo@gmail.com"), Arrays.asList("email"));
    }

    public static void main(String ...args) throws Exception {
      if (args.length < 2) {
        System.err.println("Usage: ZeuSports  ");
        return;
      }

      try {
        ZeuSportsDB zdb = new ZeuSportsDB(args[0], args[1]);
	// Warm up the spanner client session. In normal usage
	// you would have hit this point after the first operation.
	zdb.warmUpRead();

	for (int i=0; i < 3; i++) {
	  String up = i + "-" + (System.currentTimeMillis() / 1000) + ".";
	  List mutations = Arrays.asList(
	    playerMutation("Poke", "Mon", up + "poke.mon@example.org", "f1578551-eb4b-4ecd-aee2-9f97c37e164e"),
	    playerMutation("Go", "Census", up + "go.census@census.io", "540868a2-a1d8-456b-a995-b324e4e7957a"),
	    playerMutation("Quick", "Sort", up + "q.sort@gmail.com", "2b7e0098-a5cc-4f32-aabd-b978fc6b9710")
	  );

	  zdb.insertPlayers(mutations);
	}

        zdb.close();
      } catch (Exception e) {
        System.out.printf("Exception while adding player: " + e);
      } finally {
        System.out.println("Bye!");
      }
    }

    public static Mutation playerMutation(String firstName, String lastName, String email, String uuid) {
        return Mutation.newInsertBuilder("Players")
          .set("first_name")
          .to(firstName)
          .set("last_name")
          .to(lastName)
          .set("uuid")
          .to(uuid)
          .set("email")
          .to(email)
          .build();
    }

    public void insertPlayers(List players) throws Exception {
      try (Scope ss = Tracing.getTracer()
        .spanBuilderWithExplicitParent(parentSpanName, null)
        // Enable the trace sampler.
        //  We are always sampling for demo purposes only: this is a very high sampling
        // rate, but sufficient for the purpose of this quick demo.
        // More realistically perhaps tracing 1 in 10,000 might be more useful
        .setSampler(Samplers.alwaysSample())
        .startScopedSpan()) {

        this.dbClient.write(players);
      } finally {
      }
    }
}
```
{{% sc_center %}}the entirety of the source code in Java{{% /sc_center %}}
&nbsp;  

---
&nbsp;  

__Step 3.X: Enable Application Default Credentials__  

Please make sure to enable Application Default Credentials for authentication.  
Please visit [{{< sc_gloss1 >}}https://developers.google.com/identity/protocols/application-default-credentials{{< /sc_gloss1 >}}](https://cloud.google.com/docs/authentication/production) if you haven’t yet enabled them.  
&nbsp;  

---
&nbsp;  

__Step 4: Get the dependencies and run it!__  

Let’s go into our terminal and do something like this:  

For Go:  

`mkdir -p $GOPATH/src/census-demo && cd $GOPATH/src/census-demo`
make the directory go gettable/buildable  


Then, we’ll paste the main.go file from above and afterwards run:  

`go get -d && census-demo`  
go get dependencies, build and then run the binary  

Note: Just in case you didn’t properly setup your Application Default Credentials but have some test credentials, instead do this:  

`go get -d && GOOGLE_APPLICATION_CREDENTIALS=~/Downloads/census-demos.json census-demo`
go get dependencies, build the binary but also include the target Google Credentials source  
&nbsp;  

__For Java:__  

Please add the pom.xml file below:  

```
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <groupId>com.opencensus.examples</groupId>
  <artifactId>opencensus-examples</artifactId>
  <packaging>jar</packaging>
  <version>1.0-SNAPSHOT</version>
  <name>opencensus-examples</name>
  <url>http://maven.apache.org</url>

  <properties>
    <maven.compiler.target>1.8</maven.compiler.target>
    <maven.compiler.source>1.8</maven.compiler.source>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    <opencensus.version>0.11.0</opencensus.version>
  </properties>

  <dependencies>
    <dependency>
      <groupId>com.google.cloud</groupId>
      <artifactId>google-cloud-spanner</artifactId>
      <version>0.33.0-beta</version>
      <exclusions>
	<exclusion>
	  <groupId>com.google.guava</groupId>
	  <artifactId>guava-jdk5</artifactId>
	</exclusion>
	<exclusion>
	  <groupId>io.opencensus</groupId>
	  <artifactId>opencensus-api</artifactId>
	</exclusion>
      </exclusions>
    </dependency>

    <dependency>
      <groupId>com.google.guava</groupId>
      <artifactId>guava</artifactId>
      <version>20.0</version>
    </dependency>

    <dependency>
      <groupId>io.opencensus</groupId>
      <artifactId>opencensus-api</artifactId>
      <version>0.11.0</version>
    </dependency>

    <dependency>
      <groupId>io.opencensus</groupId>
      <artifactId>opencensus-exporter-stats-stackdriver</artifactId>
      <version>0.11.0</version>
    </dependency>

    <dependency>
      <groupId>io.opencensus</groupId>
      <artifactId>opencensus-exporter-trace-stackdriver</artifactId>
      <version>0.11.0</version>
    </dependency>

    <dependency>
      <groupId>io.opencensus</groupId>
      <artifactId>opencensus-contrib-grpc-metrics</artifactId>
      <version>0.11.0</version>
    </dependency>


    <dependency>
      <groupId>io.opencensus</groupId>
      <artifactId>opencensus-impl</artifactId>
      <version>0.11.0</version>
      <scope>runtime</scope>
    </dependency>

  </dependencies>

  <build>
    <plugins>
      <plugin>
	<groupId>org.codehaus.mojo</groupId>
	<artifactId>exec-maven-plugin</artifactId>
	<version>1.4.0</version>
	<configuration>
	  <mainClass>com.opencensus.examples.ZeuSportsDB</mainClass>
	</configuration>
      </plugin>
    </plugins>
  </build>

</project>
```
{{< sc_center >}}pom.xml{{< /sc_center >}}  
&nbsp;  

---
&nbsp;  


__Create the project directory__  

`mkdir -p src/main/java/com/opencensus/examples`  
&nbsp;  

__The Java source code__  

Paste the ZeuSportsDB.java file to end up like this
`src/main/java/com/opencensus/examples/ZeuSportsDB.java`  
&nbsp;  

__The Maven pom.xml file too__  

Paste it the same working directory as src to give you this structure
```
pom.xml
    src/
       |-main/
          |-java
             |-com
                |-opencensus
                   |-examples
                      |-ZeusSportsDB.java
```  
  
&nbsp;  
&nbsp;  
__Build it__  

`mvn clean package`  

&nbsp;  
&nbsp;  
__Lastly run it!__  

`mvn exec:java -Dexec.mainClass=com.opencensus.examples.ZeuSportsDB -Dexec.args="census-demos demo1"`  

&nbsp;  
&nbsp;  
If you need to use credentials from a test/known file  

```
GOOGLE_APPLICATION_CREDENTIALS=~/Downloads/census-demos-237a8e1e41df.json mvn exec:java -Dexec.mainClass=com.opencensus.examples.ZeuSportsDB -Dexec.args="census-demos demo1"
```
{{< sc_center >}}run it{{< /sc_center >}}  
&nbsp;  

---
&nbsp;  

__Step 5: Harness the power and visualize!__  

As soon as the code ran, it started exporting to Stackdriver, so let’s switch back to our browser and open up Stackdriver Trace at [{{< sc_gloss1 >}}https://console.cloud.google.com/traces/traces{{< /sc_gloss1 >}}](https://console.cloud.google.com/traces/traces) to see the output.  
&nbsp;  

![image - overview of the trace list](https://cdn-images-1.medium.com/max/800/1*WWDzGLQ1gVTtdUIjagZr1g.png "overview of the trace list"){{< sc_center >}}overview of the trace list{{< /sc_center >}}  
&nbsp;  

Notice in the span list that the latencies of create-players are variable; as the number of operations increases and existing sessions are reused, it gets faster. For example notice above that CreateSession took ~212ms but as we continued reusing the expensively setup session things got a lot more faster, down to ~8ms! You can learn more about the benefits of CreateSession at [{{< sc_gloss1 >}}https://cloud.google.com/spanner/docs/sessions#performance_benefits_of_a_session_cache{{< /sc_gloss1 >}}](https://cloud.google.com/spanner/docs/sessions#performance_benefits_of_a_session_cache)  
&nbsp;  

![image - create-players trace](https://cdn-images-1.medium.com/max/800/1*iHBt_Fl60cW9PI3q8L69lw.png "create-players trace")
{{< sc_center >}}create-players trace{{< /sc_center >}}  
&nbsp;  
&nbsp;  

Drilling down to a particular data point in time yields a trace with a root span and children spans shown below:  
&nbsp;  

![image - First child span, ReadWriteTransaction](https://cdn-images-1.medium.com/max/800/1*09LX8aIn3aF6JTjR9FfPNw.png "First child span, ReadWriteTransaction"){{< sc_center >}}First child span, ReadWriteTransaction{{< /sc_center >}}  
&nbsp;  
&nbsp;  

__Further drilling down to the child span:__  

![image - Last child span, Commit](https://cdn-images-1.medium.com/max/800/1*5tMKdma490TvVst5LA6Vhw.png "Last child span, Commit"){{< sc_center >}}Last child span, Commit{{< /sc_center >}}  
&nbsp;  
&nbsp;  

It is worth noting that the above graphs were produced by multiple runs of the sample code. But in a long running server applications, where cloud spanner client is created just once and used for the lifetime of the server, we expect to see very few CreateSession calls after the initial warm up. Typical usage of cloud spanner client in such an application would yield a graph like this:  
&nbsp;  

![image - querying](https://cdn-images-1.medium.com/max/800/1*yVlFnsZz-9jgBDD_UlnNOw.png "querying"){{< sc_center >}}querying{{< /sc_center >}}  
&nbsp;  
![image - spanner example](https://cdn-images-1.medium.com/max/800/1*UJHbMkpz6XZpT5tabAVW6A.png "spanner example")  
&nbsp;  
![image - spanner example](https://cdn-images-1.medium.com/max/800/1*bQfvfd4LKoh95TqvpgsPJw.png "spanner example")  
&nbsp;  
![image - ReadWrite transaction with CreateSession dominating](https://cdn-images-1.medium.com/max/800/1*IJA-7jNjKktjAC1B8qXUiw.png "ReadWrite transaction with CreateSession dominating"){{< sc_center >}}ReadWrite transaction with CreateSession dominating{{< /sc_center >}}
&nbsp;  
&nbsp;  

And now to view the collected metrics at [{{< sc_gloss1 >}}https://app.google.stackdriver.com/metrics-explorer?project=census-demos{{< /sc_spanner >}}](https://app.google.stackdriver.com/metrics-explorer?project=census-demos):
&nbsp;  
&nbsp;  

![image - Visualizing the number of BeginTransaction operations](https://cdn-images-1.medium.com/max/800/1*f1ja2oGqFUIW4rHba8mJZg.png "Visualizing the number of BeginTransaction operations"){{< sc_center >}}Visualizing the number of BeginTransaction operations{{< /sc_center >}}  
&nbsp;  
&nbsp;  

![image - request latencies](https://cdn-images-1.medium.com/max/800/1*5rKWGm8qm62TXgHoJQPHFQ.png "request latencies"){{< sc_center >}}request latencies{{< /sc_center >}}
&nbsp;  
&nbsp;  

As you can see, from the example above, in less than 42 lines, ZeuSports went from blindly operating their backend(they couldn’t guess how long Cloud Spanner operations took, what the latencies were), to getting an illumination on their database operations, metrics and traces in near-realtime, using OpenCensus’ packages in both the Go and Java programming languages. The power of visualization helps teams perform root cause analyses, post-mortems, bisect bad changes, figure out what needs to be optimized. The OpenCensus team has built and continues to actively build more client libraries in other languages too as well as more exporters such as Prometheus, Zipkin, SignalFx, and many others — with the purpose of democratizing good instrumentation, cheaply, scalably and nicely without having to burden your teams with maintenance.  
&nbsp;  
&nbsp;  

Thank you for following this far and hopefully this can help get you started with tracing and monitoring for Cloud Spanner in your backend. As I mentioned, the OpenCensus team has been working hard to bring us even more exporters. Please check out [{{< sc_gloss1 >}}http://opencensus.io/{{< /sc_gloss1 >}}](http://opencensus.io/) and get involved, let the team know what things you need, share examples of your instrumented backends, contribute to the code which is entirely developed in the open on Github at [{{< sc_gloss1 >}}https://github.com/census-instrumentation{{< /sc_gloss1 >}}](https://github.com/census-instrumentation).  
&nbsp;  

Big thanks to Jaana Burcu Dogan for snippets of the original Go code sample and for putting up instructions on the wiki for step-by-step usage; Ramon Nogueira, Pritam Shah, Gopi Palaniappan, Jonathan Amsterdam, Vikas Kedia, Damian Reeves, Di Xiao and Bogdan Drutu for the reviews and also to everyone on the OpenCensus team for all their hard work!  
&nbsp;  

The code in this tutorial/example is heavily borrowed from [{{< sc_gloss1 >}}https://github.com/GoogleCloudPlatform/golang-samples/blob/master/opencensus/opencensus_spanner_quickstart/main.go{{< /sc_gloss1 >}}](https://github.com/GoogleCloudPlatform/golang-samples/blob/master/opencensus/opencensus_spanner_quickstart/main.go) and the wiki [{{< sc_gloss1 >}}https://github.com/GoogleCloudPlatform/google-cloud-go/wiki/OpenCensus{{< /sc_gloss1 >}}](https://github.com/GoogleCloudPlatform/google-cloud-go/wiki/OpenCensus) as well as from [{{< sc_gloss1 >}}https://github.com/GoogleCloudPlatform/java-docs-samples/tree/master/spanner/cloud-client{{< /sc_gloss1 >}}](https://github.com/GoogleCloudPlatform/java-docs-samples/tree/master/spanner/cloud-client)  
&nbsp;  
&nbsp;  

By Emmanuel T Odeke, Orijtech, Inc.  

{{% /sc_spanner %}}