import React, { useState } from "react";
import MembershipCard from "./components/brand/MembershipCard";

const MembershipCardPreviewPage = () => {
  const [fullName, setFullName] = useState("Landon Mulhall");
  const [town, setTown] = useState("Uxbridge, ON");
  const [memberId, setMemberId] = useState("");

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-8">
        <p className="text-sm uppercase tracking-wide text-gray-500 font-semibold">
          Internal preview for NorthSide Membership Card (not linked in navigation)
        </p>
        <h1 className="text-3xl font-bold text-slate-900 mt-2">NorthSide Membership Card Preview</h1>
        <p className="text-slate-600 mt-2 max-w-3xl">
          Update the details below to see how the NorthSide GTA | Finally Home Agents membership card renders.
          This page is for visual testing only and is not connected to any signup flows.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2" htmlFor="fullName">
              Full Name
            </label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value.slice(0, 26))}
            maxLength={26}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base focus:border-green-700 focus:outline-none focus:ring-2 focus:ring-green-200"
            placeholder="Full name"
          />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2" htmlFor="town">
              Town / Community
            </label>
          <input
            id="town"
            type="text"
            value={town}
            onChange={(e) => setTown(e.target.value.slice(0, 28))}
            maxLength={28}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base focus:border-green-700 focus:outline-none focus:ring-2 focus:ring-green-200"
            placeholder="Town or community"
          />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2" htmlFor="memberId">
              Member ID (optional)
            </label>
          <input
            id="memberId"
            type="text"
            value={memberId}
            onChange={(e) => setMemberId(e.target.value.slice(0, 12))}
            maxLength={12}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base focus:border-green-700 focus:outline-none focus:ring-2 focus:ring-green-200"
            placeholder="e.g. NS-48210"
          />
          </div>
        </div>

        <div className="flex justify-center">
          <MembershipCard fullName={fullName || ""} town={town || ""} memberId={memberId || undefined} />
        </div>
      </div>
    </div>
  );
};

export default MembershipCardPreviewPage;
