import React, { useRef } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Award,
  BrainCircuit,
  Check,
  Compass,
  Flag,
  HeartHandshake,
  Home,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";

import Footer from "./Footer";
import HeaderShell from "./components/HeaderShell";
import SmartContactForm from "./components/contact/SmartContactForm";
import { useContactChannels, useContactConfig } from "./components/contact/contactConfig";
import DynamicMetaTags from "./components/seo/DynamicMetaTags";
import { getStaticRouteMeta } from "./components/seo/staticRouteMetaExports";
import { trackEvent } from "./utils/analytics";

const {
  PROFILE_PATH,
  faqEntries,
  buildMatthewProfileSchema,
  buildMatthewProfileMeta,
} = require("./lib/structuredData/matthewProfile");

const profileSchema = buildMatthewProfileSchema();
const routeMeta = getStaticRouteMeta(PROFILE_PATH) || buildMatthewProfileMeta();

const communities = [
  {
    name: "Georgina",
    detail: "Lake Simcoe, more space, family neighbourhoods, and 404 access from Keswick.",
    href: "/communities/georgina",
  },
  {
    name: "East Gwillimbury",
    detail: "Newer communities, larger homes, countryside, Highway 404, and GO access.",
    href: "/communities/east-gwillimbury",
  },
  {
    name: "Newmarket",
    detail: "Main Street character, established neighbourhoods, Southlake, GO, and daily convenience.",
    href: "/communities/newmarket",
  },
  {
    name: "Aurora",
    detail: "Mature streets, parks and trails, schools, GO service, and strong commuter access.",
    href: "/communities/aurora",
  },
  {
    name: "Stouffville",
    detail: "A connected small-town centre, family neighbourhoods, restaurants, and GO service.",
    href: "/communities/stouffville",
  },
  {
    name: "Uxbridge",
    detail: "Trails, local restaurants, golf, ski hills, rural properties, and a genuine town community.",
    href: "/communities/uxbridge",
  },
  {
    name: "Scugog & Port Perry",
    detail: "Lakefront living, a strong downtown, local events, rural space, and waterfront options.",
    href: "/communities/scugog",
  },
];

const discoverySteps = [
  {
    number: "01",
    title: "Start with your real life",
    copy: "We talk about budget, work, commute, family, schools, hobbies, the home itself, and the amenities you actually use.",
  },
  {
    number: "02",
    title: "Compare the honest trade-offs",
    copy: "More space may mean more driving. A GO station may matter more than a larger yard. I help you weigh the differences clearly.",
  },
  {
    number: "03",
    title: "Narrow the map",
    copy: "Instead of treating seven towns as interchangeable, we identify the two or three communities that genuinely fit.",
  },
  {
    number: "04",
    title: "Buy with a plan",
    copy: "We evaluate homes, risks, price, conditions, due diligence, and negotiation in the context of your bigger goal.",
  },
];

const trackProfileClick = (action) => {
  trackEvent("agent_profile_cta_click", {
    route: PROFILE_PATH,
    agent: "Matthew Mulhall",
    action,
  });
};

function Eyebrow({ children, light = false }) {
  return (
    <p
      className={`text-xs font-semibold uppercase tracking-[0.28em] ${
        light ? "text-emerald-200" : "text-emerald-700"
      }`}
    >
      {children}
    </p>
  );
}

