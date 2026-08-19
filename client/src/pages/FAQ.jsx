import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const FAQS = [
  { q: 'What is your return policy?', a: 'We accept returns within 14 days of delivery for unused, unopened products. Contact us at hello@zazaperfumes.com to initiate a return.' },
  { q: 'How long does shipping take?', a: 'Standard shipping takes 3-5 business days across India. Express shipping (1-2 days) is available at checkout.' },
  { q: 'Are your fragrances cruelty-free?', a: 'Yes. ZAZA does not test on animals and our formulas are free from ingredients derived from animal harm (with the exception of ethically-sourced ambergris).' },
  { q: 'Do you offer samples?', a: 'Sample sets are coming soon. Subscribe to our newsletter to be notified first.' },
  { q: 'How do I apply perfume for best longevity?', a: 'Apply to pulse points — wrists, neck, behind the ears, inner elbows — on moisturized skin. Do not rub; let the fragrance develop naturally.' },
  { q: 'What does EDP vs EDT mean?', a: 'EDP (Eau de Parfum) has 15-20% fragrance concentration and typically lasts 6-8 hours. EDT (Eau de Toilette) has 5-15% concentration and lasts 3-5 hours. Parfum (Extrait) is 20-30% and lasts all day.' },
  { q: 'Are your ingredients sustainably sourced?', a: 'We are committed to sustainable sourcing. Our Mysore sandalwood is from certified sustainable farms, and we work with suppliers who meet IFRA standards.' },
  { q: 'Do you ship internationally?', a: 'Currently we ship within India. International shipping is planned for 2025.' },
];

function FAQItem({ question, answer, index }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="border-b border-white/5"
    >
      <button onClick={() => setOpen(!open)} className="w-full flex justify-between items-center py-5 text-left gap-4">
        <span className="text-white text-sm">{question}</span>
        {open ? <ChevronUp size={16} className="text-chrome/50 flex-shrink-0" /> : <ChevronDown size={16} className="text-chrome/50 flex-shrink-0" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.p
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="text-sm text-chrome/50 leading-relaxed pb-5 overflow-hidden"
          >
            {answer}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQ() {
  return (
    <div className="pt-24 pb-16">
      <div className="container-zaza max-w-3xl">
        <p className="section-label mb-4">Help Center</p>
        <h1 className="font-display text-6xl text-chrome mb-16">Frequently Asked Questions</h1>
        <div>
          {FAQS.map((faq, i) => <FAQItem key={i} question={faq.q} answer={faq.a} index={i} />)}
        </div>
      </div>
    </div>
  );
}
