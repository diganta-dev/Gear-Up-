import Link from "next/link";
import { Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full border-t bg-background pt-12 pb-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-bold tracking-tight">Gear Up</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Your premium destination for renting top-quality sports and outdoor equipment. Explore, rent, and adventure with confidence.
            </p>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/" className="hover:text-foreground transition-colors">Home</Link></li>
              <li><Link href="/gear" className="hover:text-foreground transition-colors">Browse Gear</Link></li>
              <li><Link href="/about" className="hover:text-foreground transition-colors">About Us</Link></li>
              <li><Link href="/faq" className="hover:text-foreground transition-colors">FAQ</Link></li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link href="/refunds" className="hover:text-foreground transition-colors">Refund Policy</Link></li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider">Connect</h4>
            <div className="flex space-x-4 text-muted-foreground">
              <Link href="#" className="hover:text-foreground transition-colors font-medium">
                Facebook
              </Link>
              <Link href="#" className="hover:text-foreground transition-colors font-medium">
                Twitter
              </Link>
              <Link href="#" className="hover:text-foreground transition-colors font-medium">
                Instagram
              </Link>
              <Link href="#" className="hover:text-foreground transition-colors">
                <Mail className="h-5 w-5" />
                <span className="sr-only">Email</span>
              </Link>
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Gear Up. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
