import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import {readFile} from 'node:fs/promises';
import {createMetricsHandler,recordMetric} from '../lib/golf-course-living/metrics.mjs';
import {createReportHandler} from '../lib/golf-course-living/report.mjs';

const script=await readFile(new URL('../public/golf-course-living/shortlist-form.js',import.meta.url),'utf8');
const posts=[
  {
    "name": "Support Small Business — Vaughan, North York, Richmond Hill, Toronto",
    "group": "https://www.facebook.com/groups/canadianbusinesssupport/about",
    "tracking_url": "https://northsidegta.ca/golf-course-living/?utm_source=facebook&utm_medium=organic-social&utm_campaign=golf-course-living&utm_content=local-group&utm_term=toronto-regional-small-business",
    "post_url": "https://www.facebook.com/groups/3491899827790374/posts/4560608197586193/",
    "status": "published",
    "verified_at": "2026-11-09T19:13:48.981Z",
    "submission_attempts": 1,
    "duplicate_check": "No pending or published posts before submission",
    "caption": "Our 3 favourite towns north of Toronto for golfers.\n\nIf golf is part of the life you want outside the city, Uxbridge, Aurora and Stouffville are worth comparing.\n\nWe’re Matthew and Landon, golfers and real estate agents with Finally Home Agents. Our free guide compares Uxbridge, Aurora and Stouffville through 13 selected courses, public and private golf options, nearby home styles and the questions to ask before choosing a property.\n\nRead the guide without providing an email. If you’re considering a move, our optional personalized golf-and-home shortlist helps connect your preferred towns, home needs and budget.\n\nMatthew Mulhall — Real Estate Agent\nLandon Mulhall — Real Estate Agent\nFinally Home Agents\nHomeLife Optimum Realty, Brokerage\n\nhttps://northsidegta.ca/golf-course-living/?utm_source=facebook&utm_medium=organic-social&utm_campaign=golf-course-living&utm_content=local-group&utm_term=toronto-regional-small-business"
  },
  {
    "name": "Toronto Business Owners | Free Advertisement | GTA",
    "group": "https://www.facebook.com/groups/gtabusiness/about",
    "tracking_url": "https://northsidegta.ca/golf-course-living/?utm_source=facebook&utm_medium=organic-social&utm_campaign=golf-course-living&utm_content=local-group&utm_term=toronto-business-owners",
    "post_url": "https://www.facebook.com/groups/1308477709860069/posts/2057869674920865/",
    "status": "published",
    "verified_at": "2026-11-09T19:13:49.014Z",
    "submission_attempts": 1,
    "duplicate_check": "No pending or published posts before submission",
    "caption": "Our 3 favourite towns north of Toronto for golfers.\n\nThinking about where you could live with more golf nearby? The courses are only half the decision—the surrounding town matters too.\n\nWe’re Matthew and Landon, golfers and real estate agents with Finally Home Agents. Our free guide compares Uxbridge, Aurora and Stouffville through 13 selected courses, public and private golf options, nearby home styles and the questions to ask before choosing a property.\n\nRead the guide without providing an email. If you’re considering a move, our optional personalized golf-and-home shortlist helps connect your preferred towns, home needs and budget.\n\nMatthew Mulhall — Real Estate Agent\nLandon Mulhall — Real Estate Agent\nFinally Home Agents\nHomeLife Optimum Realty, Brokerage\n\nhttps://northsidegta.ca/golf-course-living/?utm_source=facebook&utm_medium=organic-social&utm_campaign=golf-course-living&utm_content=local-group&utm_term=toronto-business-owners"
  },
  {
    "name": "Local Business Toronto",
    "group": "https://www.facebook.com/groups/1530671063905320/about",
    "tracking_url": "https://northsidegta.ca/golf-course-living/?utm_source=facebook&utm_medium=organic-social&utm_campaign=golf-course-living&utm_content=local-group&utm_term=local-business-toronto",
    "post_url": "https://www.facebook.com/groups/1530671063905320/posts/4094168237555577/",
    "status": "published",
    "verified_at": "2026-11-09T19:13:49.014Z",
    "submission_attempts": 1,
    "duplicate_check": "No pending or published posts before submission",
    "caption": "Our 3 favourite towns north of Toronto for golfers.\n\nFor Toronto golfers considering a move north: what would change beyond the drive to the first tee?\n\nWe’re Matthew and Landon, golfers and real estate agents with Finally Home Agents. Our free guide compares Uxbridge, Aurora and Stouffville through 13 selected courses, public and private golf options, nearby home styles and the questions to ask before choosing a property.\n\nRead the guide without providing an email. If you’re considering a move, our optional personalized golf-and-home shortlist helps connect your preferred towns, home needs and budget.\n\nMatthew Mulhall — Real Estate Agent\nLandon Mulhall — Real Estate Agent\nFinally Home Agents\nHomeLife Optimum Realty, Brokerage\n\nhttps://northsidegta.ca/golf-course-living/?utm_source=facebook&utm_medium=organic-social&utm_campaign=golf-course-living&utm_content=local-group&utm_term=local-business-toronto"
  },
  {
    "name": "BIG Buy & Sell — Toronto, Mississauga, Brampton, all GTA",
    "group": "https://www.facebook.com/groups/TorontoBuySellOnline/about",
    "tracking_url": "https://northsidegta.ca/golf-course-living/?utm_source=facebook&utm_medium=organic-social&utm_campaign=golf-course-living&utm_content=local-group&utm_term=big-buy-sell-gta",
    "post_url": "https://www.facebook.com/groups/1706469899616171/posts/4478976985698768/",
    "status": "published",
    "verified_at": "2026-11-09T19:13:49.014Z",
    "submission_attempts": 1,
    "duplicate_check": "No pending or published posts before submission",
    "caption": "Our 3 favourite towns north of Toronto for golfers.\n\nA home near golf can mean very different things: public courses nearby, a private club, or a property beside the fairway.\n\nWe’re Matthew and Landon, golfers and real estate agents with Finally Home Agents. Our free guide compares Uxbridge, Aurora and Stouffville through 13 selected courses, public and private golf options, nearby home styles and the questions to ask before choosing a property.\n\nRead the guide without providing an email. If you’re considering a move, our optional personalized golf-and-home shortlist helps connect your preferred towns, home needs and budget.\n\nMatthew Mulhall — Real Estate Agent\nLandon Mulhall — Real Estate Agent\nFinally Home Agents\nHomeLife Optimum Realty, Brokerage\n\nhttps://northsidegta.ca/golf-course-living/?utm_source=facebook&utm_medium=organic-social&utm_campaign=golf-course-living&utm_content=local-group&utm_term=big-buy-sell-gta"
  },
  {
    "name": "Marketing and Promoting Ontario Businesses (FREE)",
    "group": "https://www.facebook.com/groups/2316113715199867/about",
    "tracking_url": "https://northsidegta.ca/golf-course-living/?utm_source=facebook&utm_medium=organic-social&utm_campaign=golf-course-living&utm_content=local-group&utm_term=ontario-business-marketing",
    "post_url": "https://www.facebook.com/groups/2316113715199867/posts/4448451238632760/",
    "status": "published",
    "verified_at": "2026-11-09T19:13:49.014Z",
    "submission_attempts": 1,
    "duplicate_check": "No pending or published posts before submission",
    "caption": "Our 3 favourite towns north of Toronto for golfers.\n\nExploring a move to the north side of the GTA—and hoping golf can be part of everyday life?\n\nWe’re Matthew and Landon, golfers and real estate agents with Finally Home Agents. Our free guide compares Uxbridge, Aurora and Stouffville through 13 selected courses, public and private golf options, nearby home styles and the questions to ask before choosing a property.\n\nRead the guide without providing an email. If you’re considering a move, our optional personalized golf-and-home shortlist helps connect your preferred towns, home needs and budget.\n\nMatthew Mulhall — Real Estate Agent\nLandon Mulhall — Real Estate Agent\nFinally Home Agents\nHomeLife Optimum Realty, Brokerage\n\nhttps://northsidegta.ca/golf-course-living/?utm_source=facebook&utm_medium=organic-social&utm_campaign=golf-course-living&utm_content=local-group&utm_term=ontario-business-marketing"
  }
];
const res=()=>({setHeader(){},status(n){this.code=n;return this},json(b){this.body=b;return this}});
function browser(url){const handlers={},requests=[],store=new Map(),form={dataset:{metrics:'enabled',delivery:'enabled'},querySelector:()=>({}),addEventListener:(k,v)=>handlers[k]=v},status={};const context={URL,URLSearchParams,Set,location:new URL(url),navigator:{},crypto:{randomUUID:()=> '12345678-1234-1234-1234-123456789abc'},sessionStorage:{setItem:(k,v)=>store.set(k,v),getItem:k=>store.get(k),removeItem:k=>store.delete(k)},document:{getElementById:id=>id==='shortlist-form'?form:status,visibilityState:'visible',addEventListener(){},createElement:()=>({setAttribute(){},style:{},append(){}}),body:{prepend(){}}},fetch:async(u,o)=>{requests.push({u,body:JSON.parse(o.body)});return {ok:true,json:async()=>({ok:true})}}};vm.runInNewContext(script,context);return {handlers,requests,status};}
for(const post of posts)test('existing published link attributes '+post.name,()=>{const b=browser(post.tracking_url);b.handlers.input();assert.equal(b.requests.length,2);for(const r of b.requests){assert.equal(r.body.source,'facebook');assert.equal(r.body.placement,new URL(post.tracking_url).searchParams.get('utm_term'));}});
test('Instagram bio placement survives and tests never submit an inquiry',async()=>{const b=browser('https://northsidegta.ca/golf-course-living/?utm_source=instagram&utm_content=reel-v17-bio&northside_test=1');b.handlers.input();await b.handlers.submit({preventDefault(){}});assert.equal(b.requests.length,2);for(const r of b.requests){assert.equal(r.body.source,'instagram');assert.equal(r.body.placement,'reel-v17-bio');assert.equal(r.body.audience,'internal-test');}assert.match(b.status.textContent,/No inquiry was sent/);});
test('unknown URL text is not captured',()=>{const b=browser('https://northsidegta.ca/golf-course-living/?utm_source=facebook&utm_term=someone@example.com');assert.equal(b.requests[0].body.placement,'unspecified');assert.ok(!JSON.stringify(b.requests).includes('@'));});
test('test aggregate has separate key and dedup identity',async()=>{const rows=[];for(const audience of ['visitor','internal-test'])await recordMetric(async c=>rows.push(c),{event:'page_view',source:'instagram',placement:'reel-v17-bio',audience,id:'id'});assert.notEqual(rows[0][4],rows[1][4]);assert.equal(rows[1].at(-1),'instagram|reel-v17-bio|page_view|internal-test');});
test('invalid audience and contact fields rejected',async()=>{for(const extra of [{audience:'bad'},{email:'x@y.ca'}]){const r=res();await createMetricsHandler({env:{NORTHSIDE_GOLF_LIVING_METRICS_ENABLED:'true'}})({method:'POST',headers:{origin:'https://northsidegta.ca','content-type':'application/json'},body:{event:'page_view',source:'instagram',placement:'reel-v17-bio',id:'12345678-1234-1234-1234-123456789abc',...extra}},r);assert.equal(r.code,400);}});
