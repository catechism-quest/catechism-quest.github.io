# Catechism Quest

A pixel-art web app that helps kids memorize the Westminster Shorter Catechism and the Heidelberg Catechism. It's published with GitHub Pages at https://catechism-quest.github.io, from the `main` branch.

## Files

- `index.html`: the page shell. It loads `css/style.css`, then the app's scripts in order. There's no build step and no dependencies apart from Google Fonts.
- `css/style.css`: all the styles.
- `js/`: the app, as plain scripts (not modules) that share top-level names. **Load order matters**, so a file may only use names from earlier files while it loads (functions can call anything at run time). The order is:
  - `sprites.js`: palette, sprites, icons and heroes.
  - `songs.js`: the jukebox melodies (`SONGS`).
  - `helpers.js`: small helpers and sprite drawing.
  - `scenes.js`: the painted land backgrounds (`SCENES`, `SCENE_META`).
  - `state.js`: saved state, progress, spaced repetition and cloud sync.
  - `sound.js`: sound effects, the hymn player, speech and confetti.
  - `rewards.js`: daily streaks, achievements (`ACH`) and the badges screen.
  - `views.js`: the map, menus, flock, shop, jukebox and settings.
  - `games.js`: study, fill-in, bonus castle, Word Builder, guardians and lost-lamb review.
  - `actions.js`: taps and input, then start-up and the `__CQ` test hook.

  A new file must be added to `index.html` in the right place and to `SHELL` in `sw.js`. Don't give a top-level name the same name as a browser global (like `top`, `name` or `status`).
- `catechisms.js`: catechism texts and the default land splits. **Generated** by `tools/build_data.py`, which is not in this repo, so don't edit it by hand. Change land places and banners in `js/scenes.js` instead (see `SCENES` and `SCENE_META`).
- `sw.js`: the service worker for offline use when installed. **Bump `VERSION` on every change to any app file**, or installed apps keep the old copy.
- `manifest.webmanifest` and `icons/`: the install-to-home-screen metadata.
- `tools/musicxml_to_notes.py`: converts a hymn's MusicXML score into a jukebox melody. See the `add-hymn` skill.

## This Mac

- There's no Node or Homebrew. Use `python3` (system Python, standard library only) for scripts and checks; run scripts on downloaded files with `python3 -I`.
- `gh` is installed and signed in, and git uses it for HTTPS.

## Testing

1. Serve the folder in the background: `python3 -m http.server 8765`.
2. Open `http://localhost:8765/index.html` in the browser pane with `preview_start` and a `url`. Don't add a launch.json.
3. Test at phone size (the mobile preset). Kids use this on phones.
4. `window.__CQ` is a test hook: `S` (state), `V` (view), `G` (game), `A` (actions), `MU` (music player), `SONGS`, `QAS`, `CAT` and more. Drive views with calls like `__CQ.A.go({dataset:{to:'flock'}})`.
5. To set up a test player, write state to `localStorage['catechism-quest-app-v1']` and reload. Days for reviews are local day numbers: `Math.floor((Date.now()-new Date().getTimezoneOffset()*60000)/86400000)`.
6. Audio only starts after a real click, and you can't hear it. Ask the user to listen to music changes.
7. Service worker registration fails in the browser pane. That's expected, not a bug.

## How things work

- **Sprites.** `SPR` holds pixel art as arrays of strings, with one character per pixel and `.` for transparent. The letters map to `PAL` colors. Every row of a sprite must be the same length. A color map can recolor a sprite, as in `spr(name, scale, {k:'#fff'})`; `ic()` makes small inline icons. Keep everything 8-bit: no emoji or font symbols for icons.
- **Lands.** `SCENES` is the 27-place journey from the Garden of Eden to the New Jerusalem. Each has a painted background drawn on a tiny canvas, and `SCENE_META` gives its banner reference, emblem and color. `sceneOf(q, s)` maps any quest's lands onto it, and `themeOf(q, s)` gives a land's banner. Westminster has 27 lands, one per place; Heidelberg has 52 Lord's Days.
- **Word Builder and guardians.** `k.mast["wsc:12"]` crowns a question built in Word Builder (`startBuild`). `k.guard["wsc:L3"]` is a land's guardian badge (`startGuard`), which also unlocks the next locked hymn the first time.
- **Flock / spaced repetition.** `k.srs["wsc:12"] = {b, d}` holds a step index into `GAPS` (1, 3, 7, 14, 30… days) and a due day. A due lamb is "lost" and appears gray in the hills. The "Find your lost lambs" review (`startHerd` / `herdV`) brings it home. A right answer moves the next review further out. A miss gets one more try; right then, the lamb comes home and its gap starts over. `fix()` migrates older saved data.
- **Streaks and achievements.** `k.streak = {n, best, last}` counts days in a row with at least one finished game (`celebrate(k)` runs on every results screen). `k.ach[id]` holds the day each achievement in `ACH` was earned; each pays `ACH_COINS`. Only append to `ACH` or add new ids, since saved ids must keep their meaning. Tap the flame in the top bar for the badges screen.
- **Music.** `SONGS` entries are melodies in `NOTE+OCTAVE:beats` form. Kids' unlocked songs are saved as **positions** in `SONGS`, so only ever append new songs. Unlocked songs play on shuffle (`nextSong`).
- **Saving.** Everything lives in localStorage. Inside Claude, a `db` capability also syncs each kid as their own document. Keep new kid fields JSON-serializable, and give them defaults in `fix()`.
- Only public-domain texts and tunes are allowed.

## Shipping changes

Work on a branch, commit, push, and open a pull request against `main`. Merge only when the user asks. After a merge, GitHub Pages republishes in about a minute: check `gh api repos/catechism-quest/catechism-quest.github.io/pages/builds/latest`.
