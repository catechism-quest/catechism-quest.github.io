#!/usr/bin/env python3
"""Turn a hymn's MusicXML file into a melody line for the Catechism Quest jukebox.

Usage:
    python3 -I tools/musicxml_to_notes.py TUNE.musicxml [--part P1] [--voice 1] [--no-repeats]

Reads plain MusicXML (.xml/.musicxml) or compressed MusicXML (.mxl). The melody is the
top note of the chosen part and voice (the soprano, in a hymnal score). It prints:
  * the key, time signature, pickup and per-measure beat totals, so you can spot a bad read;
  * the opening as scale degrees, to compare with the "incipit" on the tune's Hymnary.org page;
  * a ready-to-paste SONGS entry: n is "NOTE+OCTAVE:beats" with quarter = 1, R for a rest.

Only the standard library is used. The file is data: nothing in it is run.
"""
import argparse
import sys
import xml.etree.ElementTree as ET
import zipfile
from fractions import Fraction

STEP = {'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11}
DEGREE = {0: '1', 2: '2', 4: '3', 5: '4', 7: '5', 9: '6', 11: '7'}


def strip_ns(root):
    for el in root.iter():
        if isinstance(el.tag, str) and '}' in el.tag:
            el.tag = el.tag.split('}', 1)[1]
    return root


def load(path):
    if zipfile.is_zipfile(path):
        with zipfile.ZipFile(path) as z:
            names = z.namelist()
            target = None
            if 'META-INF/container.xml' in names:
                c = strip_ns(ET.fromstring(z.read('META-INF/container.xml')))
                rf = c.find('.//rootfile')
                if rf is not None:
                    target = rf.get('full-path')
            if not target:
                target = next(n for n in names if n.endswith(('.xml', '.musicxml')) and not n.startswith('META-INF'))
            data = z.read(target)
    else:
        with open(path, 'rb') as f:
            data = f.read()
    root = strip_ns(ET.fromstring(data))
    if root.tag != 'score-partwise':
        sys.exit(f'Expected a <score-partwise> MusicXML score, found <{root.tag}>.')
    return root


def name_of(midi):
    names = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']
    return f'{names[midi % 12]}{midi // 12 - 1}'


def spell(step, alter, octave):
    """Keep the file's spelling (Db vs C#) when it uses a single sharp or flat."""
    acc = {1: '#', -1: 'b'}.get(alter)
    if acc is not None or alter == 0:
        return f'{step}{acc or ""}{octave}'
    return name_of(12 * (octave + 1) + STEP[step] + alter)


def fmt(beats):
    s = f'{float(beats):.4f}'.rstrip('0').rstrip('.')
    return s[1:] if s.startswith('0.') else s


def expand_repeats(measures):
    """Play |: … :| sections twice and skip first endings on the second time through."""
    out, i, start, done, second, in_first = [], 0, 0, set(), False, False
    while i < len(measures):
        m = measures[i]
        if m['fwd'] and not (second and i == start):
            start, second = i, False
        if m['ending']:
            in_first = '1' in m['ending'].replace(' ', '').split(',')
        skip = second and in_first
        if not skip:
            out.append(m)
        if m['ending_end']:
            in_first = False
        if m['back'] and i not in done and not skip:
            done.add(i)
            i, second, in_first = start, True, False
            continue
        i += 1
    return out


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('file')
    ap.add_argument('--part', help='part id (default: the first part)')
    ap.add_argument('--voice', default='1', help='voice number (default: 1)')
    ap.add_argument('--no-repeats', action='store_true', help='play repeated sections once')
    a = ap.parse_args()

    root = load(a.file)
    parts = root.findall('part')
    if not parts:
        sys.exit('No <part> in this score.')
    part = next((p for p in parts if p.get('id') == a.part), None) if a.part else parts[0]
    if part is None:
        sys.exit(f'No part {a.part}; parts are: ' + ', '.join(p.get('id') for p in parts))

    divisions, fifths, mode, beats, beat_type = 1, 0, 'major', 4, 4
    measures = []
    for mx in part.findall('measure'):
        m = {'num': mx.get('number'), 'events': [], 'fwd': False, 'back': False, 'ending': None, 'ending_end': False, 'implicit': mx.get('implicit') == 'yes'}
        for el in mx:
            if el.tag == 'attributes':
                if el.findtext('divisions'):
                    divisions = int(el.findtext('divisions'))
                if el.find('key') is not None and el.findtext('key/fifths') is not None:
                    fifths = int(el.findtext('key/fifths'))
                    mode = (el.findtext('key/mode') or 'major').lower()
                if el.find('time') is not None and el.findtext('time/beats'):
                    beats, beat_type = int(el.findtext('time/beats').split('+')[0]), int(el.findtext('time/beat-type'))
            elif el.tag == 'barline':
                r = el.find('repeat')
                if r is not None:
                    m['fwd'] |= r.get('direction') == 'forward'
                    m['back'] |= r.get('direction') == 'backward'
                e = el.find('ending')
                if e is not None and e.get('type') == 'start':
                    m['ending'] = e.get('number')
                if e is not None and e.get('type') in ('stop', 'discontinue'):
                    m['ending_end'] = True
            elif el.tag == 'forward':
                if (el.findtext('voice') or a.voice) == a.voice:
                    m['events'].append({'rest': True, 'q': Fraction(int(el.findtext('duration')), divisions), 'gap': True})
            elif el.tag == 'note':
                if el.find('grace') is not None or el.find('cue') is not None:
                    continue
                if (el.findtext('voice') or '1') != a.voice:
                    continue
                q = Fraction(int(el.findtext('duration') or 0), divisions)
                ties = {t.get('type') for t in el.findall('tie')}
                if el.find('rest') is not None:
                    ev = {'rest': True, 'q': q}
                else:
                    step, octave = el.findtext('pitch/step'), int(el.findtext('pitch/octave'))
                    alter = int(float(el.findtext('pitch/alter') or 0))
                    midi = 12 * (octave + 1) + STEP[step] + alter
                    ev = {'rest': False, 'q': q, 'midi': midi, 'name': spell(step, alter, octave), 'ties': ties}
                if el.find('chord') is not None and m['events'] and not ev['rest'] and not m['events'][-1]['rest']:
                    prev = m['events'][-1]
                    if ev['midi'] > prev['midi']:   # a chord: keep its highest note
                        ev['q'] = prev['q']
                        m['events'][-1] = ev
                    continue
                m['events'].append(ev)
        m['divisions'], m['bar'] = divisions, Fraction(beats * 4, beat_type)
        measures.append(m)

    if not a.no_repeats:
        measures = expand_repeats(measures)

    notes = []
    for m in measures:
        for ev in m['events']:
            last = notes[-1] if notes else None
            if last and not ev['rest'] and not last['rest'] and 'start' in last.get('ties', set()) and last['midi'] == ev['midi']:
                last['q'] += ev['q']          # tied into this note: one longer note
                last['ties'] = ev['ties']
                continue
            if last and ev['rest'] and last['rest']:
                last['q'] += ev['q']
                continue
            notes.append(dict(ev))
    while notes and notes[-1]['rest']:
        notes.pop()                            # the player already adds a pause between hymns
    while notes and notes[0]['rest']:
        notes.pop(0)

    bar = Fraction(beats * 4, beat_type)
    sums = [sum((e['q'] for e in m['events']), Fraction(0)) for m in measures]
    pick = sums[0] if sums and sums[0] < bar else Fraction(0)
    total = sum((n['q'] for n in notes), Fraction(0))
    tonic = (fifths * 7 + (9 if mode == 'minor' else 0)) % 12
    key_names = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']
    degrees = ''.join(DEGREE.get((n['midi'] - tonic) % 12, '?') for n in notes if not n['rest'])[:15]

    print(f'Part {part.get("id")}, voice {a.voice}')
    print(f'Key: {key_names[tonic]} {mode} ({fifths:+d} fifths)   Time: {beats}/{beat_type}   bar={fmt(bar)} quarter beats')
    print(f'Pickup: {fmt(pick)} beats' if pick else 'Pickup: none')
    print(f'Measures: {len(measures)} (after repeats)' if not a.no_repeats else f'Measures: {len(measures)}')
    # A bar split across two lines shows up as two short measures that add up to one full bar.
    flags, j = [False] * len(sums), 0
    while j < len(sums):
        if sums[j] != bar:
            if j + 1 < len(sums) and sums[j] < bar and sums[j] + sums[j + 1] == bar and not (j == 0 and pick):
                j += 2
                continue
            flags[j] = True
        j += 1
    odd = [(m['num'], fmt(s)) for m, s, f in zip(measures, sums, flags) if f]
    edge = {measures[0]['num'], measures[-1]['num']}
    inner = [x for x in odd if x[0] not in edge]
    print('Measure beat totals: all full' if not odd else 'Measures that are not a full bar (first/last are often a pickup and its partner): ' + ', '.join(f'm{n}={b}' for n, b in odd))
    if inner:
        print('  ! Check these: a short or long measure in the middle usually means a misread voice or chord.')
    print(f'Total: {fmt(total)} beats, {len([n for n in notes if not n["rest"]])} notes')
    print(f'Opening scale degrees: {degrees}   (compare with the Hymnary.org incipit)')
    hi, lo = max(n['midi'] for n in notes if not n['rest']), min(n['midi'] for n in notes if not n['rest'])
    print(f'Range: {name_of(lo)} to {name_of(hi)}')
    n_str = ' '.join(f'{"R" if n["rest"] else n["name"]}:{fmt(n["q"])}' for n in notes)
    print()
    print(f"{{t:'TITLE',tune:'TUNE NAME',by:'COMPOSER, YEAR',bpm:100,bar:{fmt(bar)},pick:{fmt(pick) or 0},n:'{n_str}'}}")


if __name__ == '__main__':
    main()
