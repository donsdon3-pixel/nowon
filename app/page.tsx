import Image from "next/image";
import { revalidatePath } from "next/cache";
import { Mail, MapPin, Phone, Sparkles, Star, UserRound, UsersRound } from "lucide-react";
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
    <div className="flex min-w-0 items-center gap-2 rounded-md bg-white/75 px-3 py-2 text-sm text-slate-700 ring-1 ring-white/80">
      <Icon className="h-4 w-4 shrink-0 text-fuchsia-500" aria-hidden="true" />
      <span className="truncate">{children}</span>
    </div>
  );
}

function ProfileCard({ profile }: { profile: Profile }) {
  return (
    <article className="group overflow-hidden rounded-lg border border-white/80 bg-white/90 shadow-soft backdrop-blur">
      <div className="h-2 bg-gradient-to-r from-fuchsia-500 via-amber-400 to-cyan-400" />
      <div className="p-5">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="truncate text-xl font-semibold text-slate-950">{profile.name}</h2>
            <p className="mt-1 line-clamp-2 text-sm font-medium text-fuchsia-700">{profile.identity}</p>
          </div>
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-violet-600 via-fuchsia-500 to-amber-400 text-white shadow-lg shadow-fuchsia-500/20 transition group-hover:scale-105">
            <UserRound className="h-5 w-5" aria-hidden="true" />
          </div>
        </div>

        <div className="space-y-3">
          <Detail icon={Mail}>{profile.email}</Detail>
          <Detail icon={Phone}>{profile.mobile_number}</Detail>
          <Detail icon={MapPin}>{profile.location}</Detail>
        </div>
      </div>
    </article>
  );
}

function ProfileForm() {
  return (
    <form action={createProfile} className="overflow-hidden rounded-lg border border-white/80 bg-white shadow-soft">
      <div className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-400 p-5 text-white sm:p-6">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-lg bg-white/20 text-white ring-1 ring-white/30">
            <Sparkles className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Create an identity profile</h2>
            <p className="text-sm text-white/80">Add a vibrant card to nowon.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
        {fields.map((field) => (
          <label key={field.name} className={field.name === "identity" ? "sm:col-span-2" : ""}>
            <span className="text-sm font-medium text-slate-700">{field.label}</span>
            <input
              required
              name={field.name}
              type={field.type ?? "text"}
              placeholder={field.placeholder}
              className="mt-2 h-11 w-full rounded-md border border-fuchsia-100 bg-rose-50/60 px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-fuchsia-500 focus:bg-white focus:ring-4 focus:ring-fuchsia-500/15"
            />
          </label>
        ))}
      </div>

      <button
        type="submit"
        className="mx-5 mb-5 inline-flex h-11 w-[calc(100%-2.5rem)] items-center justify-center rounded-md bg-gradient-to-r from-slate-950 via-violet-800 to-fuchsia-700 px-5 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/20 transition hover:brightness-110 focus:outline-none focus:ring-4 focus:ring-fuchsia-500/20 sm:mx-6 sm:mb-6 sm:w-auto"
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
    <main className="relative min-h-screen overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 color-grid opacity-70" aria-hidden="true" />
      <section className="relative mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="relative overflow-hidden rounded-lg bg-slate-950 p-5 text-white shadow-soft md:p-7">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(236,72,153,0.88),rgba(124,58,237,0.82)_42%,rgba(14,165,233,0.78)_72%,rgba(250,204,21,0.82))]" aria-hidden="true" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.18)_0,rgba(255,255,255,0.18)_1px,transparent_1px,transparent_16px)]" aria-hidden="true" />
          <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-sm font-medium text-white ring-1 ring-white/25">
                <UsersRound className="h-4 w-4" aria-hidden="true" />
                nowon identity network
              </p>
              <h1 className="text-4xl font-semibold tracking-normal text-white sm:text-5xl">
                Profiles that make people easy to find, trust, and contact.
              </h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-white/85">
                A bright people directory for names, roles, email IDs, mobile numbers, and locations.
              </p>
            </div>
            <div className="flex w-28 shrink-0 flex-col gap-2 justify-self-start md:justify-self-end">
              <div className="overflow-hidden rounded-md bg-white/20 p-1 ring-1 ring-white/30 backdrop-blur">
                <Image
                  src="/images/nowon-people.png"
                  alt="A smiling man and woman representing nowon profile members"
                  width={112}
                  height={144}
                  sizes="112px"
                  priority
                  className="h-36 w-28 rounded object-cover object-center shadow-lg shadow-slate-950/25"
                />
              </div>
              <div className="rounded-md bg-white/18 px-2.5 py-1.5 text-white ring-1 ring-white/25 backdrop-blur">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold leading-none">{profiles.length}</p>
                  <Star className="h-3 w-3 text-amber-200" aria-hidden="true" />
                </div>
                <p className="mt-1 text-[10px] leading-none text-white/80">live profile{profiles.length === 1 ? "" : "s"}</p>
              </div>
            </div>
          </div>
        </header>

        {error ? (
          <div className="relative rounded-lg border border-amber-200 bg-amber-50/95 p-5 text-amber-950 shadow-soft">
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

        <div className="grid gap-6 lg:grid-cols-[minmax(320px,420px)_1fr] lg:items-start">
          <ProfileForm />

          {hasProfiles ? (
            <div className="grid gap-4 md:grid-cols-2">
              {profiles.map((profile) => (
                <ProfileCard key={profile.id} profile={profile} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-white/80 bg-white/85 p-5 text-slate-700 shadow-soft backdrop-blur">
              <h2 className="text-lg font-semibold text-slate-950">No profiles yet</h2>
              <p className="mt-2 text-sm leading-6">
                Submit the form to create the first profile card. The form will stay available for the next entry too.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

