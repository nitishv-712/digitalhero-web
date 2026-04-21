import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-white/5 mt-auto py-10 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
        <span className="font-semibold gradient-text text-base">Digital Heroes</span>
        <div className="flex gap-6">
          <Link href="/charities" className="hover:text-white transition-colors">Charities</Link>
          <Link href="/draws" className="hover:text-white transition-colors">Draws</Link>
          <Link href="/subscribe" className="hover:text-white transition-colors">Subscribe</Link>
        </div>
        <span>© {new Date().getFullYear()} Digital Heroes. All rights reserved.</span>
      </div>
    </footer>
  )
}
