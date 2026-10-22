import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/guards";
import { getOrCreateThread } from "@/lib/actions/message";

interface Props {
  searchParams: Promise<{ userId?: string }>;
}

export default async function NewMessagePage({ searchParams }: Props) {
  const { userId } = await searchParams;
  const user = await requireUser();

  if (!userId) {
    redirect("/messages");
  }

  if (userId === user.id) {
    redirect("/messages");
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!targetUser) {
    redirect("/messages");
  }

  const result = await getOrCreateThread({ targetUserId: userId });

  if (!result.success) {
    redirect("/messages");
  }

  redirect(`/messages/${result.data.threadId}`);
}
