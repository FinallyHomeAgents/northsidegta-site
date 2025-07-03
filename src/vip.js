// src/VipPage.js
import { useState } from 'react';
import Navigation from './Navigation';   // ← added

export default function VipPage() {
  const [enteredPassword, setEnteredPassword] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [submittedInfo, setSubmittedInfo] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    email: '',
    phone: ''
  });

  const correctPassword = "northsidevip";

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (enteredPassword === correctPassword) {
      setIsAuthorized(true);
      alert("Access granted! Welcome to the VIP Club.");
    } else {
      alert("Incorrect password. Please try again or request an invitation.");
    }
  };

  const handleInfoSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch("https://formspree.io/f/mwpborow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });
    if (response.ok) setSubmittedInfo(true);
    else alert("There was a problem submitting your information. Please try again.");
  };

  /* ─────────── PASSWORD SCREEN ─────────── */
  if (!isAuthorized) {
    return (
      <>
        <Navigation />
        <div
          className="min-h-screen bg-cover bg-center flex items-center justify-center px-4"
          style={{ backgroundImage: `url('/vip-bg.png')` }}
        >
          <form onSubmit={handlePasswordSubmit} className="bg-white bg-opacity-90 p-8 rounded-xl shadow-md max-w-md w-full">
            <h1 className="text-2xl font-bold mb-4 text-center text-green-700">VIP Access Only</h1>
            <p className="text-center text-gray-600 mb-6">
              This page is by invitation only. Please enter your password to continue.
            </p>
            <input
              type="password"
              placeholder="Enter VIP Password"
              value={enteredPassword}
              onChange={(e) => setEnteredPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded mb-4"
            />
            <button type="submit" className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition">
              Enter
            </button>
          </form>
        </div>
      </>
    );
  }

  /* ─────────── INFO-COLLECTION FORM ─────────── */
  if (!submittedInfo) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-white flex items-center justify-center px-4">
          <form onSubmit={handleInfoSubmit} className="bg-gray-100 p-8 rounded-xl shadow-md max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4 text-center text-green-700">You're In!</h2>
            <p className="text-center text-gray-600 mb-6">
              You've been accepted into the VIP Club. Please provide your contact details to unlock your VIP perks.
            </p>
            <input
              type="text" placeholder="Full Name" required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border rounded mb-4"
            />
            <input
              type="text" placeholder="Address" required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-4 py-2 border rounded mb-4"
            />
            <input
              type="email" placeholder="Email Address" required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border rounded mb-4"
            />
            <input
              type="tel" placeholder="Phone Number" required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2 border rounded mb-4"
            />
            <button type="submit" className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition">
              Submit
            </button>
          </form>
        </div>
      </>
    );
  }

  /* ─────────── VIP CONTENT ─────────── */
  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-white text-gray-900">
        <section className="relative h-64 w-full">
          <img
            src="/vip-hero.png"
            alt="VIP Hero Real Estate"
            className="w-full h-full object-cover rounded-b-xl"
          />
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <h1 className="text-white text-4xl font-bold">Welcome to the VIP Experience</h1>
          </div>
        </section>

        <section className="py-12 px-6 max-w-4xl mx-auto text-center">
          <p className="text-lg">
            You've been personally invited to access exclusive real estate insights, listings, and opportunities in the
            NorthSide GTA before the general public.
          </p>
        </section>

        <section className="py-12 px-6 max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-semibold mb-4">What You Get as a VIP</h2>
          <ul className="text-left list-disc list-inside text-gray-700 space-y-2">
            <li>First look at off-market and coming-soon listings</li>
            <li>Exclusive market reports and community data</li>
            <li>Private events and real estate tours</li>
            <li>Priority booking for consultations with our team</li>
          </ul>
        </section>

        <section className="bg-green-600 text-white py-12 px-6 text-center">
          <h2 className="text-2xl font-bold mb-2">You're In.</h2>
          <p className="mb-6">Explore your VIP tools and stay tuned for what's next.</p>
          <a
            href="/"
            className="bg-white text-green-700 font-semibold px-6 py-3 rounded-xl hover:bg-gray-100 transition"
          >
            Return Home
          </a>
        </section>

        <footer className="text-center text-sm text-gray-600 py-6">
          <p>© {new Date().getFullYear()} NorthSide GTA | Finally Home Agents</p>
        </footer>
      </div>
    </>
  );
}
