"use client";

import { Book, HouseIcon, InboxIcon, SearchIcon, Sparkle, ZapIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { useId } from "react";
import { SignInButton, SignUpButton, SignedIn, SignedOut, useUser } from "@clerk/nextjs";

import Logo from "@/components/navbar-components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import UserMenu from "./user-menu";

// Navigation links array to be used in both desktop and mobile menus
const navigationLinks = [
  { href: "/", icon: HouseIcon, label: "Home" },
  { href: "/courses", icon: Book, label: "Courses" },
  { href: "/breakdowns", icon: Sparkle, label: "Breakdowns", disabled: true },
];

export default function Nav() {
  const id = useId();
  const pathname = usePathname();
  const { user } = useUser();

  return (
    <header className="border-b px-4 md:px-6">
      <div className="flex h-16 items-center justify-between gap-4">
        {/* Left side */}
        <div className="flex flex-1 items-center gap-2">
          {/* Mobile menu trigger */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                className="group size-8 md:hidden"
                size="icon"
                variant="ghost"
              >
                <svg
                  className="pointer-events-none"
                  fill="none"
                  height={16}
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  width={16}
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    className="-translate-y-[7px] origin-center transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-x-0 group-aria-expanded:translate-y-0 group-aria-expanded:rotate-315"
                    d="M4 12L20 12"
                  />
                  <path
                    className="origin-center transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.8)] group-aria-expanded:rotate-45"
                    d="M4 12H20"
                  />
                  <path
                    className="origin-center translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-y-0 group-aria-expanded:rotate-135"
                    d="M4 12H20"
                  />
                </svg>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-36 p-1 md:hidden">
              <NavigationMenu className="max-w-none *:w-full">
                <NavigationMenuList className="flex-col items-start gap-0 md:gap-2">
                  {navigationLinks.map((link, _index) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;
                    return (
                      <NavigationMenuItem className="w-full" key={link.label}>
                        <NavigationMenuLink
                          active={isActive}
                          className="flex-row items-center gap-2 py-1.5"
                          href={link.href}
                        >
                          <Icon
                            aria-hidden="true"
                            className="text-muted-foreground/80"
                            size={16}
                          />
                          <span>{link.label}</span>
                        </NavigationMenuLink>
                      </NavigationMenuItem>
                    );
                  })}
                </NavigationMenuList>
              </NavigationMenu>
            </PopoverContent>
          </Popover>
          {/* Logo */}
          <div className="flex items-center">
            <a className="text-primary hover:text-primary/90" href="#">
              <Logo />
            </a>
          </div>
        </div>
        {/* Middle area */}
        <NavigationMenu className="max-md:hidden">
          <NavigationMenuList className="gap-2">
            {navigationLinks.map((link, _index) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <NavigationMenuItem key={link.label}>
                  <NavigationMenuLink
                    active={isActive}
                    className={`flex-row items-center gap-2 py-1.5 font-medium text-foreground ${link.disabled ? "text-muted-foreground hover:bg-transparent! cursor-default!" : "hover:text-primary"}`}
                    href={!link.disabled ? link.href : "#"}
                  >
                    <span>{link.label}</span>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              );
            })}
          </NavigationMenuList>
        </NavigationMenu>
        {/* Right side */}
        <div className="flex flex-1 items-center justify-end gap-2">
          <SignedOut>
            <SignUpButton mode="modal" forceRedirectUrl="/account-setup">
              <Button size={"sm"} variant={"ghost"}>Sign up</Button>
            </SignUpButton>
            <SignInButton mode="modal">
              <Button size={"sm"}>Get Started</Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            {user && (
              <UserMenu
                user={{
                  id: user.id,
                  firstName: user.firstName,
                  lastName: user.lastName,
                  email: user.primaryEmailAddress?.emailAddress ?? "",
                  imageUrl: user.imageUrl,
                  username: user.username,
                }}
              />
            )}
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
