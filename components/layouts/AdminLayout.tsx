"use client";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { UserIcon, HomeIcon, CreditCardIcon, PackageIcon, ClipboardListIcon, LogOut, Settings } from "lucide-react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const navigation = [
    { name: "Dashboard", href: "/admin/dashboard", icon: HomeIcon },
    { name: "Households", href: "/admin/households", icon: HomeIcon },
    { name: "Cards", href: "/admin/cards", icon: CreditCardIcon },
    { name: "Plans", href: "/admin/plans", icon: PackageIcon },
    { name: "Users", href: "/admin/users", icon: UserIcon },
    { name: "Audit Logs", href: "/admin/audit-logs", icon: ClipboardListIcon },
  ];

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow pt-5 overflow-y-auto bg-primary-foreground border-r">
          <div className="flex items-center flex-shrink-0 px-4 mb-5">
            <span className="text-xl font-bold">Health Card Admin</span>
          </div>
          <div className="flex flex-col flex-grow">
            <nav className="flex-1 px-2 pb-4 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link 
                    key={item.name} 
                    href={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive 
                        ? 'bg-primary/10 text-primary' 
                        : 'text-muted-foreground hover:bg-primary/5'
                    }`}
                  >
                    <item.icon 
                      className={`mr-3 flex-shrink-0 h-5 w-5 ${
                        isActive ? 'text-primary' : 'text-gray-400 group-hover:text-gray-500'
                      }`} 
                      aria-hidden="true" 
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex flex-shrink-0 p-4 border-t">
            <div className="flex items-center w-full">
              <div className="flex-shrink-0">
                <div className="bg-gray-300 rounded-full h-9 w-9 flex items-center justify-center">
                  <UserIcon className="h-5 w-5 text-gray-600" />
                </div>
              </div>
              <div className="ml-3 w-full">
                <p className="text-sm font-medium">{session?.user?.name}</p>
                <p className="text-xs text-muted-foreground">Administrator</p>
                <Button 
                  variant="link" 
                  size="sm" 
                  className="p-0 h-auto mt-1 text-muted-foreground"
                  onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                >
                  <LogOut className="h-3 w-3 mr-1" />
                  <span className="text-xs">Sign out</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile header */}
      <div className="md:hidden bg-primary text-primary-foreground py-2 px-4 flex items-center justify-between">
        <span className="text-lg font-bold">Health Card Admin</span>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" className="text-primary-foreground">
            <Settings className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-primary-foreground"
            onClick={() => signOut({ callbackUrl: '/auth/signin' })}
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 w-0 overflow-hidden">
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}