export default function MatthewMulhallPage() {
  const formRef = useRef(null);
  const contactConfig = useContactConfig();
  const channels = useContactChannels(contactConfig);
  const whatsappChannel = channels.find((channel) => channel.key === "whatsapp");

  const scrollToForm = (source) => {
    trackProfileClick(source);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-[#f4f3ed] text-[#122019]">
      <HeaderShell />
      <DynamicMetaTags {...routeMeta}>
        <script type="application/ld+json">{JSON.stringify(profileSchema)}</script>
      </DynamicMetaTags>

      <main className="overflow-hidden pb-28 md:pb-0">
        <section className="relative isolate overflow-hidden bg-[#10271b] px-4 py-10 text-white sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <div
            className="absolute inset-0 -z-20 bg-cover bg-center opacity-[0.12]"
            style={{ backgroundImage: "url('/Images/northsidegta-map-bg.jpg')" }}
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_77%_25%,rgba(190,242,100,0.18),transparent_35%),linear-gradient(115deg,rgba(16,39,27,0.98)_25%,rgba(16,39,27,0.82)_70%,rgba(28,69,45,0.92))]"
            aria-hidden="true"
          />

          <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[minmax(0,1.12fr)_minmax(340px,0.72fr)] lg:gap-16">
            <div className="max-w-3xl">
              <nav aria-label="Breadcrumb" className="mb-8 text-sm text-emerald-100/75">
                <ol className="flex flex-wrap items-center gap-2">
                  <li><Link className="transition hover:text-white" to="/">Home</Link></li>
                  <li aria-hidden="true">/</li>
                  <li><Link className="transition hover:text-white" to="/about">About</Link></li>
                  <li aria-hidden="true">/</li>
                  <li aria-current="page" className="text-white">Matthew Mulhall</li>
                </ol>
              </nav>

              <Eyebrow light>Finally Home Agents · NorthSide GTA</Eyebrow>
              <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-[1.02] tracking-[-0.035em] text-white sm:text-5xl lg:text-6xl">
                Matthew Mulhall
                <span className="mt-3 block text-2xl font-medium leading-tight text-emerald-100 sm:text-3xl lg:text-[2.45rem]">
                  NorthSide GTA Real Estate Agent
                </span>
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-emerald-50/90 sm:text-xl">
                I help people moving north from Toronto figure out where they will live best—and help people who already live here make their next move with a clear plan.
              </p>

              <div className="mt-8 flex flex-wrap gap-3 text-sm font-medium text-emerald-50">
                <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 backdrop-blur">Licensed since 2009</span>
                <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 backdrop-blur">#1 Individual Agent · 2023–2025</span>
                <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 backdrop-blur">Keswick local</span>
              </div>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => scrollToForm("hero_start_conversation")}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#b9e769] px-6 py-3 text-base font-semibold text-[#10271b] shadow-[0_16px_40px_rgba(185,231,105,0.2)] transition hover:-translate-y-0.5 hover:bg-[#c9f47a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#10271b]"
                >
                  Start a conversation <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
                <a
                  href="tel:+16476684646"
                  onClick={() => trackProfileClick("hero_call")}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/25 bg-white/5 px-6 py-3 text-base font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <Phone className="h-4 w-4" aria-hidden="true" /> 647-668-4646
                </a>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[430px] lg:mx-0 lg:ml-auto">
              <div className="absolute -inset-5 rounded-[2.6rem] border border-white/10 bg-white/5 blur-sm" aria-hidden="true" />
              <figure className="relative overflow-hidden rounded-[2.25rem] border border-white/15 bg-white/10 p-3 shadow-[0_35px_100px_rgba(0,0,0,0.38)]">
                <img
                  src="/assets/agents/matthew-mulhall-solo-portrait.jpg"
                  alt="Matthew Mulhall, NorthSide GTA real estate agent with Finally Home Agents"
                  width="1122"
                  height="1402"
                  fetchPriority="high"
                  className="aspect-[4/5] w-full rounded-[1.7rem] object-cover"
                />
                <figcaption className="flex items-center justify-between gap-4 px-3 pb-2 pt-4 text-sm text-emerald-50/80">
                  <span>HomeLife Optimum Realty, Brokerage</span>
                  <ShieldCheck className="h-5 w-5 shrink-0 text-[#b9e769]" aria-hidden="true" />
                </figcaption>
              </figure>
              <div className="absolute -bottom-6 -left-3 max-w-[235px] rounded-2xl border border-emerald-900/10 bg-[#f4f3ed] p-4 text-[#173324] shadow-2xl sm:-left-8">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#dff2ba]">
                    <Trophy className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <p className="text-sm font-semibold leading-snug">HomeLife Optimum Realty’s #1 individual agent for three consecutive years</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20">
            <div>
              <Eyebrow>Why I came home</Eyebrow>
              <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.025em] text-[#153722] sm:text-4xl">
                I have lived across the GTA. Coming back changed how I saw this area.
              </h2>
            </div>
            <div className="space-y-5 text-lg leading-8 text-slate-700">
              <p>
                I have lived in Windsor, Richmond Hill, Newmarket, East Gwillimbury, Uxbridge, and now Keswick. After living in different parts of the GTA and outside it, I moved back north and realized how good life here can be.
              </p>
              <p>
                The NorthSide GTA is not one generic market. Every town offers something different. Some people want GO access and established neighbourhoods. Others want a larger yard, a quieter street, trails, golf, lake access, or a community where people know each other. My role is to help you understand those differences before a listing makes the decision for you.
              </p>
              <p>
                I live in Keswick with my wife and our twin toddlers. It is a great place to raise a family, the 404 keeps me connected when I need to head south, traffic in town is minimal, and the sense of community is real.
              </p>
            </div>
          </div>
        </section>

        <section className="border-y border-[#dbe4d5] bg-white px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
            <article className="rounded-[1.75rem] border border-[#dbe4d5] bg-[#f8faf5] p-7">
              <Award className="h-7 w-7 text-[#32610e]" aria-hidden="true" />
              <p className="mt-5 text-3xl font-semibold tracking-tight text-[#153722]">2023 · 2024 · 2025</p>
              <h2 className="mt-2 text-lg font-semibold text-[#153722]">#1 Individual Agent</h2>
              <p className="mt-3 leading-7 text-slate-600">Awarded by HomeLife Optimum Realty for three consecutive years.</p>
            </article>
            <article className="rounded-[1.75rem] border border-[#dbe4d5] bg-[#f8faf5] p-7">
              <Compass className="h-7 w-7 text-[#32610e]" aria-hidden="true" />
              <p className="mt-5 text-3xl font-semibold tracking-tight text-[#153722]">7 communities</p>
              <h2 className="mt-2 text-lg font-semibold text-[#153722]">One honest comparison</h2>
              <p className="mt-3 leading-7 text-slate-600">Local guidance across York and Durham communities north of Toronto.</p>
            </article>
            <article className="rounded-[1.75rem] border border-[#dbe4d5] bg-[#f8faf5] p-7">
              <HeartHandshake className="h-7 w-7 text-[#32610e]" aria-hidden="true" />
              <p className="mt-5 text-3xl font-semibold tracking-tight text-[#153722]">Since 2009</p>
              <h2 className="mt-2 text-lg font-semibold text-[#153722]">Advice before pressure</h2>
              <p className="mt-3 leading-7 text-slate-600">A clear recommendation, including when the right advice is to wait or walk away.</p>
            </article>
          </div>
        </section>

        <section className="px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-6xl">
            <div className="max-w-3xl">
              <Eyebrow>Who I help</Eyebrow>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.025em] text-[#153722] sm:text-4xl">Two starting points. One job: help you make a stronger decision.</h2>
            </div>
            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              <article className="relative overflow-hidden rounded-[2rem] bg-[#173b27] p-8 text-white shadow-xl sm:p-10">
                <div className="absolute right-0 top-0 h-44 w-44 translate-x-12 -translate-y-12 rounded-full bg-[#b9e769]/10" aria-hidden="true" />
                <MapPin className="h-8 w-8 text-[#b9e769]" aria-hidden="true" />
                <h3 className="mt-6 text-2xl font-semibold">Moving north from Toronto</h3>
                <p className="mt-4 leading-7 text-emerald-50/85">You may be able to get more home, a better yard, less traffic, and a different pace without giving up the things that keep your life working. I help you compare value and lifestyle town by town.</p>
                <Link onClick={() => trackProfileClick("audience_moving_guides")} to="/neighbourhood-guide" className="mt-7 inline-flex items-center gap-2 font-semibold text-[#d8ff93] underline decoration-[#d8ff93]/40 underline-offset-4 hover:decoration-[#d8ff93]">Compare the communities <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
              </article>
              <article className="relative overflow-hidden rounded-[2rem] border border-[#d8e1d3] bg-white p-8 shadow-xl shadow-slate-900/5 sm:p-10">
                <Home className="h-8 w-8 text-[#32610e]" aria-hidden="true" />
                <h3 className="mt-6 text-2xl font-semibold text-[#153722]">Already living here</h3>
                <p className="mt-4 leading-7 text-slate-600">You may be selling, buying, upsizing, downsizing, investing, or looking for a very specific opportunity close to the life you already love. I help you price, prepare, search, negotiate, and time the move.</p>
                <Link onClick={() => trackProfileClick("audience_seller_plan")} to="/sellers" className="mt-7 inline-flex items-center gap-2 font-semibold text-[#32610e] underline decoration-[#32610e]/30 underline-offset-4 hover:decoration-[#32610e]">See the seller plan <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
              </article>
            </div>
          </div>
        </section>

        <section className="bg-[#e8eadf] px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
              <div>
                <Eyebrow>Relocation strategy</Eyebrow>
                <h2 className="mt-4 text-3xl font-semibold tracking-[-0.025em] text-[#153722] sm:text-4xl">The right town comes before the right house.</h2>
                <p className="mt-5 text-lg leading-8 text-slate-700">A listing search is more useful after we know what your day-to-day life needs to look like.</p>
              </div>
              <ol className="grid gap-4 sm:grid-cols-2">
                {discoverySteps.map((step) => (
                  <li key={step.number} className="rounded-[1.6rem] border border-[#d3dbc9] bg-[#f8f8f3] p-6">
                    <span className="text-sm font-semibold text-[#4d7627]">{step.number}</span>
                    <h3 className="mt-3 text-xl font-semibold text-[#153722]">{step.title}</h3>
                    <p className="mt-3 leading-7 text-slate-600">{step.copy}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section className="px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-6xl">
            <div className="max-w-3xl">
              <Eyebrow>Local knowledge</Eyebrow>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.025em] text-[#153722] sm:text-4xl">Seven communities. Very different versions of home.</h2>
              <p className="mt-5 text-lg leading-8 text-slate-700">These are starting points, not sales pitches. Every town has trade-offs, and the best choice depends on what matters to you.</p>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {communities.map((community, index) => (
                <Link
                  key={community.name}
                  to={community.href}
                  onClick={() => trackProfileClick(`community_${community.name.toLowerCase().replaceAll(" ", "_")}`)}
                  className={`group rounded-[1.5rem] border border-[#d8e1d3] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-[#9fbd72] hover:shadow-xl hover:shadow-[#32610e]/10 ${index === communities.length - 1 ? "lg:col-span-3" : ""}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-xl font-semibold text-[#153722]">{community.name}</h3>
                    <ArrowRight className="mt-1 h-5 w-5 shrink-0 text-[#6e8c4d] transition group-hover:translate-x-1" aria-hidden="true" />
                  </div>
                  <p className="mt-3 leading-7 text-slate-600">{community.detail}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 pb-20 sm:px-6 lg:px-8 lg:pb-28">
          <div className="mx-auto max-w-6xl overflow-hidden rounded-[2.4rem] bg-[#10271b] text-white shadow-[0_32px_90px_rgba(16,39,27,0.2)]">
            <div className="grid lg:grid-cols-[0.75fr_1.25fr]">
              <div className="bg-[#b9e769] p-8 text-[#10271b] sm:p-10 lg:p-12">
                <Flag className="h-9 w-9" aria-hidden="true" />
                <p className="mt-8 text-sm font-semibold uppercase tracking-[0.24em]">The athlete-agent relationship</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight">You are the principal. I am in your corner.</h2>
              </div>
              <div className="p-8 sm:p-10 lg:p-12">
                <p className="text-lg leading-8 text-emerald-50/90">The idea comes from professional sports. An athlete’s agent understands the goal, protects the athlete’s interests, prepares the strategy, brings the right people together, and handles difficult negotiations. Real estate representation should feel just as committed.</p>
                <ul className="mt-7 grid gap-4 sm:grid-cols-2">
                  {["Your priorities set the strategy", "You hear the honest recommendation", "Risks are raised before they become problems", "Negotiation is prepared, not improvised"].map((item) => (
                    <li key={item} className="flex gap-3 text-emerald-50/85"><Check className="mt-1 h-5 w-5 shrink-0 text-[#b9e769]" aria-hidden="true" /><span>{item}</span></li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-[#dbe4d5] bg-white px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
            <div>
              <Eyebrow>What working together feels like</Eyebrow>
              <blockquote className="mt-5 text-2xl font-medium leading-10 tracking-[-0.015em] text-[#153722] sm:text-3xl sm:leading-[1.45]">
                “The best compliment I receive is that clients never feel like they are just another transaction.”
              </blockquote>
            </div>
            <div className="space-y-5 leading-8 text-slate-700">
              <p>I take the time to understand what clients are really trying to accomplish, including concerns they may not know how to express yet. I stay accessible, explain details clearly, and say what I genuinely think—even when that means advising someone not to buy a particular home or not to accept an offer.</p>
              <p>I want clients to feel they have someone firmly in their corner: thinking ahead, protecting their interests, anticipating problems, and taking responsibility when the process becomes complicated.</p>
              <p>When it is time to negotiate, I am prepared and persistent. When a client needs clarity, I remain calm and direct. My goal is for every client to finish knowing they made a stronger decision because they did not have to make it alone.</p>
            </div>
          </div>
        </section>

        <section className="px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="relative">
              <img
                src="/uploads/sold-home-newmarket-finally-home-agents.webp"
                alt="Representative NorthSide GTA home with a Finally Home Agents sold sign"
                width="1080"
                height="1350"
                loading="lazy"
                className="aspect-[4/3] w-full rounded-[2rem] object-cover shadow-2xl"
              />
              <span className="absolute bottom-4 left-4 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#153722] shadow-lg">The right move can take patience</span>
            </div>
            <div>
              <Eyebrow>A client story</Eyebrow>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.025em] text-[#153722] sm:text-4xl">They loved their neighbourhood. So we waited for the right few streets.</h2>
              <div className="mt-6 space-y-5 text-lg leading-8 text-slate-700">
                <p>A past client told me they loved not just their town, but their exact subdivision. They would only consider leaving if a larger home with a bigger yard became available within a few streets.</p>
                <p>We listened and waited. About a year and a half later, the right home appeared. They made the move and are now happy in a home that gave them more without asking them to give up the community they already loved.</p>
                <p className="font-semibold text-[#2c5520]">Sometimes good representation means acting quickly. Sometimes it means remembering the conversation and being patient.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#173b27] px-4 py-20 text-white sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto grid max-w-6xl items-start gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
            <div>
              <BrainCircuit className="h-10 w-10 text-[#b9e769]" aria-hidden="true" />
              <Eyebrow light>Technology with judgment</Eyebrow>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.025em] sm:text-4xl">How I use AI in real estate</h2>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <article className="rounded-[1.6rem] border border-white/10 bg-white/5 p-6">
                <Sparkles className="h-6 w-6 text-[#b9e769]" aria-hidden="true" />
                <h3 className="mt-4 text-xl font-semibold">For sellers</h3>
                <p className="mt-3 leading-7 text-emerald-50/80">AI can help organize market information, sharpen property positioning, develop stronger content, and distribute that content more effectively.</p>
              </article>
              <article className="rounded-[1.6rem] border border-white/10 bg-white/5 p-6">
                <Users className="h-6 w-6 text-[#b9e769]" aria-hidden="true" />
                <h3 className="mt-4 text-xl font-semibold">For buyers</h3>
                <p className="mt-3 leading-7 text-emerald-50/80">It can help compare communities, organize options, monitor opportunities, and keep a complicated search focused.</p>
              </article>
              <p className="sm:col-span-2 rounded-[1.6rem] bg-[#b9e769] p-6 font-medium leading-7 text-[#10271b]">Technology should improve speed, reach, and quality. It does not replace local knowledge, honest advice, due diligence, or human negotiation.</p>
            </div>
          </div>
        </section>

        <section className="px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-6xl">
            <div className="grid items-end gap-8 lg:grid-cols-2">
              <div>
                <Eyebrow>Life outside real estate</Eyebrow>
                <h2 className="mt-4 text-3xl font-semibold tracking-[-0.025em] text-[#153722] sm:text-4xl">Family, golf, and a community that overlaps with real life.</h2>
              </div>
              <p className="text-lg leading-8 text-slate-700">My wife and our twins are the centre of life at home in Keswick. Golf is where work, friendship, and community often meet.</p>
            </div>
            <div className="mt-10 grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
              <figure className="overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-slate-900/10">
                <img src="/uploads/golf-swing-sunset-mill-run-golf-club-uxbridge.webp" alt="Matthew Mulhall playing golf at sunset at Mill Run Golf Club in Uxbridge" width="1600" height="1186" loading="lazy" className="aspect-[16/10] w-full object-cover" />
                <figcaption className="p-6 leading-7 text-slate-700">I am a member at Mill Run Golf Club in Uxbridge, about a 25-minute drive from home. Finally Home Agents runs the Thursday Night Golf League there with friends and past clients.</figcaption>
              </figure>
              <figure className="overflow-hidden rounded-[2rem] bg-[#e8eadf] shadow-xl shadow-slate-900/10">
                <img src="/uploads/matthew-mulhall-mill-run-cup-champion-uxbridge.webp" alt="Matthew Mulhall holding the Mill Run Cup at Mill Run Golf Club in Uxbridge" width="930" height="1179" loading="lazy" className="aspect-[4/5] w-full object-cover object-top" />
                <figcaption className="p-6 leading-7 text-slate-700">We also hold several Finally Home Agents golf tournaments at Mill Run each year—another way the relationships built through real estate become part of the community around us.</figcaption>
              </figure>
            </div>
          </div>
        </section>

        <section className="bg-white px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.65fr_1.35fr] lg:gap-20">
            <div>
              <Eyebrow>Quick answers</Eyebrow>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.025em] text-[#153722] sm:text-4xl">About working with Matthew</h2>
            </div>
            <div className="divide-y divide-[#dbe4d5] border-y border-[#dbe4d5]">
              {faqEntries.map(({ question, answer }, index) => (
                <details key={question} className="group py-5" open={index === 0}>
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-lg font-semibold text-[#153722] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4d7627]">
                    {question}
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#edf1e8] text-[#32610e] transition group-open:rotate-45" aria-hidden="true">+</span>
                  </summary>
                  <p className="max-w-3xl pb-2 pr-10 pt-4 leading-7 text-slate-600">{answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section id="contact-matthew" className="scroll-mt-32 px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="mx-auto grid max-w-6xl gap-8 rounded-[2.4rem] border border-[#d7e0d2] bg-white p-6 shadow-[0_30px_80px_rgba(31,62,38,0.12)] sm:p-10 lg:grid-cols-[0.72fr_1.28fr] lg:p-12">
            <aside className="rounded-[1.8rem] bg-[#10271b] p-7 text-white sm:p-8">
              <Eyebrow light>No-pressure first conversation</Eyebrow>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight">You do not need to have the whole move figured out.</h2>
              <p className="mt-5 leading-7 text-emerald-50/85">Sometimes the best first step is to move now. Sometimes it is to prepare, wait, or simply start watching the right area. We can figure that out together.</p>
              <div className="mt-8 space-y-4 text-sm">
                <a href="tel:+16476684646" onClick={() => trackProfileClick("contact_call")} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 transition hover:bg-white/10"><Phone className="h-5 w-5 text-[#b9e769]" aria-hidden="true" /><span><strong className="block text-white">Call or text</strong><span className="text-emerald-100/75">647-668-4646</span></span></a>
                <a href="mailto:contact@finallyhomeagents.com?subject=Conversation%20with%20Matthew" onClick={() => trackProfileClick("contact_email")} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 transition hover:bg-white/10"><Mail className="h-5 w-5 text-[#b9e769]" aria-hidden="true" /><span><strong className="block text-white">Email</strong><span className="break-all text-emerald-100/75">contact@finallyhomeagents.com</span></span></a>
              </div>
            </aside>
            <div className="p-1 sm:p-3">
              <SmartContactForm
                config={contactConfig}
                formRef={formRef}
                whatsappChannel={whatsappChannel}
                trackingRoute={PROFILE_PATH}
                sourceLabel="Matthew Mulhall agent profile"
              />
            </div>
          </div>
          <p className="mx-auto mt-6 max-w-5xl text-center text-xs leading-5 text-slate-500">Matthew Mulhall, Sales Representative, Finally Home Agents Team, HomeLife Optimum Realty, Brokerage. Regulated by the Real Estate Council of Ontario under TRESA. Not intended to solicit buyers or sellers currently under contract.</p>
        </section>
      </main>

      <Footer />

      <div className="fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-3 right-20 z-40 rounded-2xl border border-white/15 bg-[#10271b]/95 p-2 shadow-2xl backdrop-blur md:hidden">
        <div className="grid grid-cols-2 gap-2">
          <a href="tel:+16476684646" onClick={() => trackProfileClick("mobile_sticky_call")} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/15 text-sm font-semibold text-white"><Phone className="h-4 w-4" aria-hidden="true" /> Call</a>
          <button type="button" onClick={() => scrollToForm("mobile_sticky_form")} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#b9e769] px-2 text-sm font-semibold text-[#10271b]">Message Matthew</button>
        </div>
      </div>
    </div>
  );
}
