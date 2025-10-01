"use client";

import { useFormState } from "react-dom";
import type { ActionResult } from "@/app/admin/actions";
import { authenticateAction } from "@/app/admin/actions";

const INITIAL_STATE: ActionResult = { success: false, message: "" };

export function AdminLoginForm() {
  const [state, formAction] = useFormState(authenticateAction, INITIAL_STATE);

  return (
    <div className="mx-auto mt-16 max-w-md rounded-2xl border border-color-border/60 bg-surface px-8 py-10 shadow-lg">
      <h1 className="text-2xl font-semibold text-primary">Admin Sign In</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Enter the admin token to manage destinations.
      </p>
      <form action={formAction} className="mt-6 space-y-4">
        <div className="space-y-2">
          <label htmlFor="token" className="block text-sm font-medium text-primary">
            Admin token
          </label>
          <input
            id="token"
            name="token"
            type="password"
            required
            className="w-full rounded-lg border border-color-border/60 bg-transparent px-3 py-2 text-sm text-primary focus:border-accent focus:outline-none"
          />
        </div>
        {state.message ? (
          <p className={`text-sm ${state.success ? "text-emerald-500" : "text-red-500"}`}>
            {state.message}
          </p>
        ) : null}
        <button
          type="submit"
          className="w-full rounded-full bg-[linear-gradient(120deg,var(--accent),var(--accent-secondary))] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-105"
        >
          Sign in
        </button>
      </form>
    </div>
  );
}
