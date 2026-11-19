"use client";

import { variables } from "@/content/lessons/variables";
import ScenePlayer from "./scene/ScenePlayer";

export default function HeroDemo() {
  return (
    <div className="rounded-3xl border border-line bg-surface/70 p-3 shadow-2xl shadow-accent/10 backdrop-blur md:p-4">
      <ScenePlayer scene={variables.scene} autoPlay loop bare />
    </div>
  );
}
