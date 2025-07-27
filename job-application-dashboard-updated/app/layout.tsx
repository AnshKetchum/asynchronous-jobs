import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Asynchronous Jobs",
  description: "Professional job application analytics and tracking dashboard",
  icons: {
    icon: [
      {
        url:
          "data:image/svg+xml;base64," +
          btoa(`
          <svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="32" r="30" fill="#EFF6FF" stroke="#3B82F6" strokeWidth="2"/>
            <rect x="20" y="28" width="24" height="16" rx="2" fill="#3B82F6"/>
            <rect x="20" y="28" width="24" height="4" rx="2" fill="#1E40AF"/>
            <path d="M28 28 V24 Q28 22 30 22 H34 Q36 22 36 24 V28" stroke="#1E40AF" strokeWidth="2" fill="none"/>
            <rect x="22" y="20" width="2" height="8" rx="1" fill="#10B981"/>
            <rect x="26" y="16" width="2" height="12" rx="1" fill="#F59E0B"/>
            <rect x="30" y="12" width="2" height="16" rx="1" fill="#EF4444"/>
            <rect x="34" y="18" width="2" height="10" rx="1" fill="#8B5CF6"/>
            <rect x="38" y="14" width="2" height="14" rx="1" fill="#06B6D4"/>
            <path d="M12 16 L14 18 L12 20 L10 18 Z" fill="#F59E0B"/>
            <path d="M50 12 L52 14 L50 16 L48 14 Z" fill="#10B981"/>
            <path d="M52 40 L54 42 L52 44 L50 42 Z" fill="#EF4444"/>
            <path d="M10 48 L12 50 L10 52 L8 50 Z" fill="#8B5CF6"/>
            <circle cx="16" cy="24" r="1" fill="#60A5FA" opacity="0.6"/>
            <circle cx="48" cy="20" r="1" fill="#34D399" opacity="0.6"/>
            <circle cx="46" cy="48" r="1" fill="#FBBF24" opacity="0.6"/>
            <circle cx="18" cy="44" r="1" fill="#A78BFA" opacity="0.6"/>
            <circle cx="28" cy="36" r="1.5" fill="#FFFFFF"/>
            <circle cx="36" cy="36" r="1.5" fill="#FFFFFF"/>
            <path d="M30 40 Q32 42 34 40" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
          </svg>
        `),
        sizes: "32x32",
        type: "image/svg+xml",
      },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
