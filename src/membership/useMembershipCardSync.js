import { useEffect, useRef } from "react";
import { toPng } from "html-to-image";

const waitForFrame = () =>
  new Promise((resolve) => {
    if (typeof requestAnimationFrame === "function") {
      requestAnimationFrame(() => resolve());
    } else {
      resolve();
    }
  });

async function exportCardAsDataUrl(node) {
  await waitForFrame();
  await waitForFrame();
  return toPng(node, { pixelRatio: 2 });
}

async function uploadCardImage(membershipId, dataUrl, passUploadToken) {
  const response = await fetch("/api/northside-pass-card-upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ membershipId, imageDataUrl: dataUrl, passUploadToken }),
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(result?.error || "Upload failed");
    error.response = result;
    throw error;
  }

  return result.cardUrl;
}

async function syncBrevoContact(payload) {
  const response = await fetch("/api/membership/brevo-sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    const error = new Error(`Brevo sync failed with status ${response.status}`);
    error.responseBody = body?.slice(0, 500);
    throw error;
  }
}

export function useMembershipCardSync({
  isSubmitted,
  cardNumber,
  cardLabel,
  formValues,
  cardRef,
  passUploadToken,
  source = "pass-preview",
}) {
  const lastSyncedRef = useRef(null);

  useEffect(() => {
    const rootNode = cardRef?.current;
    if (!isSubmitted || !rootNode || !cardNumber) return undefined;

    const node =
      typeof rootNode.querySelector === "function"
        ? rootNode.querySelector('[data-card-export="true"]') || rootNode
        : rootNode;

    const fullName = (formValues.fullName || "").trim();
    const email = (formValues.email || "").trim().toLowerCase();
    const primaryTown = (formValues.primaryTown || "").toString().trim();
    const memberType = (formValues.memberType || "").toString().trim();

    if (!fullName || !email || !primaryTown || !memberType) return undefined;
    if (lastSyncedRef.current === cardNumber) return undefined;

    let cancelled = false;

    const runSync = async () => {
      let cardUrl;
      try {
        if (passUploadToken) {
          const dataUrl = await exportCardAsDataUrl(node);
          if (typeof dataUrl === "string" && dataUrl.startsWith("data:image/png")) {
            cardUrl = await uploadCardImage(cardNumber, dataUrl, passUploadToken);
          }
        }
      } catch (error) {
        console.error("[membership] card export/upload failed", error);
      }

      try {
        await syncBrevoContact({
          email,
          fullName,
          primaryTown,
          memberType,
          cardNumber,
          cardLabel,
          interests: formValues.interests || [],
          complianceConfirmed: formValues.compliance,
          cardUrl,
          source,
        });
      } catch (error) {
        console.error("[membership] Brevo sync failed", error);
      }

      if (!cancelled) {
        lastSyncedRef.current = cardNumber;
      }
    };

    runSync();

    return () => {
      cancelled = true;
    };
  }, [isSubmitted, cardNumber, cardLabel, formValues, cardRef, passUploadToken, source]);
}
