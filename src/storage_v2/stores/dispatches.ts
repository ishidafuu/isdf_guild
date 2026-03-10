import type { Dispatch } from "../../domain";
import { upsertById } from "./helpers";

export function listDispatches(dispatches: Dispatch[]): Dispatch[] {
  return [...dispatches];
}

export function saveDispatch(dispatches: Dispatch[], dispatch: Dispatch): Dispatch[] {
  return upsertById(dispatches, "dispatch_id", dispatch);
}
