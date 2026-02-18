#!/usr/bin/env node
/**
 * GSC "Caps" keyword position check — Al-Ameen Caps.
 *
 * Fetches average position for the exact query "Caps" in South Africa (zaf)
 * for the last 3 days. Logs SUCCESS when position ≤ 10, otherwise logs current position.
 *
 * Requires env: GSC_CLIENT_EMAIL, GSC_PRIVATE_KEY (service account with Search Console access).
 * Run: node scripts/gsc-check-caps-position.js
 *
 * Can be used as a smoke test in CI or scheduled (e.g. GitHub Action Monday 8am).
 */

import { google } from 'googleapis';

const SITE_URL = 'https://alameencaps.com/';
const QUERY = 'Caps';
const COUNTRY = 'zaf';
const POSITION_MILESTONE = 10;
const DAYS_WINDOW = 3;

// End date = yesterday (GSC data often has 2–3 day delay; today usually has no data yet)
function getDateRange() {
  const end = new Date();
  end.setDate(end.getDate() - 1);
  const start = new Date(end);
  start.setDate(start.getDate() - (DAYS_WINDOW - 1));
  const fmt = (d) => d.toISOString().slice(0, 10);
  return { startDate: fmt(start), endDate: fmt(end) };
}

async function main() {
  const email = process.env.GSC_CLIENT_EMAIL;
  const key = process.env.GSC_PRIVATE_KEY;

  if (!email || !key) {
    console.error('Missing GSC_CLIENT_EMAIL or GSC_PRIVATE_KEY in environment.');
    process.exitCode = 1;
    return;
  }

  const auth = new google.auth.JWT({
    email,
    key: key.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
  });

  const webmasters = google.webmasters({ version: 'v3', auth });
  const { startDate, endDate } = getDateRange();

  try {
    const res = await webmasters.searchanalytics.query({
      siteUrl: SITE_URL,
      requestBody: {
        startDate,
        endDate,
        dimensionFilterGroups: [
          {
            filters: [
              { dimension: 'query', operator: 'equals', expression: QUERY },
              { dimension: 'country', operator: 'equals', expression: COUNTRY },
            ],
          },
        ],
      },
    });

    const rows = res.data?.rows ?? [];
    if (rows.length === 0) {
      console.log(
        `No data for query "${QUERY}" in ${COUNTRY} for ${startDate}–${endDate}. Try again when GSC has data (often 2–3 days delay).`
      );
      return;
    }

    const row = rows[0];
    const position = row.position ?? null;
    const clicks = row.clicks ?? 0;
    const impressions = row.impressions ?? 0;

    if (position === null) {
      console.log('Position not available in response.');
      return;
    }

    console.log(`Current status for "Caps" in South Africa (${startDate}–${endDate}):`);
    console.log(`  Average position: ${position.toFixed(2)}`);
    console.log(`  Clicks: ${clicks}, Impressions: ${impressions}`);

    if (position <= POSITION_MILESTONE) {
      console.log('SUCCESS: Milestone achieved! Al-Ameen Caps is on Page 1.');
    } else {
      const spotsAway = (position - POSITION_MILESTONE).toFixed(1);
      console.log(`Keep going! You are ${spotsAway} spots away from Page 1.`);
    }
  } catch (err) {
    console.error('GSC API error:', err.message || err);
    if (err.response?.data) console.error(err.response.data);
    process.exitCode = 1;
  }
}

main();
