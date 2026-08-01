"use client"

import { useTransition } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LogOut, Settings, User, CreditCard, Menu, Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { logout } from "@/service/logout"
import { toast } from "sonner"

const navItems = [
    { label: "Home", href: "/" },
    { label: "Browse Gear", href: "/gear" },
]

interface NavbarProps {
    user?: any
}

export default function Navbar({ user }: NavbarProps) {
    const pathname = usePathname()
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    const currentUser = user?.success ? (user.data?.user || user.data) : null

    const handleLogout = () => {
        startTransition(async () => {
            await logout()
            toast.success("User logged out successfully")
            router.push("/login")
            router.refresh()
        })
    }

    const getUserInitials = (name?: string) => {
        if (!name) return "U"
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .substring(0, 2)
            .toUpperCase()
    }

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <nav
                className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4"
                aria-label="Main navigation"
            >
                {/* Logo */}
                <Link href="/" className="text-lg font-semibold tracking-tight">
                    Gear Up
                </Link>

                {/* Desktop nav links */}
                <ul className="hidden items-center gap-1 md:flex">
                    {navItems.map((item) => (
                        <li key={item.href}>
                            <Link
                                href={item.href}
                                className={cn(
                                    "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-foreground",
                                    pathname === item.href
                                        ? "text-foreground"
                                        : "text-muted-foreground"
                                )}
                                aria-current={pathname === item.href ? "page" : undefined}
                            >
                                {item.label}
                            </Link>
                        </li>
                    ))}
                </ul>

                <div className="flex items-center gap-2">
                    {/* Mobile nav dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger
                            render={
                                <Button variant="ghost" size="icon" className="md:hidden">
                                    <Menu className="size-5" />
                                    <span className="sr-only">Open navigation menu</span>
                                </Button>
                            }
                        />
                        <DropdownMenuContent align="end">
                            <DropdownMenuGroup>
                                {navItems.map((item) => (
                                    <DropdownMenuItem key={item.href} render={<Link href={item.href} className="w-full cursor-pointer">{item.label}</Link>} />
                                ))}
                                {currentUser && (
                                    <DropdownMenuItem render={<Link href={currentUser.role === 'ADMIN' ? '/admin-dashboard' : currentUser.role === 'PROVIDER' ? '/provider-dashboard' : '/dashboard'} className="w-full cursor-pointer">Dashboard</Link>} />
                                )}
                            </DropdownMenuGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Authenticated User Menu or Auth Actions */}
                    {currentUser ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger
                                render={
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="rounded-full"
                                        disabled={isPending}
                                    >
                                        <Avatar className="size-8">
                                            <AvatarImage
                                                src={currentUser.profile?.profilePicture || currentUser.profileImage || ""}
                                                alt={currentUser.name}
                                            />
                                            <AvatarFallback>{getUserInitials(currentUser.name)}</AvatarFallback>
                                        </Avatar>
                                        <span className="sr-only">Open user menu</span>
                                    </Button>
                                }
                            />
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuGroup>
                                    <DropdownMenuLabel>
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-sm font-medium">{currentUser.name}</span>
                                            <span className="text-xs font-normal text-muted-foreground">
                                                {currentUser.email}
                                            </span>
                                        </div>
                                    </DropdownMenuLabel>
                                </DropdownMenuGroup>
                                <DropdownMenuSeparator />
                                    <DropdownMenuItem render={<Link href={currentUser.role === 'ADMIN' ? '/admin-dashboard' : currentUser.role === 'PROVIDER' ? '/provider-dashboard' : '/dashboard'} className="w-full cursor-pointer" />}>
                                        <User className="mr-2 size-4" />
                                        Dashboard
                                    </DropdownMenuItem>
                                    <DropdownMenuItem render={<Link href="/profile" className="w-full cursor-pointer" />}>
                                        <Settings className="mr-2 size-4" />
                                        Profile
                                    </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuGroup>
                                    <DropdownMenuItem
                                        variant="destructive"
                                        onClick={handleLogout}
                                        disabled={isPending}
                                    >
                                        {isPending ? (
                                            <Loader2 className="mr-2 size-4 animate-spin" />
                                        ) : (
                                            <LogOut className="mr-2 size-4" />
                                        )}
                                        {isPending ? "Signing out..." : "Sign out"}
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Button render={<Link href="/login">Login</Link>} variant="ghost" size="sm" nativeButton={false} />
                            <Button render={<Link href="/register">Register</Link>} size="sm" nativeButton={false} />
                        </div>
                    )}
                </div>
            </nav>
        </header>
    )
} 
