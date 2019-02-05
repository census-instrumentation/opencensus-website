---
title: "Serialization"
weight: 6
aliases: [/core-concepts/tags/serialization]
---

### Serialization
Serialization of tags applies to all formats and protocols. Its restrictions include:

- The serialization format must preserve the TagKey-TagValue mapping
- The combined size of all keys and value MUST be at most 8192 bytes.

The "combined size" restriction applies to deserialized tags so that the set of serializable TagContexts is independent of the serialization format

### Error handling

- The result of serialiation or deserialization should ALWAYS be a complete TagContext or an error. There are NO partial failures
- Serialization should result in an error if the TagContext doesn't meet the [size restrictions above](#serialiation)
- Deserialization should result in an error if the serialized TagContext cannot be parsed or if it contains a TagKey or TagValue above size restrictions
- Deserialization should result in an error if it doesn't meet the [size restrictions above](#serialization)

### References

Resource|URL
---|---
Serialization specs reference|[specs/TagContext.Serialization](https://github.com/census-instrumentation/opencensus-specs/blob/master/tags/TagMap.md#encoding)
Error handling specs reference|[specs/TagContext.Serialization.ErrorHandling](https://github.com/census-instrumentation/opencensus-specs/blob/master/tags/TagMap.md#error-handling)

