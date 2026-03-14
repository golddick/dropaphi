import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { requireAuth } from "@/lib/auth/auth-server"
import { ok, unauthorized, serverError } from "@/lib/respond/response"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await params

    const auth = await requireAuth()
    if (auth instanceof Response) return auth

    const member = await db.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId: auth.userId,
      },
    })

    if (!member) {
      return unauthorized()
    }

    const totalCount = await db.subscriber.count({
      where: {
        workspaceId,
        status: "ACTIVE",
      },
    })

    console.log(totalCount, ' total count')

    return ok(
      { count: totalCount },
      "Subscriber count fetched successfully"
    )
  } catch (error) {
    console.error("[SUBSCRIBER_COUNT_ERROR]", error)
    return serverError()
  }
}