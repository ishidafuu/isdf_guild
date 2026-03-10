import type { Report } from "../../domain";
import { upsertById } from "./helpers";

export function listReports(reports: Report[]): Report[] {
  return [...reports];
}

export function saveReport(reports: Report[], report: Report): Report[] {
  return upsertById(reports, "report_id", report);
}
