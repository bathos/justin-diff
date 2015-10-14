'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

var _diff = require('diff');

var _cliColor = require('cli-color');

var _cliColor2 = _interopRequireDefault(_cliColor);

// I don’t have a clear picture in my head of the objects in question, though if
// I understood correctly this might yield what we’re looking for -- comparable,
// diffable re-serializations with special handling for arrays. But it will
// depend an awful lot on the content of those arrays ... if it’s a randomly
// sequenced array of objects, afterall, who’s to say any one of those members
// is a modification of its prior form rather than that of one of its peers? It
// entirely hinges on the assumption that the top-level properties of such
// objects are static ... and then some. If we know more about that actual form
// these objects will take though, we could take more into account with a custom
// comparator.

// We’re taking a little shortcut by exploiting the fact that properties have a
// specified sequence in all modern JS engines (with a few caveats that don’t
// apply to these circumstances). That cuts down on complexity a good deal I
// think.

var weightedProperties = ['name', '$ref', 'properties', 'in', 'required', 'type', 'description', 'allowMultiple', 'enum'];

var weigh = function weigh(a, b) {
  var _map = [a, b].map(function (n) {
    return weightedProperties.indexOf(n) + 1;
  });

  var _map2 = _slicedToArray(_map, 2);

  var aw = _map2[0];
  var bw = _map2[1];

  return aw > bw ? -1 : aw < bw ? 1 : a > b ? 1 : a < b ? -1 : 0;
};

var serialize = function serialize(obj) {
  return JSON.stringify(obj, null, 4);
};

var abnormalizeJSON = function abnormalizeJSON(json) {

  // Primitives can be returned as they are. String, number, boolean and null:

  var type = typeof json;

  if (type == 'string' || type == 'number' || type == 'boolean' || !json) return json;

  // Objects are where we get weird.

  if (json instanceof Array) return json.map(abnormalizeJSON).map(serialize).sort().map(JSON.parse);else return Object.keys(json).sort(weigh).reduce(function (acc, key) {
    acc[key] = abnormalizeJSON(json[key]);
    return acc;
  }, {});
};

var reserialize = function reserialize(str) {
  var json = JSON.parse(str);
  var abnormalized = abnormalizeJSON(json);
  return serialize(abnormalized);
};

var red = _cliColor2['default'].xterm(203);
var green = _cliColor2['default'].xterm(155);
var neutral = _cliColor2['default'].xterm(144);

exports['default'] = function () {
  for (var _len = arguments.length, pair = Array(_len), _key = 0; _key < _len; _key++) {
    pair[_key] = arguments[_key];
  }

  var diff = _diff.diffJson.apply(undefined, _toConsumableArray(pair.map(reserialize)));

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = diff[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var _step$value = _step.value;
      var added = _step$value.added;
      var removed = _step$value.removed;
      var value = _step$value.value;

      var color = added ? green : removed ? red : neutral;
      process.stdout.write(color(value));
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator['return']) {
        _iterator['return']();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  return diff;
};

module.exports = exports['default'];
