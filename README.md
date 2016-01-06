# sqs-stream
aws sqs stream, implementing node.js's [duplex stream class](https://nodejs.org/api/stream.html#stream_class_stream_duplex).

## use

```javascript

var sqsStream = new SqsStream(options);

/* buffering mode */
var data = sqsStream.read();

/* or flowing mode */
sqsStream.on('data', function(data){ ... });

```

###options

* `accessKeyId` - AWS access key id
* `secretAccessKey` - AWS secret access key
* `region` - Region of SQS queue
* `queueUrl` - URL of SQS queue to consume
* `idleWait=10000` - Interval (in ms) at which SqsStream will continue to attempt to read from queue, once drained
* `deleteMessages=true` - remove message from queue after read

###events
in addition to events emitted by `Stream`, SqsStream will emit:
* `info` - notifications which may be logged
* `info:error` - notification of non-fatal errors
* `flowing` - data is flowing into drained buffer
