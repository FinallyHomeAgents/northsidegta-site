import React, { useMemo } from "react";
import { Helmet } from "react-helmet-async";
import HeaderShell from "../HeaderShell";
import CommunityComplianceFooter from "../CommunityComplianceFooter";
import MARKET_DATA from "../../data/marketData.json";
import "./MovingFromTorontoPage.css";

const { getMarketTrend } = require("../../utils/marketTrend");

const QUIZ_URL = "/buyers#town-match";
const WHATSAPP_URL = "https://wa.me/16476684646";

function marketValue(value) {
  if (typeof value === "number") {
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
      maximumFractionDigits: 0,
    }).format(value);
  }
  return value;
}

function MarketStat({ label, value, marketKey, className = "" }) {
  return (
    <article className={`moving-guide__stat ${className}`.trim()}>
      <strong data-market={marketKey}>{value}</strong>
      <span>{label}</span>
    </article>
  );
}

function BudgetBuyCard({ content }) {
  return (
    <aside className="moving-guide__budget-card" aria-labelledby="moving-guide-budget-heading">
      <div>
        <p className="moving-guide__eyebrow">The $800K comparison</p>
        <h3 id="moving-guide-budget-heading">{content.heading}</h3>
        <p>{content.body}</p>
      </div>
      <img
        src="/assets/town-logos/georgina.webp"
        alt=""
        aria-hidden="true"
        width="108"
        height="108"
        loading="lazy"
      />
    </aside>
  );
}

