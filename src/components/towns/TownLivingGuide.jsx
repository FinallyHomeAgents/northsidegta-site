import React from "react";
import "./TownLivingGuide.css";

function ImagePlaceholder({ label, ratio = "4:3", alt = "Future community guide photograph placeholder" }) {
  return (
    <figure className="tlg-placeholder" style={{ "--tlg-ratio": ratio.replace(":", " / ") }}>
      <div className="tlg-placeholder__frame" role="img" aria-label={alt}>
        <span>{label}</span>
        <small>{ratio} • future WebP image • lazy-load ready</small>
      </div>
      <figcaption>{alt}</figcaption>
    </figure>
  );
}

function CtaBand({ compact = false }) {
  return <section className={`tlg-cta ${compact ? "tlg-cta--compact" : ""}`} aria-label="Georgina real estate guidance">
    <p>Thinking about moving to Georgina?</p>
    <h2>Get local guidance before you choose a town.</h2>
    <div className="tlg-actions"><a href="/contact">Talk to Matthew & Landon</a><a href="/homeanalysis">Request a Georgina home value estimate</a></div>
  </section>;
}

export default function TownLivingGuide({ guide, relatedTowns }) {
  return <main className="tlg">
    <section className="tlg-hero">
      <div><img className="tlg-town-logo" src={guide.logo} alt="Georgina official municipal logo" width="720" height="300" />
        <p className="tlg-eyebrow">{guide.eyebrow}</p><h1>{guide.title}</h1><p className="tlg-lede">{guide.intro}</p>
        <div className="tlg-actions"><a href="/contact">Talk to Matthew & Landon</a><a href="/homeanalysis">Get a Georgina Home Value Estimate</a></div></div>
      <ImagePlaceholder {...guide.heroPlaceholder} />
    </section>

    <section className="tlg-answer"><p className="tlg-eyebrow">Quick answer</p><h2>Is Georgina a good place to live?</h2><p>Yes — for the right buyer profile. Georgina can be a strong fit for young families, Lake Simcoe lifestyle buyers, retirees and empty nesters, and buyers wanting more space while staying connected to York Region. It may not be ideal if you need a transit-first lifestyle or a very short daily commute.</p></section>

    <section className="tlg-section"><h2>Quick facts about Georgina</h2><div className="tlg-facts">{guide.quickFacts.map(([k,v])=><article key={k}><h3>{k}</h3><p>{v}</p></article>)}</div></section>

    <section className="tlg-section"><h2>Why people move to Georgina</h2><div className="tlg-split"><ImagePlaceholder label="Secondary hero/lifestyle image — Lake Simcoe family lifestyle" ratio="16:9" alt="Family enjoying an outdoor Georgina lifestyle near Lake Simcoe parks and beaches"/><div className="tlg-card-list">{guide.moveReasons.map(([h,t])=><article key={h}><h3>{h}</h3><p>{t}</p></article>)}</div></div></section>

    <section className="tlg-section"><h2>Georgina community breakdown</h2><p className="tlg-section-intro">Georgina is not one single lifestyle. Keswick, Sutton, Jackson’s Point, Pefferlaw, and rural or lake-adjacent pockets attract different buyer profiles.</p><div className="tlg-community-grid">{guide.communities.map((c)=><article key={c.name}><ImagePlaceholder label={c.image} alt={c.alt}/><h3>{c.name}</h3><p>{c.text}</p></article>)}</div></section>
    <CtaBand compact />

    <section className="tlg-section"><h2>Georgina lifestyle gallery</h2><div className="tlg-gallery">{guide.gallery.map((g)=><ImagePlaceholder key={g} label={`${g} image placeholder`} ratio="1:1" alt={`Future photograph showing ${g.toLowerCase()} lifestyle in Georgina, Ontario`}/>)}</div></section>

    <section className="tlg-section tlg-two"><div><h2>Waterfront living in Georgina</h2><p>Lake Simcoe living can mean beaches, boating, fishing, marinas, sunset walks, and year-round lake routines. Buyers should separate vacation expectations from year-round ownership realities and complete careful due diligence.</p><ul><li>Shoreline and conservation considerations</li><li>Septic or well systems where applicable</li><li>Insurance, access, and winter maintenance</li><li>Property-by-property differences in usability and exposure</li></ul></div><ImagePlaceholder label="Lake Simcoe waterfront image" ratio="16:9" alt="Lake Simcoe waterfront property context in Georgina with shoreline and year-round access considerations"/></section>

    <section className="tlg-section"><h2>Golf in Georgina</h2><p className="tlg-section-intro">These course names are included as neutral, editable local reference points. Public access, membership options, and current operations should be verified before publication updates.</p><div className="tlg-golf-grid">{guide.golfCourses.map((course)=><article key={course}><ImagePlaceholder label={`${course} golf image placeholder`} alt={`Future photograph representing ${course} or golf lifestyle near Georgina`} /><h3>{course}</h3><p>Local golf reference; verify current access and program details before adding claims.</p></article>)}</div></section>

    <section className="tlg-section tlg-two"><div><h2>Family life, commuting, schools, and budgets</h2><h3>Family life</h3><p>Families often start in Keswick because of newer subdivisions, everyday amenities, parks, sports, beaches, backyards, and access to Newmarket when larger services are needed.</p><h3>Commuting and access</h3><p>Georgina is a car-first market. Keswick usually offers the strongest access profile because of its relationship to Highway 404. Exact commute expectations should be tested from the specific address and time of day.</p><h3>Schools</h3><p>YRDSB and YCDSB serve the area. Eligibility, French Immersion, and Catholic school options depend on the exact address and should be verified before buying.</p></div><ImagePlaceholder label="Family lifestyle / parks and recreation image" ratio="16:9" alt="Children and parents enjoying parks, sports, and outdoor family life in a Georgina neighbourhood"/></section>

    <section className="tlg-section"><h2>What different budgets may buy in Georgina</h2><div className="tlg-table" role="table" aria-label="Georgina budget expectations"><div role="row"><b>Around $750K</b><span>Often a search for entry detached, townhome alternatives, or homes needing trade-offs depending on market conditions.</span></div><div role="row"><b>Around $1M</b><span>May open more detached family-home options, especially when comparing age, lot, finish level, and location.</span></div><div role="row"><b>Around $1.5M</b><span>Can shift the conversation toward larger, newer, lifestyle, rural, or premium-location properties.</span></div><div role="row"><b>Waterfront properties</b><span>Highly variable; shoreline, condition, access, and due diligence matter as much as bedroom count.</span></div><div role="row"><b>Rural/larger-lot properties</b><span>More space can come with well, septic, maintenance, and commute considerations.</span></div></div></section>
    <CtaBand compact />

    <section className="tlg-section tlg-columns"><article><h2>Things most people do not know</h2><ul><li>Keswick and Sutton/Jackson’s Point attract different buyer profiles.</li><li>Georgina is not only a summer destination.</li><li>Some areas feel family-commuter; others feel lake-lifestyle.</li><li>Newmarket fills many service gaps without needing to live in Newmarket.</li></ul></article><article><h2>Common misconceptions</h2><ul><li>“Georgina is too far.” It depends on your commute pattern and chosen community.</li><li>“It is only for cottage buyers.” Many residents live here year-round.</li><li>“All waterfront homes are comparable.” They are not.</li><li>“You need to leave town for everything.” Everyday amenities are strongest in Keswick.</li></ul></article></section>

    <section className="tlg-section tlg-fit"><h2>Is Georgina right for you?</h2><div><article><h3>Best fit for</h3><p>Families wanting space, Lake Simcoe lifestyle buyers, retirees, empty nesters, golfers, boaters, and buyers comparing value north of Toronto.</p></article><article><h3>May not be ideal for</h3><p>Transit-first buyers, people who need a short daily commute, or buyers who want a dense urban main-street lifestyle at their doorstep.</p></article></div></section>

    <section className="tlg-section"><h2>Community photo project</h2><div className="tlg-gallery tlg-gallery--wide"><ImagePlaceholder label="Community-submitted photo gallery image"/><ImagePlaceholder label="Beach image"/><ImagePlaceholder label="Marina / boating image"/><ImagePlaceholder label="Winter lifestyle image"/></div><p>Have a great Georgina photo? Submit it for possible inclusion in the NorthSide GTA community guide.</p><a className="tlg-text-link" href="/contact">Send a photo idea or local recommendation</a></section>

    <section className="tlg-section"><h2>Related NorthSide GTA guides</h2><div className="tlg-logo-links">{relatedTowns.map((t)=><a href={t.href} key={t.name}><img src={t.logo} alt={`${t.name} official municipal logo`} width="720" height="300" loading="lazy"/><span>{t.name}</span></a>)}</div></section>
    <CtaBand />
  </main>;
}
