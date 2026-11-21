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
- [x] XP from every learning activity and builder challenge; a level curve up to level 50.
- [x] Level badge and XP bar in the top bar; a level-up celebration overlay.
- [x] `UNLOCKS` config: heroes, hats and companions, unlocked by level, achievement or coins.
- [x] New pixel heroes (Shepherd, Gardener, Astronaut, Robot), hats, and companion pets.
- [x] Composite hero rendering (hero + hat), with the companion shown beside the hero.
- [x] Shop with tabs (Heroes, Hats, Pets, World, Power-ups); coins only, no real money.
- [x] 30+ achievements: **37** in all (20 learning + 8 progression + 9 World Builder).

## Phase 2: Adventure world map
- [x] Overworld map of all 27 places along a winding road, with emblems, progress and locks.
- [x] Tap a place: the hero walks there and a card shows its progress, with Go to land / Guardian.
- [x] Builder Island button on the World Map.

## Phase 3: World Builder engine (details in WORLD_BUILDER_PROGRESS.md)
- [x] Isometric renderer, terrain baking, camera (pan, pinch, wheel, buttons), depth sorting.
- [x] Part-based procedural object art with rotation, state and live animated parts.
- [x] Catalog: 140 objects in 6 categories, with large picture icons.
- [x] Tools: play, build, friends, paint (3 brushes), roads/paths/rails (auto-joining, bridges), eraser, move/turn/copy/remove, undo/redo.

## Phase 4: Creatures and behaviors
- [x] 23 creatures; customizable, nameable villagers.
- [x] A* pathfinding; routines (visit, play, chat, stroll, sleep at home at night); animals wander and sleep; fish swim; fliers fly.
- [x] Cars on roads and trains on tracks; boats bob; balloons and UFOs hover.
- [x] Tap interactions for objects (20 kinds) and creatures (sounds, hearts, bubbles).

## Phase 5: Worlds, themes, challenges, integration
- [x] Up to 12 worlds per kid: previews, new (10 themes), copy, delete with confirmation, rename, expand.
- [x] Autosave into the kid's save (localStorage + cloud sync); `migrateWorld()` for future formats.
- [x] Day/night cycle, lights, rain and snow, theme ambient effects; photo mode.
- [x] 14 optional challenges with celebrations, XP and coins; 9 builder achievements.
- [x] Integration: BUILD tab, Builder Island on the World Map, treasures earned by learning in the shop's WORLD tab, Creative Mode in Settings.

## Phase 6: Polish, tests, docs
- [x] 43 automated tests (`tests/index.html`), covering existing features, progression, the world map and the builder.
- [x] Checked at phone size in the browser: learning flow, results screens, level-up, shop, world map, builder (day/night, every tool and interaction).
- [x] Docs: this checklist, WORLD_BUILDER_PROGRESS.md, CLAUDE.md.

## Known issues
- See WORLD_BUILDER_PROGRESS.md for builder-specific notes.
- Sounds were added with the app's existing tone generator. Nobody has listened to them yet.
