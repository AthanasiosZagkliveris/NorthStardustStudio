# Outstanding findings

Status: **living list**, written 2026-08-02, updated 2026-11-10. The confirmed problems that a diagnostic found and did not fix.

A durable, living record of real problems a diagnostic Skill found but did not fix — because fixing wasn't explicitly authorised in that turn, per `ai-collaboration-rules.md`. Without this file, a confirmed finding exists only in one conversation's history and is lost the moment a new session starts; this file exists so it doesn't have to be rediscovered by re-running the same scan later. Any Skill whose job is to diagnose (not author or fix) should record what it finds here, not let it evaporate at the end of its report.

## How this file works

- A diagnostic Skill appends an entry here when it confirms a real problem and isn't authorised to fix it in the same turn.
- An entry is removed (not just marked done) once the underlying problem is actually fixed and re-verified — this file tracks what's still true, not a permanent history log.
- Before starting a new diagnostic scan, check here first for anything already confirmed in the same area — don't re-derive a finding that's already recorded, but do re-verify it's still accurate if the relevant file has changed since. A scan of an area with an existing entry confirms or corrects that entry; it does not add a second one beside it, and no entry is left stale.

## Entry format

`### <short title>` — Found by: `<Skill name>` · Confirmed: `<what was independently verified, not just what a scan reported>` · Fix: `<what the correct fix is, if known>`

## Currently open

None open today.
