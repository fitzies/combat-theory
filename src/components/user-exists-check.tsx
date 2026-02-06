"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function UserExistsCheck() {
  const router = useRouter();
  const pathname = usePathname();
  const { isSignedIn, isLoaded: clerkLoaded } = useUser();
  const user = useQuery(api.users.getUser);

  useEffect(() => {
    // Don't redirect if:
    // 1. Clerk is still loading
    // 2. User is not signed in
    // 3. Already on account-setup page
    // 4. Convex query is still loading
    if (!clerkLoaded || !isSignedIn || pathname === "/account-setup" || user === undefined) {
      return;
    }

    // If user is signed in but doesn't exist in Convex, redirect to account-setup
    if (user === null) {
      router.push("/account-setup");
    }
  }, [isSignedIn, clerkLoaded, user, pathname, router]);

  return null;
}
