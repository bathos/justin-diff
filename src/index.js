
import { diffJson as diffJSON } from 'diff';
import clc from 'cli-color';

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

const weightedProperties = [
  'name', '$ref', 'properties', 'in', 'required', 'type',
  'description', 'allowMultiple', 'enum'
];

const weigh = (a, b) => {
  const [ aw, bw ] = [ a, b ].map(n => weightedProperties.indexOf(n) + 1);

  return (
    aw > bw ? -1 :
    aw < bw ?  1 :
    a  > b  ?  1 :
    a  < b  ? -1 : 0
  );
}

const serialize = obj => JSON.stringify(obj, null, 4);

const abnormalizeJSON = json => {

  // Primitives can be returned as they are. String, number, boolean and null:

  const type = typeof json;

  if (type == 'string' || type == 'number' || type == 'boolean' || !json)
    return json;

  // Objects are where we get weird.

  if (json instanceof Array)
    return json
      .map(abnormalizeJSON)
      .map(serialize)
      .sort()
      .map(JSON.parse);

  else
    return Object.keys(json)
      .sort(weigh)
      .reduce((acc, key) => {
        acc[key] = abnormalizeJSON(json[key]);
        return acc;
      }, {});
};

const reserialize = str => {
  const json = JSON.parse(str);
  const abnormalized = abnormalizeJSON(json);
  return serialize(abnormalized);
};

const red     = clc.xterm(203);
const green   = clc.xterm(155);
const neutral = clc.xterm(144);

export default (...pair) => {
  const diff = diffJSON(...pair.map(reserialize));

  for (const { added, removed, value } of diff) {
    const color = added ? green : removed ? red : neutral;
    process.stdout.write(color(value));
  }

  return diff;
};
