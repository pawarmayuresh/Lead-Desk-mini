import type { ReactNode } from 'react'
import { Navbar } from '../components/common/Navbar'
import { Footer } from '../components/common/Footer'

export const PublicLayout = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
    <Navbar />
    <main className="flex-1">{children}</main>
    <Footer />
  </div>
)
