import { cookies } from "next/headers";

import { AdminLoginForm } from "@/app/admin/login-form";
import { CreateDestinationForm } from "@/app/admin/create-destination-form";
import { DestinationEditor } from "@/app/admin/destination-editor";
import { signOutAction } from "@/app/admin/actions";
import { ADMIN_COOKIE } from "@/app/admin/shared";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const token = process.env.ADMIN_DASHBOARD_TOKEN;

  if (!token) {
    return (
      <div className="mx-auto mt-16 max-w-2xl space-y-4 rounded-2xl border border-amber-400/60 bg-amber-100/10 p-8 text-amber-700">
        <h1 className="text-2xl font-semibold">Admin dashboard unavailable</h1>
        <p className="text-sm">
          Set <code>ADMIN_DASHBOARD_TOKEN</code> in your environment and redeploy to enable the admin dashboard.
        </p>
      </div>
    );
  }

  const cookieStore = await cookies();
  const cookieToken = cookieStore.get(ADMIN_COOKIE)?.value;
  const isAuthorized = cookieToken === token;

  if (!isAuthorized) {
    return <AdminLoginForm />;
  }

  const destinations = await prisma.destination.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <main className="mx-auto max-w-5xl space-y-8 px-4 py-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-primary">Admin dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Manage the destinations stored in Neon via Prisma.
          </p>
        </div>
        <form action={signOutAction}>
          <button
            type="submit"
            className="rounded-full border border-color-border/60 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-color-muted/40"
          >
            Sign out
          </button>
        </form>
      </header>

      <CreateDestinationForm />

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-primary">Existing destinations</h2>
          <span className="text-sm text-muted-foreground">{destinations.length} total</span>
        </div>
        <div className="space-y-6">
          {destinations.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-color-border/40 bg-color-muted/30 p-6 text-sm text-muted-foreground">
              No destinations found. Use the form above to seed your database.
            </p>
          ) : (
            destinations.map((destination) => (
              <DestinationEditor key={destination.id} destination={destination} />
            ))
          )}
        </div>
      </section>
    </main>
  );
}


