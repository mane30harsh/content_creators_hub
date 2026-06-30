"use server";

import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/guards";

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

async function logAction(
  adminId: string,
  action: string,
  targetId?: string,
  reason?: string,
  metadata?: Record<string, unknown>,
  referenceId?: string,
  referenceType?: string,
) {
  await prisma.adminActionLog.create({
    data: {
      adminId,
      targetId,
      action: action as never,
      reason,
      metadata: (metadata ?? undefined) as Prisma.InputJsonValue,
      referenceId,
      referenceType,
    },
  });
}

// ─── Users ─────────────────────────────────────────────────────

export async function getAdminUsers(filters?: {
  role?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}) {
  await requireRole(["ADMIN"]);
  const page = filters?.page ?? 1;
  const pageSize = filters?.pageSize ?? 20;

  const where: Record<string, unknown> = {};
  if (filters?.role && filters.role !== "ALL") {
    where.role = filters.role;
  }
  if (filters?.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" as never } },
      { email: { contains: filters.search, mode: "insensitive" as never } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        isFeatured: true,
        createdAt: true,
        _count: { select: { posts: true, reportsReceived: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.user.count({ where }),
  ]);

  return { users, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function toggleUserActive(
  userId: string,
  reason?: string
): Promise<ActionResult<{ isActive: boolean }>> {
  const admin = await requireRole(["ADMIN"]);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, isActive: true },
  });
  if (!user) return { success: false, error: "User not found." };

  if (user.id === admin.id) {
    return { success: false, error: "Cannot deactivate yourself." };
  }

  const newStatus = !user.isActive;

  await prisma.user.update({
    where: { id: userId },
    data: { isActive: newStatus },
  });

  await logAction(
    admin.id,
    newStatus ? "USER_UNBANNED" : "USER_BANNED",
    userId,
    reason,
    undefined,
    undefined,
    undefined,
  );

  revalidatePath("/admin/users");
  return { success: true, data: { isActive: newStatus } };
}

export async function toggleUserFeatured(
  userId: string
): Promise<ActionResult<{ isFeatured: boolean }>> {
  const admin = await requireRole(["ADMIN"]);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isFeatured: true },
  });
  if (!user) return { success: false, error: "User not found." };

  const newStatus = !user.isFeatured;

  await prisma.user.update({
    where: { id: userId },
    data: { isFeatured: newStatus },
  });

  await logAction(admin.id, "USER_WARNED", userId, newStatus ? "Featured" : "Unfeatured");

  revalidatePath("/admin/users");
  return { success: true, data: { isFeatured: newStatus } };
}

// ─── Campaigns ─────────────────────────────────────────────────