export default function MovingFromTorontoPage({ content, buildSchema }) {
  const schema = useMemo(() => buildSchema(content), [buildSchema, content]);
  const canonical = `https://northsidegta.ca${content.route}`;
  const markets = MARKET_DATA.municipalities;
  const georgina = markets.georgina;
  const comparisonTowns = ["georgina", "newmarket", "aurora"];
  const toronto = MARKET_DATA.toronto || {};
  const showTorontoComparison =
    toronto.condoAverage != null && toronto.detachedAverage != null;
  const georginaTrend = getMarketTrend(georgina.yearOverYear);

  return (
    <>
      <Helmet>
        <title>{content.title}</title>
        <meta name="description" content={content.description} />
        <meta name="author" content="Matthew Mulhall" />
        <meta name="publisher" content="Finally Home Agents" />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content={content.title} />
        <meta property="og:description" content={content.description} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={`https://northsidegta.ca${content.heroImage}`} />
        <meta property="og:image:alt" content={content.heroImageAlt} />
        <meta property="og:locale" content="en_CA" />
        <meta property="og:site_name" content="NorthSide GTA" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={content.title} />
        <meta name="twitter:description" content={content.description} />
        <meta name="twitter:image" content={`https://northsidegta.ca${content.heroImage}`} />
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      </Helmet>

      <HeaderShell />

      <main className="moving-guide">
        <header className="moving-guide__hero">
          <img
            className="moving-guide__hero-image"
            src={content.heroImage}
            alt={content.heroImageAlt}
            loading="eager"
          />
          <div className="moving-guide__hero-shade" aria-hidden="true" />
          <div className="moving-guide__container moving-guide__hero-content">
            <nav className="moving-guide__breadcrumbs" aria-label="Breadcrumb">
              <a href="/">Home</a>
              <span aria-hidden="true">›</span>
              <a href="/buyers">Moving North</a>
              <span aria-hidden="true">›</span>
              <span>{content.town}</span>
            </nav>
            <div className="moving-guide__hero-badge">
              <img
                src={content.badgeImage}
                alt={content.badgeImageAlt}
                width="58"
                height="58"
              />
              <p>{content.kicker}</p>
            </div>
            <h1>{content.heading}</h1>
            <p className="moving-guide__hero-intro">{content.intro}</p>
            <p className="moving-guide__byline">
              By Matthew Mulhall, Finally Home Agents · Updated{" "}
              <span data-market="lastUpdated">{MARKET_DATA.period}</span>
            </p>
            <div className="moving-guide__hero-actions">
              <a className="moving-guide__button moving-guide__button--gold" href={QUIZ_URL}>
                Take the Town Match Quiz
              </a>
              <a className="moving-guide__button moving-guide__button--light" href="/communities/georgina">
                Full Georgina community profile
              </a>
            </div>
            <p className="moving-guide__source moving-guide__source--hero">
              Source: {MARKET_DATA.source} · {MARKET_DATA.homeType}
            </p>
          </div>
        </header>

        <div className="moving-guide__container moving-guide__body">
          <section className="moving-guide__section" aria-labelledby="moving-guide-money-heading">
            <p className="moving-guide__eyebrow">Toronto budget, Georgina space</p>
            <h2 id="moving-guide-money-heading">What your Toronto money buys in Georgina</h2>
            <div className="moving-guide__stats" aria-label={`${MARKET_DATA.period} Georgina market snapshot`}>
              <MarketStat
                label="Average sale price"
                value={georgina.averageSalePrice}
                marketKey="georgina.averageSold"
              />
              <MarketStat
                label="Sales count"
                value={georgina.salesCount}
                marketKey="georgina.salesCount"
              />
              <MarketStat
                label="Avg. LDOM"
                value={`${georgina.avgLdom} days`}
                marketKey="georgina.daysOnMarket"
              />
              <MarketStat
                label="Year over year"
                value={georginaTrend.label}
                marketKey="georgina.yearOverYear"
                className={`moving-guide__stat--${georginaTrend.direction}`}
              />
            </div>
            <p className="moving-guide__source">
              {MARKET_DATA.period} · Source: {MARKET_DATA.source} · {MARKET_DATA.homeType}
            </p>
            {showTorontoComparison ? (
              <p data-market="toronto.comparison">
                The average Toronto condo now sells for {marketValue(toronto.condoAverage)}, and a
                detached averages {marketValue(toronto.detachedAverage)} (TRREB).
              </p>
            ) : null}
            <p>
              In practical terms, the price of a modest Toronto condo puts a detached house with a
              yard within reach in Keswick — and waterfront-area living within reach for less than
              a Toronto semi.
            </p>
            <BudgetBuyCard content={content.budgetCard} />
          </section>

          <aside className="moving-guide__callout" aria-label="Toronto land transfer tax comparison">
            <div className="moving-guide__callout-mark" aria-hidden="true">$</div>
            <p>
              <strong>The number Toronto buyers forget:</strong> leaving Toronto means no municipal
              land transfer tax. On a $770,000 purchase, that's roughly{" "}
              <strong>$11,500 staying in your pocket</strong> — Toronto is the only municipality in
              Ontario that charges a second land transfer tax on top of the provincial one.
            </p>
          </aside>

          <section className="moving-guide__section" aria-labelledby="moving-guide-communities-heading">
            <p className="moving-guide__eyebrow">Choose your corner of the lake</p>
            <h2 id="moving-guide-communities-heading">Keswick, Sutton, or Jackson's Point?</h2>
            <p>Georgina isn't one place — choosing your corner of it is the real decision.</p>
            <figure className="moving-guide__feature-image">
              <img
                src={content.communityImage}
                alt={content.communityImageAlt}
                loading="lazy"
              />
            </figure>
            <div className="moving-guide__town-grid">
              {content.communities.map(({ heading, body }) => (
                <article className="moving-guide__town-card" key={heading}>
                  <h3>{heading}</h3>
                  <p>{body}</p>
                </article>
              ))}
            </div>
            <p className="moving-guide__aside-copy">
              Also worth knowing: Pefferlaw and Udora for rural properties and acreage.
            </p>
            <div className="moving-guide__mini-cta">
              <p>
                <strong>Not sure which corner fits you?</strong> Tell us your budget and lifestyle
                — we'll tell you where to look (and where not to).
              </p>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                Ask us on WhatsApp →
              </a>
            </div>
          </section>

          <section className="moving-guide__section" aria-labelledby="moving-guide-family-heading">
            <p className="moving-guide__eyebrow">Life beyond the listing</p>
            <h2 id="moving-guide-family-heading">Raising kids in Georgina</h2>
            <p>This is the question behind most moves north, so here's the real picture.</p>
            <div className="moving-guide__family-grid">
              {content.familyCards.map(({ icon, heading, body }) => (
                <article className="moving-guide__family-card" key={heading}>
                  <span className="moving-guide__family-icon" aria-hidden="true">{icon}</span>
                  <h3>{heading}</h3>
                  <p>{body}</p>
                </article>
              ))}
            </div>
            <p className="moving-guide__lifestyle-link">
              Looking for the places locals actually eat?{" "}
              <a href="/tastehub?town=georgina">Explore Georgina on TasteHub →</a>
            </p>
          </section>

          <section className="moving-guide__section moving-guide__commute" aria-labelledby="moving-guide-commute-heading">
            <p className="moving-guide__eyebrow">The trade-off to pressure-test</p>
            <h2 id="moving-guide-commute-heading">The honest commute</h2>
            <p>We won't sugar-coat this — Georgina is a commitment if you work downtown daily.</p>
            <div className="moving-guide__commute-grid">
              <article>
                <h3>Driving</h3>
                <p>
                  Highway 404 now reaches the edge of Keswick, making it highway nearly
                  door-to-door. Plan on roughly an hour to north Toronto in normal traffic, more
                  to the downtown core at peak.
                </p>
              </article>
              <article>
                <h3>GO Transit</h3>
                <p>
                  No train station in Georgina itself. The GO 67 Keswick–North York bus runs down
                  the 404 corridor, and the nearest train stations are East Gwillimbury GO and
                  Newmarket GO — about 20–25 minutes' drive from Keswick, with all-day service to
                  Union.
                </p>
              </article>
            </div>
            <div className="moving-guide__callout moving-guide__callout--inside">
              <p>
                <strong>The honest read:</strong> Georgina works best for hybrid workers, people
                working anywhere in York Region or north Toronto, and anyone whose office days are
                2–3 per week. Downtown five days a week? Let's talk honestly about whether East
                Gwillimbury or Newmarket fits better — that conversation is literally what we do.
              </p>
            </div>
          </section>

          <section className="moving-guide__section" aria-labelledby="moving-guide-market-heading">
            <p className="moving-guide__eyebrow">Three-town comparison</p>
            <div className="moving-guide__section-heading-row">
              <h2 id="moving-guide-market-heading">Georgina market snapshot</h2>
              <a href="/neighbourhood-guide">Compare all seven towns →</a>
            </div>
            <div className="moving-guide__table-wrap">
              <table>
                <caption>
                  {MARKET_DATA.period} {MARKET_DATA.homeType} market snapshot
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Metric</th>
                    {comparisonTowns.map((slug) => (
                      <th scope="col" key={slug}>{markets[slug].name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">Average sale price</th>
                    {comparisonTowns.map((slug) => (
                      <td data-market={`${slug}.averageSold`} key={slug}>
                        {markets[slug].averageSalePrice}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <th scope="row">Sales count</th>
                    {comparisonTowns.map((slug) => (
                      <td data-market={`${slug}.salesCount`} key={slug}>
                        {markets[slug].salesCount}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <th scope="row">Avg. LDOM</th>
                    {comparisonTowns.map((slug) => (
                      <td data-market={`${slug}.daysOnMarket`} key={slug}>
                        {markets[slug].avgLdom}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <th scope="row">Change YoY</th>
                    {comparisonTowns.map((slug) => {
                      const trend = getMarketTrend(markets[slug].yearOverYear);
                      return (
                        <td
                          className={`moving-guide__trend moving-guide__trend--${trend.direction}`}
                          data-market={`${slug}.yearOverYear`}
                          key={slug}
                        >
                          {trend.label}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="moving-guide__source">
              <span data-market="lastUpdated">{MARKET_DATA.period}</span> · Source:{" "}
              {MARKET_DATA.source} · {MARKET_DATA.homeType}
            </p>
            <p>
              Georgina is the lowest-priced town in the NorthSide GTA — the affordability gap
              versus Newmarket and Aurora is why so many Toronto movers start their search here.
            </p>
          </section>

          <aside className="moving-guide__review" aria-label="Client review">
            <div className="moving-guide__stars" aria-label="5 out of 5 stars">★★★★★</div>
            <blockquote>
              “What really stood out was that Matt understood our priorities as a family and
              ensured that these priorities were held in high regard throughout the whole process.”
            </blockquote>
            <p>Larissa Halko · Buyer &amp; Seller · Google Reviews (5.0 rating)</p>
          </aside>

          <section className="moving-guide__cta" aria-labelledby="moving-guide-cta-heading">
            <p className="moving-guide__eyebrow">Two minutes, no pressure</p>
            <h2 id="moving-guide-cta-heading">Is Georgina right for you?</h2>
            <p>
              Not sure whether Georgina, East Gwillimbury, or somewhere else north fits your family
              best? That's exactly what our Town Match Quiz figures out — two minutes, no contact
              info required to see your result.
            </p>
            <div className="moving-guide__cta-actions">
              <a className="moving-guide__button moving-guide__button--gold" href={QUIZ_URL}>
                Take the Town Match Quiz →
              </a>
              <a
                className="moving-guide__button moving-guide__button--whatsapp"
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp Matthew &amp; Landon
              </a>
              <a className="moving-guide__button moving-guide__button--outline" href="/contact">
                Contact Finally Home Agents
              </a>
            </div>
            <p className="moving-guide__cta-note">
              No spam. No pressure. Regulated by RECO · HomeLife Optimum Realty, Brokerage.
            </p>
          </section>

          <section className="moving-guide__section moving-guide__faq" aria-labelledby="moving-guide-faq-heading">
            <p className="moving-guide__eyebrow">Straight answers</p>
            <h2 id="moving-guide-faq-heading">Frequently asked questions</h2>
            <div className="moving-guide__faq-list">
              {content.faqs.map(({ question, answer }, index) => (
                <details key={question} open={index === 0 ? true : undefined}>
                  <summary>{question}</summary>
                  <p>{answer}</p>
                </details>
              ))}
            </div>
          </section>
        </div>

      </main>

      <CommunityComplianceFooter />
    </>
  );
}
