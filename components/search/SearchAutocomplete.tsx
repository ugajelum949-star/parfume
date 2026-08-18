'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Search, Clock, TrendingUp, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { formatCurrency } from '@/lib/utils'
import { getFirstSizePrice, getPostWarPrice } from '@/lib/price'
import { getImageSrc } from '@/lib/image-proxy'

type Product = {
  id: string
  name: string
  category: string
  brand: string
  price: number
  image: string | null
  sizes: string
  stock: number
  isBestSeller: boolean
  stockData?: string
  warPrice?: number | null
  launchedAt?: Date | string | null
  tags?: string
  description?: string | null
}

const RECENT_KEY = 'parfume_recent_searches'
const MAX_RECENT = 5
const MAX_RESULTS = 8
const DEBOUNCE_MS = 300

function getRecentSearches(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(RECENT_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveRecentSearch(query: string) {
  if (!query.trim()) return
  const recent = getRecentSearches().filter((r) => r.toLowerCase() !== query.toLowerCase())
  recent.unshift(query.trim())
  localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)))
}

function searchProducts(products: Product[], query: string): Product[] {
  const q = query.trim().toLowerCase()
  if (!q) return []

  const results = products.filter((p) =>
    p.name.toLowerCase().includes(q) ||
    p.brand.toLowerCase().includes(q) ||
    p.category.toLowerCase().includes(q) ||
    (p.tags && p.tags.toLowerCase().includes(q)) ||
    (p.description && p.description.toLowerCase().includes(q))
  )

  // Priority sort: name > brand > category > tags > description
  return [...results].sort((a, b) => {
    const nameA = a.name.toLowerCase().includes(q) ? 0 : 1
    const nameB = b.name.toLowerCase().includes(q) ? 0 : 1
    if (nameA !== nameB) return nameA - nameB
    const brandA = a.brand.toLowerCase().includes(q) ? 0 : 1
    const brandB = b.brand.toLowerCase().includes(q) ? 0 : 1
    if (brandA !== brandB) return brandA - brandB
    const catA = a.category.toLowerCase().includes(q) ? 0 : 1
    const catB = b.category.toLowerCase().includes(q) ? 0 : 1
    if (catA !== catB) return catA - catB
    const tagsA = (a.tags || '').toLowerCase().includes(q) ? 0 : 1
    const tagsB = (b.tags || '').toLowerCase().includes(q) ? 0 : 1
    if (tagsA !== tagsB) return tagsA - tagsB
    return 0
  }).slice(0, MAX_RESULTS)
}

function getDisplayPrice(product: Product): number {
  const postWar = getPostWarPrice(product.warPrice, product.launchedAt)
  if (postWar) return postWar
  const p = getFirstSizePrice(product.stockData, product.sizes, product.price)
  return p.hasDiscount ? p.sale : p.original
}

