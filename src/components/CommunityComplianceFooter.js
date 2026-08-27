import React from "react";

export default function CommunityComplianceFooter({
  marketDataSentence = "Average sold prices sourced from TRREB MLS® data and regional market reports (Q3 2025–Q2 2026).",
}) {
  return (
    <footer className="compliance" role="contentinfo">
      <div className="compliance-inner">
        <p>
          <strong>Market data disclaimer:</strong> Market information is provided for general guidance only and may change. Buyers should confirm current pricing, availability, school boundaries, commute times, and property details before making decisions. {marketDataSentence} Drive times are off-peak estimates via Hwy 404 to the DVP/401 interchange.{" "}
          <strong>TasteHub disclaimer:</strong> TasteHub results are community-powered and are not paid rankings or endorsements.{" "}
          <strong>Restaurant disclaimer:</strong> Local favourites are included for community context only and are not ranked by Finally Home Agents unless clearly identified as community voting results.{" "}
          <strong>School disclaimer:</strong> School ratings from Fraser Institute 2024/2025. School ratings and boundaries can change. Buyers should verify directly with the relevant school board before purchasing.{" "}
          <strong>Registrant information (TRESA):</strong>{" "}
          <strong>Matthew Mulhall</strong> and <strong>Landon Mulhall</strong>, Sales Representatives, Finally Home Agents Team,{" "}
          <strong>HomeLife Optimum Realty, Brokerage</strong>, regulated by the{" "}
          <strong>Real Estate Council of Ontario (RECO)</strong> under the{" "}
          <em>Trust in Real Estate Services Act, 2002 (TRESA)</em>. MLS® is a registered trademark of CREA. © 2026 Finally Home Agents Team | HomeLife Optimum Realty, Brokerage |{" "}
          <a href="https://northsidegta.ca">northsidegta.ca</a>
        </p>
      </div>
    </footer>
  );
}
