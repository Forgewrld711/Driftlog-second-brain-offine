import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const html = readFileSync(new URL('../driftlog.html', import.meta.url), 'utf8');
const worker = readFileSync(new URL('../assets/local-brain.worker.js', import.meta.url), 'utf8');
const serviceWorker = readFileSync(new URL('../sw.js', import.meta.url), 'utf8');
const extractionStart = html.indexOf('const FEELING_FAMILIES');
const extractionEnd = html.indexOf('// ── Graph layout');
const extractionSource = `${html.slice(extractionStart, extractionEnd)}\nresult = extractEntities(input);`;

function extract(input) {
  const context = { input };
  vm.createContext(context);
  vm.runInContext(extractionSource, context);
  return JSON.parse(JSON.stringify(context.result));
}

test('journal shell has no remote runtime dependencies', () => {
  assert.doesNotMatch(html, /(?:src|href)=["']https?:\/\//i);
  assert.doesNotMatch(html, /\b(?:fetch|XMLHttpRequest|WebSocket)\s*\(/);
});

test('semantic model is bundled and remote model access is disabled', () => {
  assert.match(worker, /env\.allowRemoteModels\s*=\s*false/);
  assert.match(worker, /env\.allowLocalModels\s*=\s*true/);
  assert.doesNotMatch(worker, /https?:\/\//i);
  assert.match(serviceWorker, /model_int8\.onnx/);
  const model = statSync(new URL('../models/Xenova/all-MiniLM-L6-v2/onnx/model_int8.onnx', import.meta.url));
  assert.ok(model.size > 20_000_000 && model.size < 30_000_000, `unexpected model size: ${model.size}`);
});

test('recognizes bounded people, places, topics, and feeling families', () => {
  const result = extract('I met Miranda Price at Point Au Roche and we worked on the blockchain project. I felt anxious but relieved.');
  assert.deepEqual(result.people, ['Miranda Price']);
  assert.ok(result.places.includes('Point Au Roche'));
  assert.ok(result.things.some(value => value.toLowerCase().includes('blockchain')));
  assert.deepEqual(result.feelings, ['Anxious', 'Relieved']);
  assert.ok(result.places.every(value => !value.toLowerCase().includes('worked')));
});

test('explicit local tags and quoted titles survive casual lowercase writing', () => {
  const result = extract('went to the library with @Lenny, listened to "A Better Way," and worked on #MemoryGrove. really tired.');
  assert.ok(result.people.includes('Lenny'));
  assert.ok(result.places.includes('Library'), JSON.stringify(result));
  assert.ok(result.things.includes('A Better Way'));
  assert.ok(result.things.includes('Memorygrove'));
  assert.ok(result.feelings.includes('Tired'));
});

test('feeling matching uses word boundaries', () => {
  const result = extract('I am satisfied with the app.');
  assert.ok(!result.feelings.includes('Sad'));
  assert.ok(result.things.includes('App'), JSON.stringify(result));
});
