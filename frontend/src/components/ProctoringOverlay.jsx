import { useEffect, useRef } from "react";
import { createDetector } from "../lib/deviceDetector";
import { deviceLabel } from "../lib/devices";

const FRAME_WIDTH = 480; // frames are downscaled before detection: 4x cheaper than full HD
const DETECT_INTERVAL_MS = 350; // ~3 detections per second is plenty for a sustained-presence rule
const VIOLATION_WINDOW_MS = 4000;
const VIOLATION_HITS = 5; // positive frames of the same device inside the window
const SMOOTHING = 0.4; // how fast a box chases the latest detection (per animation frame)
const MAX_AGE_MS = 800; // a box fades out when its device has not been seen for this long
const MATCH_DISTANCE = 0.3; // fraction of the frame width within which a detection continues a box

/** maps video pixels to the rendered area of the <video>, honouring object-fit */
function renderedArea(element, videoWidth, videoHeight) {
  const box = element.getBoundingClientRect();
  const scale =
    getComputedStyle(element).objectFit === "cover"
      ? Math.max(box.width / videoWidth, box.height / videoHeight)
      : Math.min(box.width / videoWidth, box.height / videoHeight);

  return {
    scale,
    left: box.left + (box.width - videoWidth * scale) / 2,
    top: box.top + (box.height - videoHeight * scale) / 2,
  };
}

/**
 * Watches the candidate's camera and draws red boxes that follow prohibited devices.
 * It owns the whole detection loop: nothing here is React state, so a detection (several per
 * second) never re-renders the call UI. Only `onStatus` (rare) and `onViolation` reach the parent.
 *
 * @param {object} props
 * @param {MediaStream} props.stream  the candidate's camera
 * @param {React.RefObject<HTMLElement>} props.containerRef  area that contains the video tile
 * @param {(status: "loading"|"active"|"error") => void} props.onStatus
 * @param {(violation: {device: string, score: number}) => void} props.onViolation
 */
