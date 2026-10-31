
"use client";

import { useState } from "react";
import { Allura } from "next/font/google";
import { ChevronDown } from "lucide-react";
import Link from "next/link";

const answeredFont = Allura({
  subsets: ["latin"],
  weight: "400",
});

const faqs = [
  {
    id: 1,
    question: "How do I find the right dental products?",
    answer:
      "Browse our product categories and explore the available product descriptions, specifications and images. If you need help identifying a suitable product, contact our team before placing your order.",
  },
  {
    id: 2,
    question: "Where can I find product specifications?",
    answer:
      "Visit the individual product page to review its available description, specifications, images and other listed details. For additional information, please get in touch with our team.",
  },
  {
    id: 3,
    question: "How can I place an order?",
    answer:
      "Explore the catalogue, select the products you need and add them to your cart. Review your order and follow the checkout steps to complete your purchase.",
  },
  {
    id: 4,
    question: "Which payment methods are available?",
    answer:
      "Available payment methods are displayed during checkout. You can review the options presented there before confirming your order.",
  },
  {
    id: 5,
    question: "How can I track my order?",
    answer:
      "Check your account or order confirmation for available order updates and tracking information. If you need assistance, contact our support team with your order details.",
  },
  {
    id: 6,
    question: "How long does delivery take?",
    answer:
      "Delivery timelines can depend on the product and destination. Please refer to the delivery information shown during checkout or contact our team for assistance.",
  },
  {
    id: 7,
    question: "Can I request help with a product before buying?",
    answer:
      "Yes. If you need clarification about a product's specifications, intended use or compatibility, contact our team before placing your order.",
  },
  {
    id: 8,
    question: "Where can I find your return and replacement policy?",
    answer:
      "Please review the return and replacement policy published on our website for the applicable conditions. If you have a question about a specific order, contact our support team.",
  },
];

export function FAQSection() {
  const [openId, setOpenId] = useState<number | null>(1);

  const leftColumn = faqs.slice(0, 4);
  const rightColumn = faqs.slice(4, 8);

  const renderFAQ = (items: typeof faqs) => (
    <div className="flex flex-col gap-2">
      {items.map((faq) => {
        const isOpen = openId === faq.id;

        return (
          <div
            key={faq.id}
            className="bg-[#faf9f8] transition-colors duration-300 hover:bg-[#f7f5f5]"
          >
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : faq.id)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-5 px-5 py-5 text-left sm:px-6 sm:py-6"
            >
              <span className="text-sm font-normal leading-6 text-[#292925] sm:text-base">
                {faq.question}
              </span>

              <ChevronDown
                className={`h-4 w-4 shrink-0 text-[#968a98] transition-transform duration-300 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            <div
              className={`grid transition-all duration-300 ease-in-out ${
                isOpen
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <p className="px-5 pb-6 text-xs leading-6 text-stone-600 sm:px-6 sm:text-sm sm:leading-6">
                  {faq.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <section className="w-full bg-white px-5 py-16 sm:px-8 md:py-20 lg:px-12">
      <div className="mx-auto max-w-[1060px]">

        {/* Heading */}
        <div className="mb-10 text-center sm:mb-12">
          <h2 className="font-sans text-3xl font-normal tracking-tight text-[#393832] sm:text-4xl md:text-[42px]">
            Your Questions,
          </h2>

          <p
            className={`${answeredFont.className} -mt-1 text-6xl leading-[1.15] text-[#a99eaa] sm:text-7xl md:text-[88px]`}
          >
            Answered
          </p>
        </div>

        {/* Two-column FAQ */}
        <div className="grid items-start gap-3 md:grid-cols-2 md:gap-5">
          {renderFAQ(leftColumn)}
          {renderFAQ(rightColumn)}
        </div>

        {/* Contact CTA */}
        <div className="mt-10 text-center">
          <p className="text-sm text-stone-600">
            Still have questions?
          </p>

          <Link
            href="/contact"
            className="mt-4 inline-flex min-h-[46px] min-w-[220px] items-center justify-center rounded-[5px] bg-[#968a98] px-7 py-3 text-xs font-semibold text-white transition-colors duration-300 hover:bg-[#817482]"
          >
            Contact Our Team
          </Link>
        </div>
      </div>
    </section>
  );
}

