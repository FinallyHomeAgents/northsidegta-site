import React from "react";
import Card from "../ui/Card";
import { trackEvent } from "../../utils/analytics";

export default function BookCallCard({ config }) {
  if (!config.showSchedulingCard || !config.schedulingUrl) {
    return null;
  }

  const label = config.schedulingLabel || "Book a Call";
  const subcopy =
    config.schedulingSubcopy || "Pick a time that works for you and we’ll confirm quickly.";

  return (
    <Card className="bg-slate-900 text-white flex flex-col gap-4">
      <div>
        <h3 className="text-2xl font-semibold">{label}</h3>
        <p className="mt-2 text-slate-200 text-sm sm:text-base">{subcopy}</p>
      </div>
      <a
        href={config.schedulingUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackEvent("schedule_cta_click", { route: "/contact" })}
        className="inline-flex items-center justify-center rounded-md bg-white px-5 py-3 text-base font-semibold text-slate-900 shadow hover:bg-emerald-50 transition"
      >
        {label}
      </a>
    </Card>
  );
}
