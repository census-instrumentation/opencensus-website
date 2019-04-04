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
from opencensus.tags import tag_map
from opencensus.tags import tag_value

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
#include "absl/strings/string_view.h"
#include "opencensus/tags/tag_key.h"
#include "opencensus/tags/tag_map.h"

ABSL_CONST_INIT const absl::string_view kGetMethod = "memcache.Client.Get";

opencensus::tags::TagKey MethodKey() {
  static const auto method = opencensus::tags::TagKey::Register("method");
  return method;
}

void Get() {
  opencensus::tags::TagMap tm({{MethodKey(), kGetMethod}});
  // ...
}

void Put() {
  // If the number of tags is variable, we can construct them from a vector.
  std::vector<std::pair<opencensus::tags::TagKey, std::string>> tags;
  // The tag value can also just be a string literal.
  tags.emplace_back(MethodKey(), "memcache.Client.Put");
  opencensus::tags::TagMap tm(std::move(tags));
  // ...
}
{{</highlight>}}

{{<highlight javascript>}}
const { TagMap } = require('@opencensus/core');
const methodTagKey = { name: "method" };
const statusTagKey = { name: "status" };

const tags = new TagMap();
tags.set(methodTagKey, { value: "REPL" });
tags.set(statusTagKey, { value: "OK" });
{{</highlight>}}
{{</tabs>}}

### References

Resource|URL
---|---
Specs reference|[specs.TagContext](https://github.com/census-instrumentation/opencensus-specs/blob/master/tags/TagMap.md#tagmap)
Go reference|[tag.New](https://godoc.org/go.opencensus.io/tag#New)
Java reference|[TagContext](https://static.javadoc.io/io.opencensus/opencensus-api/0.16.1/io/opencensus/tags/TagContext.html)
