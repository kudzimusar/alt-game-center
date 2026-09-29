# ALT Game Center — Replit export conversion

This source was converted from the attached full Replit export for deployment on the professional domain `alt-game-center.online`.

## Active production surface

The Vite/React frontend is the active Vercel production surface. It includes the expanded 19-game catalog, the new landing experience, authentication/subscription/admin screens, curriculum data, and all archived game screens.

## Preserved backend source

The Express/PostgreSQL/Supabase/Stripe/email/analytics source from the export is preserved under `server/` and `shared/`, but it is **not enabled by the static Vercel configuration in this conversion commit**. The archive itself does not contain WebSocket upgrade wiring even though multiplayer pages reference `/ws/*`, and production provider credentials must not be copied from Replit metadata into Git. Activating those services requires a bounded backend deployment pass with durable shared room state.

## Security conversion

- Replit environment metadata is not committed.
- The hard-coded Google AI credential found in the archive was removed.
- Google AI now reads `GOOGLE_AI_API_KEY` when the backend is activated.
- Professional-domain metadata replaces Replit social metadata.
- CI rejects committed Google API-key patterns and Replit deployment metadata.

## Conversion verification

- Source migration branch: `migration/full-replit-code-2026`
- Full converted application payload applied at `8aac38acbef60b2de191eb10e3b38f05540286de`
- Exact converted Vercel preview for that payload reached `READY`
- Final merge is gated on the current exact-head browser build/CI and Vercel preview
