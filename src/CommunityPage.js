// src/CommunityPage.js
import React from 'react';
import { Link } from 'react-router-dom';
import Navigation from './Navigation';
import Card from './components/ui/Card';
import { HiLocationMarker } from 'react-icons/hi';
import { FaTools } from 'react-icons/fa';

/* dotted background */
const PageBackground = () => (
  <style>{`
    body{
      background-image:radial-gradient(circle,rgba(0,0,0,0.05)1px,transparent 1px);
      background-size:12px 12px;
    }
  `}</style>
);

/* tailwind classes for an “outline button” look */
const linkButton =
  'inline-block px-5 py-3 rounded-md border border-gray-300 ' +
  'text-sm font-medium text-gray-800 hover:bg-gray-50 transition';

export default function CommunityPage() {
  return (
    <>
      <PageBackground />
      <Navigation />

      <main className="px-4 md:px-20 py-16 flex flex-col items-center text-center space-y-16">

        {/* HERO */}
        <section className="space-y-6 max-w-3xl">
          <HiLocationMarker className="w-14 h-14 text-green-600 mx-auto" />
          <h1 className="text-4xl md:text-5xl font-bold">
            Community Guides<br/>Coming&nbsp;Soon
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground">
            We’re curating neighbourhood deep-dives, school rankings, parks, trails&nbsp;&amp; more
            for every corner of the NorthSide&nbsp;GTA. Stay tuned!
          </p>

          <FaTools className="w-24 h-24 text-green-600 mx-auto opacity-70" />
        </section>

        {/* QUICK LINKS */}
        <section className="grid sm:grid-cols-3 gap-6 w-full max-w-4xl">
          {[
            { title:'Buyers',  text:'Learn how we help buyers succeed', link:'/buyers'  },
            { title:'Sellers', text:'Our stand-out listing strategy',   link:'/sellers' },
            { title:'Contact', text:'Ask us anything right now',        link:'/contact' },
          ].map(card=>(
            <Card key={card.title} className="space-y-3 text-center">
              <h3 className="text-xl font-semibold">{card.title}</h3>
              <p className="text-muted-foreground text-sm">{card.text}</p>
              <Link to={card.link} className={linkButton}>
                Go&nbsp;→
              </Link>
            </Card>
          ))}
        </section>
      </main>
    </>
  );
}
