# Buyer and seller FAQ review

The PR merges client examples into the existing FAQ sections. There is one FAQ section per page, with all answers initially collapsed: ten buyer questions and nine seller questions, unchanged from the original counts.

- Buyers: replaces the budget comparison answer with the condo-to-detached example; replaces the overlapping community-comparison question with the same-neighbourhood example; expands the existing buy-first/sell-first answer.
- Sellers: replaces the redundant pre-market preparation question with the unsuccessful-listing example; folds nearby move-up priorities into the existing sell-and-buy answer; folds initial planning into the existing timing answer.
- Visible questions and JSON-LD use the same route-specific arrays. Removed the separate MoveQuestions component and its styles. Removed an internal staging instruction that was leaking into seller marketing copy.
- Review /buyers#buyers-faq and /sellers#sellers-faq. Contact invitations remain outside the collapsed answers.

Before publication, verify factual accounts and applicable client/property permissions and review final copy with the brokerage. These are agent-authored examples, not client quotations or guaranteed outcomes. No certification of RECO compliance is implied.
