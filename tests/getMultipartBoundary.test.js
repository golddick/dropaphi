const assert = require('assert');

// The route sets a global helper __getMultipartBoundary for regression checks.
const getMultipartBoundary = global.__getMultipartBoundary || require('../app/api/v1/files/upload/route').getMultipartBoundary;

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
    const out = typeof getMultipartBoundary === 'function' ? getMultipartBoundary(c.h) : null;
    assert.strictEqual(out, c.e, `header=${String(c.h)} expected=${String(c.e)} got=${String(out)}`);
  }

  console.log('getMultipartBoundary tests passed');
}

if (require.main === module) run();

module.exports = { run };
