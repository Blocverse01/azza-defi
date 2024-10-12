import { Cross } from "../assets/index";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const faqData = [
  {
    title: "What are the supported blockchains on AZZA?",
    content:
      "List of Blockchain Networks: Base, Polygon (coming soon), Arbitrum (coming soon)",
  },
  {
    title: "What are the supported cryptocurrencies on AZZA?",
    content:
      "USDC, ETH on Base, MATIC (coming soon), ETH on Arbitrum (coming soon), USDT (coming soon)",
  },
  {
    title: "What local currencies are available on AZZA?",
    content:
      "Ethiopia (BIRR), Nigeria (NGN), Kenya (KES), Benin (CFA), South Africa (ZAR), Uganda (UGX), Ghana (GHS), Cameroon (XAF)",
  },
  {
    title: "Are there any transaction fees?",
    content:
      "Transaction fees are charged for buying, selling, and transferring assets.",
  },
];

const FaqItem = ({ title, content }: { title: string; content: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={"border-b  border-[#1B3E32]"}>
      <motion.div
        className={"flex items-center py-[32px] justify-between cursor-pointer"}
        onClick={toggleAccordion}
        whileTap={{ scale: 0.98 }}
      >
        <p
          className={
            "uppercase text-[24px] font-subj leading-[24px] font-extrabold"
          }
        >
          {title}
        </p>
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <Cross />
        </motion.div>
      </motion.div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p className='py-4 px-2'>{content}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Faq = () => {
  return (
    <div
      className={
        "text-white px-[24px] pb-[90px] mt-[80px] max-w-[587px] mx-auto"
      }
    >
      <div className={"border-t border-[#1B3E32]"}>
        {faqData.map((faq, index) => (
          <FaqItem key={index} title={faq.title} content={faq.content} />
        ))}
      </div>
    </div>
  );
};

export default Faq;
