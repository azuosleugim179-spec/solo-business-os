# Growth MS public website

This review branch integrates the approved Solo Business OS landing into the existing GitHub Pages deployment. It is not deployed. The paid application, delivery ZIP and credentials are excluded.

## Source and release

- `site/` is the maintained static public website, recovered from the production archive and updated for this handoff.
- `site/assets/solo/reference.css` preserves the approved published stylesheet verbatim. Fonts are self-hosted with their licenses. No Lovable runtime, hosting or badge is required.
- `business-info.json` records approved business information. The build checks the fixed price and checkout URL against the landing.
- `growth-ms-public-site.zip` contains 46 public files. `verify-and-extract.py` checks archive and individual file hashes before extraction into `_site/`.
- `review/` contains preservation and completed QA evidence.

Run `python tools/build.py` from the repository to validate local links and regenerate the archive and verifier. Run `python verify-and-extract.py` to verify extraction. Serve `site/` as the web root for a local preview. The source files are byte-preserved by `.gitattributes` to keep packaging consistent across operating systems.

The existing `.github/workflows/pages.yml` is unchanged. It deploys the extracted release when relevant files reach `main`. Do not merge or deploy without founder review. Automated Solo fulfillment remains a separate launch gate after landing deployment.

## Review boundary

The new landing has five direct links to the approved $79 USD Stripe Payment Link. The older Growth MS configuration retains its previous checkout gate; the new landing does not load that script. Stripe settings were not changed. The new landing has no advertising pixels or optional analytics.

Privacy, terms, refund, license and support content use previously approved decisions. The founder confirmed that the support mailbox receives messages and is monitored. Automatic fulfillment remains unverified for launch. A working checkout is not evidence of successful delivery.

Growth MS home, 404, success/cancel pages, domain and deployment workflow are preserved. Legacy landing anchors work. ClientOps route, public CSS/JS and Stripe CTAs are preserved byte-for-byte from current main.

Before merge, rollback means leaving main unchanged. After a later authorized merge, revert this handoff commit (or its merge/squash equivalent), restoring the prior archive and matching verifier from base `a96db9db24ba17ace695c4cdbdd3d25d65f4fae3` through the existing workflow.

## Current integration

Based on the current main after ClientOps. The Solo patch was applied with the outdated archive and verifier excluded; a combined public archive is regenerated from the preserved current files and approved Solo files. The founder-approved refund rule now has no voluntary refund period; sales are final to the extent permitted by applicable law, with mandatory rights and support review preserved. The historical handoff ZIP is not the current deployment artifact.
