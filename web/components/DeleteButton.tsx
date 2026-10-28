"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteItem } from "@/app/actions";
import { Svg } from "./icons";

export function DeleteButton({ id }: { id: string }) {
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  async function go() {
    setBusy(true);
    await deleteItem(id);
    router.push("/");
  }
  return (
    <button className="btn ghost" disabled={busy} onClick={() => (confirm ? go() : setConfirm(true))}
      style={confirm ? { color: "var(--danger)", borderColor: "var(--danger)" } : undefined}>
      <Svg size={16}><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" /></Svg>
      {busy ? "Deleting…" : confirm ? "Tap again to delete" : "Delete"}
    </button>
  );
}
