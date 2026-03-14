// app/invite/[token]/page.tsx
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import InviteAcceptClient from './_component/invite';

interface InvitePageProps {
  params: Promise<{
    token: string;
  }>;
}

export async function generateMetadata(
  { params }: InvitePageProps
): Promise<Metadata> {
  // IMPORTANT: Await the params Promise
  const { token } = await params;
  
  return {
    title: 'Accept Workspace Invitation',
    description: 'Join your team on Drop API',
  };
}

export default async function InviteAcceptPage({ params }: InvitePageProps) {
  // IMPORTANT: Await the params Promise
  const { token } = await params;

  console.log(token, 'inv token');

  if (!token) {
    return notFound();
  }

  // Pass the token to the client component
  return <InviteAcceptClient token={token} />;
}