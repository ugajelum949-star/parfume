'use server'

import { db } from '@/lib/db'
import { testimonials } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'
import { verifyAdmin } from '@/app/actions/auth'
import { revalidatePath } from 'next/cache'

export async function getTestimonials() {
  return db.select().from(testimonials).orderBy(desc(testimonials.createdAt))
}

export async function createTestimonial(formData: FormData) {
  try {
    await verifyAdmin()
    const name = formData.get('name') as string
    const role = formData.get('role') as string
    const content = formData.get('content') as string
    const rating = Number(formData.get('rating')) || 5
    const avatar = formData.get('avatar') as string
    const proofImage = formData.get('proofImage') as string

    await db.insert(testimonials).values({ name, role, content, rating, avatar, proofImage })
    revalidatePath('/')
    revalidatePath('/admin/testimonials')
    return { success: true }
  } catch (error) {
    console.error('Error creating testimonial:', error)
    return { success: false, error: 'Failed to create testimonial.' }
  }
}

export async function updateTestimonial(id: string, formData: FormData) {
  try {
    await verifyAdmin()
    const name = formData.get('name') as string
    const role = formData.get('role') as string
    const content = formData.get('content') as string
    const rating = Number(formData.get('rating')) || 5
    const avatar = formData.get('avatar') as string
    const proofImage = formData.get('proofImage') as string

    await db.update(testimonials).set({ name, role, content, rating, avatar, proofImage }).where(eq(testimonials.id, id))
    revalidatePath('/')
    revalidatePath('/admin/testimonials')
    return { success: true }
  } catch (error) {
    console.error('Error updating testimonial:', error)
    return { success: false, error: 'Failed to update testimonial.' }
  }
}

export async function deleteTestimonial(id: string) {
  try {
    await verifyAdmin()
    await db.delete(testimonials).where(eq(testimonials.id, id))
    revalidatePath('/')
    revalidatePath('/admin/testimonials')
    return { success: true }
  } catch (error) {
    console.error('Error deleting testimonial:', error)
    return { success: false, error: 'Failed to delete testimonial.' }
  }
}
