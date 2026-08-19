import { useCallback, useEffect, useState } from "react";

/**
 * The live hire deal / service order behind a chat card.
 *
 * The cards in chat are built from the socket message that created them, which
 * is a snapshot of one moment. That was enough while they only had to render a
 * title and a budget, but two things they now have to decide aren't in it:
 *
 *   - which side of the deal the viewer is on, so an action can be offered to
 *     the party the server will actually accept it from;
 *   - whether both parties have signed the NDA, which is the gate on payment.
 *
 * Both live on the record, so the record is what this fetches.
 */

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

export type DealResource = "hire" | "service";

/** Fired by the NDA dialog once a signature is accepted — see NdaCard. */
export const NDA_SIGNED_EVENT = "tokun:nda-signed";

const basePathFor = (resource: DealResource) =>
  resource === "service" ? "services/orders" : "hire";

export function useDealRecord(
  resource: DealResource,
  dealId?: string | null,
  token?: string
) {
  const [record, setRecord] = useState<any>(null);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    if (!dealId || !token) return;
    try {
      const res = await fetch(`${API_BASE}/api/${basePathFor(resource)}/${dealId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      // The two endpoints name their payload differently.
      const found = resource === "service" ? data?.order : data?.deal;
      if (data?.success && found) setRecord(found);
    } catch {
      // Left null. Callers treat "don't know" as "don't offer the action",
      // which is the safe direction for both an accept and a payment.
    } finally {
      setLoaded(true);
    }
  }, [resource, dealId, token]);

  useEffect(() => {
    load();
  }, [load]);

  /* Signing happens in a dialog that is not an ancestor of these cards, so
     there is no prop to thread a result back through. It announces instead, and
     this listens — the same window-event pattern the purchase flow already uses
     for "tokun:purchased". Without it a client who signed would still be
     looking at a disabled Pay button until they reloaded the page. */
  useEffect(() => {
    if (!dealId) return;
    const onSigned = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (!detail?.dealId || String(detail.dealId) === String(dealId)) load();
    };
    window.addEventListener(NDA_SIGNED_EVENT, onSigned);
    return () => window.removeEventListener(NDA_SIGNED_EVENT, onSigned);
  }, [dealId, load]);

  return { record, loaded, refresh: load };
}

/**
 * Has the NDA been signed by BOTH parties?
 *
 * Mirrors the server's own gate, which is the authority — POST
 * .../create-payment-order answers `NDA_NOT_SIGNED` when either URL is missing
 * (hire.routes.js) and refuses the payment. This is only so the button can say
 * so before it's pressed.
 *
 * Unknown record → false. A Pay button that is disabled until we know is a
 * moment's wait; one that is enabled and then rejected is a failed payment.
 */
export const ndaFullySigned = (record: any, resource: DealResource): boolean =>
  resource === "service"
    ? !!(record?.ndaBuyerUrl && record?.ndaSellerUrl)
    : !!(record?.ndaClientUrl && record?.ndaFreelancerUrl);

/** Which side of the deal a given user is on, or null if neither. */
export const sideOf = (
  record: any,
  userId?: string | null,
  resource: DealResource = "hire"
): "payer" | "worker" | null => {
  const me = String(userId || "");
  if (!me || !record) return null;
  const id = (v: any) => String(v?._id ?? v ?? "");
  const payer = resource === "service" ? id(record.buyerId) : id(record.clientId);
  const worker = resource === "service" ? id(record.sellerId) : id(record.freelancerId);
  if (me === worker) return "worker";
  if (me === payer) return "payer";
  return null;
};
