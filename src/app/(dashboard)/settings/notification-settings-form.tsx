"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Bell, Mail, MessageSquare, Briefcase } from "lucide-react";

export function NotificationSettingsForm() {
  const [emailCampaigns, setEmailCampaigns] = useState(true);
  const [emailMessages, setEmailMessages] = useState(true);
  const [emailReviews, setEmailReviews] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

  const handleSave = () => {
    toast.success("Notification preferences saved!");
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {/* Campaign updates */}
        <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-4">
          <div className="flex items-start gap-3">
            <Briefcase className="mt-0.5 h-5 w-5 text-muted-foreground shrink-0" />
            <div>
              <p className="text-sm font-medium">Campaign & Application Updates</p>
              <p className="text-xs text-muted-foreground">
                Receive email alerts when campaign status changes or applications are submitted.
              </p>
            </div>
          </div>
          <Switch
            checked={emailCampaigns}
            onCheckedChange={setEmailCampaigns}
          />
        </div>

        {/* New messages */}
        <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-4">
          <div className="flex items-start gap-3">
            <MessageSquare className="mt-0.5 h-5 w-5 text-muted-foreground shrink-0" />
            <div>
              <p className="text-sm font-medium">Direct Messages</p>
              <p className="text-xs text-muted-foreground">
                Get notified by email when a brand or creator sends you a new message.
              </p>
            </div>
          </div>
          <Switch
            checked={emailMessages}
            onCheckedChange={setEmailMessages}
          />
        </div>

        {/* Reviews */}
        <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-4">
          <div className="flex items-start gap-3">
            <Bell className="mt-0.5 h-5 w-5 text-muted-foreground shrink-0" />
            <div>
              <p className="text-sm font-medium">Reviews & Ratings</p>
              <p className="text-xs text-muted-foreground">
                Receive notifications when someone submits a review on your profile.
              </p>
            </div>
          </div>
          <Switch
            checked={emailReviews}
            onCheckedChange={setEmailReviews}
          />
        </div>

        {/* Weekly Digest */}
        <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-4">
          <div className="flex items-start gap-3">
            <Mail className="mt-0.5 h-5 w-5 text-muted-foreground shrink-0" />
            <div>
              <p className="text-sm font-medium">Weekly Digest</p>
              <p className="text-xs text-muted-foreground">
                A weekly summary of platform activity, recommended campaigns, and top creators.
              </p>
            </div>
          </div>
          <Switch
            checked={weeklyDigest}
            onCheckedChange={setWeeklyDigest}
          />
        </div>
      </div>

      <div className="pt-2">
        <Button onClick={handleSave}>
          Save Preferences
        </Button>
      </div>
    </div>
  );
}
