import { useEffect } from 'react';
import { Keyboard } from 'lucide-react';
import Link from 'next/link';

export default function Home({ useCases }) {
  useEffect(() => {
    const handleKeyPress = (event) => {
      switch(event.key) {
        case '1':
          window.location.href = '/use-cases/research';
          break;
        case '2':
          window.location.href = '/use-cases/wireframing';
          break;
        case '3':
          window.location.href = '/use-cases/testing';
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-center mb-8">Digital Product Design Use Cases</h1>
        
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {useCases.map((useCase, index) => (
            <Link href={`/use-cases/${useCase.slug}`} key={useCase.slug}>
              <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow p-6 border border-gray-200">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-semibold">{useCase.title}</h2>
                    <span className="flex items-center text-sm text-gray-500">
                      <Keyboard className="w-4 h-4 mr-1" />
                      {index + 1}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{useCase.description}</p>
                </div>
                <p className="text-sm text-gray-600">{useCase.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}

export async function getStaticProps() {
  const useCases = [
    {
      slug: 'research',
      title: 'User Research',
      description: 'Understanding user needs and behaviors',
      excerpt: 'Learn effective methods for conducting user research and synthesizing findings.'
    },
    {
      slug: 'wireframing',
      title: 'Wireframing',
      description: 'Creating low-fidelity prototypes',
      excerpt: 'Explore techniques for rapid prototyping and iteration of design concepts.'
    },
    {
      slug: 'testing',
      title: 'Usability Testing',
      description: 'Validating design decisions',
      excerpt: 'Discover best practices for conducting usability tests and gathering feedback.'
    }
  ];
  
  return {
    props: {
      useCases
    }
  };
}