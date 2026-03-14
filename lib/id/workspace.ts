'use client'

import { useParams } from "next/navigation"

export const useWorkspaceID = () => {
 const params = useParams()
 return params.workspaceId as string
}
