import { redirect } from "next/navigation";

// The canonical profile page lives at /profile (inside the (dashboard) group).
// Keep this route as a redirect so old links continue to work.
export default function ProfileRedirectPage() {
  redirect("/profile");
}
