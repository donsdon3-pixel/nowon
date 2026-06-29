import { revalidatePath } from "next/cache";
import { Mail, MapPin, Phone, Sparkles, UserRound, UsersRound } from "lucide-react";
import { createClient } from "@/utils/supabase/server";

type Profile = {
  id: string;
  name: string;
  identity: string;
  email: string;
  mobile_number: string;
  location: string;
  created_at: string;
};

type ProfileField = {
  name: keyof Pick<Profile, "name" | "identity" | "email" | "mobile_number" | "location">;
  label: string;
  placeholder: string;
  type?: string;
};

const fields: ProfileField[] = [
  { name: "name", label: "Name", placeholder: "Aarav Mehta" },
  { name: "identity", label: "Identity", placeholder: "Product Designer, Founder, Student" },
  { name: "email", label: "Email ID", placeholder: "you@example.com", type: "email" },
  { name: "mobile_number", label: "Mobile Number", placeholder: "+91 98765 43210", type: "tel" },
  { name: "location", label: "Location", placeholder: "Bengaluru, India" },
];

async function createProfile(formData: FormData) {
  "use server";

  const payload = Object.fromEntries(
    fields.map((field) => [field.name, String(formData.get(field.name) ?? "").trim()]),
  );

  const hasEmptyValue = Object.values(payload).some((value) => value.length === 0);
  if (hasEmptyValue) {
    throw new Error("All profile fields are required.");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("profiles").insert(payload);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/");
}

async function getProfiles() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("id,name,identity,email,mobile_number,location,created_at")
    .order("created_at", { ascending: false });

  return {
    profiles: (data ?? []) as Profile[],
    error,
  };
}

function Detail({ icon: Icon, children }: { icon: typeof Mail; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 items-center gap-2 text-sm text-slate-600">
      <Icon className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
      <span className="truncate">{children}</span>
    </div>
  );
}

function ProfileCard({ profile }: { profile: Profile }) {
  return (
    <article className="rounded-lg border border-white/80 bg-white/85 p-5 shadow-soft backdrop-blur">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="truncate text-xl font-semibold text-slate-950">{profile.name}</h2>
          <p className="mt-1 line-clamp-2 text-sm font-medium text-teal-700">{profile.identity}</p>
        </div>
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-slate-950 text-white">
          <UserRound className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>

      <div className="space-y-3">
        <Detail icon={Mail}>{profile.email}</Detail>
        <Detail icon={Phone}>{profile.mobile_number}</Detail>
        <Detail icon={MapPin}>{profile.location}</Detail>
      </div>
    </article>
  );
}

function ProfileForm() {
  return (
    <form action={createProfile} className="rounded-lg border border-white/80 bg-white p-5 shadow-soft sm:p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-teal-600 text-white">
          <Sparkles className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Create an identity profile</h2>
          <p className="text-sm text-slate-500">Add the first record to your Supabase profiles table.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((field) => (
          <label key={field.name} className={field.name === "identity" ? "sm:col-span-2" : ""}>
            <span className="text-sm font-medium text-slate-700">{field.label}</span>
            <input
              required
              name={field.name}
              type={field.type ?? "text"}
              placeholder={field.placeholder}
              className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
            />
          </label>
        ))}
      </div>

      <button
        type="submit"
        className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-md bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-950/15 sm:w-auto"
      >
        Save profile
      </button>
    </form>
  );
}

export default async function Home() {
  const { profiles, error } = await getProfiles();
  const hasProfiles = profiles.length > 0;

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="flex flex-col gap-5 rounded-lg border border-white/70 bg-white/70 p-5 shadow-soft backdrop-blur md:flex-row md:items-end md:justify-between md:p-7">
          <div className="max-w-2xl">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-sm font-medium text-teal-700">
              <UsersRound className="h-4 w-4" aria-hidden="true" />
              nowon identity network
            </p>
            <h1 className="text-4xl font-semibold tracking-normal text-slate-950 sm:text-5xl">
              Profiles that make people easy to find, trust, and contact.
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Connect Supabase records to a polished directory for names, roles, email IDs, mobile numbers, and locations.
            </p>
          </div>
          <div className="rounded-lg bg-slate-950 px-5 py-4 text-white">
            <p className="text-3xl font-semibold">{profiles.length}</p>
            <p className="text-sm text-slate-300">live profile{profiles.length === 1 ? "" : "s"}</p>
          </div>
        </header>

        {error ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-amber-950">
            <h2 className="font-semibold">Supabase table is not ready yet</h2>
            <p className="mt-2 text-sm leading-6">
              The app tried to read from <code className="rounded bg-amber-100 px-1">public.profiles</code> but Supabase returned:
              <span className="mt-2 block font-mono text-xs">{error.message}</span>
            </p>
            <p className="mt-3 text-sm leading-6">
              Run the SQL in <code className="rounded bg-amber-100 px-1">supabase-schema.sql</code> inside the Supabase SQL editor, then refresh this page.
            </p>
          </div>
        ) : null}

        {hasProfiles ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {profiles.map((profile) => (
              <ProfileCard key={profile.id} profile={profile} />
            ))}
          </div>
        ) : (
          <ProfileForm />
        )}
      </section>
    </main>
  );
}
