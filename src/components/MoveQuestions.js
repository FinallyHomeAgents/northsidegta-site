import React from "react";
import "./MoveQuestions.css";

const content = {
  "buyers": {
    "title": "Questions about your next move",
    "invitation": "Have a move in mind? Let's talk through your priorities.",
    "button": "Plan my next move",
    "href": "#cta-section",
    "items": [
      {
        "question": "Could my budget get me more space north of Toronto?",
        "answer": "It may open up options you have not considered. We help you compare communities, home types and everyday life alongside your budget. We have helped first-time buyers who initially expected to buy a Toronto condo find detached homes in the NorthSide GTA. What is possible for you depends on your budget, priorities and the homes available when you search."
      },
      {
        "question": "Can you help me find a larger home without leaving my neighbourhood?",
        "answer": "We can help you focus your search around the things you want to keep, as well as the space you need. For one family, that meant a larger home and yard within the same subdivision. We stayed in touch over an extended search, and they made their move when a suitable home became available."
      },
      {
        "question": "How do you help me buy when I also need to sell?",
        "answer": "We start by understanding your next-home priorities and discussing the sale of your current home alongside your purchase. We help you weigh timing, preparation and available options so you can decide on a plan that fits your circumstances."
      }
    ]
  },
  "sellers": {
    "title": "Questions about selling and moving",
    "invitation": "Need more space, but have a home to sell? Let's talk through your next move.",
    "button": "Plan my sale and purchase",
    "href": "#seller-planning",
    "items": [
      {
        "question": "My home didn't sell. How could you help?",
        "answer": "We would review the previous approach with you and discuss pricing, preparation, photography and marketing. For one growing family whose home had previously been listed without selling, our work covered those areas, with clear communication and negotiation support. Their home sold, and we helped them find a larger home nearby."
      },
      {
        "question": "Can you help us sell and find more space nearby?",
        "answer": "Yes. We can help you consider both sides of the move: selling your current home and looking for one that better suits your family. Tell us what you need more of and what you want to stay close to, so we can help you assess your options."
      },
      {
        "question": "Where would we start with a plan to sell?",
        "answer": "We would discuss your goals, timing and property, then work through pricing, preparation and how to present the home to buyers. We would also agree on how to keep you informed as you consider feedback, offers and next steps."
      }
    ]
  }
};

export default function MoveQuestions({ audience }) {
  const { title, invitation, button, href, items } = content[audience];
  const headingId = `${audience}-move-questions-heading`;
  return (
    <section className="move-questions" id={`${audience}-move-questions`} aria-labelledby={headingId}>
      <div className="move-questions__inner">
        <h2 id={headingId}>{title}</h2>
        <div className="move-questions__list">
          {items.map(({ question, answer }) => (
            <details key={question}>
              <summary>{question}</summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
        <div className="move-questions__contact">
          <p>{invitation}</p>
          <a href={href}>{button} <span aria-hidden="true">→</span></a>
        </div>
      </div>
    </section>
  );
}
