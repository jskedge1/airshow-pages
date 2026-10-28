// backend/http-functions.js
// The Big Guide to UK Airshows: public read only feeds for the pages hosted on GitHub Pages.
// GET https://www.ukairshowguide.co.uk/_functions/showTraders?show=cosford
//   Traders at this show, for the block in the Food and facilities section of each feature show page (traders-block.js).
//   Only approved, live listings are returned, trimmed to what each trader's plan allows. No contact details.

import { ok, badRequest, serverError } from "wix-http-functions";
import { getShowTraders } from "backend/traders.web";

const HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Cache-Control": "public, max-age=300"
};

export async function get_showTraders(request) {
  const show = String((request.query && request.query.show) || "").trim().toLowerCase();
  if (!/^[a-z-]{2,40}$/.test(show)) return badRequest({ headers: HEADERS, body: { error: "Please name a show." } });
  try {
    return ok({ headers: HEADERS, body: await getShowTraders(show) });
  } catch (e) {
    console.error("showTraders feed", e);
    return serverError({ headers: HEADERS, body: { error: "Traders could not load." } });
  }
}

export function options_showTraders() {
  return ok({ headers: HEADERS, body: {} });
}
