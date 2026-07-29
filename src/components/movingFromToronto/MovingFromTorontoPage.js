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
        <p className="moving-guide__eyebrow">{content.budgetCard.eyebrow}</p>
        <h3 id="moving-guide-budget-heading">{content.budgetCard.heading}</h3>
        <p>{content.budgetCard.body}</p>
      </div>
      <img
        src={content.badgeImage}
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
  const primaryMarket = markets[content.marketKey];
  const comparisonTowns = content.comparisonTowns;
  const toronto = MARKET_DATA.toronto || {};
  const showTorontoComparison =
    toronto.condoAverage != null && toronto.detachedAverage != null;
  const primaryTrend = getMarketTrend(primaryMarket.yearOverYear);

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
              <span data-market="lastUpdated">
                {MARKET_DATA.lastUpdated || MARKET_DATA.period}
              </span>
            </p>
            <div className="moving-guide__hero-actions">
              <a className="moving-guide__button moving-guide__button--gold" href={QUIZ_URL}>
                Take the Town Match Quiz
              </a>
              <a
                className="moving-guide__button moving-guide__button--light"
                href={content.communityProfilePath}
              >
                Full {content.town} community profile
              </a>
            </div>
            <p className="moving-guide__source moving-guide__source--hero">
              Source: {MARKET_DATA.source} · {MARKET_DATA.homeType}
            </p>
          </div>
        </header>

        <div className="moving-guide__container moving-guide__body">
          <section className="moving-guide__section" aria-labelledby="moving-guide-money-heading">
            <p className="moving-guide__eyebrow">{content.money.eyebrow}</p>
            <h2 id="moving-guide-money-heading">{content.money.heading}</h2>
            <div
              className="moving-guide__stats"
              aria-label={`${MARKET_DATA.period} ${content.town} market snapshot`}
            >
              <MarketStat
                label="Average sale price"
                value={primaryMarket.averageSalePrice}
                marketKey={`${content.marketKey}.averageSold`}
              />
              <MarketStat
                label="Sales count"
                value={primaryMarket.salesCount}
                marketKey={`${content.marketKey}.salesCount`}
              />
              <MarketStat
                label="Avg. LDOM"
                value={`${primaryMarket.avgLdom} days`}
                marketKey={`${content.marketKey}.daysOnMarket`}
              />
              <MarketStat
                label="Year over year"
                value={primaryTrend.label}
                marketKey={`${content.marketKey}.yearOverYear`}
                className={`moving-guide__stat--${primaryTrend.direction}`}
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
            <p>{content.money.body}</p>
            <BudgetBuyCard content={content} />
          </section>

          <aside className="moving-guide__callout" aria-label="Toronto land transfer tax comparison">
            <div className="moving-guide__callout-mark" aria-hidden="true">$</div>
            <p>
              <strong>{content.landTransferTax.headline}</strong>{" "}
              {content.landTransferTax.beforeSavings}{" "}
              <strong>{content.landTransferTax.savings}</strong>{" "}
              {content.landTransferTax.afterSavings}
            </p>
          </aside>

          <section className="moving-guide__section" aria-labelledby="moving-guide-communities-heading">
            <p className="moving-guide__eyebrow">{content.communitiesSection.eyebrow}</p>
            <h2 id="moving-guide-communities-heading">{content.communitiesSection.heading}</h2>
            <p>{content.communitiesSection.intro}</p>
            {content.communityImage ? (
              <figure className="moving-guide__feature-image">
                <img
                  src={content.communityImage}
                  alt={content.communityImageAlt}
                  loading="lazy"
                />
              </figure>
            ) : null}
            <div className="moving-guide__town-grid">
              {content.communities.map(({ heading, body }) => (
                <article className="moving-guide__town-card" key={heading}>
                  <h3>{heading}</h3>
                  <p>{body}</p>
                </article>
              ))}
            </div>
            {content.communitiesSection.aside ? (
              <p className="moving-guide__aside-copy">{content.communitiesSection.aside}</p>
            ) : null}
            <div className="moving-guide__mini-cta">
              <p>
                <strong>{content.communitiesSection.miniCtaLead}</strong>{" "}
                {content.communitiesSection.miniCtaBody}
              </p>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                Ask us on WhatsApp →
              </a>
            </div>
          </section>

          <section className="moving-guide__section" aria-labelledby="moving-guide-family-heading">
            <p className="moving-guide__eyebrow">{content.familySection.eyebrow}</p>
            <h2 id="moving-guide-family-heading">{content.familySection.heading}</h2>
            <p>{content.familySection.intro}</p>
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
              {content.familySection.tasteHubLead}{" "}
              <a href={content.tasteHubPath}>{content.familySection.tasteHubLabel}</a>
            </p>
          </section>

          <section className="moving-guide__section moving-guide__commute" aria-labelledby="moving-guide-commute-heading">
            <p className="moving-guide__eyebrow">{content.commute.eyebrow}</p>
            <h2 id="moving-guide-commute-heading">{content.commute.heading}</h2>
            <p>{content.commute.intro}</p>
            <div className="moving-guide__commute-grid">
              {content.commute.items.map(({ heading, body }) => (
                <article key={heading}>
                  <h3>{heading}</h3>
                  <p>{body}</p>
                </article>
              ))}
            </div>
            <div className="moving-guide__callout moving-guide__callout--inside">
              <p>
                <strong>The honest read:</strong> {content.commute.honestRead}
              </p>
            </div>
          </section>

          <section className="moving-guide__section" aria-labelledby="moving-guide-market-heading">
            <p className="moving-guide__eyebrow">{content.marketSection.eyebrow}</p>
            <div className="moving-guide__section-heading-row">
              <h2 id="moving-guide-market-heading">{content.marketSection.heading}</h2>
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
            <p>{content.marketSection.conclusion}</p>
          </section>

          <aside className="moving-guide__review" aria-label="Client review">
            <div className="moving-guide__stars" aria-label="5 out of 5 stars">★★★★★</div>
            <blockquote>“{content.review.quote}”</blockquote>
            <p>{content.review.attribution}</p>
          </aside>

          <section className="moving-guide__cta" aria-labelledby="moving-guide-cta-heading">
            <p className="moving-guide__eyebrow">{content.cta.eyebrow}</p>
            <h2 id="moving-guide-cta-heading">{content.cta.heading}</h2>
            <p>{content.cta.body}</p>
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
