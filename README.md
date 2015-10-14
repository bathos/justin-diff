# JstnDiff

Here’s a first try...

I don’t have a clear picture in my head of the objects in question, though if I
understood correctly this might yield what we’re looking for -- comparable,
diffable re-serializations with special handling for arrays.

But this depends an awful lot on the content of those arrays ... if we get a
randomly sequenced array of objects, who’s to say any one of those members is a
modification of its prior form rather than that of one of its peers? It all
hinges on the assumption that the top-level properties of such objects are
static ... and then some.

However, if we know more about that actual form these objects will take though,
we could take more into account with a custom comparator, ensuring the critical,
‘identity’ declaring properties float to the top.

We’re taking a little shortcut by exploiting the fact that properties have a
specified sequence in all modern JS engines (with a few caveats that don’t apply
to these circumstances).

After reorganizing the objects / arrays to their new 'sorted' forms, we run them
through `diff`, an existing lib. It poops to stdout now but obviously we’ll want
it to do something else later...

## Example

This is the setup in ./test/test.js:

```js
const a = JSON.stringify({
  propertyA: 'X',
  propertyB: 'Y',
  propertyC: 'Z',
  propertyD: [
    { name: 'cat', softness: 7 },
    { name: 'antelope', softness: 4 },
    { name: 'basalt', softness: 0 }
  ]
});

const b = JSON.stringify({
  propertyB: 'Y',
  propertyA: 'new!',
  propertyD: [
    { name: 'antelope', softness: 4 },
    { name: 'basalt', softness: 0, rock: true },
    { name: 'cat', softness: 12 }
  ],
  propertyC: 'Z'
});
```

And y’get:

![example outpoop](https://github.com/HourlyNerd/justin-diff/raw/master/resource/example.png)

So it handles that fine, but note that if one of the `propertyD` members had
added a new property that would sort before 'name', the whole array would have
been considered a diff. That’s why I figured we’d need domain-specific knowledge
to augment this.
