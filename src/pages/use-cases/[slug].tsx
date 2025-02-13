import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { MDXRemote } from 'next-mdx-remote';
import { serialize } from 'next-mdx-remote/serialize';
import { ArrowLeft, ArrowRight, ArrowLeftCircle, ArrowRightCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

// Custom Image component
const CustomImage = ({ src, alt, width = 800, height = 400 }) => {
  const imageProps = src.startsWith('http') 
    ? { src, width, height, alt }
    : { src: `/images/use-cases/${src}`, width, height, alt };

  return (
    <div className="my-8 relative w-full aspect-video">
      <Image
        {...imageProps}
        className="rounded-lg object-cover"
        sizes="(max-width: 768px) 100vw, 800px"
        quality={85}
      />
    </div>
  );
};

// MDX components with Tailwind classes
const MDXComponents = {
  img: CustomImage,
  h1: (props) => <h1 className="text-3xl font-bold mt-8 mb-4" {...props} />,
  h2: (props) => <h2 className="text-2xl font-bold mt-6 mb-3" {...props} />,
  p: (props) => <p className="my-4 text-gray-700" {...props} />,
  ul: (props) => <ul className="my-4 list-disc list-inside" {...props} />,
  ol: (props) => <ol className="my-4 list-decimal list-inside" {...props} />,
  li: (props) => <li className="my-2" {...props} />,
  a: (props) => <a className="text-blue-600 hover:underline" {...props} />,
  blockquote: (props) => (
    <blockquote className="border-l-4 border-gray-200 pl-4 my-4 italic" {...props} />
  ),
};

// Navigation component
const UseCaseNavigation = ({ prevCase, nextCase }) => (
  <div className="flex justify-between items-center mt-8 border-t border-gray-200 pt-6">
    {prevCase ? (
      <Link href={`/use-cases/${prevCase.slug}`} 
            className="flex items-center group hover:text-blue-600 transition-colors">
        <ArrowLeftCircle className="w-5 h-5 mr-2 group-hover:translate-x-[-4px] transition-transform" />
        <div className="text-left">
          <div className="text-sm text-gray-500">Previous</div>
          <div className="font-medium">{prevCase.title}</div>
        </div>
      </Link>
    ) : (
      <div></div>
    )}
    
    {nextCase ? (
      <Link href={`/use-cases/${nextCase.slug}`}
            className="flex items-center group hover:text-blue-600 transition-colors">
        <div className="text-right">
          <div className="text-sm text-gray-500">Next</div>
          <div className="font-medium">{nextCase.title}</div>
        </div>
        <ArrowRightCircle className="w-5 h-5 ml-2 group-hover:translate-x-[4px] transition-transform" />
      </Link>
    ) : (
      <div></div>
    )}
  </div>
);

export default function UseCase({ frontMatter, mdxSource, navigation }) {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link href="/">
          <button className="flex items-center text-gray-600 hover:text-gray-900 mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Use Cases
          </button>
        </Link>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">{frontMatter.title}</h1>
            <div className="text-sm text-gray-500 mt-2">
              {frontMatter.author} • {frontMatter.date}
            </div>
          </div>
          
          <div className="prose prose-gray max-w-none">
            <MDXRemote {...mdxSource} components={MDXComponents} />
          </div>

          <UseCaseNavigation {...navigation} />
        </div>
      </div>
    </div>
  );
}

export async function getStaticPaths() {
  const files = fs.readdirSync(path.join('content/use-cases'));
  
  const paths = files.map(filename => ({
    params: {
      slug: filename.replace('.md', '')
    }
  }));

  return {
    paths,
    fallback: false
  };
}

export async function getStaticProps({ params: { slug } }) {
  const markdownWithMeta = fs.readFileSync(
    path.join('content/use-cases', `${slug}.md`),
    'utf-8'
  );

  // Get all use cases for navigation
  const files = fs.readdirSync(path.join('content/use-cases'));
  const useCases = files.map(filename => {
    const content = fs.readFileSync(
      path.join('content/use-cases', filename),
      'utf-8'
    );
    const { data } = matter(content);
    return {
      slug: filename.replace('.md', ''),
      title: data.title
    };
  });

  // Find current index
  const currentIndex = useCases.findIndex(useCase => useCase.slug === slug);
  
  // Get previous and next cases
  const navigation = {
    prevCase: currentIndex > 0 ? useCases[currentIndex - 1] : null,
    nextCase: currentIndex < useCases.length - 1 ? useCases[currentIndex + 1] : null
  };

  const { data: frontMatter, content } = matter(markdownWithMeta);
  const mdxSource = await serialize(content);

  return {
    props: {
      frontMatter,
      slug,
      mdxSource,
      navigation
    }
  };
}