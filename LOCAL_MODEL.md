# Optional local-model pack

Driftlog's deterministic recognizer remains the default and complete offline
experience. A model may enrich ambiguous entries, but it must never become a
requirement for opening, writing, saving, exporting, or rendering a journal.

## Proposed pack

- Runtime: Transformers.js in a dedicated Web Worker
- Candidate: `onnx-community/SmolLM2-135M-Instruct-ONNX-MHA`
- Quantization target: Q4F16 (roughly 118 MB of model weights)
- Input: the current entry only
- Output: strict JSON arrays for `people`, `places`, `things`, and `feelings`
- Merge rule: model suggestions are additions shown for review; deterministic
  results are never silently erased

The model is small by LLM standards, not small by ordinary web standards. It
should therefore ship as an optional downloadable/importable pack rather than
inflating the core single-file journal.

## Offline contract

1. Bundle the Transformers.js runtime and WASM files with the pack.
2. Load weights from a local `models/` directory or a user-selected local pack.
3. Set `env.allowRemoteModels = false`.
4. Run inference in a Web Worker so the constellation remains responsive.
5. Cache only local assets in OPFS/Cache Storage; provide a visible Delete
   local model action.
6. Never send journal text, prompts, errors, or telemetry over the network.
7. If WebGPU/model loading fails, fall back to the built-in recognizer without
   blocking the entry.

## Before shipping

- verify the selected model and runtime licenses
- pin exact model/runtime versions and hashes
- test CPU/WASM fallback on computers without WebGPU
- measure cold load, warm load, peak memory, and extraction latency
- add adversarial tests for malformed JSON and prompt-shaped journal text
