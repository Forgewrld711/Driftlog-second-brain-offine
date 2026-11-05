# Local semantic brain

Driftlog ships with a small embedding model that enriches its deterministic
recognizer without sending journal text to a model API.

## Pinned components

- Runtime: `@huggingface/transformers@3.8.1`
- ONNX Runtime Web: `1.22.0-dev.20250409-89f8206ba4`
- Model: `Xenova/all-MiniLM-L6-v2`
- Model revision: `751bff37182d3f1213fa05d7196b954e230abad9`
- Weight file: `onnx/model_int8.onnx` (about 23 MB)
- License: Apache-2.0

The model is an embedding model, not a generative chatbot. It compares local
candidate phrases and the current entry with semantic anchors for meaningful
topics and feeling families. This is deliberately narrower and less likely to
invent a person, place, or event that the human did not write.

## Runtime path

1. The deterministic recognizer renders immediate results.
2. `assets/local-brain.worker.js` loads the bundled model in a Web Worker.
3. `env.allowRemoteModels = false` prevents model fallback to the Hub.
4. The Worker returns semantic topic and feeling suggestions.
5. Suggestions are merged as additions; rule-based results are not erased.
6. Saved entries record whether the semantic model participated.

The local-brain switch can terminate the Worker at any time. The journal,
storage, constellation, and deterministic recognizer continue to work.

## Offline path

`sw.js` pre-caches the HTML, Worker, pinned runtime, WASM backend, tokenizer,
and model. After one successful installation, the hosted app can load without a
network connection. The model also uses the browser Cache API. Direct
`file://` use retains the deterministic recognizer because browsers block the
Worker/model asset requests in that context.

## Privacy boundary

- journal text is posted only to the same-page local Worker
- no remote model host is enabled
- no analytics or telemetry is present
- only same-origin static assets are requested
- a timeout or model failure returns the deterministic result

## Future checks

- tune semantic thresholds with a larger opt-in test corpus
- add a visible storage meter and delete-cached-model action
- test memory pressure on older mobile devices
- expose model provenance in exported journal data
