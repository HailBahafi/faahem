"use client";

import { useEffect } from "react";
import { ACCOUNT_EVENT, fetchAccount } from "@/lib/account";
import { sameProgress } from "@/lib/mergeProgress";
import { PROGRESS_EVENT, readProgress, writeProgress } from "@/lib/progress";

/**
 * Keeps a signed-in learner's progress the same on every device: on load and after each
 * save it sends this browser's copy, the server merges it with its own (nothing is ever
 * lost), and the merged result comes back into this browser.
 */
export default function ProgressSync() {
  useEffect(() => {
    let signedIn = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let busy = false;

    const push = async () => {
      if (!signedIn || busy) return;
      busy = true;
      try {
        const local = readProgress();
        const r = await fetch("/api/progress", {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ progress: local }),
        });
        if (!r.ok) return;
        const { progress } = await r.json();
        if (!sameProgress(progress, readProgress())) writeProgress(progress);
      } catch {
        // Offline: the next save tries again.
      } finally {
        busy = false;
      }
    };

    const init = async () => {
      const acc = await fetchAccount();
      signedIn = !!acc.user;
      push();
    };
    const onChange = () => {
      clearTimeout(timer);
      timer = setTimeout(push, 800);
    };

    init();
    window.addEventListener(PROGRESS_EVENT, onChange);
    window.addEventListener(ACCOUNT_EVENT, init);
    return () => {
      clearTimeout(timer);
      window.removeEventListener(PROGRESS_EVENT, onChange);
      window.removeEventListener(ACCOUNT_EVENT, init);
    };
  }, []);
  return null;
}
