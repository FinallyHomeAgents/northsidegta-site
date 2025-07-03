// src/SellersPage.js
import React, { useState } from 'react';
import Navigation from './Navigation';
import Button from './components/ui/Button';
import Card from './components/ui/Card';
import {
  HiChatAlt2,
  HiChartBar,
  HiOutlineCog,
  HiCamera,
  HiPaperAirplane,
  HiPencilAlt,
  HiKey
} from 'react-icons/hi';
import { FaInstagram, FaFacebookF } from 'react-icons/fa';

/* dotted background */
const PageBackground = () => (
  <style>{`
    body{
      background-image:radial-gradient(circle,rgba(0,0,0,0.05)1px,transparent 1px);
      background-size:12px 12px;
    }
  `}</style>
);

/* timeline data */
const timeline = [
  { title:'Never Too Early',              icon:<HiChatAlt2 className="w-8 h-8 text-green-600"/>, copy:'Reach out months in advance to get market intel & timing advice.' },
  { title:'Strategy & AI Market Analysis',icon:<HiChartBar className="w-8 h-8 text-green-600"/>, copy:'On-site walk-through + AI-powered pricing roadmap.', badge:'AI Market Analysis' },
  { title:'Prep Support',                 icon:<HiOutlineCog className="w-8 h-8 text-green-600"/>, copy:'Trusted pros for repairs, painting & junk removal — all lined up for you.', badge:'Staging Consult Included' },
  { title:'Media & Marketing',            icon:<HiCamera className="w-8 h-8 text-green-600"/>, copy:'Pro photos, drone, 3-D tour, reels & paid ads — full spotlight.' },
  { title:'Launch Week',                  icon:<HiPaperAirplane className="w-8 h-8 text-green-600"/>, copy:'MLS live + multi-channel buzz drives maximum traffic fast.' },
  { title:'Offers & Negotiation',         icon:<HiPencilAlt className="w-8 h-8 text-green-600"/>, copy:'Expert playbook to secure top price, ideal terms & smooth closing.' },
  { title:'Closing & Beyond',             icon:<HiKey className="w-8 h-8 text-green-600"/>, copy:'Lawyers, movers & checklists — we stay until the keys change hands.' },
];

/* listing videos */
const videos = [
  {
    title: 'Queensville Showcase: 472 Seaview Heights',
    embed: 'https://listings.wylieford.com/videos/01922f3a-c66a-7001-83e7-0e7fb17543bb'
  },
  {
    title: 'Golf Course Estate in Uxbridge – 42 Wyndance Way',
    embed: 'https://player.vimeo.com/video/832255969'
  },
];

