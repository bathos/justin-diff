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

const jstnDiff = require('../');

console.log(jstnDiff(a, b));
