'use client';

import Link from 'next/link';

const footerLinks = [
  { 
    heading: 'Product', 
    links: [
      ['Features', '#'],
      ['Pricing', '#pricing'],
      ['Docs', '/docs'],
      ['DropID SDK', '/docs/dropid']
    ] 
  },
  { 
    heading: 'Company', 
    links: [
      ['About', '/about'],
      ['Blog', '/blog'],
      ['Contact', '#']
    ] 
  },
  { 
    heading: 'Developers', 
    links: [
      ['GitHub', 'https://github.com/golddick/dropid'],
      ['npm Package', 'https://npmjs.com/package/dropid'],
      ['Privacy', '/privacy'],
      ['Terms', '/terms']
    ] 
  },
];

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-16 px-6 pb-10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-14">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7.5 h-7.5 bg-red-600 rounded-md flex items-center justify-center font-[Bricolage_Grotesque] font-extrabold text-sm text-white">
                D
              </div>
              <span className="font-[Bricolage_Grotesque] font-extrabold text-base text-gray-900">
                Drop<span className="text-red-600">APHI</span>
              </span>
            </div>
            <p className="font-sans text-sm text-gray-400 leading-relaxed max-w-50">
              Unified messaging infrastructure for Africa's builders.
            </p>
          </div>
          
          {footerLinks.map(({ heading, links }) => (
            <div key={heading}>
              <h4 className="font-[Bricolage_Grotesque] font-bold text-sm text-gray-900 mb-4">{heading}</h4>
              <ul className="list-none p-0 flex flex-col gap-2.5">
                {links.map(([label, href]) => (
                  <li key={label}>
                    <a 
                      href={href} 
                      className="font-sans text-sm text-gray-500 hover:text-gray-900 transition-colors no-underline"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-100 pt-7 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="font-mono text-xs text-gray-400">
            © 2024 Drop API · DropID is open source (MIT License)
          </p>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <span className="font-mono text-xs text-gray-500">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}