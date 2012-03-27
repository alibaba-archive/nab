/*!
 * nab - lib/ab.js
 * Copyright(c) 2012 fengmk2 <fengmk2@gmail.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var urllib = require('urllib');
var http = require('http');
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var fs = require('fs');
var ProgressBar = require('progress');


function Benchmark(options) {
  this.url = options.url;
  this.requests = options.requests || 1000;
  this.concurrency = options.concurrency || 50;
  this.method = 'GET';
  this.timelimit = options.timelimit || 10000000;
  if (this.timelimit) {
    this.timelimit = this.timelimit * 1000;
  }
  if (options.postfile) {
    this.postdata = fs.readFileSync(options.postfile);
    this.method = 'POST';
  }
  urllib.agent.maxSockets = this.concurrency;
}
util.inherits(Benchmark, EventEmitter);

Benchmark.prototype.run = function() {
  var results = [];
  var starttime = new Date();
  console.log('\n');
  var bar = new ProgressBar('Benchmark runing [:bar] :percent :etas', { 
    total: this.requests, 
    width: 100,
    incomplete: ' '
  });
  this.on('result', (function(result) {
    bar.tick(1);
    results.push(result);
    if (results.length === this.requests) {
      console.log('\nComplete!\n');
      this.emit('finish', this.total(starttime, results));
    }
  }).bind(this));
  for (var i = this.requests; i--; ) {
    this.request(i);
  }
}

Benchmark.prototype.request = function(index) {
  var result = {
    index: index,
    starttime: new Date(),
    size: 0,
    statusCode: -1,
  };
  urllib.request(this.url, {
    type: this.method,
    content: this.postdata,
    timeout: this.timelimit,
  }, (function(err, data, res) {
    result.usetime = new Date() - result.starttime;
    result.error = err;
    if (data) {
      result.size = data.length;
    }
    if (res) {
      result.statusCode = res.statusCode;
    }
    // console.log(data.toString(), res.headers)
    this.emit('result', result);
  }).bind(this));
}

Benchmark.prototype.sumary = function(info, result) {
  info.averageUsetime += result.usetime;
  info.count++;
  if (info.min < 0 || info.min > result.usetime) {
    info.min = result.usetime;
  }
  if (info.max < 0 || info.max < result.usetime) {
    info.max = result.usetime;
  }
  if (!info.times) {
    info.times = {

    };
  }
}

Benchmark.prototype.total = function(starttime, results) {
  var totalUsetime = new Date() - starttime;
  var statuses = {};
  var total = {
    averageUsetime: 0,
    count: 0,
    min: -1,
    max: -1,
    qps: results.length / totalUsetime * 1000,
  };
  for (var i = results.length; i--; ) {
    var result = results[i];
    this.sumary(total, result);
    var statusName = result.error ? (result.error.message + ':' + result.statusCode) : result.statusCode;
    var statusResult = statuses[statusName] || {
      averageUsetime: 0,
      count: 0,
      min: -1,
      max: -1,
    };
    this.sumary(statusResult, result);
    statuses[statusName] = statusResult;
  }
  total.averageUsetime = total.averageUsetime / results.length;
  for (var k in statuses) {
    var statusResult = statuses[k];
    statusResult.averageUsetime = statusResult.averageUsetime / results.length;
  }
  return {
    requests: this.requests,
    concurrency: this.concurrency,
    totalUsetime: totalUsetime,
    total: total,
    statuses: statuses,
  }
}

exports.createBenchmark = function(options) {
  return new Benchmark(options);
};