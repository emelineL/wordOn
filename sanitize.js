var fs = require('fs');
var readline = require('readline');
var _ = require('lodash');


var statsLength = {};

fs.readFile('dico.txt', function(err, data) {
  if(err) throw err;

  var lines = data.toString().split("\n");
  var outputLines = '';

  _.each(lines, function (line) {
    statsLength[line.length] = statsLength[line.length] ? statsLength[line.length]+=1 : 1;

    if (line.length > 1 && line.length < 8) {
      outputLines += line+'\n';
    }
  });

  fs.writeFile('dico_small.txt', outputLines, 'utf8', function (err) {
    if (err) throw err;
    _logStats();
  });
});


function _logStats() {
  _.each(statsLength, function (value, key) {
    console.log('There are ' + value + ' words of length ' + key);
  });
  process.exit();
}