function ProctoringOverlay({ stream, containerRef, onStatus, onViolation }) {
  const canvasRef = useRef(null);
  const callbacks = useRef({ onStatus, onViolation });

  useEffect(() => {
    callbacks.current = { onStatus, onViolation };
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || !stream) return;

    const context = canvas.getContext("2d");
    const detector = createDetector();

    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.srcObject = stream;
    video.play().catch(() => {});

    const frameCanvas = document.createElement("canvas");
    const frameContext = frameCanvas.getContext("2d", { willReadFrequently: true });

    const tracks = [];
    const hits = []; // { at, label, score }
    let videoSize = { width: 0, height: 0 };
    let detectTimer;
    let drawing = 0;
    let disposed = false;

    // ---------- drawing: runs only while there is something to show ----------
    const draw = () => {
      drawing = 0;
      const bounds = container.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;

      if (canvas.width !== Math.round(bounds.width * ratio) || canvas.height !== Math.round(bounds.height * ratio)) {
        canvas.width = Math.round(bounds.width * ratio);
        canvas.height = Math.round(bounds.height * ratio);
      }
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, bounds.width, bounds.height);

      const now = performance.now();
      for (let i = tracks.length - 1; i >= 0; i -= 1) {
        if (now - tracks[i].seen > MAX_AGE_MS) tracks.splice(i, 1);
      }

      const element = [...container.querySelectorAll("video")].find((v) => v.srcObject === stream);

      if (element && videoSize.width) {
        const area = renderedArea(element, videoSize.width, videoSize.height);

        tracks.forEach((track) => {
          const { current, target } = track;
          current.x += (target.x - current.x) * SMOOTHING;
          current.y += (target.y - current.y) * SMOOTHING;
          current.w += (target.w - current.w) * SMOOTHING;
          current.h += (target.h - current.h) * SMOOTHING;

          const x = area.left - bounds.left + current.x * area.scale;
          const y = area.top - bounds.top + current.y * area.scale;
          const w = current.w * area.scale;
          const h = current.h * area.scale;

          context.globalAlpha = Math.min(1, (MAX_AGE_MS - (now - track.seen)) / 300);
          context.fillStyle = "rgba(239, 68, 68, 0.14)";
          context.fillRect(x, y, w, h);
          context.lineWidth = 3;
          context.strokeStyle = "#ef4444";
          context.strokeRect(x, y, w, h);

          // the device name sits inside the rectangle, top-left
          const text = `${deviceLabel(track.label)} ${Math.round(track.score * 100)}%`;
          context.font = "700 14px ui-sans-serif, system-ui, sans-serif";
          const labelWidth = Math.min(context.measureText(text).width + 16, Math.max(w - 3, 0));
          const labelHeight = Math.min(26, Math.max(h - 3, 0));

          if (labelWidth > 24 && labelHeight > 14) {
            context.fillStyle = "#ef4444";
            context.fillRect(x + 1.5, y + 1.5, labelWidth, labelHeight);
            context.fillStyle = "#fff";
            context.fillText(text, x + 9, y + 1.5 + labelHeight / 2 + 5);
          }
          context.globalAlpha = 1;
        });
      }

      if (tracks.length && !disposed) drawing = requestAnimationFrame(draw);
    };

    const scheduleDraw = () => {
      if (!drawing && !disposed) drawing = requestAnimationFrame(draw);
    };

    // ---------- tracking: continue the box of the same device or start a new one ----------
    const track = (detection) => {
      const [x, y, w, h] = detection.bbox;
      const cx = x + w / 2;
      const cy = y + h / 2;
      const limit = videoSize.width * MATCH_DISTANCE;
      const now = performance.now();

      let match = null;
      let best = Infinity;

      tracks.forEach((candidate) => {
        const distance = Math.hypot(candidate.target.cx - cx, candidate.target.cy - cy);
        if (candidate.label === detection.label && distance < limit && distance < best) {
          match = candidate;
          best = distance;
        }
      });

      if (match) {
        match.target = { x, y, w, h, cx, cy };
        match.score = detection.score;
        match.seen = now;
      } else {
        tracks.push({
          label: detection.label,
          score: detection.score,
          target: { x, y, w, h, cx, cy },
          current: { x, y, w, h },
          seen: now,
        });
      }
    };

    // ---------- detection loop ----------
    const tick = async () => {
      if (disposed) return;

      const ready = video.readyState >= 2 && video.videoWidth > 0 && !document.hidden;

      if (ready) {
        try {
          videoSize = { width: video.videoWidth, height: video.videoHeight };
          frameCanvas.width = FRAME_WIDTH;
          frameCanvas.height = Math.round((FRAME_WIDTH * video.videoHeight) / video.videoWidth);
          frameContext.drawImage(video, 0, 0, frameCanvas.width, frameCanvas.height);

          const frame = frameContext.getImageData(0, 0, frameCanvas.width, frameCanvas.height);
          const scale = video.videoWidth / frameCanvas.width;
          const detections = await detector.detect(frame);
          if (disposed) return;

          // boxes come back in the downscaled frame; bring them to video pixels
          const now = Date.now();
          detections.forEach((d) => {
            const full = { ...d, bbox: d.bbox.map((n) => n * scale) };
            track(full);
            hits.push({ at: now, label: d.label, score: d.score });
          });

          while (hits.length && now - hits[0].at > VIOLATION_WINDOW_MS) hits.shift();

          // the same device in enough frames of the last seconds: a real violation, not a glitch
          for (const label of new Set(hits.map((h) => h.label))) {
            const same = hits.filter((h) => h.label === label);

            if (same.length >= VIOLATION_HITS) {
              const score = Math.max(...same.map((h) => h.score));
              hits.length = 0;
              callbacks.current.onViolation({ device: label, score });
              break;
            }
          }

          if (tracks.length) scheduleDraw();
        } catch (error) {
          if (!disposed) {
            console.error("Device detection failed", error);
            callbacks.current.onStatus("error");
          }
          return;
        }
      }

      detectTimer = setTimeout(tick, DETECT_INTERVAL_MS);
    };

    callbacks.current.onStatus("loading");
    detector.ready
      .then(() => {
        if (disposed) return;
        callbacks.current.onStatus("active");
        tick();
      })
      .catch((error) => {
        console.error("Could not load the detection model", error);
        if (!disposed) callbacks.current.onStatus("error");
      });

    return () => {
      disposed = true;
      clearTimeout(detectTimer);
      cancelAnimationFrame(drawing);
      detector.dispose();
      video.pause();
      video.srcObject = null;
      context.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [stream, containerRef]);

  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 z-20 size-full" aria-hidden="true" />;
}

export default ProctoringOverlay;
