import { motion } from 'motion/react';
import { GetStaticProps } from 'next';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Footer from './components/footer';
import CaseStudyCard from './components/case-study-card';
import { useState } from 'react';
import "@fontsource/space-mono";

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
      <section className="py-20 px-8">
          <div className="max-w-4xl mx-auto">
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
    <main className="min-h-screen bg-gray-100">
      {/* Landing Section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="py-24 max-w-4xl mx-auto h-fit flex items-center justify-center"
      >
        <h1 className="text-4xl leading-relaxed">
        Building revolutionary experiences where emerging tech meets human potential
        </h1>
      </motion.section>

      {/* Case Studies Section */}
      <ParentComponent caseStudies={caseStudies} />

      {/* Introduction Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="py-24 max-w-4xl mx-auto"
      >
        <h3 className="text-4xl text-gray-700 leading-relaxed">
          I'm a passionate developer with experience in building modern web applications.
          My focus is on creating intuitive and performant user experiences using
          cutting-edge technologies.
        </h3>
      </motion.section>

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