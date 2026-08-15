'use server'

import { db } from '@/lib/db'
import { posts } from '@/db/schema'
import { eq, desc, and } from 'drizzle-orm'
import { verifyAdmin } from '@/app/actions/auth'
import { revalidatePath } from 'next/cache'

export async function getPosts() {
  return db
    .select()
    .from(posts)
    .where(eq(posts.published, true))
    .orderBy(desc(posts.createdAt))
}

export async function getAllPosts() {
  await verifyAdmin()
  return db.select().from(posts).orderBy(desc(posts.createdAt))
}

export async function getPost(slug: string) {
  const [post] = await db.select().from(posts)
    .where(and(eq(posts.slug, slug), eq(posts.published, true)))
    .limit(1)
  return post || null
}

export async function createPost(formData: FormData) {
  try {
    await verifyAdmin()
    const title = formData.get('title') as string
    let slug = formData.get('slug') as string
    const excerpt = formData.get('excerpt') as string
    const content = formData.get('content') as string
    const coverImage = formData.get('coverImage') as string
    const category = formData.get('category') as string
    const tags = formData.get('tags') as string
    const published = formData.get('published') === 'true'

    // Ensure slug uniqueness
    const [existing] = await db.select({ id: posts.id }).from(posts).where(eq(posts.slug, slug)).limit(1)
    if (existing) {
      let counter = 2
      while (true) {
        const candidate = `${slug}-${counter}`
        const [dup] = await db.select({ id: posts.id }).from(posts).where(eq(posts.slug, candidate)).limit(1)
        if (!dup) { slug = candidate; break }
        counter++
      }
    }

    await db.insert(posts).values({
      title,
      slug,
      excerpt: excerpt || null,
      content,
      coverImage: coverImage || null,
      category: category || null,
      tags: tags || '',
      published,
    })
    revalidatePath('/blog')
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Error creating post:', error)
    return { success: false, error: 'Failed to create post.' }
  }
}

export async function updatePost(id: string, formData: FormData) {
  try {
    await verifyAdmin()
    const title = formData.get('title') as string
    const slug = formData.get('slug') as string
    const excerpt = formData.get('excerpt') as string
    const content = formData.get('content') as string
    const coverImage = formData.get('coverImage') as string
    const category = formData.get('category') as string
    const tags = formData.get('tags') as string
    const published = formData.get('published') === 'true'

    await db.update(posts).set({
      title,
      slug,
      excerpt: excerpt || null,
      content,
      coverImage: coverImage || null,
      category: category || null,
      tags: tags || '',
      published,
    }).where(eq(posts.id, id))
    revalidatePath('/blog')
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Error updating post:', error)
    return { success: false, error: 'Failed to update post.' }
  }
}

export async function deletePost(id: string) {
  try {
    await verifyAdmin()
    await db.delete(posts).where(eq(posts.id, id))
    revalidatePath('/blog')
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Error deleting post:', error)
    return { success: false, error: 'Failed to delete post.' }
  }
}
