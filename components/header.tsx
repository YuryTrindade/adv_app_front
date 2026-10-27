"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/context/auth-context"
import { useTheme } from "@/hooks/use-theme"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, User, LogOut, Home, Users, Moon, Sun, FileText, Calendar, Briefcase } from "lucide-react"

export function Header() {
  const { profile, signOut } = useAuth()
  const { toggleTheme, isDarkTheme, mounted } = useTheme()
  const pathname = usePathname()

  const initials = profile ? `${profile.first_name.charAt(0)}${profile.last_name.charAt(0)}` : "U"

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`)
  }

  const navItems = [
    {
      name: "Início",
      href: "/dashboard",
      icon: Home,
      active:
        isActive("/dashboard") &&
        !isActive("/dashboard/clients") &&
        !isActive("/dashboard/cases") &&
        !isActive("/dashboard/hearings") &&
        !isActive("/dashboard/diligences") &&
        !isActive("/dashboard/calendar") &&
        !isActive("/dashboard/profile"),
    },
    {
      name: "Clientes",
      href: "/dashboard/clients",
      icon: Users,
      active: isActive("/dashboard/clients"),
    },
    {
      name: "Processos",
      href: "/dashboard/cases",
      icon: FileText,
      active: isActive("/dashboard/cases"),
    },
    {
      name: "Audiências",
      href: "/dashboard/hearings",
      icon: Calendar,
      active: isActive("/dashboard/hearings"),
    },
    {
      name: "Diligências",
      href: "/dashboard/diligences",
      icon: Briefcase,
      active: isActive("/dashboard/diligences"),
    },
    {
      name: "Calendário",
      href: "/dashboard/calendar",
      icon: Calendar,
      active: isActive("/dashboard/calendar"),
    },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto max-w-6xl px-4 h-14 flex items-center">
        <div className="mr-4 flex items-center md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0">
              <div className="px-7">
                <Link href="/dashboard" className="flex items-center">
                  <span className="font-bold">Escritório</span>
                </Link>
              </div>
              <div className="flex flex-col space-y-3 mt-6">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center rounded-md px-3 py-2 text-sm font-medium ${
                      item.active ? "bg-accent" : "hover:bg-accent"
                    }`}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                ))}
                <Link
                  href="/dashboard/profile"
                  className={`flex items-center rounded-md px-3 py-2 text-sm font-medium ${
                    isActive("/dashboard/profile") ? "bg-accent" : "hover:bg-accent"
                  }`}
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>Perfil</span>
                </Link>
                <button
                  onClick={toggleTheme}
                  className="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent text-left"
                >
                  {mounted && isDarkTheme ? (
                    <>
                      <Sun className="mr-2 h-4 w-4" />
                      <span>Tema Claro</span>
                    </>
                  ) : (
                    <>
                      <Moon className="mr-2 h-4 w-4" />
                      <span>Tema Escuro</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => signOut()}
                  className="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent text-left"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </button>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <Link href="/dashboard" className="mr-6 flex items-center space-x-2">
          <span className="hidden font-bold sm:inline-block">Gerenciamento de Escritório</span>
        </Link>

        <nav className="hidden md:flex md:flex-1 md:items-center md:justify-between">
          <div className="flex items-center space-x-4 lg:space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center text-sm font-medium transition-colors hover:text-primary ${
                  item.active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <item.icon className="mr-1 h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full"
              aria-label="Alternar tema"
            >
              {mounted && isDarkTheme ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile?.avatar_url || ""} alt={profile?.first_name} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    {profile && (
                      <>
                        <p className="font-medium">
                          {profile.first_name} {profile.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground">{profile.email}</p>
                      </>
                    )}
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Perfil</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </nav>
      </div>
    </header>
  )
}
