# OPEC Reference Basket

The global Economy dashboard Energy section includes 37 monthly snapshots from September 2023 through September 2026. Each point is the last available observed daily price in that month, with the actual observation date preserved; these are not monthly averages.

Historical prices come from OPEC's public chart archive: https://www.opec.org/basket/basketDay.json. The accessible archive ended September 3, 2026; September's snapshot is supplemented with the September 29 quote of $109.53 from https://dataful.in/datasets/327/. The preceding snapshot is August 31 at $91.98, giving a $17.55 increase. No prices were interpolated or extrapolated.

The basket represents physical crude grades and should not be treated as the same instrument as the website's Brent futures series. Basket composition has changed over time.

Run `npm run fetch:opec` to refresh from the official feed. The parser never evaluates remote JavaScript and rejects HTTP failures, insufficient history, or a feed older than the saved snapshot. Existing data remains unchanged on failure. OPEC currently returns HTTP 403 to this environment, so a successful automatic fetch has not been verified; the checked-in snapshot is used at build time.