export function SearchAutocomplete({
  products,
  onSelect,
  placeholder = 'Cari parfum...',
}: {
  products: Product[]
  onSelect: (productId: string) => void
  placeholder?: string
}) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [popularProducts, setPopularProducts] = useState<Product[]>([])
  const [debouncedQuery, setDebouncedQuery] = useState('')

  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // Load recent searches on mount
  useEffect(() => {
    async function init() {
      setRecentSearches(getRecentSearches())
      setPopularProducts(products.filter((p) => p.isBestSeller).slice(0, MAX_RESULTS))
    }
    init()
  }, [products])

  // Debounce the query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [query])

  const searchResults = searchProducts(products, debouncedQuery)

  // Show recent when focused & empty
  const showRecent = isOpen && !debouncedQuery.trim() && recentSearches.length > 0
  const showPopular = isOpen && !debouncedQuery.trim() && recentSearches.length === 0
  const showResults = isOpen && debouncedQuery.trim() && searchResults.length > 0

  const totalItems = showRecent
    ? recentSearches.length
    : showPopular
      ? popularProducts.length
      : showResults
        ? searchResults.length
        : 0

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll('[data-item]')
      items[highlightedIndex]?.scrollIntoView({ block: 'nearest' })
    }
  }, [highlightedIndex])

  const handleSelect = useCallback(
    (productId: string) => {
      if (debouncedQuery.trim()) {
        saveRecentSearch(debouncedQuery)
      }
      setIsOpen(false)
      setQuery('')
      setDebouncedQuery('')
      onSelect(productId)
      router.push(`/product/${productId}`)
    },
    [debouncedQuery, onSelect, router]
  )

  const handleRecentClick = useCallback(
    (term: string) => {
      setQuery(term)
      setDebouncedQuery(term)
      inputRef.current?.focus()
    },
    []
  )

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightedIndex((prev) => (prev < totalItems - 1 ? prev + 1 : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : totalItems - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (highlightedIndex < 0) return
      if (showRecent) {
        handleRecentClick(recentSearches[highlightedIndex])
      } else if (showPopular) {
        handleSelect(popularProducts[highlightedIndex].id)
      } else if (showResults) {
        handleSelect(searchResults[highlightedIndex].id)
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  const clearQuery = () => {
    setQuery('')
    setDebouncedQuery('')
    setHighlightedIndex(-1)
    inputRef.current?.focus()
  }

  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          ref={inputRef}
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setHighlightedIndex(-1)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="pl-9 pr-8"
          autoComplete="off"
        />
        {query && (
          <button
            onClick={clearQuery}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 mt-1 w-full bg-card border border-border rounded-lg shadow-lg overflow-hidden"
        >
          <div ref={listRef} className="max-h-96 overflow-y-auto">
            {/* Recent searches */}
            {showRecent && (
              <>
                <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider border-b border-border">
                  <Clock className="w-3 h-3 inline mr-1.5" />
                  Terakhir dicari
                </div>
                {recentSearches.map((term, i) => (
                  <button
                    key={term}
                    data-item
                    onClick={() => handleRecentClick(term)}
                    onMouseEnter={() => setHighlightedIndex(i)}
                    className={`w-full text-left px-3 py-2.5 text-sm flex items-center gap-2 transition-colors ${
                      highlightedIndex === i ? 'bg-accent' : 'hover:bg-accent'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span className="truncate">{term}</span>
                  </button>
                ))}
              </>
            )}

            {/* Popular / Best sellers */}
            {showPopular && (
              <>
                <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider border-b border-border">
                  <TrendingUp className="w-3 h-3 inline mr-1.5" />
                  Populer
                </div>
                {popularProducts.map((product, i) => (
                  <button
                    key={product.id}
                    data-item
                    onClick={() => handleSelect(product.id)}
                    onMouseEnter={() => setHighlightedIndex(i)}
                    className={`w-full text-left px-3 py-2.5 flex items-center gap-3 transition-colors ${
                      highlightedIndex === i ? 'bg-accent' : 'hover:bg-accent'
                    }`}
                  >
                    <div className="w-10 h-10 relative rounded-md overflow-hidden bg-gold/5 shrink-0">
                      {product.image ? (
                        <Image
                          src={getImageSrc(product.image)}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-[8px]">
                          No img
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{product.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{product.brand}</p>
                    </div>
                    <span className="text-xs text-gold font-semibold whitespace-nowrap">
                      {formatCurrency(getDisplayPrice(product))}
                    </span>
                  </button>
                ))}
              </>
            )}

            {/* Search results */}
            {showResults && (
              <>
                <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider border-b border-border">
                  Hasil pencarian
                </div>
                {searchResults.map((product, i) => (
                  <button
                    key={product.id}
                    data-item
                    onClick={() => handleSelect(product.id)}
                    onMouseEnter={() => setHighlightedIndex(i)}
                    className={`w-full text-left px-3 py-2.5 flex items-center gap-3 transition-colors ${
                      highlightedIndex === i ? 'bg-accent' : 'hover:bg-accent'
                    }`}
                  >
                    <div className="w-10 h-10 relative rounded-md overflow-hidden bg-gold/5 shrink-0">
                      {product.image ? (
                        <Image
                          src={getImageSrc(product.image)}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-[8px]">
                          No img
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{product.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{product.brand}</p>
                    </div>
                    <span className="text-xs text-gold font-semibold whitespace-nowrap">
                      {formatCurrency(getDisplayPrice(product))}
                    </span>
                  </button>
                ))}
              </>
            )}

            {/* No results */}
            {isOpen && debouncedQuery.trim() && searchResults.length === 0 && (
              <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                Tidak ada hasil untuk &ldquo;{debouncedQuery}&rdquo;
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
