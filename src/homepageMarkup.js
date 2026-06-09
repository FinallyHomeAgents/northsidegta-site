export const HOMEPAGE_MARKUP = String.raw`
<main>

  
  <section class="hero" aria-labelledby="hero-heading">
    <div class="hero__grid">

      
      <div class="hero__copy hero-animate">
        <span class="hero__eyebrow">NorthSide GTA · Real Estate Platform</span>

        <h1 class="hero__heading" id="hero-heading">
          NorthSide GTA Real Estate,
          <span class="hero__heading-em">Guided by Finally Home Agents.</span>
        </h1>

        <p class="hero__intro">
          Buy or sell north of Toronto with Finally Home Agents across Aurora, Newmarket, Stouffville, Uxbridge, Georgina, East Gwillimbury, and Scugog — with trusted support in King, Bradford, Vaughan, Richmond Hill, Markham, Pickering, Ajax, Whitby, and Oshawa.
        </p>
        <p class="hero__sub">
          Explore the communities, compare the lifestyle, and get clear guidance before your next move.
        </p>

        <div class="hero__ctas">
          <a href="/buyers" class="btn btn--green btn--lg">Start Your NorthSide Move <span aria-hidden>→</span></a>
          <a href="#communities" class="btn btn--ghost btn--lg">Explore Communities</a>
        </div>

        
        <div class="hero-badges">
          <a href="https://share.google/GJz2QTQ8GqZIifaNH" target="_blank" rel="noopener" class="hero-badge hero-badge--google" aria-label="5.0 Google Rating — view reviews">
            <img src="/Images/google-logo.png" alt="Google" width="16" height="16">
            <span>★ 5.0 Google Rating</span>
            <span class="sr-only">Based on client reviews</span>
          </a>
          <span class="hero-badge">
            <span aria-hidden="true">✓</span> RECO Licensed
          </span>
          <span class="hero-badge">
            <span aria-hidden="true">📍</span> 7 Communities
          </span>
          <span class="hero-badge">
            <span aria-hidden="true">🔄</span> Updated Monthly
          </span>
        </div>
      </div>

      
      <div class="hero__map-panel">
        <div class="hero__map-header">
          <div>
            <p class="map-label">Explore the NorthSide GTA</p>
            <p class="map-sublabel">Tap any focus community to learn more</p>
          </div>
          <div class="map-interactive-badge">
            <span class="pulse-dot pulse-dot--green"></span>
            <span>Interactive</span>
          </div>
        </div>

        
        <div class="hero__map-frame" id="northside-map-container">
                    <svg class="northside-map northside-map--inline" id="northside-map" viewBox="0 0 1600 900" xmlns="http://www.w3.org/2000/svg"
               role="img"
               aria-label="NorthSide GTA real estate map showing Aurora, Newmarket, Stouffville, Uxbridge, Georgina, East Gwillimbury, and Scugog north of Toronto"
               style="width:100%;height:auto;display:block;background:#f4f1e8;">

            <!--
              NorthSide GTA — static reference map SVG (v4)
              ViewBox: 1600 × 900
              Coordinates extracted from approved homepage map-data bundle.
              This is a STATIC reference. The production map is interactive (React/JSX).
              For the interactive version, see the map.jsx component in homepage-map-notes below.

              CSS colour notes (define on .nsmap or :root if adapting):
                svc: #235c0d            (service region fill)
                svc-hover: #3a7822      (hover fill)
                svc-rule: rgba(200,167,90,0.25)  (region border)
                svc-ink: #f0e8d4        (region name colour)
                svc-sub: #c9a465        (subtitle colour)
                ctx: #e3e1d8            (context region fill)
                also-served-fill: #d8c9a6 (nearby GTA communities also served)
                water: #cfe1ee          (lake fill)
                water-ink: #6f9fbc      (lake label)
                ctx-ink: #8d8d80        (context label)
                also-served-label: #7b715f
                hwy: #d98b2b            (highway line)
                skyline: #c8bda4        (Toronto skyline bars)
            -->

            <defs>
              <style>
                .map-bg    { fill: #f4f1e8; }
                .water     { fill: #cfe1ee; }
                .water-lbl { font-family: 'Blinker', system-ui, sans-serif; font-size: 17px; font-weight: 600;
                             fill: #6f9fbc; letter-spacing: 0.42em; text-transform: uppercase; }
                .water-lbl.sm { font-size: 11px; letter-spacing: 0.16em; }
                .ctx       { fill: #e3e1d8; stroke: #f4f1e8; stroke-width: 2; stroke-linejoin: round; }
                .ctx.also-served { fill: #d8c9a6; stroke: #efe6d1; }
                .ctx.toronto { fill: #d8d4c4; }
                .ctx-lbl   { font-family: 'Blinker', system-ui, sans-serif; font-size: 19px; font-weight: 500;
                             fill: #8d8d80; }
                .ctx-lbl.also-served { fill: #7b715f; }
                .ctx-lbl.toronto { font-family: 'Newsreader', Georgia, serif; font-style: italic;
                                   font-size: 26px; fill: #7c7868; }
                .map-nearby-served { cursor: help; outline: none; }
                .map-nearby-served .ctx.also-served { transition: fill 240ms ease, stroke 240ms ease, filter 240ms ease; }
                .map-nearby-served .ctx-lbl.also-served { transition: fill 240ms ease; pointer-events: none; }
                .map-nearby-served:hover .ctx.also-served,
                .map-nearby-served:focus .ctx.also-served,
                .map-nearby-served:focus-visible .ctx.also-served { fill: #ddcfad; stroke: #fff4df; filter: drop-shadow(0 5px 10px rgba(54, 45, 25, 0.12)); }
                .map-nearby-served:hover .ctx-lbl.also-served,
                .map-nearby-served:focus .ctx-lbl.also-served,
                .map-nearby-served:focus-visible .ctx-lbl.also-served { fill: #5f563f; }
                .map-nearby-served:focus-visible .ctx.also-served { stroke-width: 3; }
                .nearby-service-marker { pointer-events: none; filter: drop-shadow(0 3px 6px rgba(54, 45, 25, 0.13)); }
                .nearby-service-marker__disc { fill: #f8f1df; stroke: #b79a5c; stroke-width: 1.4; }
                .nearby-service-marker__check { fill: none; stroke: #32610e; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round; }
                .nearby-tooltip { opacity: 0; overflow: visible; transition: opacity 220ms ease; pointer-events: none; }
                .map-nearby-served:hover .nearby-tooltip,
                .map-nearby-served:focus .nearby-tooltip,
                .map-nearby-served:focus-visible .nearby-tooltip { opacity: 1; }
                .map-nearby-served--bradford:hover ~ .nearby-tooltip--bradford,
                .map-nearby-served--bradford:focus ~ .nearby-tooltip--bradford,
                .map-nearby-served--bradford:focus-visible ~ .nearby-tooltip--bradford { opacity: 1; }
                .map-nearby-served--king:hover ~ .nearby-tooltip--king,
                .map-nearby-served--king:focus ~ .nearby-tooltip--king,
                .map-nearby-served--king:focus-visible ~ .nearby-tooltip--king { opacity: 1; }
                .map-nearby-served--vaughan:hover ~ .nearby-tooltip--vaughan,
                .map-nearby-served--vaughan:focus ~ .nearby-tooltip--vaughan,
                .map-nearby-served--vaughan:focus-visible ~ .nearby-tooltip--vaughan { opacity: 1; }
                .map-nearby-served--richmond-hill:hover ~ .nearby-tooltip--richmond-hill,
                .map-nearby-served--richmond-hill:focus ~ .nearby-tooltip--richmond-hill,
                .map-nearby-served--richmond-hill:focus-visible ~ .nearby-tooltip--richmond-hill { opacity: 1; }
                .map-nearby-served--markham:hover ~ .nearby-tooltip--markham,
                .map-nearby-served--markham:focus ~ .nearby-tooltip--markham,
                .map-nearby-served--markham:focus-visible ~ .nearby-tooltip--markham { opacity: 1; }
                .map-nearby-served--pickering:hover ~ .nearby-tooltip--pickering,
                .map-nearby-served--pickering:focus ~ .nearby-tooltip--pickering,
                .map-nearby-served--pickering:focus-visible ~ .nearby-tooltip--pickering { opacity: 1; }
                .map-nearby-served--ajax:hover ~ .nearby-tooltip--ajax,
                .map-nearby-served--ajax:focus ~ .nearby-tooltip--ajax,
                .map-nearby-served--ajax:focus-visible ~ .nearby-tooltip--ajax { opacity: 1; }
                .map-nearby-served--whitby:hover ~ .nearby-tooltip--whitby,
                .map-nearby-served--whitby:focus ~ .nearby-tooltip--whitby,
                .map-nearby-served--whitby:focus-visible ~ .nearby-tooltip--whitby { opacity: 1; }
                .map-nearby-served--oshawa:hover ~ .nearby-tooltip--oshawa,
                .map-nearby-served--oshawa:focus ~ .nearby-tooltip--oshawa,
                .map-nearby-served--oshawa:focus-visible ~ .nearby-tooltip--oshawa { opacity: 1; }
                .nearby-tooltip-card { fill: rgba(255, 252, 244, 0.98); stroke: rgba(123, 113, 95, 0.24); stroke-width: 1; filter: drop-shadow(0 12px 22px rgba(35, 71, 10, 0.16)); }
                .nearby-tooltip-name { font-family: 'Newsreader', Georgia, serif; font-size: 26px; fill: #173f08; font-weight: 600; }
                .nearby-tooltip-copy { font-family: 'Blinker', system-ui, sans-serif; font-size: 18px; fill: #6f6655; font-weight: 600; letter-spacing: 0.01em; white-space: normal; }
                @media (prefers-reduced-motion: reduce) {
                  .map-nearby-served .ctx.also-served,
                  .map-nearby-served .ctx-lbl.also-served,
                  .nearby-tooltip { transition: none; }
                }
                .svc       { fill: #235c0d; stroke: rgba(200,167,90,0.25); stroke-width: 2.5; stroke-linejoin: round; }
                .svc-name  { font-family: 'Newsreader', Georgia, serif; font-weight: 400; fill: #f0e8d4;
                             letter-spacing: 0.01em;
                             filter: drop-shadow(0 1px 4px rgba(0,0,0,0.45)); }
                .tier-lg   { font-size: 38px; }
                .tier-md   { font-size: 28px; }
                .tier-sm   { font-size: 21px; }
                .svc-sub   { font-family: 'Blinker', system-ui, sans-serif; font-weight: 600; font-size: 12px;
                             fill: #c9a465; letter-spacing: 0.22em; text-transform: uppercase; }
                .hwy-cas   { fill: none; stroke: #f4f1e8; stroke-width: 8; stroke-linecap: round; }
                .hwy-line  { fill: none; stroke: #d98b2b; stroke-width: 3.5; stroke-linecap: round; }
                .shield    { fill: #fff; stroke: #2c560c; stroke-width: 1.4; }
                .shield-txt{ font-family: 'Blinker', system-ui, sans-serif; font-weight: 700; font-size: 13px;
                             fill: #2c560c; }
                .skyline   { fill: #c8bda4; }
                .sublake   { fill: #cfe1ee; stroke: #a8cadf; stroke-width: 1; }
                .mring     { fill: rgba(255,255,255,0.16); stroke: rgba(255,255,255,0.55); stroke-width: 1.2; }
                .mglyph    { stroke: #fff; stroke-width: 1.7; fill: none; stroke-linecap: round; stroke-linejoin: round; }
              </style>
            </defs>

            <!-- ── BACKGROUND ─────────────────────────────────────────── -->
            <rect width="1600" height="900" class="map-bg"/>

            <!-- ── LAKE SIMCOE (top) ──────────────────────────────────── -->
            <path class="water"
              d="M 0,0 L 1600,0 L 1600,150 L 1320,150 L 1150,182 L 1092,156 L 1010,134 L 928,122
                 L 846,132 L 770,118 L 700,134 L 648,150 L 600,156 L 575,170 L 575,250 L 545,256
                 L 512,250 L 490,165 L 462,150 L 430,162 L 392,150 L 348,166 L 305,150 L 262,140
                 L 180,150 L 90,148 L 0,150 Z"/>
            <text class="water-lbl" x="800" y="76" text-anchor="middle">Lake Simcoe</text>

            <!-- ── LAKE ONTARIO (bottom) ─────────────────────────────── -->
            <path class="water"
              d="M 0,900 L 1600,900 L 1600,838 L 1410,832 L 1260,838 L 1095,842 L 980,840
                 L 830,825 L 700,832 L 420,838 L 180,832 L 0,852 Z"/>
            <text class="water-lbl" x="800" y="872" text-anchor="middle">Lake Ontario</text>

            <!-- ── CONTEXT REGIONS ───────────────────────────────────── -->
            <!-- Bradford -->
            <g class="map-nearby-served map-nearby-served--bradford" tabindex="0" focusable="true" role="img" aria-label="Bradford — also guided by Finally Home Agents">
              <path class="ctx also-served" d="M 180,400 L 490,400 L 490,165 L 462,150 L 430,162 L 392,150 L 348,166 L 305,150 L 262,140 L 180,150 Z"/>
              <g class="nearby-service-marker" transform="translate(307,282)" aria-hidden="true">
                <circle class="nearby-service-marker__disc" r="10"/>
                <path class="nearby-service-marker__check" d="M -4,0 L -1,3.5 L 5,-4"/>
              </g>
              <text class="ctx-lbl also-served" x="335" y="312" text-anchor="middle">Bradford</text>
            </g>
            <!-- King -->
            <g class="map-nearby-served map-nearby-served--king" tabindex="0" focusable="true" role="img" aria-label="King — also guided by Finally Home Agents">
              <path class="ctx also-served" d="M 180,400 L 490,400 L 490,630 L 180,630 Z"/>
              <g class="nearby-service-marker" transform="translate(307,492)" aria-hidden="true">
                <circle class="nearby-service-marker__disc" r="10"/>
                <path class="nearby-service-marker__check" d="M -4,0 L -1,3.5 L 5,-4"/>
              </g>
              <text class="ctx-lbl also-served" x="335" y="520" text-anchor="middle">King</text>
            </g>
            <!-- Vaughan -->
            <g class="map-nearby-served map-nearby-served--vaughan" tabindex="0" focusable="true" role="img" aria-label="Vaughan — also guided by Finally Home Agents">
              <path class="ctx also-served" d="M 180,630 L 410,630 L 410,782 L 180,786 Z"/>
              <g class="nearby-service-marker" transform="translate(268,684)" aria-hidden="true">
                <circle class="nearby-service-marker__disc" r="10"/>
                <path class="nearby-service-marker__check" d="M -4,0 L -1,3.5 L 5,-4"/>
              </g>
              <text class="ctx-lbl also-served" x="296" y="712" text-anchor="middle">Vaughan</text>
            </g>
            <!-- Richmond Hill -->
            <g class="map-nearby-served map-nearby-served--richmond-hill" tabindex="0" focusable="true" role="img" aria-label="Richmond Hill — also guided by Finally Home Agents">
              <path class="ctx also-served" d="M 410,630 L 575,630 L 575,782 L 410,782 Z"/>
              <g class="nearby-service-marker" transform="translate(462,674)" aria-hidden="true">
                <circle class="nearby-service-marker__disc" r="10"/>
                <path class="nearby-service-marker__check" d="M -4,0 L -1,3.5 L 5,-4"/>
              </g>
              <text class="ctx-lbl also-served" x="493" y="702" text-anchor="middle">Richmond</text>
              <text class="ctx-lbl also-served" x="493" y="722" text-anchor="middle">Hill</text>
            </g>
            <!-- Markham -->
            <g class="map-nearby-served map-nearby-served--markham" tabindex="0" focusable="true" role="img" aria-label="Markham — also guided by Finally Home Agents">
              <path class="ctx also-served" d="M 575,630 L 830,630 L 830,782 L 575,782 Z"/>
              <g class="nearby-service-marker" transform="translate(667,684)" aria-hidden="true">
                <circle class="nearby-service-marker__disc" r="10"/>
                <path class="nearby-service-marker__check" d="M -4,0 L -1,3.5 L 5,-4"/>
              </g>
              <text class="ctx-lbl also-served" x="702" y="712" text-anchor="middle">Markham</text>
            </g>
            <!-- Pickering -->
            <g class="map-nearby-served map-nearby-served--pickering" tabindex="0" focusable="true" role="img" aria-label="Pickering — also guided by Finally Home Agents">
              <path class="ctx also-served" d="M 830,630 L 980,630 L 980,784 L 830,782 Z"/>
              <g class="nearby-service-marker" transform="translate(862,684)" aria-hidden="true">
                <circle class="nearby-service-marker__disc" r="10"/>
                <path class="nearby-service-marker__check" d="M -4,0 L -1,3.5 L 5,-4"/>
              </g>
              <text class="ctx-lbl also-served" x="905" y="712" text-anchor="middle">Pickering</text>
            </g>
            <!-- Ajax -->
            <g class="map-nearby-served map-nearby-served--ajax" tabindex="0" focusable="true" role="img" aria-label="Ajax — also guided by Finally Home Agents">
              <path class="ctx also-served" d="M 980,630 L 1095,630 L 1095,788 L 980,784 Z"/>
              <g class="nearby-service-marker" transform="translate(1012,688)" aria-hidden="true">
                <circle class="nearby-service-marker__disc" r="10"/>
                <path class="nearby-service-marker__check" d="M -4,0 L -1,3.5 L 5,-4"/>
              </g>
              <text class="ctx-lbl also-served" x="1037" y="716" text-anchor="middle">Ajax</text>
            </g>
            <!-- Whitby -->
            <g class="map-nearby-served map-nearby-served--whitby" tabindex="0" focusable="true" role="img" aria-label="Whitby — also guided by Finally Home Agents">
              <path class="ctx also-served" d="M 1095,630 L 1260,630 L 1260,792 L 1095,788 Z"/>
              <g class="nearby-service-marker" transform="translate(1147,688)" aria-hidden="true">
                <circle class="nearby-service-marker__disc" r="10"/>
                <path class="nearby-service-marker__check" d="M -4,0 L -1,3.5 L 5,-4"/>
              </g>
              <text class="ctx-lbl also-served" x="1177" y="716" text-anchor="middle">Whitby</text>
            </g>
            <!-- Oshawa -->
            <g class="map-nearby-served map-nearby-served--oshawa" tabindex="0" focusable="true" role="img" aria-label="Oshawa — also guided by Finally Home Agents">
              <path class="ctx also-served" d="M 1260,630 L 1400,630 L 1410,640 L 1404,792 L 1260,792 Z"/>
              <g class="nearby-service-marker" transform="translate(1305,688)" aria-hidden="true">
                <circle class="nearby-service-marker__disc" r="10"/>
                <path class="nearby-service-marker__check" d="M -4,0 L -1,3.5 L 5,-4"/>
              </g>
              <text class="ctx-lbl also-served" x="1335" y="716" text-anchor="middle">Oshawa</text>
            </g>
            <!-- Toronto -->
            <path class="ctx toronto" d="M 180,786 L 410,782 L 575,782 L 830,782 L 830,825 L 700,832 L 420,838 L 180,832 Z"/>
            <text class="ctx-lbl toronto" x="475" y="815" text-anchor="middle">Toronto</text>

            <!-- ── TORONTO SKYLINE (subtle bars) ─────────────────────── -->
            <g transform="translate(0, 782)" opacity="0.9">
              <rect class="skyline" x="360" y="-16" width="8" height="16"/>
              <rect class="skyline" x="374" y="-24" width="8" height="24"/>
              <rect class="skyline" x="388" y="-20" width="8" height="20"/>
              <rect class="skyline" x="402" y="-30" width="8" height="30"/>
              <rect class="skyline" x="418" y="-26" width="8" height="26"/>
              <rect class="skyline" x="434" y="-40" width="8" height="40"/>
              <rect class="skyline" x="452" y="-34" width="8" height="34"/>
              <rect class="skyline" x="470" y="-46" width="8" height="46"/>
              <rect class="skyline" x="490" y="-40" width="8" height="40"/>
              <rect class="skyline" x="510" y="-56" width="8" height="56"/>
              <rect class="skyline" x="530" y="-48" width="8" height="48"/>
              <rect class="skyline" x="552" y="-66" width="8" height="66"/>
              <rect class="skyline" x="570" y="-60" width="8" height="60"/>
              <rect class="skyline" x="586" y="-96" width="6" height="96"/><!-- CN tower-ish spike -->
              <rect class="skyline" x="602" y="-70" width="8" height="70"/>
              <rect class="skyline" x="618" y="-52" width="8" height="52"/>
              <rect class="skyline" x="636" y="-44" width="8" height="44"/>
              <rect class="skyline" x="654" y="-36" width="8" height="36"/>
              <rect class="skyline" x="670" y="-28" width="8" height="28"/>
              <rect class="skyline" x="686" y="-20" width="8" height="20"/>
            </g>

            <!-- ── SERVICE REGIONS (NorthSide GTA towns) ─────────────── -->

            <!-- Georgina -->
            <a class="map-town" tabindex="0" href="/communities/georgina" aria-label="Explore Georgina Real Estate">
              <path class="svc" d="M 575,255 L 575,170 L 600,156 L 648,150 L 700,134 L 770,118 L 846,132 L 928,122 L 1010,134 L 1092,156 L 1150,182 L 1150,255 Z"/>
              <text class="svc-name tier-lg" x="862" y="226" text-anchor="middle">Georgina</text>
              <text class="svc-sub" x="862" y="247" text-anchor="middle">Keswick · Sutton</text>
              <!-- marker ring -->
              <circle class="mring map-marker-pulse" cx="862" cy="182" r="14"/>
              <!-- wave glyph -->
              <path class="mglyph" d="M 855,180 Q 859,177 862,180 T 869,180"/>
              <path class="mglyph" d="M 855,184 Q 859,181 862,184 T 869,184"/>
            </a>

            <!-- East Gwillimbury -->
            <a class="map-town" tabindex="0" href="/communities/east-gwillimbury" aria-label="Explore East Gwillimbury Real Estate">
              <path class="svc" d="M 490,255 L 905,255 L 905,400 L 490,400 Z"/>
              <text class="svc-name tier-lg" x="697" y="340" text-anchor="middle">East Gwillimbury</text>
              <text class="svc-sub" x="697" y="362" text-anchor="middle">Holland Landing</text>
              <circle class="mring map-marker-pulse" cx="705" cy="302" r="14"/>
              <!-- field lines glyph -->
              <line class="mglyph" x1="699" y1="298" x2="711" y2="298"/>
              <line class="mglyph" x1="699" y1="302" x2="711" y2="302" stroke-dasharray="2,2"/>
              <line class="mglyph" x1="699" y1="306" x2="711" y2="306" stroke-dasharray="2,2"/>
            </a>

            <!-- Newmarket -->
            <a class="map-town" tabindex="0" href="/communities/newmarket" aria-label="Explore Newmarket Real Estate">
              <path class="svc" d="M 490,400 L 640,400 L 640,510 L 490,510 Z"/>
              <text class="svc-name tier-sm" x="565" y="468" text-anchor="middle">Newmarket</text>
              <text class="svc-sub" x="565" y="488" text-anchor="middle">Old Main</text>
              <circle class="mring map-marker-pulse" cx="565" cy="436" r="12"/>
              <!-- cross glyph -->
              <line class="mglyph" x1="565" y1="431" x2="565" y2="441"/>
              <line class="mglyph" x1="560" y1="436" x2="570" y2="436"/>
            </a>

            <!-- Aurora -->
            <a class="map-town" tabindex="0" href="/communities/aurora" aria-label="Explore Aurora Real Estate">
              <path class="svc" d="M 490,510 L 640,510 L 640,630 L 490,630 Z"/>
              <text class="svc-name tier-sm" x="565" y="582" text-anchor="middle">Aurora</text>
              <text class="svc-sub" x="565" y="602" text-anchor="middle">Town Park</text>
              <circle class="mring map-marker-pulse" cx="565" cy="548" r="12"/>
              <!-- sunrise glyph -->
              <path class="mglyph" d="M 559,552 A 6,6 0 0,1 571,552"/>
              <line class="mglyph" x1="565" y1="542" x2="565" y2="544"/>
              <line class="mglyph" x1="558" y1="544" x2="560" y2="546"/>
              <line class="mglyph" x1="570" y1="546" x2="572" y2="544"/>
            </a>

            <!-- Whitchurch-Stouffville -->
            <a class="map-town" tabindex="0" href="/communities/stouffville" aria-label="Explore Stouffville Real Estate">
              <path class="svc" d="M 640,400 L 905,400 L 905,630 L 640,630 Z"/>
              <text class="svc-name tier-md" x="772" y="500" text-anchor="middle">Whitchurch–</text>
              <text class="svc-name tier-md" x="772" y="530" text-anchor="middle">Stouffville</text>
              <text class="svc-sub" x="772" y="554" text-anchor="middle">Stouffville</text>
              <circle class="mring map-marker-pulse" cx="772" cy="458" r="14"/>
              <!-- grid glyph -->
              <rect class="mglyph" x="766" y="452" width="5" height="5" rx="0.5"/>
              <rect class="mglyph" x="773" y="452" width="5" height="5" rx="0.5"/>
              <rect class="mglyph" x="766" y="459" width="5" height="5" rx="0.5"/>
              <rect class="mglyph" x="773" y="459" width="5" height="5" rx="0.5"/>
            </a>

            <!-- Uxbridge -->
            <a class="map-town" tabindex="0" href="/communities/uxbridge" aria-label="Explore Uxbridge Real Estate">
              <path class="svc" d="M 905,255 L 1150,255 L 1150,400 L 1158,500 L 1150,630 L 905,630 Z"/>
              <text class="svc-name tier-lg" x="1027" y="462" text-anchor="middle">Uxbridge</text>
              <text class="svc-sub" x="1027" y="484" text-anchor="middle">Trail Capital</text>
              <circle class="mring map-marker-pulse" cx="1027" cy="420" r="14"/>
              <!-- pine tree glyph -->
              <path class="mglyph" d="M 1027,413 L 1031,419 L 1029,419 L 1033,425 L 1021,425 L 1025,419 L 1023,419 Z"/>
              <line class="mglyph" x1="1025" y1="425" x2="1025" y2="428"/>
              <line class="mglyph" x1="1029" y1="425" x2="1029" y2="428"/>
            </a>

            <!-- Scugog -->
            <a class="map-town" tabindex="0" href="/communities/scugog" aria-label="Explore Scugog Real Estate">
              <path class="svc" d="M 1150,255 L 1380,255 L 1392,360 L 1400,470 L 1384,560 L 1360,630 L 1150,630 L 1150,400 Z"/>
              <!-- Lake Scugog cutout -->
              <ellipse class="sublake" cx="1316" cy="360" rx="17" ry="44" transform="rotate(14,1316,360)"/>
              <text class="water-lbl sm" x="1316" y="345" text-anchor="middle">Lake</text>
              <text class="water-lbl sm" x="1316" y="357" text-anchor="middle">Scugog</text>
              <text class="svc-name tier-lg" x="1248" y="512" text-anchor="middle">Scugog</text>
              <text class="svc-sub" x="1248" y="534" text-anchor="middle">Port Perry · Lake Scugog</text>
              <circle class="mring map-marker-pulse" cx="1232" cy="470" r="14"/>
              <!-- droplet glyph -->
              <path class="mglyph" d="M 1232,463 Q 1237,468 1237,472 A 5,5 0 0,1 1227,472 Q 1227,468 1232,463 Z"/>
              <circle class="mglyph" fill="#fff" stroke="none" cx="1232" cy="472" r="1.5"/>
            </a>

            <!-- ── HIGHWAY 404 ──────────────────────────────────────── -->
            <g pointer-events="none">
              <path class="hwy-cas" d="M 650,180 C 650,260 646,330 645,400 C 645,500 646,560 646,620 C 646,700 648,760 648,800"/>
              <path class="hwy-line" d="M 650,180 C 650,260 646,330 645,400 C 645,500 646,560 646,620 C 646,700 648,760 648,800"/>
              <!-- Arrow at bottom -->
              <polygon fill="#d98b2b" points="648,810 643,796 653,796"/>
              <!-- Shield at top -->
              <rect class="shield" x="638" y="196" width="24" height="20" rx="3"/>
              <text class="shield-txt" x="650" y="210" text-anchor="middle">404</text>
            </g>

            <!-- ── COMPASS ─────────────────────────────────────────── -->
            <g transform="translate(1520, 780)" opacity="0.7">
              <line stroke="#8a8a7e" stroke-width="1.4" x1="0" y1="-24" x2="0" y2="24"/>
              <line stroke="#8a8a7e" stroke-width="1.4" x1="-24" y1="0" x2="24" y2="0"/>
              <polygon fill="#235c0d" points="0,-24 -5,-8 5,-8"/>
              <text font-family="'Blinker',system-ui,sans-serif" font-weight="700" font-size="16"
                    fill="#3a3a32" x="0" y="-28" text-anchor="middle">N</text>
            </g>

            <!-- ── SCALE ──────────────────────────────────────────── -->
            <g transform="translate(1380, 820)" opacity="0.7">
              <line stroke="#3a3a32" stroke-width="1.6" x1="0" y1="0" x2="100" y2="0"/>
              <line stroke="#3a3a32" stroke-width="1.6" x1="0" y1="-4" x2="0" y2="4"/>
              <line stroke="#3a3a32" stroke-width="1.6" x1="66" y1="-3" x2="66" y2="3"/>
              <line stroke="#3a3a32" stroke-width="1.6" x1="100" y1="-4" x2="100" y2="4"/>
              <text font-family="'Blinker',system-ui,sans-serif" font-size="12" fill="#8a8a7e"
                    x="0" y="-8">0</text>
              <text font-family="'Blinker',system-ui,sans-serif" font-size="12" fill="#8a8a7e"
                    x="60" y="-8">10</text>
              <text font-family="'Blinker',system-ui,sans-serif" font-size="12" fill="#8a8a7e"
                    x="94" y="-8">15 km</text>
            </g>

            <!-- Nearby-served tooltips render above the map so copy is never clipped. -->
            <g class="nearby-tooltip nearby-tooltip--bradford" transform="translate(210,235)" aria-hidden="true">
              <rect class="nearby-tooltip-card" width="430" height="92" rx="18"/>
              <text class="nearby-tooltip-name" x="20" y="32">Bradford</text>
              <text class="nearby-tooltip-copy" x="20" y="62">Also guided by Finally Home Agents</text>
            </g>
            <g class="nearby-tooltip nearby-tooltip--king" transform="translate(36,455)" aria-hidden="true">
              <rect class="nearby-tooltip-card" width="430" height="92" rx="18"/>
              <text class="nearby-tooltip-name" x="20" y="32">King</text>
              <text class="nearby-tooltip-copy" x="20" y="62">Also guided by Finally Home Agents</text>
            </g>
            <g class="nearby-tooltip nearby-tooltip--vaughan" transform="translate(126,655)" aria-hidden="true">
              <rect class="nearby-tooltip-card" width="430" height="92" rx="18"/>
              <text class="nearby-tooltip-name" x="20" y="32">Vaughan</text>
              <text class="nearby-tooltip-copy" x="20" y="62">Also guided by Finally Home Agents</text>
            </g>
            <g class="nearby-tooltip nearby-tooltip--richmond-hill" transform="translate(323,650)" aria-hidden="true">
              <rect class="nearby-tooltip-card" width="430" height="92" rx="18"/>
              <text class="nearby-tooltip-name" x="20" y="32">Richmond Hill</text>
              <text class="nearby-tooltip-copy" x="20" y="62">Also guided by Finally Home Agents</text>
            </g>
            <g class="nearby-tooltip nearby-tooltip--markham" transform="translate(532,655)" aria-hidden="true">
              <rect class="nearby-tooltip-card" width="430" height="92" rx="18"/>
              <text class="nearby-tooltip-name" x="20" y="32">Markham</text>
              <text class="nearby-tooltip-copy" x="20" y="62">Also guided by Finally Home Agents</text>
            </g>
            <g class="nearby-tooltip nearby-tooltip--pickering" transform="translate(735,655)" aria-hidden="true">
              <rect class="nearby-tooltip-card" width="430" height="92" rx="18"/>
              <text class="nearby-tooltip-name" x="20" y="32">Pickering</text>
              <text class="nearby-tooltip-copy" x="20" y="62">Also guided by Finally Home Agents</text>
            </g>
            <g class="nearby-tooltip nearby-tooltip--ajax" transform="translate(867,659)" aria-hidden="true">
              <rect class="nearby-tooltip-card" width="430" height="92" rx="18"/>
              <text class="nearby-tooltip-name" x="20" y="32">Ajax</text>
              <text class="nearby-tooltip-copy" x="20" y="62">Also guided by Finally Home Agents</text>
            </g>
            <g class="nearby-tooltip nearby-tooltip--whitby" transform="translate(1007,659)" aria-hidden="true">
              <rect class="nearby-tooltip-card" width="430" height="92" rx="18"/>
              <text class="nearby-tooltip-name" x="20" y="32">Whitby</text>
              <text class="nearby-tooltip-copy" x="20" y="62">Also guided by Finally Home Agents</text>
            </g>
            <g class="nearby-tooltip nearby-tooltip--oshawa" transform="translate(1165,659)" aria-hidden="true">
              <rect class="nearby-tooltip-card" width="430" height="92" rx="18"/>
              <text class="nearby-tooltip-name" x="20" y="32">Oshawa</text>
              <text class="nearby-tooltip-copy" x="20" y="62">Also guided by Finally Home Agents</text>
            </g>

          </svg>
          <noscript>
            <img
              src="/assets/homepage/northside-map.svg"
              alt="Interactive NorthSide GTA real estate map showing Aurora, Newmarket, Stouffville, Uxbridge, Georgina, East Gwillimbury, and Scugog"
              width="900" height="700"
            >
          </noscript>
          <div class="map-legend" aria-label="Map legend">
            <span class="map-legend__item"><span class="map-legend__dot map-legend__dot--focus" aria-hidden="true"></span>NorthSide GTA focus area</span>
            <span class="map-legend__item"><span class="map-legend__dot map-legend__dot--served" aria-hidden="true"></span>Guidance also available nearby</span>
          </div>
        </div>

        <nav class="focus-community-rail" aria-label="NorthSide GTA focus communities">
          <p class="focus-community-rail__label">NorthSide GTA focus communities</p>
          <div class="focus-community-rail__track">
            <a class="focus-community-rail__tile" href="/communities/georgina" aria-label="Explore Georgina Real Estate">
              <img class="focus-community-rail__logo focus-community-rail__logo--georgina" src="/assets/town-logos/georgina.webp" alt="Georgina" width="720" height="300" loading="eager" decoding="async">
              <span>Georgina</span>
            </a>
            <a class="focus-community-rail__tile" href="/communities/east-gwillimbury" aria-label="Explore East Gwillimbury Real Estate">
              <img class="focus-community-rail__logo focus-community-rail__logo--east-gwillimbury" src="/assets/town-logos/east-gwillimbury.webp" alt="East Gwillimbury" width="720" height="300" loading="eager" decoding="async">
              <span>East Gwillimbury</span>
            </a>
            <a class="focus-community-rail__tile" href="/communities/newmarket" aria-label="Explore Newmarket Real Estate">
              <img class="focus-community-rail__logo focus-community-rail__logo--newmarket" src="/assets/town-logos/newmarket.webp" alt="Newmarket" width="720" height="300" loading="eager" decoding="async">
              <span>Newmarket</span>
            </a>
            <a class="focus-community-rail__tile" href="/communities/aurora" aria-label="Explore Aurora Real Estate">
              <img class="focus-community-rail__logo focus-community-rail__logo--aurora" src="/assets/town-logos/aurora.webp" alt="Aurora" width="720" height="300" loading="eager" decoding="async">
              <span>Aurora</span>
            </a>
            <a class="focus-community-rail__tile" href="/communities/stouffville" aria-label="Explore Stouffville Real Estate">
              <img class="focus-community-rail__logo focus-community-rail__logo--stouffville" src="/assets/town-logos/stouffville.webp" alt="Whitchurch-Stouffville" width="720" height="300" loading="eager" decoding="async">
              <span>Stouffville</span>
            </a>
            <a class="focus-community-rail__tile" href="/communities/uxbridge" aria-label="Explore Uxbridge Real Estate">
              <img class="focus-community-rail__logo focus-community-rail__logo--uxbridge" src="/assets/town-logos/uxbridge.webp" alt="Uxbridge" width="720" height="300" loading="eager" decoding="async">
              <span>Uxbridge</span>
            </a>
            <a class="focus-community-rail__tile" href="/communities/scugog" aria-label="Explore Scugog Real Estate">
              <img class="focus-community-rail__logo focus-community-rail__logo--scugog" src="/assets/town-logos/scugog.webp" alt="Scugog" width="720" height="300" loading="eager" decoding="async">
              <span>Scugog</span>
            </a>
          </div>
        </nav>

        <div class="hero__map-footer" id="map-caption" aria-live="polite">
          NorthSide GTA focus communities · guidance also available in King, Bradford, Vaughan, Richmond Hill, Markham, Pickering, Ajax, Whitby, and Oshawa
        </div>
      </div>

    </div>
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
                  <span class="community-card__price-label">Avg. price · Apr 2026</span>
                  <span class="community-card__price">$767,732</span>
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
                  <span class="community-card__price-label">Avg. price · Apr 2026</span>
                  <span class="community-card__price">$1,038,275</span>
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
                  <span class="community-card__price-label">Avg. price · Apr 2026</span>
                  <span class="community-card__price">$998,202</span>
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
                  <span class="community-card__price-label">Avg. price · Apr 2026</span>
                  <span class="community-card__price">$1,153,153</span>
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
                  <span class="community-card__price-label">Avg. price · Apr 2026</span>
                  <span class="community-card__price">$1,186,821</span>
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
                  <span class="community-card__price-label">Avg. price · Apr 2026</span>
                  <span class="community-card__price">$1,023,606</span>
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
                  <span class="community-card__price-label">Avg. price · Apr 2026</span>
                  <span class="community-card__price">$865,895</span>
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
          <p class="market-snapshot__date">Last updated: April 2026 · Updated monthly</p>
        </div>
        <span class="market-snapshot__source">Source: TRREB Market Watch, April 2026</span>
      </div>

      <p class="market-context">
        Prices across the NorthSide GTA are down year-over-year — giving buyers more room to negotiate and more time to decide than at any point in the last three years.
      </p>

      <div class="market-cards" role="list" aria-label="Market data by community">
        
        <div class="market-card" role="listitem">
          <div class="market-card__top"><span class="market-card__name">Georgina</span><span class="market-card__yoy market-card__yoy--down">↓ -7.8%</span></div>
          <span class="market-card__price">$767,732</span>
          <span class="market-card__meta">Avg · 24 days on market · YoY</span>
        </div>
        <div class="market-card" role="listitem">
          <div class="market-card__top"><span class="market-card__name">East Gwillimbury</span><span class="market-card__yoy market-card__yoy--down">↓ -4.4%</span></div>
          <span class="market-card__price">$1,038,275</span>
          <span class="market-card__meta">Avg · 31 days on market · YoY</span>
        </div>
        <div class="market-card" role="listitem">
          <div class="market-card__top"><span class="market-card__name">Newmarket</span><span class="market-card__yoy market-card__yoy--down">↓ -9.2%</span></div>
          <span class="market-card__price">$998,202</span>
          <span class="market-card__meta">Avg · 24 days on market · YoY</span>
        </div>
        <div class="market-card" role="listitem">
          <div class="market-card__top"><span class="market-card__name">Aurora</span><span class="market-card__yoy market-card__yoy--down">↓ -12.3%</span></div>
          <span class="market-card__price">$1,153,153</span>
          <span class="market-card__meta">Avg · 26 days on market · YoY</span>
        </div>
        <div class="market-card" role="listitem">
          <div class="market-card__top"><span class="market-card__name">Whitchurch-Stouffville</span><span class="market-card__yoy market-card__yoy--down">↓ -10.2%</span></div>
          <span class="market-card__price">$1,186,821</span>
          <span class="market-card__meta">Avg · 27 days on market · YoY</span>
        </div>
        <div class="market-card" role="listitem">
          <div class="market-card__top"><span class="market-card__name">Uxbridge</span><span class="market-card__yoy market-card__yoy--down">↓ -7.3%</span></div>
          <span class="market-card__price">$1,023,606</span>
          <span class="market-card__meta">Avg · 37 days on market · YoY</span>
        </div>
        <div class="market-card" role="listitem">
          <div class="market-card__top"><span class="market-card__name">Scugog</span><span class="market-card__yoy market-card__yoy--down">↓ -6.4%</span></div>
          <span class="market-card__price">$865,895</span>
          <span class="market-card__meta">Avg · 37 days on market · YoY</span>
        </div>
      </div>

      <p class="market-snapshot__disclaimer">
        Source: TRREB Market Watch · April 2026. Figures are rounded and may vary by property type, location, and condition.
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
        data-netlify="true"
        netlify-honeypot="bot-field"
        action="/thank-you"
        novalidate
      >
        <input type="hidden" name="form-name" value="homepage-lead">
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
