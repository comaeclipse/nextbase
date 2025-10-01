"use client";

import type { MouseEvent } from "react";
import { useFormState, useFormStatus } from "react-dom";
import type { Destination } from "@prisma/client";
import type { ActionResult } from "@/app/admin/shared";
import { deleteDestinationAction, updateDestinationAction } from "@/app/admin/actions";

const INITIAL_STATE: ActionResult = { success: false, message: "" };

export function DestinationEditor({ destination }: { destination: Destination }) {
  const [updateState, updateAction] = useFormState(updateDestinationAction, INITIAL_STATE);
  const [deleteState, deleteAction] = useFormState(deleteDestinationAction, INITIAL_STATE);

  return (
    <div className="space-y-4 rounded-2xl border border-color-border/60 bg-surface p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-primary">{destination.name}</h3>
        <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{destination.id}</span>
      </div>
      <form action={updateAction} className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <input type="hidden" name="id" value={destination.id} />
        <Field label="Name" name="name" defaultValue={destination.name} required />
        <Field label="State/Region" name="state" defaultValue={destination.state} />
        <Field label="Region" name="region" defaultValue={destination.region} />
        <Field label="Tax band" name="taxBand" defaultValue={destination.taxBand} />
        <Field label="Tech presence" name="techPresence" defaultValue={destination.techPresence} />
        <Field label="Gun laws" name="gunLaws" defaultValue={destination.gunLaws} />
        <Field label="Hero image" name="heroImage" defaultValue={destination.heroImage} />
        <NumberField label="Cost of living index" name="costOfLivingIndex" defaultValue={destination.costOfLivingIndex} required />
        <NumberField label="VA resources score" name="vaResourcesScore" defaultValue={destination.vaResourcesScore} required />
        <NumberField label="Healthcare index" name="healthcareIndex" defaultValue={destination.healthcareIndex} required />
        <Field
          label="Climate tags"
          name="climate"
          defaultValue={destination.climate.join(", ")}
          placeholder="warm, coastal"
        />
        <Field
          label="Lifestyle tags"
          name="lifestyle"
          defaultValue={destination.lifestyle.join(", ")}
          placeholder="arts & culture, tech culture"
        />
        <Field
          label="Highlights"
          name="highlights"
          defaultValue={destination.highlights.join(", ")}
          placeholder="Highlight one, Highlight two"
        />
        <SummaryField defaultValue={destination.summary} />
        <div className="md:col-span-2 flex items-center gap-3">
          <SubmitButton idleLabel="Save changes" pendingLabel="Saving..." />
          {updateState.message ? (
            <span className={`text-sm ${updateState.success ? "text-emerald-500" : "text-red-500"}`}>
              {updateState.message}
            </span>
          ) : null}
        </div>
      </form>
      <form action={deleteAction} className="flex items-center justify-between border-t border-color-border/40 pt-4">
        <input type="hidden" name="id" value={destination.id} />
        <DeleteButton />
        {deleteState.success ? (
          <span className="text-sm text-emerald-500">Destination deleted.</span>
        ) : deleteState.message ? (
          <span className="text-sm text-red-500">{deleteState.message}</span>
        ) : null}
      </form>
    </div>
  );
}

type FieldProps = {
  label: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
};

function Field({ label, name, defaultValue, placeholder, required }: FieldProps) {
  return (
    <label className="space-y-2 text-sm text-primary">
      <span className="block font-medium">{label}</span>
      <input
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-lg border border-color-border/60 bg-transparent px-3 py-2 text-sm text-primary focus:border-accent focus:outline-none"
      />
    </label>
  );
}

type NumberFieldProps = {
  label: string;
  name: string;
  defaultValue: number;
  required?: boolean;
};

function NumberField({ label, name, defaultValue, required }: NumberFieldProps) {
  return (
    <label className="space-y-2 text-sm text-primary">
      <span className="block font-medium">{label}</span>
      <input
        name={name}
        type="number"
        defaultValue={defaultValue}
        required={required}
        className="w-full rounded-lg border border-color-border/60 bg-transparent px-3 py-2 text-sm text-primary focus:border-accent focus:outline-none"
      />
    </label>
  );
}

function SummaryField({ defaultValue }: { defaultValue: string }) {
  return (
    <label className="md:col-span-2 space-y-2 text-sm text-primary">
      <span className="block font-medium">Summary</span>
      <textarea
        name="summary"
        defaultValue={defaultValue}
        rows={4}
        className="w-full rounded-lg border border-color-border/60 bg-transparent px-3 py-2 text-sm text-primary focus:border-accent focus:outline-none"
      />
    </label>
  );
}

function SubmitButton({ idleLabel, pendingLabel }: { idleLabel: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(120deg,var(--accent),var(--accent-secondary))] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-105 disabled:opacity-70"
      disabled={pending}
    >
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}

function DeleteButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      onClick={(event: MouseEvent<HTMLButtonElement>) => {
        if (!window.confirm("Delete this destination?")) {
          event.preventDefault();
        }
      }}
      className="rounded-full border border-red-400 px-4 py-2 text-sm font-semibold text-red-500 transition hover:bg-red-500/10 disabled:opacity-70"
      disabled={pending}
    >
      {pending ? "Deleting..." : "Delete"}
    </button>
  );
}


