#!/usr/bin/env node

/**
 * Module dependencies.
 */

var package = require('./package.json');
var path = require('path');
var program = require('commander');
var bench = require('./lib/bench');

program
  .version(package.version)
  .usage('[options] [http[s]://]hostname[:port]/path')
  .option('-n, --requests <n>', 'Number of requests to perform', parseInt)
  .option('-c, --concurrency <n>', 'Number of multiple requests to make', parseInt)
  .option('-t, --timelimit <n>', 'Seconds to max. wait for responses', parseInt)
  .option('-b, --windowsize <n>', 'Size of TCP send/receive buffer, in bytes', parseInt)
  .option('-p, --postfile <file>', 'File containing data to POST. Remember also to set -T')
  .option('-u, --putfile <file>', 'File containing data to PUT. Remember also to set -T')
  .option('-T, --content-type <type>', 'Content-type header for POSTing, eg. \'application/x-www-form-urlencoded\'. Default is \'text/plain\'')
  .option('-v, --verbosity', 'How much troubleshooting info to print')
  .option('-w, --htmltable', 'Print out results in HTML tables')
  .option('-i, --head', 'Use HEAD instead of GET')
  // .option('-x --attributes', 'String to insert as table attributes')
  // .option('-y attributes   String to insert as tr attributes')
  // .option('-z attributes   String to insert as td or th attributes')
  .option('-C, --cookie <name=value>', 'Add cookie, eg. \'Apache=1234\'. (repeatable)')
  .option('-H, --headers <name: value>', 'Add Arbitrary header line, eg. \'Accept-Encoding: gzip\'. Inserted after all normal header lines. (repeatable)')
  .option('-A, --auth <username:password>', 'Add Basic WWW Authentication, the attributes are a colon separated username and password.')
  .option('-P, --proxyauth <username:password>', 'Add Basic Proxy Authentication, the attributes are a colon separated username and password.')
  .option('-X, --proxy <proxy:port>', 'Proxyserver and port number to use')
  .option('-V, --version', 'Print version number and exit')
  .option('-k, --keepalive', 'Use HTTP KeepAlive feature')
  .option('-d, --noprecent', 'Do not show percentiles served table.')
  .option('-S, --silence', 'Do not show confidence estimators and warnings.')
  .option('-g, --gnuplot <file>', 'Output collected data to gnuplot format file.')
  .option('-e, --csv <file>', 'Output CSV file with percentages served')
  // .option('-r              Don\'t exit on socket receive errors.')
  .option('-Z, --ciphersuite <cipher>', 'Specify SSL/TLS cipher suite (See openssl ciphers)')
  .option('-f, --protocol [type]', 'Specify SSL/TLS protocol (SSL2, SSL3, TLS1, or ALL)');

program.parse(process.argv);

program.name = 'nab';
program.url = program.args[0];

if (!program.url) {
  console.log('url required.');
  process.exit(-1);
}

var benchmark = bench.createBenchmark(program);
benchmark.on('finish', function(results) {
  console.log(results);
  process.exit(0);
});
benchmark.run();




