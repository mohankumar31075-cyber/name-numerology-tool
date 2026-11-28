import { redirect } from "next/navigation";

/** The former day-only heuristic was presented as guna matching. The new
 * relationship report explicitly identifies itself as numerology instead. */
export default function MatchmakingPage() {
  redirect("/readings/compatibility");
}
