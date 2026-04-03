import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SignUpButton, SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link2, BarChart3, ShieldCheck, Zap, Globe, Copy } from "lucide-react";

const features = [
  {
    icon: Link2,
    title: "Shorten Any URL",
    description:
      "Turn long, unwieldy URLs into clean, shareable links in seconds.",
  },
  {
    icon: BarChart3,
    title: "Track Analytics",
    description:
      "See how many times your links are clicked with detailed visit analytics.",
  },
  {
    icon: ShieldCheck,
    title: "Secure & Private",
    description:
      "Your links are protected. Manage access and keep your data safe.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description:
      "Redirects happen in milliseconds — no slowdown for your audience.",
  },
  {
    icon: Globe,
    title: "Share Anywhere",
    description:
      "Shortened links work everywhere — social media, email, SMS, and more.",
  },
  {
    icon: Copy,
    title: "Easy Management",
    description:
      "Organize all your links in one dashboard. Edit or delete anytime.",
  },
];

export default async function Home() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");
  return (
    <div className="flex flex-col flex-1">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center gap-8 px-6 py-24 text-center">
        <div className="flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-1.5 text-xs font-medium text-muted-foreground">
          <Zap className="size-3" />
          Fast, simple link shortening
        </div>
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
          Shorten links. <span className="text-primary">Track results.</span>
          <br />
          Share smarter.
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground leading-relaxed">
          Create compact, memorable links in seconds. Monitor clicks, manage
          your links, and understand your audience — all from one dashboard.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <SignUpButton mode="modal">
            <Button size="lg" className="px-8">
              Get Started for Free
            </Button>
          </SignUpButton>
          <SignInButton mode="modal">
            <Button size="lg" variant="outline" className="px-8">
              Sign In
            </Button>
          </SignInButton>
        </div>
      </section>

      {/* Features */}
      <section className="flex flex-col items-center gap-12 px-6 py-20 bg-muted/40">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Everything you need
          </h2>
          <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
            A complete link management platform built for speed and simplicity.
          </p>
        </div>
        <div className="grid w-full max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, description }) => (
            <Card key={title} className="border-border bg-card">
              <CardHeader className="pb-2">
                <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="size-5 text-primary" />
                </div>
                <CardTitle className="text-base">{title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="flex flex-col items-center gap-6 px-6 py-24 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          Ready to shorten your first link?
        </h2>
        <p className="max-w-md text-muted-foreground">
          Join today and start sharing smarter links with built-in analytics.
        </p>
        <SignUpButton mode="modal">
          <Button size="lg" className="px-10">
            Create Free Account
          </Button>
        </SignUpButton>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Link Shortener. All rights reserved.
      </footer>
    </div>
  );
}
