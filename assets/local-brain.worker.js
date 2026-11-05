import { env, pipeline } from './vendor/transformers.min.js';

const MODEL_ID = 'Xenova/all-MiniLM-L6-v2';
const MODEL_REVISION = '751bff37182d3f1213fa05d7196b954e230abad9';

env.allowLocalModels = true;
env.allowRemoteModels = false;
env.useBrowserCache = true;
env.localModelPath = new URL('../models/', self.location.href).href;
env.backends.onnx.wasm.wasmPaths = new URL('./vendor/', self.location.href).href;
env.backends.onnx.wasm.numThreads = Math.max(1, Math.min(4, self.navigator?.hardwareConcurrency || 1));

const FEELING_ANCHORS = {
  Happy: 'feeling happy joyful delighted cheerful and glad',
  Calm: 'feeling calm peaceful content settled and grounded',
  Excited: 'feeling excited eager energized thrilled and enthusiastic',
  Grateful: 'feeling grateful thankful appreciative and blessed',
  Proud: 'feeling proud accomplished capable and successful',
  Hopeful: 'feeling hopeful optimistic encouraged and looking forward',
  Inspired: 'feeling inspired creative motivated curious and full of ideas',
  Sad: 'feeling sad unhappy heartbroken down and grieving',
  Anxious: 'feeling anxious nervous uneasy panicked and on edge',
  Angry: 'feeling angry furious irritated annoyed and mad',
  Overwhelmed: 'feeling overwhelmed by too many demands at once, everything piling up, swamped and unable to cope',
  Tired: 'feeling tired exhausted drained sleepy and burned out',
  Frustrated: 'feeling frustrated stuck blocked and fed up',
  Lonely: 'feeling lonely isolated alone and left out',
  Confused: 'feeling confused uncertain unsure lost and puzzled',
  Relieved: 'feeling relieved after something difficult finally worked, shoulders relaxing, tension released, a weight lifted, and able to breathe again',
  Scared: 'feeling scared afraid fearful terrified and worried',
  Numb: 'feeling numb empty disconnected and detached'
};

const TOPIC_ANCHOR = 'a meaningful topic, object, project, activity, task, subject, media, or idea in a personal journal';
const NON_TOPIC_ANCHOR = 'grammar, filler words, pronouns, dates, and generic conversational language';

let extractorPromise;
let anchorVectorsPromise;

function dot(a, b) {
  let total = 0;
  for (let index = 0; index < a.length; index += 1) total += a[index] * b[index];
  return total;
}

async function embed(texts) {
  const extractor = await extractorPromise;
  const tensor = await extractor(texts, { pooling: 'mean', normalize: true });
  return tensor.tolist();
}

async function loadBrain() {
  if (extractorPromise) return extractorPromise;
  self.postMessage({ type: 'status', status: 'loading', message: 'loading 23 MB local model' });
  extractorPromise = pipeline('feature-extraction', MODEL_ID, {
    dtype: 'int8',
    device: 'wasm',
    progress_callback: progress => {
      if (progress?.status === 'progress' && Number.isFinite(progress.progress)) {
        self.postMessage({
          type: 'status',
          status: 'loading',
          message: `loading local model · ${Math.round(progress.progress)}%`
        });
      }
    }
  });
  await extractorPromise;
  anchorVectorsPromise = embed([
    TOPIC_ANCHOR,
    NON_TOPIC_ANCHOR,
    ...Object.values(FEELING_ANCHORS)
  ]);
  await anchorVectorsPromise;
  self.postMessage({
    type: 'ready',
    model: MODEL_ID,
    revision: MODEL_REVISION,
    message: 'local semantic brain ready'
  });
  return extractorPromise;
}

async function analyze({ id, text, candidates = [] }) {
  await loadBrain();
  const trimmed = text.trim();
  if (!trimmed) {
    self.postMessage({ type: 'result', id, result: { things: [], feelings: [] } });
    return;
  }

  const feelingLabels = Object.keys(FEELING_ANCHORS);
  const anchors = await anchorVectorsPromise;
  const uniqueCandidates = [...new Set(candidates.map(value => value.trim()).filter(Boolean))].slice(0, 28);
  const inputs = [trimmed.slice(0, 1200), ...uniqueCandidates];
  const vectors = await embed(inputs);
  const entryVector = vectors[0];

  const feelings = feelingLabels
    .map((label, index) => ({ label, score: dot(entryVector, anchors[index + 2]) }))
    .sort((a, b) => b.score - a.score)
    .filter((item, index, all) => item.score >= 0.27 && (index === 0 || item.score >= all[0].score - 0.03))
    .slice(0, 2)
    .map(item => item.label);

  const things = uniqueCandidates
    .map((label, index) => {
      const vector = vectors[index + 1];
      const topicScore = dot(vector, anchors[0]);
      const fillerScore = dot(vector, anchors[1]);
      const contextScore = dot(vector, entryVector);
      const phraseBonus = Math.min(2, Math.max(0, label.split(/\s+/).length - 1)) * 0.055;
      return { label, score: (topicScore - fillerScore) * 0.55 + contextScore * 0.45 + phraseBonus };
    })
    .filter(item => item.score >= 0.11)
    .sort((a, b) => b.score - a.score || b.label.length - a.label.length)
    .slice(0, 5)
    .map(item => item.label);

  self.postMessage({ type: 'result', id, result: { things, feelings } });
}

self.addEventListener('message', event => {
  const message = event.data || {};
  if (message.type === 'init') {
    loadBrain().catch(error => self.postMessage({
      type: 'error',
      message: error?.message || 'local model failed to load'
    }));
    return;
  }
  if (message.type === 'analyze') {
    analyze(message).catch(error => self.postMessage({
      type: 'result',
      id: message.id,
      error: error?.message || 'local analysis failed',
      result: null
    }));
  }
});
