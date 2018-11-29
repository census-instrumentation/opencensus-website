---
title: "TagMap/TagContext"
weight: 3
aliases: [/core-concepts/tags/tagmap]
---

- [TagMap](#tagmap)
- [Source code example](#source-code-example)
- [References](#references)


### TagMap
To record specific tags against [measurements](/stats/measurement), they need to be isolated and inserted into a collection.
This is collection of tags is called a "TagMap"

### Source code example
{{<tabs Go Python Java CplusPlus NodeJS>}}
{{<highlight go>}}
package main

import (
	"go.opencensus.io/stats"
	"go.opencensus.io/tag"
)

func doWork() {
	// The TagMap is inserted into this context
	ctx, _ := tag.New(ctx,
		tag.Upsert(tagKey, "gomemcache.Client.Get"),
		tag.Upsert(tagKeyRegion, "asia-x1"))
{{</highlight>}}

{{<highlight python>}}
import opencensus.tags import tag_map
import opencensus.tags import tag_value

# Values are inserted 
tag_map.TagMap().insert(keyMethod, tag_value.TagValue("memcache.Client.Get"))
{{</highlight>}}

{{<highlight java>}}
import io.opencensus.tags.TagContext;
import io.opencensus.tags.Tagger;

Tagger TAGGER = Tags.getTagger();
TagContext tagCtx = TAGGER.currentBuilder().
                put(keyMethod, TagValue.create("memcache.Client.Get")).
                .build();
{{</highlight>}}

{{<highlight cpp>}}
#include "opencensus/tags/tag_key.h"
#include "opencensus/tags/tag_map.h"

void Get() {
  static const auto method = opencensus::tags::TagKey::Register("method");
  opencensus::tags::TagMap tm({{method, "memcache.Client.Get"}});
  // ...
}
{{</highlight>}}

{{<highlight nodejs>}}
const keyMethod = "method";
{{</highlight>}}
{{</tabs>}}

### References

Resource|URL
---|---
Specs reference|[specs.TagContext](https://github.com/census-instrumentation/opencensus-specs/blob/master/tags/TagContext.md#tag-context-api)
Go reference|[tag.New](https://godoc.org/go.opencensus.io/tag#New)
Java reference|[TagContext](https://static.javadoc.io/io.opencensus/opencensus-api/0.16.1/io/opencensus/tags/TagContext.html)
