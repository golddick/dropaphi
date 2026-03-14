'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function SettingsIndexPage() {
  const router = useRouter();
  const params = useParams<{ workspaceId: string }>();

  useEffect(() => {
    if (!params.workspaceId) return;

    router.replace(
      `/dashboard/${params.workspaceId}/settings/workspace`
    );
  }, [params.workspaceId, router]);

  return null;
}