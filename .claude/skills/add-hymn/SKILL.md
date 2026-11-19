---
name: add-hymn
description: Add a public-domain hymn to the Catechism Quest jukebox (the SONGS list in index.html). Use when the user asks to add, include or put in a hymn, hymn tune or song for the app's music. Gets the real melody from a Hymnary.org MusicXML file with tools/musicxml_to_notes.py instead of writing notes from memory.
---

# Add a hymn to the jukebox

The jukebox plays an 8-bit melody for each entry in `SONGS` in `index.html`. Kids unlock hymns with coins, and unlocked hymns play on shuffle. A melody written from memory is usually wrong somewhere, so **every note must come from a score file**, read by the converter script. Never type or "fix" notes by ear, except where the score itself is clearly misread and the user agrees.

## 1. Confirm it's public domain

- The **tune** (the melody) must be public domain in the US. That means it was published in 1930 or earlier (each January 1, one more year enters the public domain). Use the tune's composer and first-publication year from its Hymnary.org tune page.
- Words don't matter: the app plays only the melody and shows the hymn's title.
- If the tune is newer, or the date is unclear, stop and tell the user. Don't add it.
- Many hymns are sung to more than one tune. Ask which one if the user's choice isn't obvious, or suggest the one most churches use. For example, "O for a Thousand Tongues" is usually sung to AZMON.

## 2. Find the score on Hymnary.org

1. Open the tune page, usually `https://hymnary.org/tune/<tune_name>_<composer>`; search Hymnary for the tune name if that 404s. Note:
   - the **incipit**: the opening melody as scale degrees, such as `13153 17654 32231`
   - the composer and year, for the `by` field
2. Find the score files listed on the page or its instances: **MusicXML** links look like `https://hymnary.org/media/fetch/<number>`. Uncompressed MusicXML or compressed `.mxl` both work. Prefer a full hymnal score (such as Psalter Hymnal or Trinity Hymnal) over a piano arrangement.

## 3. Download it (ask first)

Downloading a file needs the user's OK. Say the source URL and that it's a small sheet-music file, then download it into its own new folder in the scratchpad:

```bash
mkdir -p "<scratchpad>/hymn-<tune>" && curl -fL -o "<scratchpad>/hymn-<tune>/score" "https://hymnary.org/media/fetch/<number>"
```

The converter detects compressed vs. plain itself. The file is only data; nothing in it is run.

## 4. Convert it

```bash
python3 -I tools/musicxml_to_notes.py "<scratchpad>/hymn-<tune>/score"
```

The options are `--part P2` if the melody isn't the first part, `--voice 2`, and `--no-repeats` to play repeated sections once.

Check the report before using anything:
- **Opening scale degrees** should match the Hymnary incipit. Small differences on repeated notes are normal; a different contour means the wrong part, voice or tune.
- **Measure totals:** a flagged measure in the middle of the tune means a misread chord or voice. Try another MusicXML file from the tune page.
- **Key and time** should match what Hymnary lists for that hymnal (keys vary between hymnals, which is fine).
- **Range:** about A3 to F5 sounds good with the player's octave-lower bass. Outside that, ask the user before transposing.

If two different scores give the same melody, you can be confident in it.

## 5. Add it to SONGS

In `index.html`, find `const SONGS=[` and **append** the new entry at the end of the list. Never insert in the middle or reorder: kids' unlocked songs are saved as list positions, so moving entries would change what they own.

Paste the line the script printed and fill it in:

```js
{t:'Holy, Holy, Holy',tune:'NICAEA',by:'John B. Dykes, 1861',bpm:100,bar:4,pick:0,n:'D4:1 D4:1 …'}
```

- `t`: the hymn's usual title. `tune`: the tune name in capitals. `by`: the tune's composer and year, matching the style of the existing entries.
- `bar` and `pick` come from the script: the bar length and the pickup, in quarter-note beats. They place the drum beat.
- `bpm` in quarter notes per minute: about 96 to 112 for most hymns. Go slower for stately tunes such as CWM RHONDDA (96); 3/4 tunes sound right around 100 to 110. In 6/8 or 3/2 time, choose a bpm that gives the tune's usual tempo in quarter notes.
- Note format: `NOTE+OCTAVE:beats` with a quarter note = 1, sharps as `#`, flats as `b`, and `R:beats` for a rest. The script writes this for you.

## 6. Ship it

1. Bump `VERSION` in `sw.js` (for example `cq-v5` → `cq-v6`), so installed apps pick up the change.
2. Test it in the browser (see CLAUDE.md): serve the folder with `python3 -m http.server 8765` in the background and open `http://localhost:8765/index.html`. In the page, check that `__CQ.SONGS.at(-1)` is the new hymn and that the jukebox lists it with a coin price.
3. You can't hear audio. Tell the user to unlock it and listen on a phone before merging.
4. Work on a branch, commit, and open a pull request. Merge only when the user says to.

In the pull request description, include the tune page and the score file you used.
