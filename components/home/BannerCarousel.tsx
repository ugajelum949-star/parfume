'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'

type Banner = {
  id: string
  title: string | null
  image: string
  link: string | null
}

export function BannerCarousel({ banners }: { banners: Banner[] }) {
  const [current, setCurrent] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const next = useCallback(() => {
    setCurrent(c => (c + 1) % banners.length)
  }, [banners.length])

  useEffect(() => {
    if (isPaused || banners.length <= 1) return
    const timer = setInterval(next, 4000)
    return () => clearInterval(timer)
  }, [isPaused, next, banners.length])

  if (banners.length === 0) return null
  if (banners.length === 1) {
    const b = banners[0]
    const content = (
      <div className="relative aspect-[21/9] md:aspect-[3/1] rounded-2xl overflow-hidden">
        <Image src={b.image} alt={b.title || 'Banner'} fill className="object-cover" />
        {b.title && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-6 md:p-10">
            <span className="text-white font-bold text-lg md:text-2xl">{b.title}</span>
          </div>
        )}
      </div>
    )
    return (
      <div className="px-4 md:px-6">
        <div className="container mx-auto">
          {b.link ? <Link href={b.link} className="block">{content}</Link> : content}
        </div>
      </div>
    )
  }

  return (
    <div
      className="px-4 md:px-6"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="container mx-auto">
        <div className="relative overflow-hidden rounded-2xl">
          {/* Track */}
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${current * 100}%)` }}
          >
            {banners.map((b) => {
              const slide = (
                <div key={b.id} className="relative w-full shrink-0 aspect-[21/9] md:aspect-[3/1]">
                  <Image src={b.image} alt={b.title || 'Banner'} fill className="object-cover" />
                  {b.title && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-6 md:p-10">
                      <span className="text-white font-bold text-lg md:text-2xl">{b.title}</span>
                    </div>
                  )}
                </div>
              )
              return b.link ? (
                <Link key={b.id} href={b.link} className="w-full shrink-0">{slide}</Link>
              ) : (
                <div key={b.id} className="w-full shrink-0">{slide}</div>
              )
            })}
          </div>

          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-2 h-2 rounded-full transition-all ${i === current ? 'bg-gold w-6' : 'bg-white/40 hover:bg-white/60'}`}
              />
            ))}
          </div>

          {/* Arrows */}
          <button onClick={() => setCurrent(c => (c - 1 + banners.length) % banners.length)} className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 3L4 7l5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <button onClick={() => setCurrent(c => (c + 1) % banners.length)} className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 3l5 4-5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      </div>
    </div>
  )
}
