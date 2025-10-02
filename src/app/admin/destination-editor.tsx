"use client";

import type { MouseEvent } from "react";
import { useFormState, useFormStatus } from "react-dom";

import { deleteDestinationAction, updateDestinationAction } from "@/app/admin/actions";
import { FIREARM_OPTIONS, MARIJUANA_OPTIONS, PARTY_OPTIONS } from "@/data/destination-options";
import type { Destination } from "@/types/destination";
import type { ActionResult } from "@/app/admin/shared";

const INITIAL_STATE: ActionResult = { success: false, message: "" };

export function DestinationEditor({ destination }: { destination: Destination }) {
  const [updateState, updateAction] = useFormState(updateDestinationAction, INITIAL_STATE);
  const [deleteState, deleteAction] = useFormState(deleteDestinationAction, INITIAL_STATE);

  return (
    <div className="glass-panel space-y-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-primary">{destination.city}, {destination.state}</h3>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{destination.id}</p>
        </div>
        <span className="badge-soft">
          {formatLabel(destination.governorParty)}
        </span>
      </div>
      <form action={updateAction} className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <input type="hidden" name="id" value={destination.id} />
        <Field label="City" name="city" defaultValue={destination.city} required />
        <Field label="State" name="state" defaultValue={destination.state} required />
        <Field label="Governor name" name="governorName" defaultValue={destination.governorName} required />
        <SelectField
          label="Governor party"
          name="governorParty"
          defaultValue={destination.governorParty}
          options={PARTY_OPTIONS}
          required
        />
        <NumberField label="Sales tax (%)" name="salesTax" defaultValue={destination.salesTax} required step="0.1" />
        <NumberField label="Income tax (%)" name="incomeTax" defaultValue={destination.incomeTax} required step="0.1" />
        <SelectField
          label="Marijuana status"
          name="marijuanaStatus"
          defaultValue={destination.marijuanaStatus}
          options={MARIJUANA_OPTIONS}
          required
        />
        <SelectField
          label="Firearm laws"
          name="firearmLaws"
          defaultValue={destination.firearmLaws}
          options={FIREARM_OPTIONS}
          required
        />
        <Field label="Climate" name="climate" defaultValue={destination.climate} required />
        <NumberField label="Avg snowfall (in/yr)" name="snowfall" defaultValue={destination.snowfall} required step="0.1" />
        <NumberField label="Avg rainfall (in/yr)" name="rainfall" defaultValue={destination.rainfall} required step="0.1" />
        <NumberField label="Gas price ($/gal)" name="gasPrice" defaultValue={destination.gasPrice} required step="0.01" />
        <NumberField label="Cost of living index" name="costOfLiving" defaultValue={destination.costOfLiving} required step="0.1" />
        <SummaryField defaultValue={destination.veteranBenefits} />
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
  required?: boolean;
};

function Field({ label, name, defaultValue, required }: FieldProps) {
  return (
    <label className="space-y-2 text-sm text-primary">
      <span className="block font-medium">{label}</span>
      <input
        name={name}
        defaultValue={defaultValue}
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
  step?: string;
};

function NumberField({ label, name, defaultValue, required, step }: NumberFieldProps) {
  return (
    <label className="space-y-2 text-sm text-primary">
      <span className="block font-medium">{label}</span>
      <input
        name={name}
        type="number"
        defaultValue={defaultValue}
        required={required}
        step={step}
        className="w-full rounded-lg border border-color-border/60 bg-transparent px-3 py-2 text-sm text-primary focus:border-accent focus:outline-none"
      />
    </label>
  );
}

type SelectFieldProps = {
  label: string;
  name: string;
  defaultValue: string;
  options: { label: string; value: string }[];
  required?: boolean;
};

function SelectField({ label, name, defaultValue, options, required }: SelectFieldProps) {
  return (
    <label className="space-y-2 text-sm text-primary">
      <span className="block font-medium">{label}</span>
      <select
        name={name}
        defaultValue={defaultValue}
        required={required}
        className="w-full rounded-lg border border-color-border/60 bg-transparent px-3 py-2 text-sm text-primary focus:border-accent focus:outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function SummaryField({ defaultValue }: { defaultValue: string }) {
  return (
    <label className="md:col-span-2 space-y-2 text-sm text-primary">
      <span className="block font-medium">Veteran benefits snapshot</span>
      <textarea
        name="veteranBenefits"
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

function formatLabel(value: string) {
  return value
    .split(/[\s-]+/)
    .map((fragment) => fragment.charAt(0).toUpperCase() + fragment.slice(1))
    .join(" ");
}
