// Map product image filenames stored in DB to bundled asset URLs.
import vial from "@/assets/product-peptide-vial.jpg";
import vial2 from "@/assets/product-peptide-vial-2.jpg";
import bottleBlack from "@/assets/product-bottle-black.jpg";
import bottleWhite from "@/assets/product-bottle-white.jpg";
import dropper from "@/assets/product-dropper.jpg";
import capsules from "@/assets/product-capsules.jpg";
import powder from "@/assets/product-powder.jpg";
import lab from "@/assets/lab-interior.jpg";
import hero from "@/assets/hero-dna.jpg";

const map: Record<string, string> = {
  "product-peptide-vial.jpg": vial,
  "product-peptide-vial-2.jpg": vial2,
  "product-bottle-black.jpg": bottleBlack,
  "product-bottle-white.jpg": bottleWhite,
  "product-dropper.jpg": dropper,
  "product-capsules.jpg": capsules,
  "product-powder.jpg": powder,
  "lab-interior.jpg": lab,
  "hero-dna.jpg": hero,
};

/** Resolves DB-stored image strings (e.g. "/__asset/product-peptide-vial.jpg") to bundled URLs. */
export function resolveAsset(input?: string | null): string {
  if (!input) return vial;
  const filename = input.replace(/^\/?__asset\//, "").split("/").pop() ?? "";
  return map[filename] ?? vial;
}

export function resolveAssets(inputs?: string[] | null): string[] {
  if (!inputs?.length) return [vial];
  return inputs.map(resolveAsset);
}
