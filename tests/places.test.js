import test from 'node:test';
import assert from 'node:assert/strict';
import { places } from '../src/data/places.js';
import { filterPlaces } from '../src/search.js';

const expectedIds = ['ice-cc','qianjiang-park','yongfu','taoguang','west-lake','guyongjin','cruise','lingyin','hubin','qinghefang','wulin-square','ice-88','faxi','wulin-pier','xiaohe','gongchen','outlet','silk-city','silk-street','kinglomo-xixi','atour','xixi','wulin-night','airport','kinglomo-xiaoshan','qipao','xianghu'];

test('source inventory preserves 27 distinct places', () => {
  assert.equal(places.length, 27);
  assert.deepEqual(places.map(p => p.id).sort(), [...expectedIds].sort());
  assert.equal(new Set(places.map(p => p.id)).size, 27);
  assert.equal(places.find(p => p.id === 'lingyin').nameZh, '灵隐寺');
  assert.equal(places.find(p => p.id === 'lingyin').rating, null);
  assert.equal(places.find(p => p.id === 'ice-cc').price, 25);
  assert.equal(places.find(p => p.id === 'ice-88').price, 30);
  assert.equal(places.find(p => p.id === 'west-lake').rating, 4.9);
});

test('search intersects the selected category', () => {
  assert.deepEqual(filterPlaces(places, '  灵隐寺  ', 'temple').map(p => p.id), ['lingyin']);
  assert.deepEqual(filterPlaces(places, '灵隐寺', 'food'), []);
  assert.equal(filterPlaces(places, '', 'all').length, 27);
  assert.equal(filterPlaces(places, '킹로모', 'food').length, 2);
  assert.equal(filterPlaces(places, '시후', 'all').some(p => p.id === 'west-lake'), true);
  assert.deepEqual(filterPlaces(places, '없는 장소', 'all'), []);
});

test('photos and coordinates retain source metadata', () => {
  const sources = new Set();
  for (const p of places) {
    assert.equal(p.coordinates.length, 2, p.id);
    assert.ok(p.coordinates[0] > 29 && p.coordinates[0] < 31, p.id);
    assert.ok(p.coordinates[1] > 119 && p.coordinates[1] < 121, p.id);
    assert.ok(['place', 'area'].includes(p.locationAccuracy), p.id);
    assert.ok(p.locationSource.label && /^https:\/\//.test(p.locationSource.url), p.id);
    const f = p.photo;
    assert.ok(f.x >= 0 && f.y >= 0 && f.width > 0 && f.height > 0, p.id);
    assert.ok(f.x + f.width <= f.sourceWidth && f.y + f.height <= f.sourceHeight, p.id);
    assert.match(f.src, /IMG_675[0-5]\.JPG|IMG_6749\.JPG/);
    sources.add(f.src);
  }
  assert.equal(sources.size, 7);
});
