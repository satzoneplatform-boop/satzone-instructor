import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { AlertCircle, Loader2 } from "lucide-react";
import { mintCoursePreviewPlayback, mintLessonPlayback } from "../api/playback";
import type { LessonPlaybackResponse } from "../api/types";
import { ApiError } from "../api/client";

type Source =
  | { kind: "lesson"; lessonId: string }
  | { kind: "preview"; slug: string }
  | { kind: "url"; url: string };

/**
 * Plays an instructor's lesson or course-preview video. Mints a short-lived
 * playback token from the backend, then drives hls.js (or native HLS on Safari).
 * Refreshes the token automatically when the player reports an HLS error
 * (typical causes: IP change or token expiry).
 */
export function HLSPlayer({ source, posterUrl, controls = true }: { source: Source; posterUrl?: string; controls?: boolean }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "pending" | "error">("loading");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let pollTimer: number | null = null;

    function attachDirect(videoUrl: string) {
      const video = videoRef.current;
      if (!video || cancelled) return;
      if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }

      // Show controls immediately while the browser fetches the first bytes.
      // If loading fails (expired token, 4xx, network), the error event fires
      // and we surface a message instead of silently showing a black rectangle.
      const onErr = () => {
        if (cancelled) return;
        const code = video.error?.code;
        const msg =
          code === MediaError.MEDIA_ERR_NETWORK ? "Network error — check your connection."
          : code === MediaError.MEDIA_ERR_DECODE  ? "Video format not supported."
          : "Couldn't load the video. Try refreshing the page.";
        setState("error");
        setMessage(msg);
      };
      video.addEventListener("error", onErr, { once: true });
      video.src = videoUrl;
      setState("ready");
    }

    async function attachHls(streamUrl: string) {
      const video = videoRef.current;
      if (!video || cancelled) return;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        // Safari: native HLS.
        video.src = streamUrl;
        setState("ready");
        return;
      }

      if (Hls.isSupported()) {
        if (hlsRef.current) { hlsRef.current.destroy(); }
        const hls = new Hls();
        hlsRef.current = hls;
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          if (!cancelled) setState("ready");
        });
        hls.on(Hls.Events.ERROR, (_e, data) => {
          if (data.fatal) {
            setMessage("Reconnecting…");
            setTimeout(() => { if (!cancelled) loadOnce(); }, 400);
          }
        });
        return;
      }

      setState("error");
      setMessage("HLS playback isn't supported in this browser.");
    }

    async function loadOnce() {
      if (cancelled) return;
      setMessage(null);
      try {
        if (source.kind === "url") {
          // preview_playback_url / playback_url from the admin API returns a
          // direct video stream (range-based), NOT an HLS manifest. Use native
          // <video src> unless the URL explicitly points to a .m3u8 file.
          const isHls = /\.m3u8(\?|$)/i.test(source.url);
          if (isHls) await attachHls(source.url);
          else attachDirect(source.url);
        } else if (source.kind === "preview") {
          const r = await mintCoursePreviewPlayback(source.slug);
          await attachHls(r.stream_url);
        } else {
          const r: LessonPlaybackResponse = await mintLessonPlayback(source.lessonId);
          if (r.hls_status !== "ready" || !r.hls_url) {
            setState("pending");
            setMessage(r.hls_status === "failed" ? "Encoding failed. Re-upload the video." : "Encoding… this can take a minute.");
            if (r.hls_status === "pending") {
              pollTimer = window.setTimeout(loadOnce, 5000);
            }
            return;
          }
          await attachHls(r.hls_url);
        }
      } catch (e) {
        if (cancelled) return;
        setState("error");
        if (e instanceof ApiError) {
          if (e.code === "not_enrolled") setMessage("You need to enroll to watch this lesson.");
          else if (e.code === "course_preview_missing") setMessage("No preview video on this course yet.");
          else if (e.code === "course_not_published") setMessage("Preview available after publishing.");
          else if (e.code === "lesson_video_missing") setMessage("This lesson has no video yet.");
          else setMessage(e.message);
        } else {
          setMessage("Couldn't load the video.");
        }
      }
    }

    loadOnce();

    return () => {
      cancelled = true;
      if (pollTimer) window.clearTimeout(pollTimer);
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [source.kind, source.kind === "lesson" ? source.lessonId : "", source.kind === "preview" ? source.slug : "", source.kind === "url" ? source.url : ""]);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
      <video
        ref={videoRef}
        controls={controls}
        playsInline
        poster={posterUrl}
        className="h-full w-full bg-black"
      />
      {state !== "ready" && (
        <div className="absolute inset-0 grid place-items-center bg-black/60 text-center text-white">
          <div className="flex flex-col items-center gap-2">
            {state === "error" ? (
              <AlertCircle size={28} />
            ) : (
              <Loader2 size={28} className="animate-spin" />
            )}
            <p className="text-[13px]">{message ?? (state === "pending" ? "Processing…" : "Loading…")}</p>
          </div>
        </div>
      )}
    </div>
  );
}
