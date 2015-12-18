# sqs-stream
aws sqs stream, implementing node.js's [readable stream class](https://nodejs.org/api/stream.html#stream_class_stream_readable).

## use
(AWS credentials/region should be configured)

```javascript

var sqsStream = new SqsStream(options);

/* buffering mode */
var data = sqsStream.read();

/* or flowing mode */
sqsStream.on('data', function(data){ ... });

```

###options
* `queueUrl` - URL of SQS queue to consume
* `region` - Region of SQS queue
* `idleWait=10000` - Interval (in ms) at which SqsStream will continue to attempt to read from queue, once drained

###events
in addition to events emitted by `Stream`, SqsStream will emit:
* `info` - notifications which may be logged
* `info:error` - notification of non-fatal errors
* `flowing` - data is flowing into drained buffer
