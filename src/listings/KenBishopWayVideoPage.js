import React from "react";

const VIDEO_URL = "https://videos.aryeo.com/listings/019ddebf-9de8-72b6-8fa3-9b09b23b6b0b/a1ab3e4b-7a23-41c0-9dd3-3d74fa97892c.mp4";

export default function KenBishopWayVideoPage() {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <section className="w-full max-w-5xl">
        <h1 className="text-2xl md:text-3xl font-semibold mb-4 text-center">
          45 Ken Bishop Way — Listing Video
        </h1>
        <div className="rounded-xl overflow-hidden shadow-2xl bg-black">
          <video className="w-full h-auto" controls playsInline preload="metadata" aria-label="Listing video for 45 Ken Bishop Way">
            <source src={VIDEO_URL} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </section>
    </main>
  );
}
