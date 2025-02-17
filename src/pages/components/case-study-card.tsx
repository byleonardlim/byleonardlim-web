import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

interface CaseStudyCardProps {
    study: any;
    index: number;
    isExpanded: boolean;
    onExpand: () => void;
}

const CaseStudyCard: React.FC<CaseStudyCardProps> = ({ study, index, isExpanded, onExpand }) => {
    return (
        <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className="w-full"
    >
        <motion.div
             onHoverStart={() => {
                if (window.innerWidth >= 768) { // Check if the screen width is desktop size
                    onExpand();
                }
            }}
            onHoverEnd={() => {
                if (window.innerWidth >= 768) { // Check if the screen width is desktop size
                    onExpand();
                }
            }}
            onTap={() => {
                if (window.innerWidth < 768) { // Check if the screen width is mobile size
                    onExpand();
                }
            }}
            className={`p-8 rounded-lg border border-gray-300 cursor-pointer transition-all duration-300 ${
                isExpanded ? 'bg-gray-100 drop-shadow-2xl' : ''
            }`}
        >
         <div className="flex-col items-center">
                <p className="flex-row items-center text-3xl font-bold">
                    <Link 
                        href={`/case-study/${study.slug}`}
                    >
                        {study.title}
                    </Link>
                    <ArrowUpRight className='ml-4 inline-block w-6 h-6' />
                    </p> 
                </div>  
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <p className="mt-6 mb-8 text-md text-gray-700">{study.description}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    );
  };

  export default CaseStudyCard;