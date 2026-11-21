# World Builder: Progress & Architecture

The World Builder is an isometric creative sandbox inside Catechism Quest. Each kid has up to 12 named worlds. To open it, tap the **BUILD** tab, the **Sail to Builder Island** button on the World Map, or a world card.

## Status
| Area | State |
|---|---|
| Isometric terrain: 6 ground types, water banks, toy-diorama edges | ✅ Done |
| Roads, paths and railroads that join up by themselves; bridges over water | ✅ Done |
| Catalog: **140 objects** in 6 categories (35 homes, 38 nature, 21 fun, 20 town, 20 magic, 6 treasures) | ✅ Done |
| **23 creatures**: villagers (customizable), pets, farm animals, wildlife, dinosaurs, dragons, a space buddy | ✅ Done |
| Behaviors: villagers visit buildings, play, chat, stroll on paths and sleep at home; animals wander and sleep; fish swim; fliers fly | ✅ Done |
| Vehicles: cars on roads, a steam train on each stretch of track | ✅ Done |
| Interactions: doors, spinning rides, rocket launch, volcano eruption, treasure chests, gardens that grow, lights, bells, splashes, sirens, magic, hatching eggs | ✅ Done |
| Tools: play, build, friends, paint (3 brush sizes), roads, eraser, move/turn/copy/remove, undo/redo, zoom/pinch/pan | ✅ Done |
| Day/night (day, night, or a changing cycle) with glowing lights; rain and snow; ambient effects for each theme | ✅ Done |
| **10 themes** with their own ground colors, sky, ambient effect, featured items, creatures and starter scenery | ✅ Done |
| **14 optional challenges**, each with a progress bar and a celebration, plus badges, XP and coins (once per kid) | ✅ Done |
| Worlds list with previews; new (theme picker), copy, delete (with confirmation), rename, expand (+4 up to 40×40) | ✅ Done |
| Photo mode: hides the UI and saves a PNG | ✅ Done |
| Autosave into the kid's save (localStorage + Claude `db` sync), with format migration | ✅ Done |
| Creative Mode: a grown-up setting that unlocks every treasure | ✅ Done |
| Tests: 20 builder tests (43 in all) in `tests/tests.js` | ✅ Done |

## Architecture
All plain classic scripts in `js/wb/`, loaded in this order, with no build step:

| File | What it does |
|---|---|
| `art.js` | Isometric projection (32×16 tiles, 16 px per height unit). It turns **part lists** (`box`, `roof`, `cyl`, `cone`, `ball`, `tile`, `dots`, `pole`, `flag`, `px`, `live`) into cached pixel-art sprites for each object, rotation and state, snapped to hard pixel edges. It also draws the animated "live" parts every frame, and creature sprites (villager looks with hats). |
| `catalog.js` | **Config only.** `TERRAIN`, `OVERLAYS`, `THEMES`, `OBJECTS`, `CREATURES`, creature sprites, and World Builder treasures appended to `UNLOCKS`. |
| `world.js` | The world model: create (with themed starter scenery), `migrateWorld`, tile and overlay access, footprints, `canPlace` collision rules, fence joins (`connMask`), creatures, `History` (snapshot undo/redo, 40 steps), `expandWorld`, `dupWorld`. |
| `sim.js` | A* pathfinding (paths and roads are cheaper; buildings block), creature plans and steps, doorsteps, cars and trains, and `ACTS`, the tap interactions. |
| `engine.js` | The runtime (`WBS`): camera (art-pixel space, integer-crisp scaling), the terrain baked to one image, a depth-sorted render (flat things first, then everything upright from back to front), night lighting with additive glows, weather particles, and pointer input (tap, drag, two-finger pan and pinch, wheel). |
| `ui.js` | Screens (`VIEWS.worlds`, `VIEWS.wb`), the toolbar, drawers and selection panel, `CHALLENGES`, builder achievements, and photo mode. |

### Key decisions
- **Canvas 2D with procedural pixel art.** The app is a no-dependency static site, and its look is 8-bit sprites. Building objects from simple 3D parts gives consistent, original art for 140 objects in all 4 rotations without hand-drawing 560 sprites. Hard alpha edges keep the 8-bit look when scaled.
- **Performance:** terrain (and roads) is baked once per edit into a single image, and object sprites are cached per object, rotation and state, so a frame is one terrain draw plus one `drawImage` per visible thing. Only "live" parts (wheels, blades, water, smoke) are drawn every frame. The loop pauses when the tab is hidden and stops when you leave the builder.
- **Saving:** worlds live in `k.worlds`, so they ride on the existing localStorage save and the Claude `db` sync and backup per kid. The format is compact: terrain and overlays are strings of N×N letters. Edits save after 0.7 s; creature positions save every 20 s. `migrateWorld()` repairs or upgrades any saved world on load, so data survives app updates.
- **Undo** uses whole-world snapshots, which is simple and reliable at this size. Every destructive action (erase, remove, expand, move) can be undone.
- **Never required, never manipulative.** Everything except 6 treasures is free and unlimited. Treasures come from learning (levels, badges) or coins, or from Creative Mode. Challenges are optional ideas and nothing is lost for ignoring them.

## How to extend
- **New object:** add an entry to `OBJECTS` in `catalog.js` with `id`, `n`, `cat`, `th`, `w`/`d`, and `parts`. Add behaviors with flags: `act` (any key of `ACTS`), `home`, `visit`, `play`, `light`, `flat`, `water`, `float`, `hover`, `conn`, `grow`. Tests check that it renders in all 4 rotations and has an icon.
- **New interaction:** add a function to `ACTS` in `sim.js` and use its name as an object's `act`.
- **New creature:** add a sprite to `SPR` and an entry to `CREATURES` (`move`, `home`, `speed`, `snd`, `cat`).
- **New theme:** add a `THEMES` entry (ground, palette overrides, sky, ambient, featured items, pets).
- **New challenge:** add a `CHALLENGES` entry whose `check(world)` returns `[have, need]`.
- **New treasure:** add an object with `cat:'treasure'` and `reward:'wb:<id>'`, plus a matching `UNLOCKS` entry.
- Never rename or remove ids. They're saved in worlds.

## Known issues / ideas for later
- Depth sorting uses each object's front corner, so a creature walking *behind* the far side of a large (2×2+) building can briefly draw in front of it.
- Roads and rails draw corners as two straight arms meeting at the center, not smooth curves.
- Downloading a photo from inside an embedded preview may be blocked by the host. It works on the published site.
- Tapping a tall object in Play mode checks its actual pixels, but very thin parts (poles) are hard to hit. Using the tile under them would be easier.
