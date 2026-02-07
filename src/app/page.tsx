import { SignedIn, SignedOut } from "@clerk/nextjs";
import AuthenticatedHome from "@/components/authenticated-home";
import { Hero } from "@/components/landing-page/hero";
import { Features } from "@/components/landing-page/features";

export default function Page() {
  return (
    <>
      <SignedOut>
        <Hero />
        <Features />
      </SignedOut>
      <SignedIn>
        <AuthenticatedHome />
      </SignedIn>
    </>
  );
}
