// Runs the object-detection model off the main thread so the call UI never freezes while the
// network thinks. Frames come in as raw RGBA buffers and results go back as plain objects.
import * as tf from "@tensorflow/tfjs";
import * as cocoSsd from "@tensorflow-models/coco-ssd";

let model;

async function init() {
  // WebGL (via OffscreenCanvas) is the fastest; the CPU backend is the safety net
  let backend = "cpu";
  try {
    if (await tf.setBackend("webgl")) backend = "webgl";
  } catch {
    // fall through to cpu
  }
  if (backend === "cpu") await tf.setBackend("cpu");

  await tf.ready();
  model = await cocoSsd.load({ base: "mobilenet_v2" });

  return backend;
}

self.onmessage = async ({ data }) => {
  try {
    if (data.type === "init") {
      self.postMessage({ type: "ready", backend: await init() });
    } else if (data.type === "detect") {
      const frame = new ImageData(new Uint8ClampedArray(data.buffer), data.width, data.height);
      const predictions = await model.detect(frame, 10, data.minScore);

      self.postMessage({
        type: "result",
        id: data.id,
        frameWidth: data.width,
        frameHeight: data.height,
        predictions: predictions.map(({ class: label, score, bbox }) => ({ label, score, bbox })),
      });
    }
  } catch (error) {
    self.postMessage({ type: "error", id: data.id, message: error.message });
  }
};
