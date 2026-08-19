/**
 * Cities for a given country, for the City field's suggestions.
 *
 * WHY A REQUEST AND NOT A BUNDLED LIST
 * The city field was free text with no relationship to the country beside it, so
 * "India" + "New York" was a valid profile. Fixing that needs a per-country list,
 * and the two ways to get one both have a cost:
 *
 *   - Bundle it. A curated list is small but silently excludes anyone from a town
 *     that didn't make the cut — the exact objection lib/referenceData.ts already
 *     raises about shortlist country lists. A complete one is megabytes.
 *   - Ask for it. One request per country, cached, and the list is complete:
 *     India comes back with 4,267 entries, small towns included.
 *
 * So it asks. No API key, `Access-Control-Allow-Origin: *`, and results are
 * cached per country for the session — a country is picked once.
 *
 * IF THE REQUEST FAILS the caller falls back to a plain text field. This sits in
 * the middle of onboarding: a third party being down must not be able to stop
 * someone finishing their profile. Degrading to today's behaviour is acceptable;
 * blocking the flow is not.
 */

const ENDPOINT = "https://countriesnow.space/api/v0.1/countries/cities/q";

export type CityLookup =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; cities: string[] }
  /** The list couldn't be fetched — accept free text rather than block. */
  | { status: "unavailable" };

/* Module-level, so switching country back and forth doesn't re-request, and two
   screens editing the same profile share one copy. */
const cache = new Map<string, string[]>();
const inFlight = new Map<string, Promise<string[] | null>>();

export function cachedCities(country: string): string[] | undefined {
  return cache.get(country.trim().toLowerCase());
}

export async function fetchCities(country: string): Promise<string[] | null> {
  const key = country.trim().toLowerCase();
  if (!key) return null;

  const hit = cache.get(key);
  if (hit) return hit;

  // Two fields mounted at once (the wizard and the section editor) must not fire
  // the same request twice.
  const pending = inFlight.get(key);
  if (pending) return pending;

  const request = (async () => {
    try {
      const res = await fetch(`${ENDPOINT}?country=${encodeURIComponent(country.trim())}`);
      const data = await res.json().catch(() => null);
      // `error: true` is how this API reports an unknown country, with HTTP 200.
      if (!res.ok || !data || data.error || !Array.isArray(data.data)) return null;

      /* Deduped and sorted: the raw payload has repeats and is in no useful
         order, and SearchableSelect shows the list as given. */
      const cities: string[] = Array.from(
        new Set<string>(
          data.data
            .map((c: unknown) => String(c ?? "").trim())
            .filter((c: string) => c.length > 1)
        )
      ).sort((a, b) => a.localeCompare(b));

      if (!cities.length) return null;
      cache.set(key, cities);
      return cities;
    } catch {
      return null;
    } finally {
      inFlight.delete(key);
    }
  })();

  inFlight.set(key, request);
  return request;
}

/** Is this city one of the country's known cities? Case-insensitive. */
export function isKnownCity(country: string, city: string): boolean {
  const cities = cachedCities(country);
  if (!cities) return true; // Unknown list — nothing to contradict.
  const c = city.trim().toLowerCase();
  return !c || cities.some((k) => k.toLowerCase() === c);
}
