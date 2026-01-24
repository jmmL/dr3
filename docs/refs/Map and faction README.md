# Divine Right Game Data Exports

This directory contains JSON exports of the Divine Right game data, including map hexes and faction information.

## Files

### `hexmap.json` (138 KB)
Complete map hex data (1,070 hexes from the Divine Right 25th Anniversary Edition map).

**Structure:**
```json
{
  "version": "1.0.0",
  "exportDate": "ISO timestamp",
  "map": {
    "cols": 35,
    "rows": 31,
    "hexes": [ ... ]
  }
}
```

**Hex Properties:**
Each hex includes only the properties that are present:
- `col`, `row` - Coordinates (always present)
- `name` - Optional: Castle or scenic location name
- `terrain` - Optional object with terrain types (only includes present terrain):
  - `clear` - Clear/open terrain
  - `forest`, `hill`, `mountain`, `pass`, `swamp`
  - `minorRiver` - Non-navigable river
  - `majorRiver` - Navigable river
  - `lake`, `lakeshore`, `sea`, `seashore`
  - `castle`, `port`, `scenic`, `ancientBattlefield`, `royal`
- `kingdom` - Optional: Controlling faction ID
- `intrinsic` - Optional: Castle defense value (1-6)

**Example Hexes:**
```json
{
  "col": 0,
  "row": 0,
  "terrain": { "forest": true },
  "kingdom": "neuth"
}
```

```json
{
  "col": 2,
  "row": 1,
  "name": "Aws Noir",
  "terrain": { "castle": true },
  "kingdom": "ghem",
  "intrinsic": 4
}
```

### `factions.json` (8.6 KB)
Faction data for all 11 player-selectable factions.

**Structure:**
```json
{
  "version": "1.0.0",
  "exportDate": "ISO timestamp",
  "factions": [ ... ]
}
```

**Faction Properties:**
- `id` - Faction identifier (matches kingdom ID)
- `name` - Display name
- `race` - Human, Elves, Dwarves, Goblins, or Trolls
- `coatOfArms` - Emoji representation
- `capitalName` - Capital city name
- `capitalId` - Capital identifier
- `color` - Hex color code
- `cities` - Array of city objects:
  - `name`, `col`, `row` - City location
  - `armies` - Starting armies
  - `seaFleet` - Optional: Starting sea fleet
  - `isCapital` - Optional: true if this is the capital
- `totalArmies`, `totalSeaFleets`, - Calculated totals

**Factions Included:**
- Hothior (Human) - Red (#FE0000)
- Mivior (Human) - Pink (#F8A0D2)
- Muetar (Human) - Yellow (#FFFF19)
- Shucassam (Human) - Orange (#F4AC48)
- Immer (Human) - Purple (#BD9FF7)
- Pon (Human) - Blue (#1EA5FF)
- Rombune (Human) - Magenta (#E52E96)
- Neuth (Elves) - Green (#30C44C)
- Zorn (Goblins) - Teal (#7AB5A1)
- Ghem (Dwarves) - Gray (#ACACAC)
- Trolls (Trolls) - Brown (#A86051)

**Note:** Troll faction cities use Divine Right 3rd Edition naming:
- "Stone Face" (capital at 6,13)
- "The Gathering" (at 33,21)
- "The Crag" (at 27,2)
- "The Shunned Vale" (at 17,28)

## Format Features

**Minimal JSON:**
- Only includes properties that are present (no `null` or `false` values)
- Terrain is an object with only present terrain types
- Significantly smaller file size (146 KB total vs. previous 1.4 MB)
