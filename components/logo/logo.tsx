import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const Logo = () => {
  return (
    <div>
         <Link href="/" className="flex items-center gap-2.5 no-underline">
        <div
        className="flex h-8 w-8 items-center justify-center rounded overflow-hidden bg-background"
        style={{ backgroundColor: '#1A1A1A' }}
    >
        <Image
        src="/image/drop-logo.png"
        alt="Dropaphi Logo"
        width={24}
        height={24}
        className="object-contain"
        priority
        />
    </div>
        <span className="font-extrabold text-lg text-secondary-foreground">
        Drop<span className="text-red-600">APHI</span>
        </span>
    </Link>
    </div>
  )
}

export default Logo