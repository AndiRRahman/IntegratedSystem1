import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left">
          <div className="mb-4 md:mb-0">
            <Link href="/" className="font-headline font-bold text-xl">
              E-Commers V
            </Link>
            <p className="text-sm text-muted-foreground mt-1">© {new Date().getFullYear()} All Rights Reserved.</p>
          </div>
          <nav className="flex gap-4 md:gap-6 text-sm">
            <Link href="#" className="hover:text-primary transition-colors">About</Link>
            <Link href="#" className="hover:text-primary transition-colors">Contact</Link>
            <Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
