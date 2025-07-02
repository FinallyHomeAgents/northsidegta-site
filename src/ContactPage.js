// src/ContactPage.js
import React from 'react';

/* shared components */
import Navigation from './Navigation';
import Button     from './components/ui/Button';
import Card       from './components/ui/Card';

export default function ContactPage() {
  return (
    <>
      {/* ─────────── Navbar ─────────── */}
      <Navigation />

      {/* ─────────── Page Content ─────────── */}
      <div className="space-y-16 px-4 md:px-20 py-12">

        {/* Hero */}
        <section className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold">
            Let’s Talk About Your Next Move.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Questions about buying, selling, or life in the NorthSide GTA?
            Drop us a note below — no pressure, just real advice.
          </p>

          {/* reply-time badge */}
          <p className="flex justify-center mt-2">
            <span className="inline-block bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-sm font-medium">
              💬 We reply within 1&nbsp;hour (9 am – 9 pm)
            </span>
          </p>
        </section>

        {/* Form + Contact Card */}
        <section className="grid md:grid-cols-2 gap-12 items-start">

          {/* Netlify Form */}
          <form name="contact" method="POST" data-netlify="true" className="space-y-4 w-full">
            <input type="hidden" name="form-name" value="contact" />

            <input name="name"  placeholder="Full Name"  className="w-full border rounded-md px-4 py-3" required />
            <input name="email" type="email" placeholder="Email" className="w-full border rounded-md px-4 py-3" required />
            <input name="phone" placeholder="Phone (optional)" className="w-full border rounded-md px-4 py-3" />

            <select name="subject" className="w-full border rounded-md px-4 py-3">
              <option>What can we help you with?</option>
              <option>Buying a home</option>
              <option>Selling a home</option>
              <option>VIP Client Program</option>
              <option>Something else</option>
            </select>

            <textarea
              name="message"
              rows="5"
              placeholder="Your Message"
              className="w-full border rounded-md px-4 py-3"
              required
            />

            <Button size="lg" type="submit">Send Message</Button>
          </form>

          {/* Contact Card */}
          <Card className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Contact Info</h2>
              <p className="text-lg">📞 (647) 668-4646</p>
              <p className="text-lg">📧 info@finallyhomeagents.ca</p>
              <p className="text-lg">🏢 123 Main St, Uxbridge ON</p>

              {/* socials */}
              <div className="flex gap-4 mt-4">
                <a href="https://instagram.com/finallyhomeagents" target="_blank" rel="noreferrer">Instagram</a>
                <a href="https://facebook.com/finallyhomeagents"  target="_blank" rel="noreferrer">Facebook</a>
              </div>
            </div>

            {/* WhatsApp CTA */}
            <a
              href="https://wa.me/16476684646?text=Hi%20Finally%20Home%20Agents%20👋"
              target="_blank"
              rel="noreferrer"
              className="
                relative flex items-center justify-center gap-3
                bg-gradient-to-r from-[#25D366] via-[#20bf5e] to-[#128C7E]
                text-white px-6 py-4 rounded-2xl shadow-xl
                hover:shadow-2xl hover:scale-[1.04] transition-all duration-300
              "
            >
              {/* badge moved slightly inward */}
              <span
                className="
                  absolute top-0 right-0 translate-x-1/3 -translate-y-1/3
                  bg-yellow-400 text-white text-xs font-bold
                  px-2 py-0.5 rounded-full shadow animate-bounce
                "
              >
                ✨ Instant Chat
              </span>

              {/* WhatsApp icon */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="w-6 h-6 fill-current">
                <path d="M380.9 97.1C339 55.3 282.1 32 224.1 32 100.3 32 0 132.3 0 256c0 45 11.7 89 34 128.1L0 480l99.9-32.6C137.9 466.3 181 480 224.1 480c123.7 0 224.1-100.3 224.1-224.1 0-58-23.2-114.9-68.3-158.8zM224.1 438c-41.5 0-82.7-12.3-117.7-35.4l-8.4-5.3-59.5 19.4 19.8-58.2-5.5-8.5C30.6 314.3 16 285.9 16 256 16 141.1 109.1 48 224.1 48c59.7 0 115.9 23.3 158.3 65.6 42.4 42.4 65.8 98.6 65.8 158.3 0 114.9-93.1 206.1-224.1 206.1zm121.5-146.4c-6.6-3.3-39-19.2-45.1-21.3-6.1-2.1-10.5-3.3-14.9 3.3-4.5 6.6-17.1 21.3-21 25.6-3.8 4.2-7.7 4.8-14.3 1.6-6.6-3.3-27.9-10.2-53.2-32.5-19.6-17.5-32.8-39.1-36.6-45.7-3.8-6.6-.4-10.2 3-13.5 3.1-3.1 6.6-8.1 9.9-12.1 3.3-4 4.4-6.6 6.6-11 2.1-4.5 1.1-8.1-.5-11.4-1.6-3.3-14.9-35.9-20.5-49.3-5.4-13-10.9-11.2-14.9-11.4-3.8-.2-8.1-.2-12.4-.2s-11.4 1.6-17.4 8.1c-6.1 6.6-23 22.4-23 54.4 0 32 23.5 62.9 26.8 67.3 3.3 4.5 46.2 70.4 112 98.5 65.8 28 65.8 18.7 77.6 17.5 11.9-1.2 39-15.9 44.5-31.3 5.5-15.3 5.5-28.4 3.8-31.2-1.6-2.8-6.1-4.4-12.7-7.6z" />
              </svg>

              <span className="text-lg font-semibold">Connect with us on WhatsApp</span>
            </a>
            <p className="text-sm text-center text-muted-foreground -mt-2">
              Instant replies • 9 am – 9 pm
            </p>

            <Button as="a" href="https://calendly.com/yourlink" variant="outline" size="lg">
              Book a Call
            </Button>
          </Card>
        </section>

        {/* Map placeholder */}
        <section className="text-center space-y-4">
          <h2 className="text-3xl font-semibold">Where We Work</h2>
          <p className="max-w-2xl mx-auto text-muted-foreground">
            Proudly serving Uxbridge, Georgina, Stouffville, East Gwillimbury, Newmarket, Scugog and beyond.
          </p>
          <div className="w-full aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
            <span className="text-gray-500">[ Map Placeholder ]</span>
          </div>
        </section>

        {/* Trust logos */}
        <section className="flex flex-wrap justify-center gap-6 mt-8">
          <img src="/Images/brokerage.png" alt="HomeLife Optimum Realty" className="h-10 w-auto opacity-80" />
          <img src="/Images/reco.png"      alt="Registered with RECO"    className="h-10 w-auto opacity-80" />
          <img src="/Images/treb.png"      alt="Member: TRREB"           className="h-10 w-auto opacity-80" />
        </section>

        {/* Quick CTA cards */}
        <section className="grid md:grid-cols-3 gap-6">
          {[
            { title: 'Buyers',      text: 'Learn how we help buyers succeed' },
            { title: 'Sellers',     text: 'See what makes our listings stand out' },
            { title: 'VIP Program', text: 'Unlock early access & special perks' },
          ].map((item, i) => (
            <Card key={i} className="text-center space-y-3">
              <h3 className="text-xl font-semibold">{item.title}</h3>
              <p className="text-muted-foreground">{item.text}</p>
              <Button variant="outline">Learn More</Button>
            </Card>
          ))}
        </section>
      </div>

      {/* Floating WhatsApp button */}
      <a
        href="https://wa.me/16476684646?text=Hi%20Finally%20Home%20Agents%20👋"
        target="_blank"
        rel="noreferrer"
        className="
          fixed bottom-6 right-6 w-16 h-16 rounded-full
          bg-gradient-to-br from-[#25D366] to-[#128C7E]
          flex items-center justify-center shadow-xl
          hover:shadow-2xl hover:scale-110 transition-all duration-300
        "
        aria-label="Chat on WhatsApp"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="w-8 h-8 fill-white">
          <path d="M380.9 97.1C339 55.3 282.1 32 ..." />{/* truncated for brevity */}
        </svg>
      </a>
    </>
  );
}
