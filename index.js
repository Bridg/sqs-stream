'use strict';

var stream = require('stream');
var util = require('util');
var AWS = require('aws-sdk');
var async = require('async');


function SqsStream(options){

  stream.Readable.apply(this, [{ 'objectMode': true }]);

  this.sqs = new AWS.SQS({region: 'us-west-2'});
  this.queueUrl = options.queueUrl;
  this.idleWait = options.idleWait || 10000;
  this._getMessages();

}

util.inherits(SqsStream, stream.Readable);

SqsStream.prototype._getMessages = function(){

  if(this.full){
    return;
  }

  var parameters = {
    QueueUrl: this.queueUrl,
    MaxNumberOfMessages: 10,
    MessageAttributeNames: [
      'All',
    ],
    VisibilityTimeout: 120,
    WaitTimeSeconds: 2
  };

  this.sqs.receiveMessage(parameters, function(error, data){

    if(error){
      return this.emit('error', error);
    }

    if(!data.Messages || !data.Messages.length){
      return setTimeout(this._getMessages.bind(this), this.idleWait);
    }

    this._pushMessages(data.Messages, this._getMessages.bind(this));

  }.bind(this));

};

SqsStream.prototype._pushMessages = function(messages, complete){

  async.eachSeries(
    messages,
    function(message, complete){
      var data;
      try{
        data = JSON.parse(message.Body);
      }
      catch(exception){
        this.emit('info:error', exception);
        return complete();
      }
      if(this.full || !this.push(data)){
        this.full = true;
        return this._returnMessage(message, complete);
      }
      this.emit('flowing');
      this._deleteMessage(message, complete);
    }.bind(this),
    function(error){
      if(!error){
        complete();
      }
    }
  );

};

SqsStream.prototype._returnMessage = function(message, complete){

  var parameters = {
    QueueUrl: this.queueUrl,
    ReceiptHandle: message.ReceiptHandle,
    VisibilityTimeout: 0
  };

  this.sqs.changeMessageVisibility(parameters, function(error, data){
    if(error){
      this.emit('info:error', error);
    }
    complete();
  }.bind(this));

}

SqsStream.prototype._deleteMessage = function(message, complete){

    var parameters = {
      QueueUrl: this.queueUrl,
      ReceiptHandle: message.ReceiptHandle
    };

    this.sqs.deleteMessage(parameters, function(error, data){
      if(error){
        this.emit('info:error', error);
      }
      complete();
    }.bind(this));

};

SqsStream.prototype._read = function(size){

  if(this.paused){
    this.paused = false;
    this.emit('reading');
  }

};

module.exports = SqsStream;
