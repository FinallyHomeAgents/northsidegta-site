import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowRight, ExternalLink, Instagram, Play } from "lucide-react";
import HeaderShell from "./components/HeaderShell";
import DynamicMetaTags from "./components/seo/DynamicMetaTags";
import { getStaticRouteMeta } from "./components/seo/staticRouteMetaExports";
import snapshot from "./data/mediaSnapshot.json";
import propertyTours from "./data/propertyTourVideos";
import "./MediaPage.css";

const MEDIA_ROUTE_META = getStaticRouteMeta("/media") || {};
const isVideo = (url = "") => /\.(mp4|webm)(\?|#|$)/i.test(url);

const { normalizeMedia } = require("./lib/mediaContent");

function ReelCard({ item, index }) {
  const title = item.title?.trim() || "A moment from the NorthSide";
  return <article className="media-reel">
    <a className="media-reel-cover" href={item.url} target="_blank" rel="noreferrer" aria-label={`Watch ${title} on Instagram (opens in a new tab)`}><Instagram size={28} aria-hidden="true" /><span className="media-reel-number">{String(index + 1).padStart(2, "0")}</span><span className="media-reel-cover-title">{title}</span><span className="media-reel-play"><Play size={17} aria-hidden="true" /> Watch on Instagram <ExternalLink size={14} aria-hidden="true" /></span></a>
    <div className="media-reel-copy"><p className="media-eyebrow">Instagram reel</p><h3>{title}</h3><p>Opens on Instagram</p></div>
  </article>;
}

function PropertyPlayer({ tour }) {
  return <div className="media-tour-player"><a className="media-tour-cover" href={tour.embed} target="_blank" rel="noreferrer" aria-label={`Watch ${tour.title} (opens in a new tab)`}><img src={tour.poster} alt="" loading="lazy" /><span><Play size={24} aria-hidden="true" /><span className="sr-only">Open property film</span></span></a></div>;
}

function FeaturedVideo({ item }) {
  const [failed, setFailed] = useState(false);
  const src = item?.source_url || "";
  const validSrc = src.startsWith("/") && !src.startsWith("//") || /^https:\/\//.test(src);
  if (!validSrc) return null;
  const title = item.title || "NorthSide GTA in motion";
  return <div className="media-feature">
    <div className="media-feature-frame">
      {isVideo(src) ? <video key={src} controls playsInline preload="none" poster={item.poster_url || undefined} onError={() => setFailed(true)} aria-label={title}><source src={src} />Your browser cannot play this video. Use the link below to open it.</video> : <a className="media-feature-external" href={src} target="_blank" rel="noreferrer"><Play size={38} aria-hidden="true" /><span>Watch {title}</span><ExternalLink size={18} aria-hidden="true" /></a>}
    </div>
    <div className="media-feature-caption"><div><p className="media-eyebrow">Featured film</p><h2>{title}</h2></div><a href={src} target="_blank" rel="noreferrer">Open video <ExternalLink size={15} aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a></div>
    {failed && <p className="media-notice" role="status">The video couldn’t load here. Try opening it directly using the link above.</p>}
  </div>;
}

export default function MediaPage() {
  const [settings, setSettings] = useState(snapshot.settings);
  const [items, setItems] = useState(() => normalizeMedia(snapshot.items));
  const [notice, setNotice] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    const load = async path => {
      const response = await fetch(path, { cache: "no-store", signal: controller.signal });
      if (!response.ok) throw new Error("Media unavailable");
      return response.json();
    };
    Promise.allSettled([load("/content/socials-settings.json"), load("/content/socials.json")]).then(([config, list]) => {
      if (controller.signal.aborted) return;
      const configOk = config.status === "fulfilled" && config.value?.pinned && typeof config.value.pinned === "object";
      const listOk = list.status === "fulfilled" && Array.isArray(list.value?.items);
      if (configOk) setSettings(config.value);
      if (listOk) setItems(normalizeMedia(list.value.items));
      setNotice(!configOk || !listOk);
    });
    return () => controller.abort();
  }, []);
  const featured = settings?.pinned?.enabled !== false ? settings?.pinned : null;
  return <div className="media-page"><HeaderShell /><DynamicMetaTags {...MEDIA_ROUTE_META} /><main>
    <section className="media-hero"><div className="media-wrap media-hero-grid"><div><p className="media-eyebrow">The NorthSide, in motion</p><h1>NorthSide GTA<br />Videos <span>+ Reels</span></h1><p className="media-intro">Get a feel for life north of Toronto.</p><p className="media-description">Step inside homes, explore our communities, and get to know the places and people behind NorthSide GTA.</p><a className="media-button" href="#property-tours">Explore the videos <ArrowDown size={18} aria-hidden="true" /></a><p className="media-credit">Local stories. Real homes. Finally Home Agents.</p></div>{featured?.source_url ? <FeaturedVideo key={featured.source_url} item={featured} /> : <div className="media-hero-note"><Play size={42} aria-hidden="true" /><h2>A closer look at the NorthSide.</h2><p>Start with our property tours and short films below.</p></div>}</div></section>
    <nav className="media-wrap media-section-nav" aria-label="Video sections"><a href="#property-tours">Property tours <ArrowDown size={14} aria-hidden="true" /></a><a href="#reels">Shorts & reels <ArrowDown size={14} aria-hidden="true" /></a><Link to="/sellers">How we market homes <ArrowRight size={14} aria-hidden="true" /></Link></nav>
    <section className="media-wrap media-section" id="property-tours" aria-labelledby="tours-heading"><div className="media-section-heading"><div><p className="media-eyebrow">Inside the homes</p><h2 id="tours-heading">Take a closer look.</h2></div><p>Walkthroughs from our listing work.<br />See the space, the setting, and the details.</p></div><div className="media-tour-grid">{propertyTours.map(tour => <article className="media-tour" key={tour.embed}><PropertyPlayer tour={tour} /><div className="media-tour-copy"><p className="media-eyebrow">{tour.community}</p><h3>{tour.title}</h3><p>{tour.strategy}</p><a href={tour.embed} target="_blank" rel="noreferrer">Open property film <ExternalLink size={15} aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a></div></article>)}</div><p className="media-small">Films open in their original players in a new tab. Featured properties may no longer be available.</p></section>
    <section className="media-reels-section" id="reels" aria-labelledby="reels-heading"><div className="media-wrap media-section"><div className="media-section-heading"><div><p className="media-eyebrow">A little more local</p><h2 id="reels-heading">Short stories. NorthSide life.</h2></div><p>Quick watches from our Instagram library.<br />Watch the full reels on Instagram.</p></div>{notice && <p className="media-notice" role="status">We couldn’t refresh the latest reels. You can still explore our saved selection below.</p>}{items.length ? <div className="media-reel-grid">{items.map((item,index) => <ReelCard key={item.url} item={item} index={index} />)}</div> : <div className="media-empty"><Instagram size={30} aria-hidden="true" /><h3>More local stories are on the way.</h3><p>In the meantime, explore our property films above or find your next community below.</p><Link to="/communities">Explore the communities <ArrowRight size={17} aria-hidden="true" /></Link></div>}<p className="media-small">Reels open in a new tab on Instagram, which may ask you to sign in.</p></div></section>
    <section className="media-wrap media-cta"><div><p className="media-eyebrow">See something that feels like home?</p><h2>Let’s turn inspiration into a plan.</h2><p>Talk to Matthew and Landon about your next move—or how we could present your home.</p></div><Link className="media-button" to="/contact">Start a conversation <ArrowRight size={18} aria-hidden="true" /></Link></section>
    </main><footer className="media-wrap media-footer"><p><strong>Finally Home Agents</strong><br />HomeLife Optimum Realty, Brokerage</p><p>© {new Date().getFullYear()} NorthSide GTA · <Link to="/privacy">Privacy policy</Link><br />Not intended to solicit clients already under contract with a brokerage.</p></footer></div>;
}
