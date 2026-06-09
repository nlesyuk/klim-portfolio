// Upload route categories used to derive the storage sub-path from a URL.
export const categories = [
  "work",
  "shot",
  "photo",
  "slider",
  "photos",
  "contact",
] as const;

// Tenant map: domain header → DB user id. Overridable via the TENANTS env var
// (JSON object) so a 3rd site can be onboarded without a code change (R7).
function loadTenants(): Record<string, number> {
  const fallback: Record<string, number> = {
    "klimstepan.com": 1,
    "derzhanovska.com": 2,
  };
  const raw = process.env.TENANTS;
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw) as Record<string, number>;
    return Object.keys(parsed).length ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export const sitesByUserId: Record<string, number> = loadTenants();