export async function getAdminCampaigns(filters?: {
  status?: string;
  search?: string;
  page?: number;
  pageSize?: number;
  includeRemoved?: boolean;
}) {
  await requireRole(["ADMIN"]);
  const page = filters?.page ?? 1;
  const pageSize = filters?.pageSize ?? 20;

  const where: Record<string, unknown> = {};
  if (filters?.status && filters.status !== "ALL") {
    where.status = filters.status;
  }
  if (filters?.search) {
    where.OR = [
      { title: { contains: filters.search, mode: "insensitive" as never } },
      { description: { contains: filters.search, mode: "insensitive" as never } },
    ];
  }

  const [campaigns, total] = await Promise.all([
    prisma.campaign.findMany({
      where,
      include: {
        brandProfile: {
          select: { companyName: true, slug: true, logo: true, userId: true },
        },
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.campaign.count({ where }),
  ]);

  return { campaigns, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function removeCampaign(
  campaignId: string,
  reason: string
): Promise<ActionResult> {
  const admin = await requireRole(["ADMIN"]);

  if (!reason || reason.length < 10) {
    return { success: false, error: "Please provide a reason (min 10 characters)." };
  }

  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    select: { id: true, title: true, brandProfile: { select: { userId: true } } },
  });
  if (!campaign) return { success: false, error: "Campaign not found." };

  await prisma.campaign.update({
    where: { id: campaignId },
    data: {
      isRemoved: true,
      removedReason: reason,
      removedAt: new Date(),
      status: "CANCELLED",
      isPublic: false,
    },
  });

  await logAction(
    admin.id,
    "CAMPAIGN_REMOVED",
    campaign.brandProfile.userId,
    reason,
    { campaignTitle: campaign.title },
    campaignId,
    "Campaign",
  );

  await prisma.notification.create({
    data: {
      userId: campaign.brandProfile.userId,
      type: "ADMIN_NOTICE",
      title: "Campaign removed",
      body: `Your campaign "${campaign.title}" was removed. Reason: ${reason}`,
      referenceId: campaignId,
      referenceType: "Campaign",
      actionUrl: `/brand/campaigns`,
    },
  });

  revalidatePath("/admin/campaigns");
  return { success: true, data: undefined };
}

// ─── Reports ───────────────────────────────────────────────────

export async function getAdminReports(filters?: {
  status?: string;
  page?: number;
  pageSize?: number;
}) {
  await requireRole(["ADMIN"]);
  const page = filters?.page ?? 1;
  const pageSize = filters?.pageSize ?? 20;

  const where: Record<string, unknown> = {};
  if (filters?.status && filters.status !== "ALL") {
    where.status = filters.status;
  }

  const [reports, total] = await Promise.all([
    prisma.report.findMany({
      where,
      include: {
        reporter: { select: { id: true, name: true, email: true, image: true } },
        reported: { select: { id: true, name: true, email: true, image: true, role: true, isActive: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.report.count({ where }),
  ]);

  return { reports, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function resolveReport(
  reportId: string,
  action: "RESOLVED" | "DISMISSED",
  resolution?: string
): Promise<ActionResult> {
  const admin = await requireRole(["ADMIN"]);

  const report = await prisma.report.findUnique({
    where: { id: reportId },
    select: { id: true, reportedId: true, referenceId: true, referenceType: true },
  });
  if (!report) return { success: false, error: "Report not found." };

  await prisma.report.update({
    where: { id: reportId },
    data: {
      status: action as never,
      resolvedBy: admin.id,
      resolvedAt: new Date(),
      resolution: resolution || null,
    },
  });

  await logAction(
    admin.id,
    action === "RESOLVED" ? "REPORT_RESOLVED" : "REPORT_DISMISSED",
    report.reportedId,
    resolution,
    undefined,
    reportId,
    "Report",
  );

  revalidatePath("/admin/reports");
  return { success: true, data: undefined };
}

// ─── Analytics ─────────────────────────────────────────────────

export async function getAnalytics() {
  await requireRole(["ADMIN"]);

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    totalCreators,
    totalBrands,
    totalAdmins,
    activeUsers30d,
    inactiveUsers,
    totalCampaigns,
    openCampaigns,
    completedCampaigns,
    totalApplications,
    acceptedApplications,
    totalPosts,
    totalReports,
    pendingReports,
    totalReviews,
    totalMessages,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "CREATOR" } }),
    prisma.user.count({ where: { role: "BRAND" } }),
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.user.count({ where: { isActive: false } }),
    prisma.campaign.count(),
    prisma.campaign.count({ where: { status: "OPEN", isRemoved: false } }),
    prisma.campaign.count({ where: { status: "COMPLETED" } }),
    prisma.campaignApplication.count(),
    prisma.campaignApplication.count({ where: { status: "ACCEPTED" } }),
    prisma.post.count(),
    prisma.report.count(),
    prisma.report.count({ where: { status: "PENDING" } }),
    prisma.review.count(),
    prisma.message.count(),
  ]);

  const campaignsByStatus = await prisma.campaign.groupBy({
    by: ["status"],
    _count: true,
  });

  const usersByRole = await prisma.user.groupBy({
    by: ["role"],
    _count: true,
  });

  return {
    users: {
      total: totalUsers,
      creators: totalCreators,
      brands: totalBrands,
      admins: totalAdmins,
      active30d: activeUsers30d,
      inactive: inactiveUsers,
      byRole: usersByRole.map((r) => ({ role: r.role, count: r._count })),
    },
    campaigns: {
      total: totalCampaigns,
      open: openCampaigns,
      completed: completedCampaigns,
      byStatus: campaignsByStatus.map((s) => ({ status: s.status, count: s._count })),
    },
    applications: {
      total: totalApplications,
      accepted: acceptedApplications,
      acceptanceRate: totalApplications > 0
        ? Math.round((acceptedApplications / totalApplications) * 100)
        : 0,
    },
    content: {
      posts: totalPosts,
      reviews: totalReviews,
      messages: totalMessages,
    },
    reports: {
      total: totalReports,
      pending: pendingReports,
    },
  };
}

// ─── Admin action logs ─────────────────────────────────────────

export async function getAdminLogs(page = 1, pageSize = 30) {
  await requireRole(["ADMIN"]);

  const [logs, total] = await Promise.all([
    prisma.adminActionLog.findMany({
      include: {
        admin: { select: { id: true, name: true, email: true } },
        target: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.adminActionLog.count(),
  ]);

  return { logs, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}
