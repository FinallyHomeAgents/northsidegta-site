import MARKET_DATA from "./data/marketData.json";

const MARKET_TOWNS = MARKET_DATA.municipalities;

export const HOMEPAGE_MARKUP = String.raw`
<main>

  
  <section class="hero hero--concept" aria-labelledby="hero-heading">
    <div class="hero__grid">

      
      <div class="hero__copy hero-animate">
        <video autoplay loop muted playsinline aria-hidden="true" class="agent-video" poster="/assets/homepage/matthew-landon-northside-gta.jpg" style="filter: brightness(1.15) contrast(1.05);">
          <source src="/assets/homepage/matthew-landon-hero.mp4" type="video/mp4">
          <img src="/assets/homepage/matthew-landon-northside-gta.jpg" alt="" aria-hidden="true" style="filter: brightness(1.15) contrast(1.05);">
        </video>
        <div class="hero__video-overlay hero__video-overlay--side" aria-hidden="true"></div>
        <div class="hero__video-overlay hero__video-overlay--bottom" aria-hidden="true"></div>
        <div class="hero__copy-inner">
          <section class="hero__brand-section" aria-label="NorthSide GTA introduction">
            <span class="hero__eyebrow">NorthSide GTA · Real Estate North of Toronto</span>

            <h1 class="hero__heading" id="hero-heading">
              Welcome to
              <span class="hero__heading-em">NorthSide GTA.</span>
            </h1>

            <p class="hero__intro">
              Discover seven distinct communities—and the one that feels like home.
            </p>

            <div class="hero__ctas" aria-label="Start exploring NorthSide GTA">
              <a class="hero__cta hero__cta--primary" href="#communities">Find your NorthSide <span aria-hidden="true">→</span></a>
              <a class="hero__cta hero__cta--secondary" href="#finally-home-agents">Meet the Finally Home Agents</a>
            </div>
          </section>

          <div class="hero__divider" aria-hidden="true"></div>

          <section class="hero__agents" id="finally-home-agents" aria-label="Meet Finally Home Agents">
            <p class="hero__agents-label">Finally Home Agents</p>
            <div class="hero__agent-names">
              <p><strong>Landon Mulhall</strong><span>Real Estate Agent</span></p>
              <p><strong>Matthew Mulhall</strong><span>Real Estate Agent</span></p>
            </div>
            <p class="hero__agents-attribution">HomeLife Optimum Realty, Brokerage</p>
          </section>

          <div class="hero-badges" aria-label="NorthSide GTA trust signals">
            <a href="https://share.google/GJz2QTQ8GqZIifaNH" target="_blank" rel="noopener" class="hero-badge hero-badge--google" aria-label="5.0 Rating — Google Reviews">
              <span class="hero-badge__icon" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              </span>
              <span class="hero-badge__text"><strong>5.0 Rating</strong><span>Google Reviews</span></span>
            </a>
            <span class="hero-badge">
              <span class="hero-badge__icon" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                  <circle cx="12" cy="9" r="2.5"/>
                </svg>
              </span>
              <span class="hero-badge__text"><strong>7 Communities</strong><span>North of Toronto</span></span>
            </span>
            <span class="hero-badge">
              <span class="hero-badge__icon" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="4" width="18" height="18" rx="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </span>
              <span class="hero-badge__text"><strong>Updated Monthly</strong><span>Market Data</span></span>
            </span>
          </div>
        </div>
      </div>

      
      <div class="hero__map-panel">
        <div class="hero__map-frame editorial-terrain-host" id="northside-map-container">
          <div class="hero__map-title">
            <span>Real estate north of Toronto</span>
            <strong>This is NorthSide GTA.</strong>
          </div>
          <div id="editorial-terrain-map-root" aria-label="Loading the interactive NorthSide GTA map"></div>
          <noscript><img src="/assets/homepage/northside-map.svg" alt="NorthSide GTA communities map" width="1600" height="900"></noscript>
        </div>

        <div class="hero__map-footer" id="map-caption" aria-live="polite">
          NorthSide GTA focus communities · guidance also available in King, Bradford, Vaughan, Richmond Hill, Markham, Pickering, Ajax, Whitby, and Oshawa
        </div>
      </div>

    </div>

    <nav class="focus-community-rail focus-community-rail--full" id="communities" aria-label="Explore NorthSide GTA by community">
      <p class="focus-community-rail__label"><span>Explore by community</span></p>
      <div class="focus-community-rail__track">
        <a class="focus-community-rail__tile" href="/communities/georgina" aria-label="Explore Georgina Real Estate">
          <img class="focus-community-rail__photo" src="/Images/towns/georgina.jpg" alt="" width="640" height="360" loading="eager" decoding="async">
          <span class="focus-community-rail__body"><img class="focus-community-rail__logo" src="/assets/town-logos/georgina.webp" alt="" width="720" height="300"><span><strong>Georgina</strong><small>Lakeside living</small></span><b aria-hidden="true">›</b></span>
        </a>
        <a class="focus-community-rail__tile" href="/communities/east-gwillimbury" aria-label="Explore East Gwillimbury Real Estate">
          <img class="focus-community-rail__photo" src="/Images/towns/east-gwillimbury.jpg" alt="" width="640" height="360" loading="eager" decoding="async">
          <span class="focus-community-rail__body"><img class="focus-community-rail__logo" src="/assets/town-logos/east-gwillimbury.webp" alt="" width="720" height="300"><span><strong>East Gwillimbury</strong><small>Family focused</small></span><b aria-hidden="true">›</b></span>
        </a>
        <a class="focus-community-rail__tile" href="/communities/newmarket" aria-label="Explore Newmarket Real Estate">
          <img class="focus-community-rail__photo" src="/Images/towns/newmarket.jpg" alt="" width="640" height="360" loading="eager" decoding="async">
          <span class="focus-community-rail__body"><img class="focus-community-rail__logo" src="/assets/town-logos/newmarket.webp" alt="" width="720" height="300"><span><strong>Newmarket</strong><small>Urban convenience</small></span><b aria-hidden="true">›</b></span>
        </a>
        <a class="focus-community-rail__tile" href="/communities/aurora" aria-label="Explore Aurora Real Estate">
          <img class="focus-community-rail__photo" src="/Images/towns/aurora.jpg" alt="" width="640" height="360" loading="eager" decoding="async">
          <span class="focus-community-rail__body"><img class="focus-community-rail__logo" src="/assets/town-logos/aurora.webp" alt="" width="720" height="300"><span><strong>Aurora</strong><small>Timeless appeal</small></span><b aria-hidden="true">›</b></span>
        </a>
        <a class="focus-community-rail__tile" href="/communities/stouffville" aria-label="Explore Stouffville Real Estate">
          <img class="focus-community-rail__photo" src="/Images/towns/stouffville.jpg" alt="" width="640" height="360" loading="eager" decoding="async">
          <span class="focus-community-rail__body"><img class="focus-community-rail__logo" src="/assets/town-logos/stouffville.webp" alt="" width="720" height="300"><span><strong>Stouffville</strong><small>Small-town feel</small></span><b aria-hidden="true">›</b></span>
        </a>
        <a class="focus-community-rail__tile" href="/communities/uxbridge" aria-label="Explore Uxbridge Real Estate">
          <img class="focus-community-rail__photo" src="/Images/towns/uxbridge.jpg" alt="" width="640" height="360" loading="eager" decoding="async">
          <span class="focus-community-rail__body"><img class="focus-community-rail__logo" src="/assets/town-logos/uxbridge.webp" alt="" width="720" height="300"><span><strong>Uxbridge</strong><small>Natural beauty</small></span><b aria-hidden="true">›</b></span>
        </a>
        <a class="focus-community-rail__tile" href="/communities/scugog" aria-label="Explore Scugog Real Estate">
          <img class="focus-community-rail__photo" src="/Images/towns/scugog.jpg" alt="" width="640" height="360" loading="eager" decoding="async">
          <span class="focus-community-rail__body"><img class="focus-community-rail__logo" src="/assets/town-logos/scugog.webp" alt="" width="720" height="300"><span><strong>Scugog</strong><small>More to explore</small></span><b aria-hidden="true">›</b></span>
        </a>
      </div>
    </nav>
  </section>

  
  <section class="proof-bar" aria-label="Trust indicators">
    <div class="proof-bar__inner">
      <div class="proof-bar__item">
        <span class="proof-bar__icon proof-bar__icon--gold" aria-hidden>★</span>
        <strong class="proof-bar__value"><span data-counter data-target="5.0" data-decimals="1">5.0</span> Stars</strong>
        <span class="proof-bar__label">Google Rating</span>
      </div>
      <div class="proof-bar__item">
        <span class="proof-bar__icon" aria-hidden>📍</span>
        <strong class="proof-bar__value"><span data-counter data-target="7">7</span></strong>
        <span class="proof-bar__label">Communities Served</span>
      </div>
      <div class="proof-bar__item">
        <span class="proof-bar__icon" aria-hidden>📄</span>
        <strong class="proof-bar__value">Buyers &amp; Sellers</strong>
        <span class="proof-bar__label">Guided North</span>
      </div>
      <div class="proof-bar__item">
        <span class="proof-bar__icon" aria-hidden>👤</span>
        <strong class="proof-bar__value">Finally Home</strong>
        <span class="proof-bar__label">Agents Team</span>
      </div>
      <div class="proof-bar__item">
        <span class="proof-bar__icon" aria-hidden>✓</span>
        <strong class="proof-bar__value">RECO</strong>
        <span class="proof-bar__label">Registered · Licensed</span>
      </div>
    </div>
  </section>

  
  <section class="pathways" aria-label="Buyer and seller pathways">
    <div class="pathways__inner">
      <div class="pathways__grid">

        <div class="pathway pathway--buyers" id="buyers">
          <p class="pathway__eyebrow">For buyers</p>
          <h2 class="pathway__heading">Buying in the NorthSide GTA</h2>
          <p class="pathway__body">Compare towns, understand the local market, and find the community that fits your lifestyle, budget, and next stage.</p>
          <a href="/buyers" class="btn btn--white-on-green">Start Your Buyer Plan <span aria-hidden>→</span></a>
        </div>

        <div class="pathway pathway--sellers" id="sellers">
          <p class="pathway__eyebrow">For sellers</p>
          <h2 class="pathway__heading">Selling in the NorthSide GTA</h2>
          <p class="pathway__body">Get a clear read on your home's value, buyer demand, and what small prep moves could improve your result.</p>
          <a href="/homeanalysis" class="btn btn--white-on-navy">Request a Home Value Opinion <span aria-hidden>→</span></a>
        </div>

      </div>
    </div>
  </section>

  
  <section class="communities" id="communities" aria-labelledby="communities-heading">
    <div class="section-inner">
      <div class="section-header section-header--center">
        <p class="section-eyebrow">Seven communities north of Toronto</p>
        <h2 class="section-heading" id="communities-heading">Explore NorthSide GTA Communities</h2>
        <p class="section-sub">Each town has a distinct feel, price point, and lifestyle. Finally Home Agents can walk you through the differences before you commit to a search.</p>
      </div>

      <ul class="community-grid" role="list">

        <li class="community-card">
          <a href="/communities/georgina" class="community-card__link">
            <div class="community-card__img-wrap">
              <img src="/assets/town-logos/georgina.webp" alt="Georgina official municipal logo" width="720" height="300" loading="lazy" class="community-card__img community-card__logo community-card__logo--georgina">
            </div>
            <div class="community-card__body">
              <h3 class="community-card__name">Georgina</h3>
              <p class="community-card__sub">Lake Simcoe shoreline, Keswick &amp; Sutton — approx. 60 min to Toronto</p>
              <ul class="pill-list" aria-label="Key features">
                <li class="pill">Lake Simcoe</li><li class="pill">Keswick</li><li class="pill">Sutton</li>
              </ul>
              <div class="community-card__footer">
                <div>
                  <span class="community-card__price-label">Avg. sale price · ${MARKET_DATA.period}</span>
                  <span class="community-card__price">${MARKET_TOWNS.georgina.averageSalePrice}</span>
                </div>
                <span class="community-card__cta">Explore Georgina Real Estate →</span>
              </div>
            </div>
          </a>
        </li>

        <li class="community-card">
          <a href="/communities/east-gwillimbury" class="community-card__link">
            <div class="community-card__img-wrap">
              <img src="/assets/town-logos/east-gwillimbury.webp" alt="East Gwillimbury official municipal logo" width="720" height="300" loading="lazy" class="community-card__img community-card__logo community-card__logo--east-gwillimbury">
            </div>
            <div class="community-card__body">
              <h3 class="community-card__name">East Gwillimbury</h3>
              <p class="community-card__sub">Larger lots, growing communities, strong Hwy 404 access</p>
              <ul class="pill-list" aria-label="Key features">
                <li class="pill">New Builds</li><li class="pill">Holland Landing</li><li class="pill">404 Corridor</li>
              </ul>
              <div class="community-card__footer">
                <div>
                  <span class="community-card__price-label">Avg. sale price · ${MARKET_DATA.period}</span>
                  <span class="community-card__price">${MARKET_TOWNS["east-gwillimbury"].averageSalePrice}</span>
                </div>
                <span class="community-card__cta">Explore East Gwillimbury Real Estate →</span>
              </div>
            </div>
          </a>
        </li>

        <li class="community-card">
          <a href="/communities/newmarket" class="community-card__link">
            <div class="community-card__img-wrap">
              <img src="/assets/town-logos/newmarket.webp" alt="Newmarket official municipal logo" width="720" height="300" loading="lazy" class="community-card__img community-card__logo community-card__logo--newmarket">
            </div>
            <div class="community-card__body">
              <h3 class="community-card__name">Newmarket</h3>
              <p class="community-card__sub">Historic Main Street, full services, GO Train access</p>
              <ul class="pill-list" aria-label="Key features">
                <li class="pill">Main Street</li><li class="pill">GO Train</li><li class="pill">Full Amenities</li>
              </ul>
              <div class="community-card__footer">
                <div>
                  <span class="community-card__price-label">Avg. sale price · ${MARKET_DATA.period}</span>
                  <span class="community-card__price">${MARKET_TOWNS.newmarket.averageSalePrice}</span>
                </div>
                <span class="community-card__cta">Explore Newmarket Real Estate →</span>
              </div>
            </div>
          </a>
        </li>

        <li class="community-card">
          <a href="/communities/aurora" class="community-card__link">
            <div class="community-card__img-wrap">
              <img src="/assets/town-logos/aurora.webp" alt="Aurora official municipal logo" width="720" height="300" loading="lazy" class="community-card__img community-card__logo community-card__logo--aurora">
            </div>
            <div class="community-card__body">
              <h3 class="community-card__name">Aurora</h3>
              <p class="community-card__sub">Established neighbourhoods, strong schools, parks, GO access</p>
              <ul class="pill-list" aria-label="Key features">
                <li class="pill">Schools</li><li class="pill">Parks</li><li class="pill">GO Train</li>
              </ul>
              <div class="community-card__footer">
                <div>
                  <span class="community-card__price-label">Avg. sale price · ${MARKET_DATA.period}</span>
                  <span class="community-card__price">${MARKET_TOWNS.aurora.averageSalePrice}</span>
                </div>
                <span class="community-card__cta">Explore Aurora Real Estate →</span>
              </div>
            </div>
          </a>
        </li>

        <li class="community-card">
          <a href="/communities/stouffville" class="community-card__link">
            <div class="community-card__img-wrap">
              <img src="/assets/town-logos/stouffville.webp" alt="Whitchurch-Stouffville official municipal logo" width="720" height="300" loading="lazy" class="community-card__img community-card__logo community-card__logo--stouffville">
            </div>
            <div class="community-card__body">
              <h3 class="community-card__name">Whitchurch-Stouffville</h3>
              <p class="community-card__sub">Main Street village, trail system, GO access, family communities</p>
              <ul class="pill-list" aria-label="Key features">
                <li class="pill">GO Train</li><li class="pill">Trail System</li><li class="pill">Main Street</li>
              </ul>
              <div class="community-card__footer">
                <div>
                  <span class="community-card__price-label">Avg. sale price · ${MARKET_DATA.period}</span>
                  <span class="community-card__price">${MARKET_TOWNS.stouffville.averageSalePrice}</span>
                </div>
                <span class="community-card__cta">Explore Stouffville Real Estate →</span>
              </div>
            </div>
          </a>
        </li>

        <li class="community-card">
          <a href="/communities/uxbridge" class="community-card__link">
            <div class="community-card__img-wrap">
              <img src="/assets/town-logos/uxbridge.webp" alt="Uxbridge official municipal logo" width="720" height="300" loading="lazy" class="community-card__img community-card__logo community-card__logo--uxbridge">
            </div>
            <div class="community-card__body">
              <h3 class="community-card__name">Uxbridge</h3>
              <p class="community-card__sub">Trail Capital of Canada, acreage properties, heritage downtown</p>
              <ul class="pill-list" aria-label="Key features">
                <li class="pill">Trail Capital</li><li class="pill">Acreage</li><li class="pill">Heritage</li>
              </ul>
              <div class="community-card__footer">
                <div>
                  <span class="community-card__price-label">Avg. sale price · ${MARKET_DATA.period}</span>
                  <span class="community-card__price">${MARKET_TOWNS.uxbridge.averageSalePrice}</span>
                </div>
                <span class="community-card__cta">Explore Uxbridge Real Estate →</span>
              </div>
            </div>
          </a>
        </li>

        <li class="community-card">
          <a href="/communities/scugog" class="community-card__link">
            <div class="community-card__img-wrap">
              <img src="/assets/town-logos/scugog.webp" alt="Scugog official municipal logo" width="720" height="300" loading="lazy" class="community-card__img community-card__logo community-card__logo--scugog">
            </div>
            <div class="community-card__body">
              <h3 class="community-card__name">Scugog</h3>
              <p class="community-card__sub">Port Perry waterfront, Lake Scugog, heritage main street</p>
              <ul class="pill-list" aria-label="Key features">
                <li class="pill">Port Perry</li><li class="pill">Waterfront</li><li class="pill">Lake Scugog</li>
              </ul>
              <div class="community-card__footer">
                <div>
                  <span class="community-card__price-label">Avg. sale price · ${MARKET_DATA.period}</span>
                  <span class="community-card__price">${MARKET_TOWNS.scugog.averageSalePrice}</span>
                </div>
                <span class="community-card__cta">Explore Scugog Real Estate →</span>
              </div>
            </div>
          </a>
        </li>

      </ul>
    </div>
  </section>

  
  <section class="market-snapshot" id="market" aria-labelledby="market-heading">
    <div class="section-inner">
      <div class="market-snapshot__header">
        <div>
          <h2 class="market-snapshot__heading" id="market-heading">NorthSide GTA Market Snapshot</h2>
          <p class="market-snapshot__date">${MARKET_DATA.period} · ${MARKET_DATA.homeType}</p>
        </div>
        <span class="market-snapshot__source">Source: ${MARKET_DATA.source}</span>
      </div>

      <p class="market-context">
        A consistent all-home-types view of average sale price, sales, and average listing days on market across all seven municipalities.
      </p>

      <div class="market-cards" role="list" aria-label="Market data by community">
        
        <div class="market-card" role="listitem">
          <div class="market-card__top"><span class="market-card__name">Georgina</span></div>
          <span class="market-card__price">${MARKET_TOWNS.georgina.averageSalePrice}</span>
          <span class="market-card__meta">Sales count ${MARKET_TOWNS.georgina.salesCount} · Avg. LDOM ${MARKET_TOWNS.georgina.avgLdom}</span>
        </div>
        <div class="market-card" role="listitem">
          <div class="market-card__top"><span class="market-card__name">East Gwillimbury</span></div>
          <span class="market-card__price">${MARKET_TOWNS["east-gwillimbury"].averageSalePrice}</span>
          <span class="market-card__meta">Sales count ${MARKET_TOWNS["east-gwillimbury"].salesCount} · Avg. LDOM ${MARKET_TOWNS["east-gwillimbury"].avgLdom}</span>
        </div>
        <div class="market-card" role="listitem">
          <div class="market-card__top"><span class="market-card__name">Newmarket</span></div>
          <span class="market-card__price">${MARKET_TOWNS.newmarket.averageSalePrice}</span>
          <span class="market-card__meta">Sales count ${MARKET_TOWNS.newmarket.salesCount} · Avg. LDOM ${MARKET_TOWNS.newmarket.avgLdom}</span>
        </div>
        <div class="market-card" role="listitem">
          <div class="market-card__top"><span class="market-card__name">Aurora</span></div>
          <span class="market-card__price">${MARKET_TOWNS.aurora.averageSalePrice}</span>
          <span class="market-card__meta">Sales count ${MARKET_TOWNS.aurora.salesCount} · Avg. LDOM ${MARKET_TOWNS.aurora.avgLdom}</span>
        </div>
        <div class="market-card" role="listitem">
          <div class="market-card__top"><span class="market-card__name">Whitchurch-Stouffville</span></div>
          <span class="market-card__price">${MARKET_TOWNS.stouffville.averageSalePrice}</span>
          <span class="market-card__meta">Sales count ${MARKET_TOWNS.stouffville.salesCount} · Avg. LDOM ${MARKET_TOWNS.stouffville.avgLdom}</span>
        </div>
        <div class="market-card" role="listitem">
          <div class="market-card__top"><span class="market-card__name">Uxbridge</span></div>
          <span class="market-card__price">${MARKET_TOWNS.uxbridge.averageSalePrice}</span>
          <span class="market-card__meta">Sales count ${MARKET_TOWNS.uxbridge.salesCount} · Avg. LDOM ${MARKET_TOWNS.uxbridge.avgLdom}</span>
        </div>
        <div class="market-card" role="listitem">
          <div class="market-card__top"><span class="market-card__name">Scugog</span></div>
          <span class="market-card__price">${MARKET_TOWNS.scugog.averageSalePrice}</span>
          <span class="market-card__meta">Sales count ${MARKET_TOWNS.scugog.salesCount} · Avg. LDOM ${MARKET_TOWNS.scugog.avgLdom}</span>
        </div>
      </div>

      <p class="market-snapshot__disclaimer">
        Source: ${MARKET_DATA.source}. ${MARKET_DATA.homeType}.
      </p>
      <p class="market-snapshot__legal">
        Not a guarantee of value. Not intended to solicit clients already under contract with a brokerage.
      </p>
    </div>
  </section>

  
  <section class="why-fha" aria-labelledby="why-fha-heading">
    <div class="section-inner">
      <div class="section-header section-header--center">
        <p class="section-eyebrow">The team behind the platform</p>
        <h2 class="section-heading" id="why-fha-heading">Why Work With Finally Home Agents</h2>
      </div>
      <div class="why-fha__grid">
        <div class="why-card">
          <div class="why-card__icon" aria-hidden="true"></div>
          <h3 class="why-card__title">Town-by-town guidance before the search begins</h3>
          <p class="why-card__body">Before you start touring homes, we walk you through the real differences between each community — commute, schools, price range, and feel. Aurora and Newmarket are not the same. Georgina and Scugog are not the same. That context shapes your search.</p>
        </div>
        <div class="why-card">
          <div class="why-card__icon" aria-hidden="true"></div>
          <h3 class="why-card__title">Pricing and marketing built for how buyers actually search</h3>
          <p class="why-card__body">Photography, video, drone, and staging strategy — not as add-ons, but as standard practice. Your listing is priced using current TRREB data, positioned for the buyers most likely to act, and marketed beyond the MLS.</p>
        </div>
        <div class="why-card">
          <div class="why-card__icon" aria-hidden="true"></div>
          <h3 class="why-card__title">Offer and negotiation support from first showing to closing</h3>
          <p class="why-card__body">We are in your corner from the first showing through to the last signature. That means offer strategy, condition advice, negotiation, lawyer and lender coordination, and a clear picture of what you are getting into before you commit.</p>
        </div>
      </div>
    </div>
  </section>

  
  <section class="proof-section" aria-label="Client results and reviews">
    <div class="section-inner">

      
      <div class="recent-moves">
        <div class="section-header section-header--center recent-moves__header">
          <div class="gold-rule-group" aria-hidden="true"><span class="gold-rule"></span><span>Real Results</span><span class="gold-rule"></span></div>
          <h2 class="section-heading">Recent Client Moves</h2>
          <p class="section-sub">Active representation across the NorthSide GTA and beyond.</p>
        </div>
        <div class="moves-grid">
          
          
          
          <article class="move-card move-card--purchased">
            <span class="move-card__ghost" aria-hidden="true">M</span>
            <div class="move-card__top">
              <span class="move-card__type">Purchased</span>
              <h3 class="move-card__town">Markham</h3>
              <span class="move-card__line" aria-hidden="true"></span>
            </div>
            <dl class="move-card__details">
              <dt>Goal</dt><dd>Move closer to family</dd>
              <dt>Result</dt><dd>Secured a detached home in Markham — right neighbourhood, right timeline.</dd>
            </dl>
          </article>
          <article class="move-card move-card--purchased">
            <span class="move-card__ghost" aria-hidden="true">U</span>
            <div class="move-card__top">
              <span class="move-card__type">Purchased</span>
              <h3 class="move-card__town">Uxbridge</h3>
              <span class="move-card__line" aria-hidden="true"></span>
            </div>
            <dl class="move-card__details">
              <dt>Goal</dt><dd>Move into the country</dd>
              <dt>Result</dt><dd>Found a large detached property outside of town — more land, more space, exactly what the family wanted.</dd>
            </dl>
          </article>
          <article class="move-card move-card--sold">
            <span class="move-card__ghost" aria-hidden="true">B</span>
            <div class="move-card__top">
              <span class="move-card__type">Sold</span>
              <h3 class="move-card__town">Brooklin</h3>
              <span class="move-card__line" aria-hidden="true"></span>
            </div>
            <dl class="move-card__details">
              <dt>Goal</dt><dd>Relocate closer to family</dd>
              <dt>Result</dt><dd>Sold a detached home in Brooklin and coordinated a smooth transition to the next chapter.</dd>
            </dl>
          </article>
          <article class="move-card move-card--purchased">
            <span class="move-card__ghost" aria-hidden="true">N</span>
            <div class="move-card__top">
              <span class="move-card__type">Purchased</span>
              <h3 class="move-card__town">Newmarket</h3>
              <span class="move-card__line" aria-hidden="true"></span>
            </div>
            <dl class="move-card__details">
              <dt>Goal</dt><dd>Find a forever home backing onto forest</dd>
              <dt>Result</dt><dd>Bought a detached home backing onto protected forest in Newmarket — a property they plan to stay in for the long term.</dd>
            </dl>
          </article>
          <article class="move-card move-card--sold">
            <span class="move-card__ghost" aria-hidden="true">N</span>
            <div class="move-card__top">
              <span class="move-card__type">Sold</span>
              <h3 class="move-card__town">Newmarket</h3>
              <span class="move-card__line" aria-hidden="true"></span>
            </div>
            <dl class="move-card__details">
              <dt>Goal</dt><dd>Upsize to a larger home</dd>
              <dt>Result</dt><dd>Sold their Newmarket detached and positioned them to move up — clear strategy from start to close.</dd>
            </dl>
          </article>
          <article class="move-card move-card--sold">
            <span class="move-card__ghost" aria-hidden="true">E</span>
            <div class="move-card__top">
              <span class="move-card__type">Sold</span>
              <h3 class="move-card__town">East Gwillimbury</h3>
              <span class="move-card__line" aria-hidden="true"></span>
            </div>
            <dl class="move-card__details">
              <dt>Goal</dt><dd>Start the family's next chapter</dd>
              <dt>Result</dt><dd>Sold an East Gwillimbury detached home as the family prepared for their next stage of life.</dd>
            </dl>
          </article>
        </div>

        
        <div class="moves-cta-strip">
          <div class="moves-cta-strip__text">
            <strong>Planning your next move? Let's map it out.</strong>
            <span>Thoughtful strategy. Local knowledge. Clear guidance.</span>
          </div>
          <a href="/contact" class="btn btn--dark-green">Start Your Home Strategy →</a>
        </div>
      </div>

      
      <div class="reviews">
        <div class="reviews__header">
          <div>
            <p class="section-eyebrow">Client feedback</p>
            <h2 class="section-heading">Trusted by Buyers and Sellers Across the GTA</h2>
          </div>
          <a href="https://share.google/GJz2QTQ8GqZIifaNH" class="reviews__all-link" target="_blank" rel="noopener">All Google reviews →</a>
        </div>
        <div class="reviews-grid">
          <blockquote class="review-card">
            <div class="review-card__stars" aria-label="5 stars">★★★★★</div>
            <p class="review-card__quote">"Matthew and the team really took the time and care to help us find the right place. He made the sometimes overwhelming burden of moving seem so smooth. I would greatly recommend that anyone looking for a home seek out Matthew and the team at Finally Home Agents."</p>
            <footer class="review-card__footer">
              <cite class="review-card__name">Devin Tappenden</cite>
              <span class="review-card__type">Buyer · Uxbridge</span>
            </footer>
          </blockquote>
          <blockquote class="review-card">
            <div class="review-card__stars" aria-label="5 stars">★★★★★</div>
            <p class="review-card__quote">"Their professionalism and personal attention set them apart. Throughout the entire process these Finally Home Agents exceeded our expectations. If you're thinking about selling, they should be your first and only choice."</p>
            <footer class="review-card__footer">
              <cite class="review-card__name">Susan Booth</cite>
              <span class="review-card__type">Seller · Holland Landing</span>
            </footer>
          </blockquote>
          <blockquote class="review-card">
            <div class="review-card__stars" aria-label="5 stars">★★★★★</div>
            <p class="review-card__quote">"What really stood out was that Matt understood our priorities as a family and ensured that these priorities were held in high regard throughout the whole process. He is ready to help in a heartbeat and will see you through from start to finish."</p>
            <footer class="review-card__footer">
              <cite class="review-card__name">Larissa Halko</cite>
              <span class="review-card__type">Buyer &amp; Seller</span>
            </footer>
          </blockquote>
          <blockquote class="review-card">
            <div class="review-card__stars" aria-label="5 stars">★★★★★</div>
            <p class="review-card__quote">"Thanks to Matt we sold our home for much more than the market rate — higher than any comparable in the neighbourhood. We were able to close on our forever home for much lower than we ever thought possible."</p>
            <footer class="review-card__footer">
              <cite class="review-card__name">Arron Breen</cite>
              <span class="review-card__type">Buyer &amp; Seller</span>
            </footer>
          </blockquote>
        </div>
      </div>

    </div>
  </section>

  
  <section class="agent-intro" aria-labelledby="agent-heading">
    <div class="section-inner section-inner--narrow">
      <div class="agent-intro__grid">
        <div class="agent-intro__photo">
          <figure class="agent-intro__team-card">
            <img
              src="/assets/homepage/matthew-landon-northside-gta.jpg"
              alt="Matthew Mulhall and Landon Mulhall of Finally Home Agents — NorthSide GTA real estate"
              width="1484" height="1060"
              loading="lazy"
              class="agent-intro__img"
            >
          </figure>
        </div>
        <div class="agent-intro__copy">
          <p class="section-eyebrow">The team behind NorthSide GTA</p>
          <h2 class="section-heading" id="agent-heading">We live here. We work here.</h2>
          <p class="agent-intro__body">For brothers Matthew and Landon, NorthSide GTA is personal.<br><br>It’s where they <span class="text-brand-green font-bold">live</span>, <span class="text-brand-green font-bold">work</span>, <span class="text-brand-green font-bold">raise their families</span>, <span class="text-brand-green font-bold">golf</span>, and spend their time. That perspective shapes how they guide clients — helping people look beyond homes and prices to understand the <span class="text-brand-green font-bold">communities</span>, lifestyle, and <span class="text-brand-green font-bold">long-term fit</span> behind each move.</p>
          <div class="agent-intro__contacts">
            <a href="https://wa.me/16476684646" class="btn btn--whatsapp">WhatsApp us</a>
            <a href="tel:+16476684646" class="btn btn--outline-green">Matthew · 647-668-4646</a>
            <a href="tel:+14164554594" class="btn btn--outline-green">Landon · 416-455-4594</a>
          </div>
        </div>
      </div>
    </div>
  </section>

  
  <section class="inline-lead" id="get-started" aria-labelledby="inline-lead-heading">
    <div class="inline-lead__inner">
      <div class="inline-lead__copy">
        <p class="inline-lead__eyebrow">Ready when you are</p>
        <h2 id="inline-lead-heading" class="inline-lead__heading">Tell us where you're headed.</h2>
        <p class="inline-lead__sub">We'll follow up with community comparisons, current pricing, and a clear next step — no pressure, no spam.</p>
      </div>
      <form
        class="inline-lead__form"
        name="homepage-lead"
        method="POST"
        action="/api/homepage-lead"
      >
        <input type="hidden" name="form-name" value="homepage-lead">
        <input type="hidden" name="sourceUrl" value="/">
        <input type="hidden" name="pageUrl" value="/">
        <input type="hidden" name="submittedAt" value="">
        <p class="inline-lead__honeypot" aria-hidden="true">
          <label>Don't fill this out: <input name="bot-field" tabindex="-1"></label>
        </p>

        <div class="inline-lead__fields">
          <div class="inline-lead__field">
            <label for="lead-name" class="inline-lead__label">Your name</label>
            <input
              type="text"
              id="lead-name"
              name="name"
              class="inline-lead__input"
              placeholder="First name is fine"
              autocomplete="given-name"
              required
            >
          </div>

          <div class="inline-lead__field">
            <label for="lead-phone" class="inline-lead__label">Phone or email</label>
            <input
              type="text"
              id="lead-phone"
              name="contact"
              class="inline-lead__input"
              placeholder="However you prefer to be reached"
              autocomplete="tel"
              required
            >
          </div>

          <div class="inline-lead__field inline-lead__field--full">
            <label for="lead-community" class="inline-lead__label">Which communities interest you?</label>
            <select id="lead-community" name="community" class="inline-lead__select" required>
              <option value="" disabled selected>Pick one to start</option>
              <option value="Aurora">Aurora</option>
              <option value="Newmarket">Newmarket</option>
              <option value="East Gwillimbury">East Gwillimbury</option>
              <option value="Georgina">Georgina</option>
              <option value="Stouffville">Whitchurch-Stouffville</option>
              <option value="Uxbridge">Uxbridge</option>
              <option value="Scugog">Scugog</option>
              <option value="Not sure yet">Not sure yet — help me compare</option>
            </select>
          </div>
        </div>

        <button type="submit" class="inline-lead__submit">
          Start the Conversation →
        </button>

        <p class="inline-lead__disclaimer">
          No spam. No pressure. Regulated by RECO · HomeLife Optimum Realty, Brokerage.
        </p>
        <p class="inline-lead__status" data-inline-lead-status role="alert" aria-live="assertive"></p>
      </form>
    </div>
  </section>

    <section class="faq" aria-labelledby="faq-heading">
    <div class="section-inner section-inner--faq">
      <div class="section-header section-header--center">
        <p class="section-eyebrow">Common questions</p>
        <h2 class="section-heading" id="faq-heading">Frequently Asked Questions</h2>
      </div>
      <dl class="faq__list">
        <div class="faq__item">
          <dt class="faq__question">What is the NorthSide GTA?</dt>
          <dd class="faq__answer">The NorthSide GTA refers to communities north of Toronto including Aurora, Newmarket, Whitchurch-Stouffville, Uxbridge, Georgina, East Gwillimbury, and Scugog — areas where buyers often find more space, established communities, and lifestyle options while staying connected to the Greater Toronto Area.</dd>
        </div>
        <div class="faq__item">
          <dt class="faq__question">Who helps buyers and sellers in the NorthSide GTA?</dt>
          <dd class="faq__answer">Finally Home Agents — Matthew Mulhall and Landon Mulhall — provide buyer and seller representation across the NorthSide GTA, operating under HomeLife Optimum Realty, Brokerage, and regulated by RECO (Real Estate Council of Ontario).</dd>
        </div>
        <div class="faq__item">
          <dt class="faq__question">Is the NorthSide GTA a good area for families moving out of Toronto?</dt>
          <dd class="faq__answer">Many buyers consider the NorthSide GTA for more living space, established neighbourhoods, trail access, lakes, strong schools, and a quieter pace of life — while maintaining reasonable access to York Region, Durham Region, and Toronto via Hwy 404 and GO Transit.</dd>
        </div>
        <div class="faq__item">
          <dt class="faq__question">Can Finally Home Agents help me sell my home north of Toronto?</dt>
          <dd class="faq__answer">Yes. Finally Home Agents provides full seller representation across all seven NorthSide GTA communities — market-informed pricing strategy, professional photography, video, and marketing, and coordinated support through to closing.</dd>
        </div>
        <div class="faq__item">
          <dt class="faq__question">Can I compare NorthSide GTA communities before buying?</dt>
          <dd class="faq__answer">Yes. The NorthSide GTA platform helps buyers compare communities by lifestyle, price point, commute, and local character. Finally Home Agents provides town-by-town guidance before the search begins, so buyers understand the real differences between Aurora, Newmarket, Stouffville, Uxbridge, Georgina, East Gwillimbury, and Scugog.</dd>
        </div>
      </dl>
    </div>
  </section>

  
  <section class="final-cta" aria-labelledby="final-cta-heading">
    <div class="section-inner section-inner--narrow section-inner--center">
      <h2 class="final-cta__heading" id="final-cta-heading">Planning a Move North of Toronto?</h2>
      <p class="final-cta__sub">Whether you are buying, selling, or still comparing communities, Finally Home Agents can help you make a clearer plan.</p>
      <div class="final-cta__buttons">
        <a href="/contact" class="btn btn--white-on-dark">Book a Real Estate Call →</a>
        <a href="/homeanalysis" class="btn btn--ghost-on-dark">Get a Home Value Opinion</a>
        <a href="/what-my-home-buys" class="btn btn--ghost-on-dark">See what your home buys up north</a>
      </div>
    </div>
  </section>

  
  <section class="insights-preview" aria-labelledby="insights-heading">
    <div class="section-inner">
      <div class="insights-preview__header">
        <h2 class="section-heading" id="insights-heading">What's happening north of Toronto</h2>
        <a href="/insights" class="insights-preview__all">All insights →</a>
      </div>
      <div class="insights-grid">
        <a href="/insights/go-north-starting-life-northside-gta" class="insight-card">
          <span class="insight-card__tag">Home Ownership</span>
          <h3 class="insight-card__title">Why more people are building their lives just north of Toronto</h3>
          <p class="insight-card__excerpt">More homes under $800K just north of Toronto — why young families and their parents are starting their next chapter in the NorthSide GTA.</p>
          <div class="insight-card__footer"><span>Read more →</span><span>Mar 2026</span></div>
        </a>
        <a href="/insights/parents-using-home-equity-help-kids-buy-houses-northside-gta" class="insight-card">
          <span class="insight-card__tag">Buyer Guide</span>
          <h3 class="insight-card__title">Helping your kids buy their first home</h3>
          <p class="insight-card__excerpt">Parents across the GTA are using their home equity to help their kids buy houses in the NorthSide GTA — real homes, real communities, attainable prices.</p>
          <div class="insight-card__footer"><span>Read more →</span><span>Feb 2026</span></div>
        </a>
        <a href="/insights/where-to-live-in-the-northside-gta-2026-guide-for-toronto-movers" class="insight-card">
          <span class="insight-card__tag">Relocating</span>
          <h3 class="insight-card__title">Where to live in the NorthSide GTA: a 2026 guide for Toronto movers</h3>
          <p class="insight-card__excerpt">A community-by-community look at where Toronto movers are putting down roots across the NorthSide GTA this year.</p>
          <div class="insight-card__footer"><span>Read more →</span><span>2026</span></div>
        </a>
      </div>
    </div>
  </section>

</main>

<footer class="site-footer">
  <div class="site-footer__inner">
    <div class="site-footer__grid">
      <div class="site-footer__brand">
        <p class="brand-primary">NorthSide GTA</p>
        <p class="brand-secondary">served by Finally Home Agents</p>
        <p class="site-footer__tagline">Real estate guidance across Georgina, East Gwillimbury, Newmarket, Aurora, Whitchurch-Stouffville, Uxbridge, and Scugog.</p>
      </div>
      <nav aria-label="Explore">
        <h3 class="site-footer__col-heading">Explore</h3>
        <ul>
          <li><a href="/buyers">Buyers</a></li>
          <li><a href="/sellers">Sellers</a></li>
          <li><a href="/insights">Insights</a></li>
          <li><a href="/videos">Videos + Reels</a></li>
          <li><a href="/about">About</a></li>
          <li><a href="/contact">Contact</a></li>
        </ul>
      </nav>
      <nav aria-label="Communities">
        <h3 class="site-footer__col-heading">Communities</h3>
        <ul>
          <li><a href="/communities/georgina">Georgina</a></li>
          <li><a href="/communities/east-gwillimbury">East Gwillimbury</a></li>
          <li><a href="/communities/newmarket">Newmarket</a></li>
          <li><a href="/communities/aurora">Aurora</a></li>
          <li><a href="/communities/stouffville">Whitchurch-Stouffville</a></li>
          <li><a href="/communities/uxbridge">Uxbridge</a></li>
          <li><a href="/communities/scugog">Scugog</a></li>
        </ul>
      </nav>
      <div>
        <h3 class="site-footer__col-heading">Finally Home Agents</h3>
        <p>HomeLife Optimum Realty, Brokerage</p>
        <ul>
          <li><a href="/privacy">Privacy Policy</a></li>
          <li><a href="/contact">Contact</a></li>
        </ul>
      </div>
    </div>
    <div class="site-footer__legal">
      <p>Not intended to solicit clients already under contract with a brokerage.</p>
      <p>© 2026 NorthSide GTA · Finally Home Agents · HomeLife Optimum Realty, Brokerage</p>
    </div>
  </div>
</footer>
`;
