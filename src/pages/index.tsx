import { motion } from 'motion/react';
import { GetStaticProps } from 'next';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Footer from './components/footer';
import CaseStudyCard from './components/case-study-card';
import { useState } from 'react';

// Types
interface CaseStudy {
  slug: string;
  title: string;
  description: string;
  content: string;
}

interface HomeProps {
  caseStudies: CaseStudy[];
}

const ParentComponent = ({ caseStudies }) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const handleExpand = (index: number) => {
      setExpandedIndex(expandedIndex === index ? null : index); // Toggle the current index
  };

  return (
      <section className="py-20 px-8 bg-white">
          <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl font-bold mb-12 text-center">Case Studies</h2>
              <div className="space-y-6">
                  {caseStudies.map((study, index) => (
                      <CaseStudyCard 
                          key={study.slug} 
                          study={study} 
                          index={index} 
                          isExpanded={expandedIndex === index} // Check if this card is expanded
                          onExpand={() => handleExpand(index)} // Pass down the handler
                      />
                  ))}
              </div>
          </div>
      </section>
  );
};

// Main Page Component
export default function Home({ caseStudies }: HomeProps) {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Landing Section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600"
      >
        <div className="text-center text-white">
          <h1 className="text-6xl font-bold mb-4">John Doe</h1>
          <p className="text-xl">Full Stack Developer & Designer</p>
        </div>
      </motion.section>

      {/* Introduction Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="py-20 px-8 max-w-4xl mx-auto"
      >
        <h2 className="text-4xl font-bold mb-8">About Me</h2>
        <p className="text-lg text-gray-700 leading-relaxed">
          I'm a passionate developer with experience in building modern web applications.
          My focus is on creating intuitive and performant user experiences using
          cutting-edge technologies.
        </p>
      </motion.section>

      {/* Case Studies Grid */}
        <ParentComponent caseStudies={caseStudies} />
      <Footer />
    </main>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const files = fs.readdirSync(path.join('content/case-studies'));
  const caseStudies = files.map(filename => {
      const slug = filename.replace('.md', '');
      const markdownWithMeta = fs.readFileSync(path.join('content/case-studies', filename), 'utf-8');
      const { data } = matter(markdownWithMeta);
      return { slug, ...data };
  });

  return {
      props: {
          caseStudies,
      },
  };
};