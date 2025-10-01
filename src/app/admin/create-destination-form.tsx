"use client";

import { useEffect, useRef } from "react";
import { useFormState } from "react-dom";
import type { ActionResult } from "@/app/admin/shared";
import { createDestinationAction } from "@/app/admin/actions";

const INITIAL_STATE: ActionResult = { success: false, message: "" };

export function CreateDestinationForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useFormState(createDestinationAction, INITIAL_STATE);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4 rounded-2xl border border-color-border/60 bg-surface p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-primary">Add destination</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <TextField name="id" label="ID (slug)" required placeholder="city-state" />
        <TextField name="name" label="Name" required />
        <TextField name="state" label="State/Region" />
        <TextField name="region" label="Region" placeholder="Southeast" />
        <TextField name="taxBand" label="Tax band" placeholder="very-low" />
        <TextField name="techPresence" label="Tech presence" placeholder="emerging" />
        <TextField name="gunLaws" label="Gun laws" placeholder="moderate" />
        <TextField name="heroImage" label="Hero image path" placeholder="/images/destinations/example.jpg" />
        <NumberField name="costOfLivingIndex" label="Cost of living index" required />
        <NumberField name="vaResourcesScore" label="VA resources score" required />
        <NumberField name="healthcareIndex" label="Healthcare index" required />
        <TextField name="climate" label="Climate tags" placeholder="warm, coastal" />
        <TextField name="lifestyle" label="Lifestyle tags" placeholder="arts & culture, tech culture" />
        <TextField name="highlights" label="Highlights" placeholder="Item one, Item two" />
      </div>
      <div className="space-y-2">
        <label htmlFor="summary" className="block text-sm font-medium text-primary">
          Summary
        </label>
        <textarea
          id="summary"
          name="summary"
          rows={4}
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
        className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(120deg,var(--accent),var(--accent-secondary))] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-105"
      >
        Save destination
      </button>
    </form>
  );
}

type TextFieldProps = {
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
};

function TextField({ name, label, placeholder, required }: TextFieldProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={name} className="block text-sm font-medium text-primary">
        {label}
      </label>
      <input
        id={name}
        name={name}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-lg border border-color-border/60 bg-transparent px-3 py-2 text-sm text-primary focus:border-accent focus:outline-none"
      />
    </div>
  );
}

type NumberFieldProps = TextFieldProps;

function NumberField({ name, label, placeholder, required }: NumberFieldProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={name} className="block text-sm font-medium text-primary">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type="number"
        required={required}
        placeholder={placeholder}
        className="w-full rounded-lg border border-color-border/60 bg-transparent px-3 py-2 text-sm text-primary focus:border-accent focus:outline-none"
      />
    </div>
  );
}
