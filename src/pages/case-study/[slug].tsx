import { motion } from 'motion/react';
import Link from 'next/link';
import { GetStaticProps, GetStaticPaths } from 'next';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import ReactMarkdown from 'react-markdown';
import Footer from '../components/footer';
import { ArrowLeft, ArrowRight, HomeIcon, MoveLeft, MoveRight } from 'lucide-react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import React from 'react';

// Base component for common props
interface BaseProps {
  node: any; // Replace with the actual type if known
  [key: string]: any; // Allow additional props
}

// Base styled component
const StyledComponent = ({ className, children, ...props }: { className: string; children: React.ReactNode }) => (
  <div className={className} {...props}>
      {children}
  </div>
);

const MarkdownComponents = {
  // Enhanced image component with zoom functionality
  img: ({ node, src, alt, ...props }: { node: any; src: string; alt?: string; }) => {
    const [isZoomed, setIsZoomed] = React.useState(false);
    const [allImages, setAllImages] = React.useState<Array<{src: string; alt: string}>>([]);
    const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
    const containerRef = React.useRef<HTMLDivElement>(null);
    
    // Clean and normalize image URLs
    const normalizeImageUrl = React.useCallback((url: string) => {
      // Remove any existing _next/image processing
      const cleanUrl = url.replace(/\/_next\/image\?url=/, '');
      // Decode URL if it's encoded
      try {
        return decodeURIComponent(cleanUrl);
      } catch {
        return cleanUrl;
      }
    }, []);

    // Find all images in the markdown content on mount
    React.useEffect(() => {
      const images = document.querySelectorAll('.prose img');
      const imageArray = Array.from(images).map(img => ({
        src: normalizeImageUrl(img.getAttribute('src') || ''),
        alt: img.getAttribute('alt') || ''
      }));
      setAllImages(imageArray);
      const currentIndex = imageArray.findIndex(img => normalizeImageUrl(img.src) === normalizeImageUrl(src));
      setCurrentImageIndex(currentIndex >= 0 ? currentIndex : 0);
    }, [src, normalizeImageUrl]);

    // Handle touch events for swipe
    const [touchStart, setTouchStart] = React.useState<number | null>(null);
    const [touchEnd, setTouchEnd] = React.useState<number | null>(null);
    
    const minSwipeDistance = 50;

    const onTouchStart = (e: React.TouchEvent) => {
      setTouchEnd(null);
      setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e: React.TouchEvent) => {
      setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = React.useCallback(() => {
      if (!touchStart || !touchEnd) return;
      
      const distance = touchStart - touchEnd;
      const isLeftSwipe = distance > minSwipeDistance;
      const isRightSwipe = distance < -minSwipeDistance;

      if (isLeftSwipe) {
        setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
      }
      if (isRightSwipe) {
        setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
      }

      setTouchStart(null);
      setTouchEnd(null);
    }, [touchStart, touchEnd, allImages.length]);

    const handleNext = React.useCallback((e: React.MouseEvent) => {
      e.stopPropagation();
      setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
    }, [allImages.length]);

    const handlePrev = React.useCallback((e: React.MouseEvent) => {
      e.stopPropagation();
      setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
    }, [allImages.length]);

    const toggleZoom = React.useCallback(() => {
      setIsZoomed(prev => !prev);
    }, []);

    // Handle escape key to close lightbox
    React.useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setIsZoomed(false);
        }
      };

      if (isZoomed) {
        document.addEventListener('keydown', handleEscape);
      }

      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    }, [isZoomed]);

    if (!src) return null;

    const normalizedSrc = normalizeImageUrl(src);

    return (
      <>
        <motion.div 
          ref={containerRef}
          className="w-full aspect-[16/9] sm:aspect-[3/2] md:aspect-[16/9] relative my-8 group rounded-md border border-gray-300 cursor-zoom-in"
          whileHover={{ scale: 1.5 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          onTap={toggleZoom}
        >
          <Image 
            src={normalizedSrc}
            alt={alt || 'Case study image'}
            fill
            priority
            quality={90}
            className="rounded-lg object-contain transition-all duration-300 group-hover:drop-shadow-2xl"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw"
          />
        </motion.div>

        {/* Mobile Lightbox */}
        {isZoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center md:hidden"
            onTap={toggleZoom}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <motion.div 
              className="absolute inset-0 flex items-center justify-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onTap={(e) => e.stopPropagation()}
            >
              <div className="relative w-full h-full p-4">
                <Image
                  src={normalizeImageUrl(allImages[currentImageIndex]?.src || src)}
                  alt={allImages[currentImageIndex]?.alt || alt || 'Case study image'}
                  fill
                  priority
                  quality={90}
                  className="object-contain"
                  sizes="100vw"
                />
              </div>
            </motion.div>

            {/* Navigation Buttons */}
            {allImages.length > 1 && (
              <>
                <button
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 p-2 rounded-full backdrop-blur-sm"
                  onClick={handlePrev}
                >
                  <MoveLeft className="w-6 h-6 text-white" />
                </button>
                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 p-2 rounded-full backdrop-blur-sm"
                  onClick={handleNext}
                >
                  <MoveRight className="w-6 h-6 text-white" />
                </button>
              </>
            )}

            {/* Close button */}
            <button
              className="absolute top-4 right-4 text-white bg-white/10 p-2 rounded-full backdrop-blur-sm"
              onClick={toggleZoom}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Image counter */}
            {allImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white bg-black/50 px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                {currentImageIndex + 1} / {allImages.length}
              </div>
            )}
          </motion.div>
        )}
      </>
    );
  },
  
  // Style headings
  h1: (props: BaseProps) => <h1 className="text-3xl lg:text-4xl font-bold mt-8 mb-4 leading-relaxed" {...props} />,
  h2: (props: BaseProps) => <h2 className="text-2xl lg:text-3xl font-bold mt-8 mb-4 leading-relaxed" {...props} />,
  h3: (props: BaseProps) => <h3 className="text-xl lg:text-2xl font-bold mt-6 mb-3 leading-relaxed" {...props} />,

  // Style paragraphs
  p: (props: BaseProps) => <div className="my-4 text-gray-700 leading-relaxed" {...props} />,

  // Style lists
  ul: (props: BaseProps) => <ul className="list-disc list-inside my-4 space-y-2" {...props} />,
  ol: (props: BaseProps) => <ol className="list-decimal list-inside my-4 space-y-2" {...props} />,

  // Style links
  a: React.forwardRef<HTMLAnchorElement, React.AnchorHTMLAttributes<HTMLAnchorElement>>((props, ref) => (
    <a ref={ref} className="text-blue-600 hover:text-blue-800 underline" {...props} />
  )),

  // Style code blocks
  code: ({ inline, ...props }: BaseProps) => (
      inline ? 
      <code className="bg-gray-100 px-1 py-0.5 rounded" {...props} /> :
      <code className="block bg-gray-100 p-4 rounded-lg my-4 overflow-x-auto" {...props} />
  ),

  // Style blockquotes
  blockquote: React.forwardRef<HTMLQuoteElement, React.BlockquoteHTMLAttributes<HTMLQuoteElement>>((props, ref) => (
    <blockquote ref={ref} className="border-l-4 border-gray-300 pl-4 my-4 italic" {...props} />
)),

  // Style tables
  table: (props: BaseProps) => (
      <div className="overflow-x-auto my-8">
          <table className="min-w-full divide-y divide-gray-200" {...props} />
      </div>
  ),
  th: (props: BaseProps) => <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" {...props} />,
  td: (props: BaseProps) => <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" {...props} />,
};

