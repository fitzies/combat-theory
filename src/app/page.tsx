import { SignedIn, SignedOut } from "@clerk/nextjs";
import { Spinner } from "@/components/ui/spinner";
import AuthenticatedHome from "@/components/authenticated-home";

export default function Page() {
  return (
    <>
      <SignedOut>
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
          <Spinner className="size-6" />
          <p className="text-muted-foreground">Please login</p>
        </div>
      </SignedOut>
      <SignedIn>
        <AuthenticatedHome />
      </SignedIn>
    </>
  );
}
