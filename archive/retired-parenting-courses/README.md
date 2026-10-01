# Retired parenting-topic courses

These 4 files (Tantrums Tamed, Mastering Organization, Teaching Your Kids to
Listen, Mastering Social Skills — 37 real, fully-authored lessons) were the
app's Courses content before it was restructured into the 28-day ACT
program (6 processes + Choice Point, 4 weeks). They were replaced, not
deleted, since the writing itself is still real and potentially reusable —
just no longer part of the active app.

`.ts.bak` (not `.ts`) is deliberate: TypeScript's default file matching
doesn't pick up this extension, so these compile-check-clean without being
part of the live build, while staying easy to open, read, or copy pieces
out of later. They reference the old `CourseId` values ('tantrums',
'organization', 'listening', 'social'), which no longer exist in
`src/features/courses/types.ts` — restoring any of this would mean
re-adding those ids (or re-mapping the content onto the current ACT
process ids) rather than dropping the files back in as-is.
