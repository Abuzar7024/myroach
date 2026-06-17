import { redirect } from "next/navigation";
import { ADMIN_PANEL_URL } from "@/lib/config";

/** Storefront admin routes redirect to the dedicated admin panel. */
export default function AdminLayout() {
  redirect(`${ADMIN_PANEL_URL}/login`);
}
