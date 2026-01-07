import React from "react";
import GoogleGradientReviews from "../reviews/GoogleGradientReviews";

export default function SellerReviewsSection() {
  return (
    <section className="space-y-6">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          What Our Clients Say
        </h2>
        <p className="mt-3 text-base text-slate-600 sm:text-lg">
          Real feedback from NorthSide GTA clients.
        </p>
      </div>
      <GoogleGradientReviews />
    </section>
  );
}
