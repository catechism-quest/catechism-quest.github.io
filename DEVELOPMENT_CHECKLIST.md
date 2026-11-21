# Adventure & World Builder: Development Checklist

This checklist tracks the adventure and progression system and the World Builder. The World Builder's architecture notes are in [WORLD_BUILDER_PROGRESS.md](WORLD_BUILDER_PROGRESS.md).

## Design principles
- **Learning comes first.** XP, coins and unlocks come from learning activities and creative goals. The World Builder is fully playable without earning anything.
- **No manipulative mechanics:** no real money, ads, timers, loot boxes, limited-time offers or penalties. Streaks only ever celebrate; missing a day costs nothing. Every reward can be reached by playing normally.
- **Fits the existing app:** the same 8-bit pixel style, Press Start 2P and Pixelify fonts, palette, chunky borders and sound effects. No emoji artwork.
- **Extensible:** heroes, hats, pets, achievements, places, builder objects, creatures, themes and challenges are config entries, not one-off code.
- **Nothing destructive:** existing saves upgrade in `fix()`, new kid fields get defaults, and existing screens keep working (checked by `tests/`).

## Phase 0: Foundations
- [x] Audit the codebase (`index.html` shell, `js/*` classic scripts, localStorage plus the Claude `db` sync per kid).
- [x] Cache fix: `?v=N` on every script and stylesheet, plus a `no-cache` service-worker fetch, so a deploy never mixes old and new files. `tools/bump_version.py` bumps both.
- [x] Extension points in `helpers.js`: `VIEWS`, `MOUNT`/`UNMOUNT`, `ACT`, `NEED`, `NAVTABS`.
- [x] Screen-in transition and modal pop animations, turned off for `prefers-reduced-motion`.
- [x] Test runner: `tests/index.html` loads the app's real scripts with a separate save key, and `tests/tests.js` holds the tests.

## Phase 1: Progression
- [ ] XP from every learning activity and builder challenge; a level curve up to level 50.
- [ ] Level badge and XP bar in the top bar; a level-up celebration overlay.
- [ ] `UNLOCKS` config: heroes, hats and companions, unlocked by level, achievement or coins.
- [ ] New pixel heroes (Shepherd, Gardener, Astronaut, Robot), hats, and companion pets.
- [ ] Composite hero rendering (hero + hat), with the companion shown beside the hero.
- [ ] Shop with tabs (Heroes, Hats, Pets, World, Power-ups); coins only, no real money.
- [ ] 30+ achievements (20 existing + level, collection and builder achievements).

## Phase 2: Adventure world map
- [ ] Overworld map of all 27 places along a winding road, with emblems, progress and locks.
- [ ] Tap a place: the hero walks there and a card shows its progress, with Go to land / Guardian.
- [ ] Builder Island on the overworld.

## Phase 3: World Builder engine (see WORLD_BUILDER_PROGRESS.md)
## Phase 4: Creatures and behaviors
## Phase 5: Worlds, themes, challenges, integration
## Phase 6: Polish, tests, docs

## Known issues
- None yet.
