// Prohibited-device detection. The model runs in a Web Worker (see workers/detector.worker.js),
// entirely inside the browser: no video leaves the machine and nothing is recorded.

// COCO label -> minimum confidence. Everything else is ignored: remotes, books and monitors are
// misread as phones all the time, and keyboards/monitors are normal in any workspace.
export const PROHIBITED = {
  "cell phone": 0.6,
  laptop: 0.7,
};

const MODEL_MIN_SCORE = 0.4;

// a real phone/laptop in a webcam frame has a plausible size and shape
const MIN_AREA = 0.004; // of the frame
const MAX_AREA = 0.32;
const MIN_ASPECT = 0.3; // width / height
const MAX_ASPECT = 3.3;

/** keeps only detections that look like a real prohibited device */
export function filterDetections(predictions, frameWidth, frameHeight) {
  const frameArea = frameWidth * frameHeight;

  return predictions
    .filter((p) => {
      if (p.score < (PROHIBITED[p.label] ?? Infinity)) return false;

      const [, , w, h] = p.bbox;
      const area = (w * h) / frameArea;
      const aspect = w / h;

      return area >= MIN_AREA && area <= MAX_AREA && aspect >= MIN_ASPECT && aspect <= MAX_ASPECT;
    })
    .map((p) => ({ ...p, bbox: p.bbox.map((n) => Math.round(n)) }));
}

/**
 * @returns {{
 *   ready: Promise<string>,                       resolves with the TensorFlow backend name
 *   detect: (frame: ImageData) => Promise<{label: string, score: number, bbox: number[]}[]>,
 *   dispose: () => void,
 * }}
 */
export function createDetector() {
  const worker = new Worker(new URL("../workers/detector.worker.js", import.meta.url), { type: "module" });
  const pending = new Map();
  let nextId = 0;
  let resolveReady;
  let rejectReady;

  const ready = new Promise((resolve, reject) => {
    resolveReady = resolve;
    rejectReady = reject;
  });
  ready.catch(() => {}); // an unobserved failure must not surface as an unhandled rejection

  worker.onmessage = ({ data }) => {
    if (data.type === "ready") {
      resolveReady(data.backend);
    } else if (data.type === "result") {
      pending.get(data.id)?.resolve(filterDetections(data.predictions, data.frameWidth ?? 1, data.frameHeight ?? 1));
      pending.delete(data.id);
    } else if (data.type === "error") {
      if (data.id === undefined) rejectReady(new Error(data.message));
      pending.get(data.id)?.reject(new Error(data.message));
      pending.delete(data.id);
    }
  };

  worker.onerror = (event) => rejectReady(new Error(event.message || "Detector worker failed"));
  worker.postMessage({ type: "init" });

  return {
    ready,

    detect(frame) {
      const id = (nextId += 1);

      return new Promise((resolve, reject) => {
        pending.set(id, {
          resolve: (predictions) => resolve(predictions),
          reject,
        });
        worker.postMessage(
          { type: "detect", id, width: frame.width, height: frame.height, buffer: frame.data.buffer, minScore: MODEL_MIN_SCORE },
          [frame.data.buffer]
        );
      });
    },

    dispose() {
      worker.terminate();
      pending.forEach(({ reject }) => reject(new Error("Detector disposed")));
      pending.clear();
    },
  };
}
