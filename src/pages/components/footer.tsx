import { motion } from 'motion/react';
import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <motion.footer 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-gray-900 text-white py-12"
    >
      <div className="max-w-4xl mx-auto p-8">
        <div className="text-xs text-center text-gray-400">
          <p>&copy; {currentYear} By Leonard Lim</p>
        </div>
      </div>
    </motion.footer>
  );
}
