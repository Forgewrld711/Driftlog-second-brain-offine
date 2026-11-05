# Third-party components

Driftlog redistributes the following pinned local components so the semantic
recognizer does not need a third-party CDN or model API at runtime.

## Transformers.js

- Package: `@huggingface/transformers@3.8.1`
- Source: <https://github.com/huggingface/transformers.js>
- License: Apache License 2.0
- License copy: `licenses/TRANSFORMERS_JS_LICENSE.txt`

## ONNX Runtime Web

- Package: `onnxruntime-web@1.22.0-dev.20250409-89f8206ba4`
- Source: <https://github.com/microsoft/onnxruntime>
- License: MIT
- License copy: `licenses/ONNXRUNTIME_LICENSE.txt`

## all-MiniLM-L6-v2 ONNX model

- Repository: `Xenova/all-MiniLM-L6-v2`
- Revision: `751bff37182d3f1213fa05d7196b954e230abad9`
- Source: <https://huggingface.co/Xenova/all-MiniLM-L6-v2>
- Upstream model: `sentence-transformers/all-MiniLM-L6-v2`
- License: Apache License 2.0
- License copy: `licenses/TRANSFORMERS_JS_LICENSE.txt`

No component listed here receives journal content over a network. The bundled
runtime is configured with remote model loading disabled.
