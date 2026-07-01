import { CheckCheck } from "lucide-react";
import { getNotifications, markAllAsRead } from "@/lib/actions/notification";
import { NotificationsList } from "./notifications-list";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/shared/back-button";
import type { NotificationItem } from "@/components/notifications/types";

export const metadata = { title: "Notifications – Content Creators Hub" };

export default async function NotificationsPage() {
  const { data, nextCursor } = await getNotifications();

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <BackButton />
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Stay up to date with your activity.
          </p>
        </div>
        {data.length > 0 && (
          <form action={markAllAsRead}>
            <Button variant="outline" size="sm" type="submit">
              <CheckCheck className="mr-1.5 h-4 w-4" />
              Mark all read
            </Button>
          </form>
        )}
      </div>

      <NotificationsList initialItems={data as NotificationItem[]} initialCursor={nextCursor} />
    </main>
  );
}
