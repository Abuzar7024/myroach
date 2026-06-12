import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageLayout } from "@/components/legal/legal-page-layout";
import { PRODUCT_SIZES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Size Guide",
  description: "MY ROACH size guide — find your fit for hoodies, tees, and cargos.",
};

const sizeChart = [
  { size: "XS", chest: "86–91", waist: "71–76", length: "66" },
  { size: "S", chest: "91–96", waist: "76–81", length: "68" },
  { size: "M", chest: "96–101", waist: "81–86", length: "70" },
  { size: "L", chest: "101–106", waist: "86–91", length: "72" },
  { size: "XL", chest: "106–111", waist: "91–96", length: "74" },
  { size: "XXL", chest: "111–116", waist: "96–101", length: "76" },
];

export default function SizeGuidePage() {
  return (
    <LegalPageLayout
      title="Size Guide"
      subtitle="All measurements in cm. Our fits run oversized — size down if you want a tighter look."
    >
      <section>
        <h2 className="font-display text-lg text-noire-white">How to Measure</h2>
        <ol className="mt-3 list-inside list-decimal space-y-2">
          <li>Chest: measure around the fullest part, under arms</li>
          <li>Waist: measure around natural waistline</li>
          <li>Length: from shoulder seam to hem</li>
        </ol>
      </section>

      <section>
        <h2 className="font-display text-lg text-noire-white">Size Chart</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[320px] border border-noire-border text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-noire-border bg-noire-charcoal">
                <th className="p-3 font-semibold text-accent-cyan">Size</th>
                <th className="p-3 font-semibold text-accent-cyan">Chest</th>
                <th className="p-3 font-semibold text-accent-cyan">Waist</th>
                <th className="p-3 font-semibold text-accent-cyan">Length</th>
              </tr>
            </thead>
            <tbody>
              {sizeChart.map((row) => (
                <tr key={row.size} className="border-b border-noire-border">
                  <td className="p-3 font-medium text-noire-white">{row.size}</td>
                  <td className="p-3">{row.chest}</td>
                  <td className="p-3">{row.waist}</td>
                  <td className="p-3">{row.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs">
          Available sizes: {PRODUCT_SIZES.join(", ")}
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg text-noire-white">Fit Notes</h2>
        <ul className="mt-3 list-inside list-disc space-y-2">
          <li>Hoodies & tees: intentionally oversized — go true to size for baggy fit</li>
          <li>Cargos: wide leg with adjustable waist — check waist measurement first</li>
          <li>Accessories: one size fits most unless noted on product page</li>
        </ul>
      </section>

      <section>
        <p>
          Still unsure?{" "}
          <Link href="/contact" className="text-accent-cyan hover:underline">
            Hit us up
          </Link>{" "}
          with your measurements — we&apos;ll help you pick the right size, bhai.
        </p>
      </section>
    </LegalPageLayout>
  );
}
