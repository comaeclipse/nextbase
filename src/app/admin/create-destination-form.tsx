"use client";

import { useEffect, useRef } from "react";
import { useFormState } from "react-dom";

import type { ActionResult } from "@/app/admin/shared";
import { createDestinationAction } from "@/app/admin/actions";
import { FIREARM_OPTIONS, MARIJUANA_OPTIONS, PARTY_OPTIONS } from "@/data/destination-options";

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
    <form
      ref={formRef}
      action={formAction}
      className="space-y-4 rounded-2xl border border-color-border/60 bg-surface p-6 shadow-sm"
    >
      <h2 className="text-lg font-semibold text-primary">Add destination</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <TextField name="id" label="ID (slug)" required placeholder="city-state" />
        <TextField name="city" label="City" required placeholder="Tampa" />
        <TextField name="state" label="State" required placeholder="Florida" />
        <TextField name="governorName" label="Governor name" required placeholder="Jane Doe" />
        <SelectField name="governorParty" label="Governor party" options={PARTY_OPTIONS} required />
        <NumberField name="salesTax" label="Sales tax (%)" required step="0.1" />
        <NumberField name="incomeTax" label="Income tax (%)" required step="0.1" />
        <SelectField name="marijuanaStatus" label="Marijuana status" options={MARIJUANA_OPTIONS} required />
        <SelectField name="firearmLaws" label="Firearm laws" options={FIREARM_OPTIONS} required />
        <TextField name="climate" label="Climate" required placeholder="Humid subtropical" />
        <NumberField name="snowfall" label="Avg snowfall (in/yr)" required step="0.1" />
        <NumberField name="rainfall" label="Avg rainfall (in/yr)" required step="0.1" />
        <NumberField name="gasPrice" label="Gas price ($/gal)" required step="0.01" />
        <NumberField name="costOfLiving" label="Cost of living index" required step="0.1" />
      </div>
      <div className="space-y-2">
        <label htmlFor="veteranBenefits" className="block text-sm font-medium text-primary">
          Veteran benefits snapshot
        </label>
        <textarea
          id="veteranBenefits"
          name="veteranBenefits"
          rows={4}
          required
          className="w-full rounded-lg border border-color-border/60 bg-transparent px-3 py-2 text-sm text-primary focus:border-accent focus:outline-none"
          placeholder="Summarize key state-level benefits, property tax exemptions, etc."
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

type NumberFieldProps = TextFieldProps & { step?: string };

function NumberField({ name, label, placeholder, required, step }: NumberFieldProps) {
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
        step={step}
        className="w-full rounded-lg border border-color-border/60 bg-transparent px-3 py-2 text-sm text-primary focus:border-accent focus:outline-none"
      />
    </div>
  );
}

type SelectFieldProps = {
  name: string;
  label: string;
  options: { label: string; value: string }[];
  required?: boolean;
};

function SelectField({ name, label, options, required }: SelectFieldProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={name} className="block text-sm font-medium text-primary">
        {label}
      </label>
      <select
        id={name}
        name={name}
        required={required}
        className="w-full rounded-lg border border-color-border/60 bg-transparent px-3 py-2 text-sm text-primary focus:border-accent focus:outline-none"
        defaultValue=""
      >
        <option value="" disabled>
          Select
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
