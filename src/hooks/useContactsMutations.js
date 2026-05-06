import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  loadContacts, saveContacts, loadMessage, saveMessage, cleanPhone,
} from "@/lib/safety/contactsStore";

const CONTACTS_KEY = ["safety_contacts"];
const MESSAGE_KEY = ["safety_message"];

export function useContacts() {
  return useQuery({
    queryKey: CONTACTS_KEY,
    queryFn: () => loadContacts(),
    staleTime: Infinity,
  });
}

export function useSafetyMessage() {
  return useQuery({
    queryKey: MESSAGE_KEY,
    queryFn: () => loadMessage(),
    staleTime: Infinity,
  });
}

export function useAddContact(maxContacts = 10) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, phone }) => {
      const trimName = name.trim();
      const cleaned = cleanPhone(phone);
      if (!trimName) throw new Error("Please enter a name.");
      if (!cleaned) throw new Error("Please enter a valid 10-digit US number.");
      const current = qc.getQueryData(CONTACTS_KEY) || [];
      if (current.some((c) => c.phone === cleaned)) throw new Error("That number is already saved.");
      if (current.length >= maxContacts) throw new Error(`Max ${maxContacts} contacts.`);
      return { id: Date.now().toString(), name: trimName, phone: cleaned };
    },
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: CONTACTS_KEY });
      const previous = qc.getQueryData(CONTACTS_KEY) || [];
      // optimistic — but we don't yet have the cleaned object; the mutationFn
      // resolves quickly so we let onSuccess append. Roll back on error.
      return { previous, vars };
    },
    onSuccess: (newContact) => {
      const current = qc.getQueryData(CONTACTS_KEY) || [];
      const next = [...current, newContact];
      qc.setQueryData(CONTACTS_KEY, next);
      saveContacts(next);
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(CONTACTS_KEY, ctx.previous);
    },
  });
}

export function useRemoveContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id) => id,
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: CONTACTS_KEY });
      const previous = qc.getQueryData(CONTACTS_KEY) || [];
      const next = previous.filter((c) => c.id !== id);
      qc.setQueryData(CONTACTS_KEY, next); // optimistic
      return { previous };
    },
    onSuccess: () => {
      const current = qc.getQueryData(CONTACTS_KEY) || [];
      saveContacts(current);
    },
    onError: (_e, _id, ctx) => {
      if (ctx?.previous) qc.setQueryData(CONTACTS_KEY, ctx.previous);
    },
  });
}

export function useUpdateMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (msg) => msg,
    onMutate: async (msg) => {
      await qc.cancelQueries({ queryKey: MESSAGE_KEY });
      const previous = qc.getQueryData(MESSAGE_KEY);
      qc.setQueryData(MESSAGE_KEY, msg);
      return { previous };
    },
    onSuccess: (msg) => saveMessage(msg),
    onError: (_e, _v, ctx) => {
      if (ctx?.previous !== undefined) qc.setQueryData(MESSAGE_KEY, ctx.previous);
    },
  });
}