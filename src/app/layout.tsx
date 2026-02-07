import type { Metadata } from "next";
import { DM_Mono, DM_Sans, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import ConvexClientProvider from "@/components/convex-client-provider";
import { ThemeProvider } from "@/components/theme-provider";
import LayoutShell from "@/components/layout-shell";
import UserExistsCheck from "@/components/user-exists-check";

const geistSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fight Meta",
  description: "Master grappling, striking, and complete MMA through structured, step-by-step systems. Combat Theory breaks down complex techniques into clear, actionable lessons designed to remove guesswork and accelerate real skill development.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{ cssLayerName: "clerk" }}
      signUpForceRedirectUrl="/account-setup"
    >
      <ConvexClientProvider>
        <html lang="en" suppressHydrationWarning>
          <body
            className={`${geistSans.variable} antialiased`}
          >
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange
            >
              <UserExistsCheck />
              <LayoutShell>{children}</LayoutShell>
            </ThemeProvider>
          </body>
        </html>
      </ConvexClientProvider>
    </ClerkProvider>
  );
}