export { MarkdownComponents };

// Case Studies
interface CaseStudy {
  title: string;
  content: string;
  slug: string;
}

interface CaseStudyProps {
  study: CaseStudy;
  nextStudy: CaseStudy | null;
  prevStudy: CaseStudy | null;
}

export default function CaseStudy({ study, nextStudy, prevStudy }: CaseStudyProps) {
  const router = useRouter();

  // Page transition variants
  const pageVariants = {
    initial: (direction: number) => ({
      opacity: 0,
      x: direction > 0 ? 1000 : -1000
    }),
    animate: {
      opacity: 1,
      x: 0,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 }
      }
    },
    exit: (direction: number) => ({
      opacity: 0,
      x: direction > 0 ? -1000 : 1000,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 }
      }
    })
  };

  // Navigation handler with direction
  const handleNavigation = async (path: string, direction: number) => {
    // Update the direction in URL state
    await router.push({
      pathname: path,
      query: { direction }
    }, path);
  };

  // Get the direction from URL or default to 0
  const direction = parseInt(router.query.direction as string) || 0;

  return (
    <>
      <motion.div
        key={router.asPath}
        custom={direction}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        className="min-h-screen bg-white"
      >
        <div className="max-w-4xl mx-auto px-8 py-20">
          {/* Back to Home Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <Link 
              href="/"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
            >
              <motion.div
                whileHover={{ x: -4 }}
                className="flex items-center"
              >
                <HomeIcon className="w-5 h-5 mr-2" />
                <ArrowLeft className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
              Back to Home
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl lg:text-4xl font-bold mb-8">{study.title}</h1>
            <div className="prose prose-lg max-w-none">
              <ReactMarkdown components={MarkdownComponents}>{study.content}</ReactMarkdown>
            </div>
          </motion.div>

          <div className="mt-16 flex justify-between">
            <div>
              {prevStudy && (
                <button
                  onClick={() => handleNavigation(`/case-study/${prevStudy.slug}`, -1)}
                  className="group flex items-center gap-3 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <motion.div
                    whileHover={{ x: -4 }}
                    className="flex items-center gap-2"
                  >
                    <MoveLeft className="w-6 h-6" />
                  </motion.div>
                  <div className="flex flex-col items-start">
                    <span className="text-sm text-gray-500">Previous</span>
                    <span className="font-medium">{prevStudy.title}</span>
                  </div>
                </button>
              )}
            </div>
            
            <div>
              {nextStudy && (
                <button
                  onClick={() => handleNavigation(`/case-study/${nextStudy.slug}`, 1)}
                  className="group flex items-center gap-3 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <div className="flex flex-col items-end">
                    <span className="text-sm text-gray-500">Next</span>
                    <span className="font-medium">{nextStudy.title}</span>
                  </div>
                  <motion.div
                    whileHover={{ x: 4 }}
                    className="flex items-center gap-2"
                  >
                    <MoveRight className="w-6 h-6" />
                  </motion.div>
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
      <Footer />
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const files = fs.readdirSync(path.join('content/case-studies'));
  
  const paths = files.map(filename => ({
    params: {
      slug: filename.replace('.md', ''),
    },
  }));

  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params as { slug: string };
  
  // Get all case studies
  const files = fs.readdirSync(path.join('content/case-studies'));
  const caseStudies = files.map(filename => {
    const currentSlug = filename.replace('.md', '');
    const markdownWithMeta = fs.readFileSync(
      path.join('content/case-studies', filename),
      'utf-8'
    );
    
    const { data, content } = matter(markdownWithMeta);
    
    return {
      slug: currentSlug,
      ...data,
      content,
    };
  });

  // Find current, next and previous studies
  const currentIndex = caseStudies.findIndex(s => s.slug === slug);
  const study = caseStudies[currentIndex];
  
  // Only set next/prev if they exist
  const nextStudy = currentIndex < caseStudies.length - 1 ? caseStudies[currentIndex + 1] : null;
  const prevStudy = currentIndex > 0 ? caseStudies[currentIndex - 1] : null;

  if (!study) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      study,
      nextStudy,
      prevStudy,
    },
  };
};