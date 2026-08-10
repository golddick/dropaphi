const assert = require('assert');

const { getMultipartBoundary } = require('../lib/utils/multipart');

function run() {
  const cases = [
    { h: 'multipart/form-data; boundary=----WebKitFormBoundaryabc123', e: '----WebKitFormBoundaryabc123' },
    { h: 'Multipart/Form-Data; Boundary=----ABC', e: '----ABC' },
    { h: 'multipart/form-data; boundary="----Quoted"', e: '----Quoted' },
    { h: 'multipart/form-data; boundary=', e: null },
    { h: 'text/plain; charset=utf-8', e: null },
    { h: null, e: null },
  ];

  for (const c of cases) {
    const out = getMultipartBoundary(c.h);
    assert.strictEqual(out, c.e, `header=${String(c.h)} expected=${String(c.e)} got=${String(out)}`);
  }

  console.log('getMultipartBoundary tests passed');
}

if (require.main === module) run();

module.exports = { run };
