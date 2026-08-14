'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, FileText, Trash2, Pencil, X, Image as ImageIcon, Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { getAllPosts, createPost, updatePost, deletePost } from '@/app/actions/posts'
import { uploadImage } from '@/app/actions/upload'

interface Post {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  coverImage: string | null
  category: string | null
  tags: string
  published: boolean
  createdAt: Date | null
  updatedAt: Date | null
}

const categories = ['Care Tips', 'Scent Guide', 'News', 'Recommendation']

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  // Form state
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [category, setCategory] = useState('')
  const [tags, setTags] = useState('')
  const [published, setPublished] = useState(false)
  const [slugEdited, setSlugEdited] = useState(false)

  const load = async () => {
    const data = await getAllPosts()
    setPosts(data as Post[])
  }

  useEffect(() => {
    async function init() {
      const data = await getAllPosts()
      setPosts(data as Post[])
    }
    init()
  }, [])

  // Auto-generate slug from title
  const derivedSlug = slugEdited ? slug : slugify(title)

  const resetForm = () => {
    setTitle(''); setSlug(''); setExcerpt(''); setContent('')
    setCoverImage(''); setCategory(''); setTags(''); setPublished(false)
    setEditingId(null); setSlugEdited(false)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const reader = new FileReader()
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
      const result = await uploadImage(base64, 'blog')
      if (result.success && result.url) {
        setCoverImage(result.url)
        toast.success('Image uploaded')
      } else {
        toast.error(result.error || 'Upload failed')
      }
    } catch {
      toast.error('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim() || !derivedSlug.trim()) {
      toast.error('Title, slug, and content are required')
      return
    }
    setSaving(true)
    try {
      const fd = new FormData()
      fd.set('title', title)
      fd.set('slug', derivedSlug)
      fd.set('excerpt', excerpt)
      fd.set('content', content)
      fd.set('coverImage', coverImage)
      fd.set('category', category)
      fd.set('tags', tags)
      fd.set('published', String(published))

      if (editingId) {
        await updatePost(editingId, fd)
        toast.success('Post updated')
      } else {
        await createPost(fd)
        toast.success('Post created')
      }
      resetForm()
      setShowForm(false)
      await load()
    } catch {
      toast.error('Failed to save')
    }
    setSaving(false)
  }

  const handleEdit = (post: Post) => {
    setTitle(post.title)
    setSlug(post.slug)
    setSlugEdited(true)
    setExcerpt(post.excerpt || '')
    setContent(post.content)
    setCoverImage(post.coverImage || '')
    setCategory(post.category || '')
    setTags(post.tags || '')
    setPublished(post.published)
    setEditingId(post.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this post?')) return
    await deletePost(id)
    toast.success('Deleted')
    await load()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Blog</h1>
          <p className="text-muted-foreground text-sm">{posts.length} articles</p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(!showForm) }} className="bg-accent text-white hover:bg-gold-light">
          <Plus className="w-4 h-4 mr-2" /> {showForm ? 'Cancel' : 'New Article'}
        </Button>
      </div>

      {showForm && (
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{editingId ? 'Edit Article' : 'New Article'}</CardTitle>
            <Button variant="ghost" size="icon" onClick={() => { setShowForm(false); resetForm() }}>
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Title *</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Article title" className="bg-input border-border text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Slug *</Label>
                  <Input value={derivedSlug} onChange={(e) => { setSlug(e.target.value); setSlugEdited(true) }} placeholder="article-slug" className="bg-input border-border text-sm" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Excerpt</Label>
                <Input value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="Short description for previews" className="bg-input border-border text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Content (Markdown) *</Label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={10}
                  placeholder="Write your article content in Markdown..."
                  className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground resize-y font-mono"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Category</Label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground">
                    <option value="">No category</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Cover Image</Label>
                  <Label className="cursor-pointer">
                    <span className="inline-flex items-center gap-2 bg-accent hover:bg-accent/80 px-3 py-2 rounded-lg border border-border text-sm transition-colors">
                      {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                      {coverImage ? 'Change Image' : 'Upload Image'}
                    </span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                  </Label>
                  {coverImage && <img src={coverImage} alt="" className="w-20 h-12 rounded-lg mt-2 object-cover border border-border" />}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Tags (comma separated)</Label>
                <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="e.g. parfum, tips, perawatan" className="bg-input border-border text-sm" />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="published"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="accent-gold"
                />
                <Label htmlFor="published" className="text-sm">Published</Label>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={saving} className="bg-accent text-white hover:bg-gold-light">
                  {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
                </Button>
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); resetForm() }}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {posts.map((post) => (
          <Card key={post.id} className="bg-card border-border">
            <CardContent className="flex items-start gap-4 p-4">
              <div className="w-16 h-12 rounded-lg bg-gold/10 shrink-0 overflow-hidden">
                {post.coverImage ? (
                  <img src={post.coverImage} alt="" className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><FileText className="w-5 h-5 text-gold/40" /></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm truncate">{post.title}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${post.published ? 'bg-emerald-500/10 text-emerald-600' : 'bg-yellow-500/10 text-yellow-600'}`}>
                    {post.published ? 'Published' : 'Draft'}
                  </span>
                </div>
                {post.category && <span className="text-xs text-muted-foreground">{post.category}</span>}
                {post.excerpt && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{post.excerpt}</p>}
              </div>
              <div className="flex gap-1 shrink-0">
                <Button variant="ghost" size="icon" onClick={() => handleEdit(post)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(post.id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {posts.length === 0 && (
          <p className="text-center text-muted-foreground py-8">No articles yet. Create one above.</p>
        )}
      </div>
    </div>
  )
}
