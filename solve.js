var prompt = require('prompt');
var fs = require('fs');
var _ = require('lodash');

var letters = [];
var goldenLetters = [];
var weightLetters = [];
var weightGoldenLetters = [];

var joker = false;

var multipliers = [];

var possibleWords = [];
var rankedPossiblewords = [];

function _getLetters(callback) {
  prompt.start();

  prompt.get(['letters', 'weightLetters', 'goldenLetters', 'weightGoldenLetters', 'multipliers', 'joker'], function (err, result) {

    letters = result.letters.split('');
    weightLetters = result.weightLetters.split('');
    goldenLetters = result.goldenLetters.split('');
    weightGoldenLetters = result.weightGoldenLetters.split('');

    if (result.joker) { joker = true; }

    multipliers = _.map(result.multipliers.split(''), function (multiplier) {
      if (multiplier == '-' || !multiplier) { return 1; }
      return parseInt(multiplier);
    });

    callback();
  });
}

function _findPossibleWords(callback) {
  var dico = 'dico_small.txt';

  fs.readFile(dico, function(err, data) {
    if(err) throw err;

    var words = data.toString().split("\n");

    _.each(words, function (word) {
      if (_isPossibleWord(word)) {
        possibleWords.push(word);
      }
    });

    console.log('list of possible words', JSON.stringify(possibleWords, null, ' '));
    callback();
  });
}

function _isPossibleWord(word) {
  var wordletters = word.split('');

  if (!_containsGoldenLetters(wordletters)) { return; }

  _.each(letters, function (letter) {
    if (wordletters.length) {
      var position = _.findIndex(wordletters, function (l) { return l.toLowerCase() === letter.toLowerCase() });
      if (position !== -1) {
        wordletters.splice(position, 1);
      }
    }
  });

  if (wordletters.length === 0 || (wordletters.length === 1 && joker)) {
    return true;
  } else {
    return false;
  }
}

function _containsGoldenLetters(wordletters) {
  var containLetters = true;

  _.each(goldenLetters, function (golden) {
    var position = _.findIndex(wordletters, function (l) { return l.toLowerCase() === golden.toLowerCase() });
    if (position === -1) { containLetters = false };
    wordletters.splice(position, 1);
  });
  return containLetters;
}

function _rankPossibleWords() {
  var rankedNotSorted = {};

  _.each(possibleWords, function (possibleWord) {
    var rank = _getRank(possibleWord);
    if (rankedNotSorted[rank]) {
      rankedNotSorted[rank].push(possibleWord);
    } else {
      rankedNotSorted[rank] = [possibleWord];
    }
  });

  _.each(rankedNotSorted, function (value, key) {
    rankedPossiblewords.push([key, value]);
  });

  rankedPossiblewords.sort(function(a, b) {
    if (parseInt(a[0]) === parseInt(b[0])) { return 0; }
    else if (parseInt(a[0]) < parseInt(b[0])) { return 1; }
    else { return -1; }
  });

  console.log('Possible words :');
  _.each(rankedPossiblewords, function (possible) {
    console.log(possible[0] + ' ' + possible[1].join(' '));
  });
}

function _getRank(word) {
  var points = word.length === 7 ? 10: 0;

  var allLetters = letters.concat(goldenLetters);
  var allWeights = weightLetters.concat(weightGoldenLetters);

  _.each(allLetters, function (letter, index) {
    var position = _.findIndex(word.split(''), function (l) { return l.toLowerCase() === letter.toLowerCase() });
    if (position !== -1) {
      points += allWeights[index] * multipliers[position];
    }
  });
  return points;
}



_getLetters(function () {
  _findPossibleWords(function () {
    _rankPossibleWords();
  });
});

