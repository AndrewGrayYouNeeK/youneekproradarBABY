import { useState } from "react";
import AppHeader from "@/components/nav/AppHeader";
import BottomNav from "@/components/nav/BottomNav";
import { formatDisplay } from "@/lib/safety/contactsStore";
import {
  useContacts, useAddContact, useRemoveContact,
} from "@/hooks/useContactsMutations";
import { UserPlus, Trash2, User, Phone, Shield, AlertTriangle } from "lucide-react";

const MAX_CONTACTS = 10;

export default function Contacts() {
  const { data: contacts = [] } = useContacts();
  const addContact = useAddContact(MAX_CONTACTS);
  const removeContact = useRemoveContact();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  const handleAdd = () => {
    setError("");
    addContact.mutate(
      { name, phone },
      {
        onSuccess: () => { setName(""); setPhone(""); },
        onError: (e) => setError(e.message),
      }
    );
  };

  const handleRemove = (id) => removeContact.mutate(id);

  return (
    <div className="min-h-screen bg-background pb-24 text-foreground">
      <AppHeader title="Safety Contacts" showBack />

      <div className="mx-auto max-w-md space-y-5 px-4 pt-4">
        <div>
          <h1 className="text-xl font-bold">Trusted Contacts</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            These people get a text with your GPS location when you tap "I'm Safe" on the Safety screen.
          </p>
        </div>

        <div className="space-y-3 rounded-2xl border border-border/60 bg-card/60 p-4">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Add Contact</div>

          <div className="relative">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={name}
              onChange={(e) => { setName(e.target.value); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder="Name"
              aria-label="Contact name"
              className="w-full rounded-xl border border-border/60 bg-secondary/40 pl-9 pr-3 py-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/60"
            />
          </div>

          <div className="relative">
            <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={phone}
              onChange={(e) => { setPhone(e.target.value); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder="(555) 867-5309"
              inputMode="tel"
              type="tel"
              aria-label="Contact phone"
              className="w-full rounded-xl border border-border/60 bg-secondary/40 pl-9 pr-3 py-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/60"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-500/40 bg-red-950/40 px-3 py-2">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-red-400" />
              <p className="text-xs text-red-200">{error}</p>
            </div>
          )}

          <button
            onClick={handleAdd}
            disabled={!name.trim() || !phone.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-md transition-colors disabled:opacity-40"
          >
            <UserPlus className="h-4 w-4" />
            Add Contact
          </button>
        </div>

        <div className="space-y-2">
          {contacts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card/30 px-4 py-10 text-center">
              <Shield className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No contacts yet.</p>
              <p className="mt-1 text-xs text-muted-foreground/70">Add up to {MAX_CONTACTS} people.</p>
            </div>
          ) : (
            contacts.map((c) => (
              <div key={c.id} className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card/60 px-4 py-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 ring-1 ring-primary/30">
                  <span className="text-sm font-bold text-primary">{c.name[0].toUpperCase()}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">{c.name}</div>
                  <div className="text-xs text-muted-foreground tabular-nums">{formatDisplay(c.phone)}</div>
                </div>
                <button
                  onClick={() => handleRemove(c.id)}
                  aria-label={`Remove ${c.name}`}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-500/30 bg-red-950/30 text-red-400 hover:bg-red-950/60"
                  style={{ minHeight: "auto" }}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="flex items-start gap-2 rounded-xl border border-border/40 bg-card/30 px-3 py-3">
          <Shield className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <p className="text-xs leading-relaxed text-muted-foreground">
            Contacts are stored only on this device. Your location is shared only when <em>you</em> tap "I'm Safe" — never automatically.
          </p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}