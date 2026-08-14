'use server'

import { db } from '@/lib/db'
import { paymentMethods } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'
import { verifyAdmin } from './auth'
import { deleteFromS3, uploadToS3 } from '@/lib/s3-storage'
import { revalidatePath } from 'next/cache'

export async function getPaymentMethods() {
  await verifyAdmin()
  return await db
    .select()
    .from(paymentMethods)
    .orderBy(desc(paymentMethods.createdAt))
}

export async function savePaymentMethod(
  data: {
    type: string
    label: string
    accountName?: string
    accountNumber?: string
    qrisImageUrl?: string
    isActive?: boolean
  },
  editingId?: string
) {
  await verifyAdmin()

  if (!data.type || !data.label) {
    throw new Error('Type and label are required')
  }

  if (editingId) {
    await db
      .update(paymentMethods)
      .set({
        type: data.type,
        label: data.label,
        accountName: data.accountName || null,
        accountNumber: data.accountNumber || null,
        qrisImageUrl: data.qrisImageUrl || null,
        isActive: data.isActive ?? true,
        updatedAt: new Date(),
      })
      .where(eq(paymentMethods.id, editingId))
    revalidatePath('/admin/payment-methods')
    revalidatePath('/cart')
    return { success: true, id: editingId }
  }

  const [created] = await db
    .insert(paymentMethods)
    .values({
      type: data.type,
      label: data.label,
      accountName: data.accountName || null,
      accountNumber: data.accountNumber || null,
      qrisImageUrl: data.qrisImageUrl || null,
      isActive: data.isActive ?? true,
    })
    .returning({ id: paymentMethods.id })

  revalidatePath('/admin/payment-methods')
  revalidatePath('/cart')
  return { success: true, id: created.id }
}

export async function deletePaymentMethod(id: string) {
  await verifyAdmin()

  // Clean up S3 image if exists
  const [method] = await db
    .select()
    .from(paymentMethods)
    .where(eq(paymentMethods.id, id))

  if (method?.qrisImageUrl) {
    await deleteFromS3(method.qrisImageUrl)
  }

  await db.delete(paymentMethods).where(eq(paymentMethods.id, id))
  revalidatePath('/admin/payment-methods')
  revalidatePath('/cart')
  return { success: true }
}

export async function uploadQrisImage(base64Data: string) {
  await verifyAdmin()
  const url = await uploadToS3(base64Data, 'qris')
  return { success: true, url }
}
