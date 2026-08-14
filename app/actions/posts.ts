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
  await verifyAdmin()
  const title = formData.get('title') as string
  const slug = formData.get('slug') as string
  const excerpt = formData.get('excerpt') as string
  const content = formData.get('content') as string
  const coverImage = formData.get('coverImage') as string
  const category = formData.get('category') as string
  const tags = formData.get('tags') as string
  const published = formData.get('published') === 'true'

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
}

export async function updatePost(id: string, formData: FormData) {
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
}

export async function deletePost(id: string) {
  await verifyAdmin()
  await db.delete(posts).where(eq(posts.id, id))
  revalidatePath('/blog')
  revalidatePath('/')
}