export default function SellersPage() {
  /* message-form state */
  const [formData, setFormData] = useState({ name:'', email:'', phone:'', message:'' });
  const [formSent, setFormSent] = useState(false);

  async function handleSellerFormSubmit(e){
    e.preventDefault();
    const res = await fetch('https://formspree.io/f/mwpborow',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(formData)
    });
    if(res.ok) setFormSent(true);
    else alert('Something went wrong — please try again.');
  }

  return (
    <>
      <PageBackground />
      <Navigation />

      <div className="space-y-16 px-4 md:px-20 py-12">

        {/* HERO */}
        <section className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold">Sell for More. Stress-Free.</h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            From early planning to closing day, Finally&nbsp;Home&nbsp;Agents give your
            home the A-list treatment — and you the peace of mind you deserve.
          </p>
          <Button size="lg" as="a" href="#timeline">See the Plan</Button>
        </section>

        {/* QUOTE */}
        <Card className="max-w-3xl mx-auto text-center bg-green-50 border border-green-100 p-6 md:p-8">
          <p className="italic text-lg md:text-xl">
            “If you fail to plan, you are planning to fail.” — Benjamin&nbsp;Franklin
          </p>
        </Card>

        {/* TIMELINE */}
        <section id="timeline" className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {timeline.map((step,idx)=>(
            <Card key={idx} className="space-y-3 p-6 text-center h-full flex flex-col">
              <span className="inline-block text-xs font-semibold bg-green-50 text-green-700 rounded-full px-3 py-1">
                Step {idx+1}
              </span>
              <div className="flex justify-center">{step.icon}</div>
              <h3 className="text-xl font-semibold">{step.title}</h3>
              <p className="text-sm text-muted-foreground flex-1">{step.copy}</p>
              {step.badge && (
                <span className="inline-block bg-green-100 text-green-700 text-xs font-medium px-3 py-1 rounded-full">
                  {step.badge}
                </span>
              )}
            </Card>
          ))}
        </section>

        {/* VIDEO SHOWCASE */}
        <section className="space-y-6">
          <h2 className="text-3xl font-semibold text-center">See Us in Action</h2>
          <p className="text-center text-muted-foreground max-w-2xl mx-auto">
            A glimpse of the VIP media treatment every listing receives.
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {videos.map((v,idx)=>(
              <Card key={idx} className="overflow-hidden flex flex-col p-0">
                {/* responsive 16×9 wrapper */}
                <div className="relative w-full" style={{ paddingTop:'56.25%' }}>
                  <iframe
                    src={v.embed}
                    title={v.title}
                    className="absolute inset-0 w-full h-full"
                    frameBorder="0"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <h3 className="text-lg font-semibold px-5 py-5">{v.title}</h3>
              </Card>
            ))}
          </div>
        </section>

        {/* CONTACT SECTION */}
        <section className="space-y-8">

          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-semibold">Reach Out Your Way.</h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto">
              Call, chat, or drop us a quick note — whichever’s easiest. We reply fast.
            </p>
            <p className="flex justify-center">
              <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                💬 We reply within 1&nbsp;hour&nbsp;(9&nbsp;am&nbsp;–&nbsp;9&nbsp;pm)
              </span>
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-start">

            {/* message form */}
            {!formSent ? (
              <form onSubmit={handleSellerFormSubmit} className="space-y-4 w-full">
                <input
                  type="text" name="name" placeholder="Full Name" required
                  value={formData.name}
                  onChange={e=>setFormData({...formData,name:e.target.value})}
                  className="w-full border rounded-md px-4 py-3"
                />
                <input
                  type="email" name="email" placeholder="Email" required
                  value={formData.email}
                  onChange={e=>setFormData({...formData,email:e.target.value})}
                  className="w-full border rounded-md px-4 py-3"
                />
                <input
                  type="tel" name="phone" placeholder="Phone (optional)"
                  value={formData.phone}
                  onChange={e=>setFormData({...formData,phone:e.target.value})}
                  className="w-full border rounded-md px-4 py-3"
                />
                <textarea
                  name="message" rows="4" placeholder="Your Message" required
                  value={formData.message}
                  onChange={e=>setFormData({...formData,message:e.target.value})}
                  className="w-full border rounded-md px-4 py-3"
                />
                <Button size="lg" type="submit" className="w-full sm:w-auto">
                  Send Message
                </Button>
              </form>
            ) : (
              <Card className="p-6 text-center bg-green-50">
                <h3 className="text-xl font-semibold text-green-700 mb-2">Thank you!</h3>
                <p className="text-sm text-muted-foreground">
                  Your message is on its way. We’ll respond within the hour.
                </p>
              </Card>
            )}

            {/* contact info */}
            <Card className="space-y-4 sm:space-y-6">
              <div className="space-y-1 sm:space-y-2">
                <h3 className="text-xl sm:text-2xl font-semibold">Contact Info</h3>
                <p className="text-base">📞 <a href="tel:16476684646" className="hover:underline">(647) 668-4646</a></p>
                <p className="text-base">📧 <a href="mailto:contact@finallyhomeagents.com" className="hover:underline">contact@finallyhomeagents.com</a></p>
                <p className="text-base">📍 <span className="font-medium">NorthSide GTA</span> — <span className="italic">More Community, Less Traffic</span></p>
              </div>

              {/* WhatsApp */}
              <a
                href="https://wa.me/16476684646?text=Hi%20Finally%20Home%20Agents%20👋"
                target="_blank" rel="noreferrer"
                className="relative flex items-center justify-center gap-3
                           bg-gradient-to-r from-[#25D366] via-[#20bf5e] to-[#128C7E]
                           text-white px-6 py-4 rounded-2xl shadow-xl
                           hover:shadow-2xl hover:scale-[1.03] transition"
              >
                <span className="absolute top-0 right-0 translate-x-1/3 -translate-y-1/3
                                 bg-yellow-400 text-white text-xs font-bold px-1.5 py-[1px]
                                 rounded-full shadow animate-bounce">
                  Chat
                </span>
                <svg viewBox="0 0 448 512" className="w-5 h-5 fill-current"><path d="M380.9 97.1c-39.7-39.7-92.5-61.6-148.9-61.1C100.3 36.4 0 138 0 261.8c0 45.1 11.9 88.9 34.5 127.7L0 512l125.2-33.1c37.8 20.8 79.8 31.7 122.6 31.6h.6c123.5 0 224-100.7 224-224.6.1-59.3-22.9-115.1-64.5-156.8z"/></svg>
                WhatsApp
              </a>

              {/* socials */}
              <p className="text-center text-xs sm:text-sm font-medium text-muted-foreground">
                Follow Finally Home Agents
              </p>
              <div className="flex justify-center gap-3">
                <a href="https://instagram.com/finallyhomeagents" target="_blank" rel="noreferrer"
                   className="flex items-center justify-center w-9 h-9 rounded-full
                              bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500
                              text-white shadow hover:shadow-lg hover:scale-110 transition">
                  <FaInstagram className="w-4 h-4" />
                  <span className="sr-only">Instagram</span>
                </a>
                <a href="https://facebook.com/finallyhomeagents" target="_blank" rel="noreferrer"
                   className="flex items-center justify-center w-9 h-9 rounded-full
                              bg-[#1877F2] text-white shadow hover:bg-[#0f6ae0]
                              hover:shadow-lg hover:scale-110 transition">
                  <FaFacebookF className="w-4 h-4" />
                  <span className="sr-only">Facebook</span>
                </a>
              </div>
            </Card>
          </div>
        </section>
      </div>
    </>
  );
}
