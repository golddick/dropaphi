'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

export default function DropIDDocs() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAFAFA' }}>
      {/* Navigation */}
      <nav className="border-b" style={{ borderColor: '#E5E5E5', backgroundColor: '#FFFFFF' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div
                className="flex h-8 w-8 items-center justify-center rounded font-bold text-white text-sm"
                style={{ backgroundColor: '#DC143C' }}
              >
                D
              </div>
              <span className="font-bold text-lg" style={{ color: '#1A1A1A' }}>
                Drop API
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/docs">
                <Button variant="outline" size="sm">
                  ← Back to Docs
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button size="sm" style={{ backgroundColor: '#DC143C' }}>
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              <div>
                <h3 className="font-bold mb-3" style={{ color: '#1A1A1A' }}>
                  On This Page
                </h3>
                <ul className="space-y-2 text-sm" style={{ color: '#666666' }}>
                  <li><a href="#overview" className="hover:underline">Overview</a></li>
                  <li><a href="#installation" className="hover:underline">Installation</a></li>
                  <li><a href="#quick-start" className="hover:underline">Quick Start</a></li>
                  <li><a href="#api-reference" className="hover:underline">API Reference</a></li>
                  <li><a href="#orm-integration" className="hover:underline">ORM Integration</a></li>
                  <li><a href="#examples" className="hover:underline">Examples</a></li>
                  <li><a href="#security" className="hover:underline">Security</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold mb-3" style={{ color: '#1A1A1A' }}>
                  Related
                </h3>
                <ul className="space-y-2 text-sm" style={{ color: '#666666' }}>
                  <li><a href="https://npmjs.com/package/drop-api-id" className="hover:underline">npm Package</a></li>
                  <li><a href="https://github.com/golddick/dropid" className="hover:underline">GitHub Repository</a></li>
                </ul>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="prose max-w-none">
              {/* Header */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-4xl">🔖</span>
                  <h1 className="text-4xl font-bold m-0" style={{ color: '#1A1A1A' }}>
                    DropID
                  </h1>
                </div>
                <p className="text-xl" style={{ color: '#666666' }}>
                  Human-readable, prefixed unique identifiers for your database models
                </p>
                <div className="flex gap-3 mt-4">
                  <span className="px-3 py-1 rounded text-xs font-medium" style={{ backgroundColor: '#DC143C', color: '#FFFFFF' }}>
                    v1.0.0
                  </span>
                  <span className="px-3 py-1 rounded text-xs font-medium" style={{ backgroundColor: '#F5F5F5', color: '#666666' }}>
                    MIT License
                  </span>
                  <span className="px-3 py-1 rounded text-xs font-medium" style={{ backgroundColor: '#F5F5F5', color: '#666666' }}>
                    TypeScript
                  </span>
                </div>
              </div>

              {/* Overview */}
              <section id="overview" className="mb-12">
                <h2 className="text-2xl font-bold mb-4" style={{ color: '#1A1A1A' }}>
                  Overview
                </h2>
                <p style={{ color: '#666666' }}>
                  DropID is a lightweight TypeScript library that generates human-readable, prefixed unique identifiers 
                  for database models. Instead of cryptic UUIDs like <code>550e8400-e29b-41d4-a916-446655440000</code>, 
                  you get readable IDs like <code>user_a3f2b9c1d4e5</code>.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="p-4 border rounded" style={{ borderColor: '#E5E5E5', backgroundColor: '#FFFFFF' }}>
                    <h4 className="font-semibold mb-2" style={{ color: '#DC143C' }}>Before (UUID)</h4>
                    <code className="text-sm" style={{ color: '#666666' }}>
                      550e8400-e29b-41d4-a916-446655440000
                    </code>
                    <p className="text-xs mt-2" style={{ color: '#999999' }}>Hard to read, no context</p>
                  </div>
                  <div className="p-4 border rounded" style={{ borderColor: '#DC143C', backgroundColor: '#FFF5F5' }}>
                    <h4 className="font-semibold mb-2" style={{ color: '#DC143C' }}>After (DropID)</h4>
                    <code className="text-sm" style={{ color: '#DC143C' }}>
                      user_a3f2b9c1d4e5
                    </code>
                    <p className="text-xs mt-2" style={{ color: '#999999' }}>Instantly readable, contextual</p>
                  </div>
                </div>
              </section>

              {/* Installation */}
              <section id="installation" className="mb-12">
                <h2 className="text-2xl font-bold mb-4" style={{ color: '#1A1A1A' }}>
                  Installation
                </h2>
                <div className="relative">
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto">
                    <code>npm install drop-api-id</code>
                  </pre>
                  <button
                    onClick={() => copyToClipboard('npm install drop-api-id', 'install')}
                    className="absolute top-2 right-2 p-2 rounded hover:bg-gray-700"
                  >
                    {copiedCode === 'install' ? (
                      <Check className="h-4 w-4 text-green-400" />
                    ) : (
                      <Copy className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                <p className="text-sm mt-2" style={{ color: '#666666' }}>
                  Or using yarn: <code>yarn add drop-api-id</code>
                </p>
              </section>

              {/* Quick Start */}
              <section id="quick-start" className="mb-12">
                <h2 className="text-2xl font-bold mb-4" style={{ color: '#1A1A1A' }}>
                  Quick Start
                </h2>
                
                <h3 className="text-xl font-semibold mb-3" style={{ color: '#1A1A1A' }}>
                  Basic Usage
                </h3>
                <div className="relative">
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-sm">
                    <code>{`import { dropid } from 'drop-api-id';

// Generate a simple ID
const userId = dropid('user');
// → user_a3f2b9c1d4e5

// With prefix (for multi-tenant apps)
const orderId = dropid('order', 'acme');
// → acme_order_x7k9m2n4p1q8

// With custom options
const customId = dropid('post', 'blog', { length: 16 });
// → blog_post_k8j3m9n2l4p6q1r7`}</code>
                  </pre>
                  <button
                    onClick={() => copyToClipboard(`import { dropid } from 'drop-api-id';

const userId = dropid('user');
const orderId = dropid('order', 'acme');
const customId = dropid('post', 'blog', { length: 16 });`, 'basic')}
                    className="absolute top-2 right-2 p-2 rounded hover:bg-gray-700"
                  >
                    {copiedCode === 'basic' ? (
                      <Check className="h-4 w-4 text-green-400" />
                    ) : (
                      <Copy className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </section>

              {/* API Reference */}
              <section id="api-reference" className="mb-12">
                <h2 className="text-2xl font-bold mb-4" style={{ color: '#1A1A1A' }}>
                  API Reference
                </h2>

                {/* dropid function */}
                <div className="mb-6 p-4 border rounded" style={{ borderColor: '#E5E5E5', backgroundColor: '#FFFFFF' }}>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: '#DC143C' }}>
                    <code>dropid(modelName, prefix?, options?)</code>
                  </h3>
                  <p className="mb-3" style={{ color: '#666666' }}>
                    Generates a unique ID with optional prefix.
                  </p>
                  <div className="space-y-2">
                    <div>
                      <strong>Parameters:</strong>
                      <ul className="ml-4 mt-1 space-y-1 text-sm" style={{ color: '#666666' }}>
                        <li><code>modelName</code> (string, required) - The model/table name</li>
                        <li><code>prefix</code> (string, optional) - Additional prefix for namespacing</li>
                        <li><code>options</code> (object, optional) - Configuration options</li>
                      </ul>
                    </div>
                    <div>
                      <strong>Returns:</strong>
                      <p className="text-sm" style={{ color: '#666666' }}>
                        <code>string</code> - The generated unique ID
                      </p>
                    </div>
                  </div>
                </div>

                {/* configure function */}
                <div className="mb-6 p-4 border rounded" style={{ borderColor: '#E5E5E5', backgroundColor: '#FFFFFF' }}>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: '#DC143C' }}>
                    <code>configure(options)</code>
                  </h3>
                  <p className="mb-3" style={{ color: '#666666' }}>
                    Set global configuration for all subsequent ID generations.
                  </p>
                  <pre className="bg-gray-900 text-gray-100 p-3 rounded text-sm overflow-x-auto">
                    <code>{`configure({
  length: 16,           // Length of random part
  alphabet: '0-9a-z',   // Characters to use
  separator: '-'        // Separator between parts
});`}</code>
                  </pre>
                </div>

                {/* createPrefixedId function */}
                <div className="mb-6 p-4 border rounded" style={{ borderColor: '#E5E5E5', backgroundColor: '#FFFFFF' }}>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: '#DC143C' }}>
                    <code>createPrefixedId(prefix, options?)</code>
                  </h3>
                  <p className="mb-3" style={{ color: '#666666' }}>
                    Creates a reusable ID generator with a fixed prefix.
                  </p>
                  <pre className="bg-gray-900 text-gray-100 p-3 rounded text-sm overflow-x-auto">
                    <code>{`const acmeId = createPrefixedId('acme');

acmeId('user');   // → acme_user_a3f2b9c1d4e5
acmeId('order');  // → acme_order_x7k9m2n4p1q8`}</code>
                  </pre>
                </div>
              </section>

              {/* ORM Integration */}
              <section id="orm-integration" className="mb-12">
                <h2 className="text-2xl font-bold mb-4" style={{ color: '#1A1A1A' }}>
                  ORM Integration
                </h2>

                {/* Drizzle */}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-3" style={{ color: '#1A1A1A' }}>
                    Drizzle ORM
                  </h3>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-sm">
                    <code>{`import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { dropid } from 'drop-api-id';

export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => dropid('user')),
  name: text('name').notNull(),
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const orders = pgTable('orders', {
  id: text('id').primaryKey().$defaultFn(() => dropid('order', 'shop')),
  userId: text('user_id').references(() => users.id),
  total: text('total').notNull(),
});`}</code>
                  </pre>
                </div>

                {/* Prisma */}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-3" style={{ color: '#1A1A1A' }}>
                    Prisma
                  </h3>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-sm">
                    <code>{`import { dropid } from 'drop-api-id';

const user = await prisma.user.create({
  data: {
    id: dropid('user'),
    name: 'John Doe',
    email: 'john@example.com',
  },
});

const order = await prisma.order.create({
  data: {
    id: dropid('order', 'shop'),
    userId: user.id,
    total: '99.99',
  },
});`}</code>
                  </pre>
                </div>

                {/* TypeORM */}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-3" style={{ color: '#1A1A1A' }}>
                    TypeORM
                  </h3>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-sm">
                    <code>{`import { Entity, PrimaryColumn, Column, BeforeInsert } from 'typeorm';
import { dropid } from 'drop-api-id';

@Entity()
export class User {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @BeforeInsert()
  generateId() {
    this.id = dropid('user');
  }
}`}</code>
                  </pre>
                </div>
              </section>

              {/* Examples */}
              <section id="examples" className="mb-12">
                <h2 className="text-2xl font-bold mb-4" style={{ color: '#1A1A1A' }}>
                  Real-World Examples
                </h2>

                {/* Multi-tenant SaaS */}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-3" style={{ color: '#1A1A1A' }}>
                    Multi-Tenant SaaS Application
                  </h3>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-sm">
                    <code>{`import { createPrefixedId } from 'drop-api-id';

// Create tenant-specific ID generators
function getTenantIdGenerator(tenantId: string) {
  return createPrefixedId(tenantId);
}

// In your API route
app.post('/api/:tenantId/users', async (req, res) => {
  const genId = getTenantIdGenerator(req.params.tenantId);
  
  const user = {
    id: genId('user'),           // → acme_user_a3f2b9c1d4e5
    workspaceId: genId('workspace'), // → acme_workspace_x7k9m2n4
    ...req.body
  };
  
  await db.users.insert(user);
  res.json(user);
});`}</code>
                  </pre>
                </div>

                {/* Custom Alphabets */}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-3" style={{ color: '#1A1A1A' }}>
                    Using Different Alphabets
                  </h3>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-sm">
                    <code>{`import { dropid, configure, alphabets } from 'drop-api-id';

// Use hexadecimal
configure({ alphabet: alphabets.hex });
dropid('log'); // → log_a3f2b9c1d4e5

// Use Base58 (no confusing chars)
configure({ alphabet: alphabets.base58 });
dropid('token'); // → token_Kx7mN3pQ2rT8

// Reset to default
configure({ alphabet: alphabets.alphanumeric });`}</code>
                  </pre>
                </div>
              </section>

              {/* Security */}
              <section id="security" className="mb-12">
                <h2 className="text-2xl font-bold mb-4" style={{ color: '#1A1A1A' }}>
                  Security & Performance
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded" style={{ borderColor: '#E5E5E5', backgroundColor: '#FFFFFF' }}>
                    <h4 className="font-semibold mb-2" style={{ color: '#DC143C' }}>Collision Resistance</h4>
                    <ul className="space-y-1 text-sm" style={{ color: '#666666' }}>
                      <li>• 12 chars: ~200 years at 1K/sec</li>
                      <li>• 16 chars: ~10^12 years at 1K/sec</li>
                      <li>• Uses nanoid (crypto-secure)</li>
                    </ul>
                  </div>
                  <div className="p-4 border rounded" style={{ borderColor: '#E5E5E5', backgroundColor: '#FFFFFF' }}>
                    <h4 className="font-semibold mb-2" style={{ color: '#DC143C' }}>Performance</h4>
                    <ul className="space-y-1 text-sm" style={{ color: '#666666' }}>
                      <li>• 2-3M IDs per second</li>
                      <li>• Zero network latency</li>
                      <li>• Only 2KB bundle size</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-4 p-4 rounded" style={{ backgroundColor: '#FFF5F5', border: '1px solid #DC143C20' }}>
                  <h4 className="font-semibold mb-2" style={{ color: '#DC143C' }}>🔒 Security Benefits</h4>
                  <ul className="space-y-1 text-sm" style={{ color: '#666666' }}>
                    <li>✓ No sequential enumeration - prevents guessing attacks</li>
                    <li>✓ URL-safe characters - works in URLs without encoding</li>
                    <li>✓ Database-friendly - works as VARCHAR primary key</li>
                  </ul>
                </div>
              </section>

              {/* Footer */}
              <div className="mt-12 pt-8 border-t" style={{ borderColor: '#E5E5E5' }}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <p className="text-sm font-semibold mb-1" style={{ color: '#1A1A1A' }}>
                      Need help?
                    </p>
                    <p className="text-sm" style={{ color: '#666666' }}>
                      Check out our <Link href="/docs" className="underline" style={{ color: '#DC143C' }}>full documentation</Link> or 
                      reach out to <a href="#" className="underline" style={{ color: '#DC143C' }}>support</a>.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <a 
                      href="https://github.com/golddick/dropid" 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" size="sm">
                        View on GitHub
                      </Button>
                    </a>
                    <a 
                      href="https://npmjs.com/package/drop-api-id" 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <Button size="sm" style={{ backgroundColor: '#DC143C' }}>
                        View on npm
                      </Button>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
