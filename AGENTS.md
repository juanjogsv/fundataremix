# Project architecture

- Keep section names, routes, and accents in `src/config/navigation.ts` so the global header, page banner, and home directory stay consistent.
- Serve shared raster brand assets through immutable CDN pointers and reserve their intrinsic dimensions to reduce transfer size and layout shifts.