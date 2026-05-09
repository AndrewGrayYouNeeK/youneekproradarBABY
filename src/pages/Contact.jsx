import AppHeader from "@/components/nav/AppHeader";
import BottomNav from "@/components/nav/BottomNav";
import { Mail, Github, MessageCircle } from "lucide-react";

const SUPPORT_EMAIL = "andrewgray@youneek.xyz";

export default function Contact() {
  return (
    <div className="h-full overflow-y-auto bg-background pb-24 text-foreground">
      <AppHeader title="Contact" showBack />

      <main className="mx-auto max-w-2xl space-y-5 px-4 pt-4 pb-8">
        <header>
          <h1 className="text-2xl font-bold tracking-tight">Contact YouNeeK</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Bug reports, feature requests, partnership inquiries — we read every message.
          </p>
        </header>

        <section className="space-y-3">
          <a
            href={`mailto:${SUPPORT_EMAIL}?subject=YouNeeK%20Pro%20Radar%20Support`}
            className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card/60 p-4 transition-colors hover:bg-secondary/50"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/30">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold">Email Support</div>
              <div className="truncate text-xs text-muted-foreground">{SUPPORT_EMAIL}</div>
            </div>
          </a>

          <a
            href="https://github.com/AndrewgrayYouneek"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card/60 p-4 transition-colors hover:bg-secondary/50"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary">
              <Github className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold">GitHub</div>
              <div className="truncate text-xs text-muted-foreground">github.com/AndrewgrayYouneek</div>
            </div>
          </a>

          <div className="flex items-start gap-3 rounded-2xl border border-border/60 bg-card/60 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary">
              <MessageCircle className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold">Response time</div>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                We aim to reply within 2 business days. For active life-threatening weather, always call 911 or
                follow guidance from your local National Weather Service office — not an app.
              </p>
            </div>
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}