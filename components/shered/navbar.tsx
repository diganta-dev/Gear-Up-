import Link from "next/link";
import { Button } from "@/components/ui/button";
import { IUser } from "@/types/user";

export default function Navbar({ user }: { user: IUser | null }) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Prisma Press
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <Button variant="ghost">Logout</Button>
          ) : (
            <>
              <Button render={<Link href="/login" />} variant="ghost">Login</Button>
              <Button render={<Link href="/register" />}>Register</Button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
