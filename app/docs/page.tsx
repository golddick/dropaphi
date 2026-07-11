import { V1ApiDocs } from '@/components/docs/v1-api-docs';

export default function DocsPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <V1ApiDocs />
      </div>
    </main>
  );
}
