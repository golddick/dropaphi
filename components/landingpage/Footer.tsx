'use client';

import Image from 'next/image';
import Link from 'next/link';

const footerLinks = [
  { 
    heading: 'Product', 
    links: [
      ['Features', '#'],
      ['Pricing', '#pricing'],
      ['Docs', '/docs'],
      ['Drop-id', '/docs/dropid']
    ] 
  },
  { 
    heading: 'Company', 
    links: [
      ['About', '/about'],
      ['Blog', '/blog'],
      ['Contact', '/contact']
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
    <footer className="bg-[#0a0a0f] border-t border-border py-16 px-6 pb-10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-14">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div
              className="flex h-8 w-8 items-center justify-center rounded overflow-hidden bg-white"
              style={{ backgroundColor: '#1A1A1A' }}
            >
              <Image
                src="/image/drop-logo.png"
                alt="Dropaphi Logo"
                width={24}
                height={24}
                className="object-contain"
                priority
              />
            </div>
              <span className=" font-extrabold text-base text-foreground">
                Drop<span className="text-red-600">APHI</span>
              </span>
            </div>
            <p className="font-sans text-sm text-muted-foreground leading-relaxed max-w-50">
              DropAPHI is a unified application infrastructure platform that replaces five separate vendors with a single API.
            </p>
          </div>
          
          {footerLinks.map(({ heading, links }) => (
            <div key={heading}>
              <h4 className=" font-bold text-sm text-foreground mb-4">{heading}</h4>
              <ul className="list-none p-0 flex flex-col gap-2.5">
                {links.map(([label, href]) => (
                  <li key={label}>
                    <a 
                      href={href} 
                      className="font-sans text-sm text-muted-foreground hover:text-foreground transition-colors no-underline"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-7 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className=" text-xs text-muted-foreground">
            © 2025 Drop API · DropID is open source (MIT License)
          </p>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <span className=" text-xs text-muted-foreground">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}