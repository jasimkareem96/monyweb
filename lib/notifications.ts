import { prisma } from "./prisma"

export type NotificationType =
  | "ORDER_STATUS_CHANGED"
  | "DISPUTE_CREATED"
  | "DISPUTE_RESOLVED"
  | "MESSAGE_RECEIVED"
  | "RATING_RECEIVED"
  | "PAYMENT_REQUIRED"
  | "DELIVERY_PROOF_REQUIRED"
  | "ORDER_COMPLETED"
  | "ORDER_CANCELLED"
  | "OFFER_APPROVED"
  | "OFFER_REJECTED"

export interface CreateNotificationParams {
  userId: string
  type: NotificationType
  title: string
  message: string
  link?: string
}

/**
 * إنشاء إشعار جديد
 */
export async function createNotification(params: CreateNotificationParams) {
  try {
    return await prisma.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        link: params.link,
      },
    })
  } catch (error) {
    console.error("Error creating notification:", error)
    return null
  }
}

/**
 * إنشاء إشعارات متعددة
 */
export async function createNotifications(params: CreateNotificationParams[]) {
  try {
    return await prisma.notification.createMany({
      data: params.map((p) => ({
        userId: p.userId,
        type: p.type,
        title: p.title,
        message: p.message,
        link: p.link,
      })),
    })
  } catch (error) {
    console.error("Error creating notifications:", error)
    return null
  }
}

/**
 * الحصول على إشعارات المستخدم
 */
export async function getUserNotifications(userId: string, limit: number = 20) {
  return await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  })
}

/**
 * الحصول على عدد الإشعارات غير المقروءة
 */
export async function getUnreadNotificationCount(userId: string) {
  return await prisma.notification.count({
    where: {
      userId,
      isRead: false,
    },
  })
}

/**
 * تحديد إشعار كمقروء
 */
export async function markNotificationAsRead(notificationId: string, userId: string) {
  return await prisma.notification.updateMany({
    where: {
      id: notificationId,
      userId, // Security: ensure user can only mark their own notifications as read
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  })
}

/**
 * تحديد جميع إشعارات المستخدم كمقروءة
 */
export async function markAllNotificationsAsRead(userId: string) {
  return await prisma.notification.updateMany({
    where: {
      userId,
      isRead: false,
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  })
}

/**
 * حذف إشعار
 */
export async function deleteNotification(notificationId: string, userId: string) {
  return await prisma.notification.deleteMany({
    where: {
      id: notificationId,
      userId, // Security: ensure user can only delete their own notifications
    },
  })
}

