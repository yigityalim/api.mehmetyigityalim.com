import { redirect } from "next/navigation";

export default async function RedirectAPIPage() {
  redirect("/api");
  return null;
}
