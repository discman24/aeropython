export const stagesPart2 = [
  // ── REGION 4 — Approach Control (ids 36-40) ─────────────────────────────────

  {
    id: 36,
    regionId: 4,
    regionStage: 6,
    title: "Variable Payload",
    subtitle: "*args — Variable Positional Arguments",
    briefing:
      "Approach Control: your aircraft can carry any number of cargo units. Define a function that accepts any quantity of values and sums them all — no fixed manifest required.",
    concept: "*args",
    lesson:
      "Sometimes you don't know how many arguments a function will receive. Prefix the parameter name with `*` and Python packs all extra positional arguments into a **tuple**.\n\n```python\ndef add_all(*nums):\n    return sum(nums)\n\nprint(add_all(10, 20, 30))  # 60\nprint(add_all(5))           # 5\n```\n\nInside the function, `nums` is just a regular tuple you can loop over with `for n in nums`. The `*` only appears in the **definition**, not when you call the function.\n\nCombine fixed and variable params like `def log(label, *values)` — fixed params come first, then `*args` catches the rest.",
    starterCode:
      "# Define add_all so it accepts any number of fuel loads and returns their total\ndef add_all(*nums):\n    # hint: use sum() on the nums tuple\n    pass\n\nprint(add_all(100, 200, 300))\nprint(add_all(50, 75))\n",
    solution:
      "def add_all(*nums):\n    return sum(nums)\n\nprint(add_all(100, 200, 300))\nprint(add_all(50, 75))\n",
    tests: [
      { description: "add_all(100, 200, 300) prints 600", expectedOutput: "600" },
      { description: "add_all(50, 75) prints 125", expectedOutput: "125" },
    ],
    hint: "Inside the function, `nums` is a tuple — `sum(nums)` adds them all up in one shot.",
    xp: 100,
    isMilestone: false,
  },

  {
    id: 37,
    regionId: 4,
    regionStage: 7,
    title: "Flight Plan Keywords",
    subtitle: "**kwargs — Variable Keyword Arguments",
    briefing:
      "Dispatch sends flight info using named fields — callsign, altitude, heading. Your function must accept any combination of named data and print each field clearly.",
    concept: "**kwargs",
    lesson:
      "Use `**kwargs` (double-star) when you want to accept any number of **named** arguments. Python collects them into a **dict**.\n\n```python\ndef describe_flight(**info):\n    for key, value in info.items():\n        print(f\"{key}: {value}\")\n\ndescribe_flight(callsign=\"SQ321\", altitude=35000, heading=270)\n# callsign: SQ321\n# altitude: 35000\n# heading: 270\n```\n\nLoop over `info.items()` to access each key-value pair — identical to a normal dict. You can mix fixed params, `*args`, and `**kwargs` in one function: `def f(a, *args, **kwargs)` — that order is mandatory.",
    starterCode:
      "# Define describe_flight to accept any named flight data and print each field\ndef describe_flight(**info):\n    # loop over info.items() and print \"key: value\" for each\n    pass\n\ndescribe_flight(callsign=\"SQ321\", altitude=35000)\n",
    solution:
      "def describe_flight(**info):\n    for key, value in info.items():\n        print(f\"{key}: {value}\")\n\ndescribe_flight(callsign=\"SQ321\", altitude=35000)\n",
    tests: [
      { description: "prints callsign: SQ321", expectedOutput: "callsign: SQ321" },
      { description: "prints altitude: 35000", expectedOutput: "altitude: 35000" },
    ],
    hint: "`info` is a plain dict inside the function — iterate with `for key, value in info.items()`.",
    xp: 100,
    isMilestone: false,
  },

  {
    id: 38,
    regionId: 4,
    regionStage: 8,
    title: "Nav Computer",
    subtitle: "The math Module",
    briefing:
      "Your FMS needs precise calculations — great-circle distances use square roots and pi. Import Python's built-in `math` module to access these navigation-grade tools.",
    concept: "import math",
    lesson:
      "Python's `math` module provides mathematical constants and functions. Import it with `import math`.\n\nKey tools:\n- `math.sqrt(x)` — square root, e.g. `math.sqrt(144)` returns `12.0`\n- `math.pi` — the constant pi (approx 3.14159)\n- `math.floor(x)` — round **down** to nearest integer\n- `math.ceil(x)` — round **up**\n- `math.radians(deg)` / `math.degrees(rad)` — angle conversion\n\n```python\nimport math\nprint(math.sqrt(225))    # 15.0\nprint(math.floor(3.9))   # 3\nprint(round(math.pi, 2)) # 3.14\n```\n\nUse `math.floor` when you need a conservative (never overshoot) integer result — handy for fuel-block calculations.",
    starterCode:
      "import math\n\n# Print the square root of 225\nprint(math.sqrt(225))\n\n# Print math.pi rounded to 2 decimal places\nprint(round(math.pi, 2))\n\n# Print math.floor of 7.8 (should be 7)\nprint(math.floor(7.8))\n",
    solution:
      "import math\n\nprint(math.sqrt(225))\nprint(round(math.pi, 2))\nprint(math.floor(7.8))\n",
    tests: [
      { description: "math.sqrt(225) prints 15.0", expectedOutput: "15.0" },
      { description: "math.floor(7.8) prints 7", expectedOutput: "7" },
    ],
    hint: "`math.sqrt` always returns a float, so `math.sqrt(225)` gives `15.0` not `15`.",
    xp: 100,
    isMilestone: false,
  },

  {
    id: 39,
    regionId: 4,
    regionStage: 9,
    title: "Function Relay",
    subtitle: "Functions Calling Functions",
    briefing:
      "Converting airspeed requires chaining conversions — knots to m/s, then m/s to Mach. Build two functions where the outer one calls the inner one to complete the relay.",
    concept: "function composition",
    lesson:
      "Functions can call other functions — this is called **composition** and keeps each function small and testable.\n\n```python\ndef knots_to_ms(knots):\n    return knots * 0.514444\n\ndef convert_to_mach(knots, speed_of_sound=340):\n    ms = knots_to_ms(knots)       # call the helper\n    return round(ms / speed_of_sound, 2)\n\nprint(convert_to_mach(661))  # roughly Mach 1\n```\n\nThe outer function delegates part of its work to the inner one. Each function stays focused on one job — the **single responsibility** principle. You can also pass functions as arguments: `apply(fn, value)` calls `fn(value)` inside.",
    starterCode:
      "# Helper: convert knots to metres per second\ndef knots_to_ms(knots):\n    return knots * 0.514444\n\n# Outer: convert knots to Mach by calling knots_to_ms\ndef convert_to_mach(knots, speed_of_sound=340):\n    ms = knots_to_ms(knots)\n    return round(ms / speed_of_sound, 2)\n\nprint(convert_to_mach(340))\n",
    solution:
      "def knots_to_ms(knots):\n    return knots * 0.514444\n\ndef convert_to_mach(knots, speed_of_sound=340):\n    ms = knots_to_ms(knots)\n    return round(ms / speed_of_sound, 2)\n\nprint(convert_to_mach(340))\n",
    tests: [
      { description: "convert_to_mach(340) prints approximately 0.51", expectedOutput: "0.51" },
    ],
    hint: "Call `knots_to_ms(knots)` inside `convert_to_mach` to get m/s, then divide by `speed_of_sound`.",
    xp: 100,
    isMilestone: false,
  },

  {
    id: 40,
    regionId: 4,
    regionStage: 10,
    title: "Clearance Authority",
    subtitle: "MILESTONE — Scope & the global Keyword",
    briefing:
      "MILESTONE: Approach clears you to land. Variables in the cockpit (local) don't automatically reach the tower (global). Demonstrate that you control which scope a variable lives in — and when to cross the boundary.",
    concept: "local vs global scope",
    lesson:
      "Every function has its own **local scope** — variables created inside do not exist outside. The enclosing module has a **global scope**.\n\n```python\naltitude = 35000  # global\n\ndef descend():\n    altitude = 10000  # local copy — does NOT change global\n    print(altitude)   # 10000\n\ndescend()\nprint(altitude)  # still 35000\n```\n\nTo **modify** a global variable inside a function, declare it with `global`:\n\n```python\ndef emergency_descent():\n    global altitude\n    altitude = 0\n    print(\"Descending to\", altitude)\n\nemergency_descent()\nprint(altitude)  # 0 — global was changed\n```\n\nUse `global` sparingly — it creates hidden coupling. Prefer returning values and reassigning at the call site when possible.",
    starterCode:
      "altitude = 35000  # global variable\n\ndef descend():\n    # local altitude — does NOT affect the global\n    altitude = 10000\n    print(\"Local altitude:\", altitude)\n\ndef emergency_descent():\n    global altitude\n    altitude = 0\n    print(\"Emergency altitude:\", altitude)\n\ndescend()\nprint(\"Global after descend:\", altitude)\nemergency_descent()\nprint(\"Global after emergency:\", altitude)\n",
    solution:
      "altitude = 35000\n\ndef descend():\n    altitude = 10000\n    print(\"Local altitude:\", altitude)\n\ndef emergency_descent():\n    global altitude\n    altitude = 0\n    print(\"Emergency altitude:\", altitude)\n\ndescend()\nprint(\"Global after descend:\", altitude)\nemergency_descent()\nprint(\"Global after emergency:\", altitude)\n",
    tests: [
      { description: "global stays 35000 after local descend()", expectedOutput: "Global after descend: 35000" },
      { description: "global becomes 0 after emergency_descent()", expectedOutput: "Global after emergency: 0" },
    ],
    hint: "Without the `global` keyword, assigning inside a function creates a brand-new local variable — the global is untouched.",
    xp: 500,
    isMilestone: true,
  },

  // ── REGION 5 — Navigation Suite (ids 41-50) ──────────────────────────────────

  {
    id: 41,
    regionId: 5,
    regionStage: 1,
    title: "Waypoint List",
    subtitle: "Lists — Basics",
    briefing:
      "Navigation Suite online. Your flight plan is a list of waypoints. Learn to create a list, access items by index, and append new waypoints as ATC issues amendments.",
    concept: "list basics",
    lesson:
      "A **list** is an ordered, mutable sequence. Create one with square brackets:\n\n```python\nwaypoints = [\"IGARI\", \"VAMPI\", \"MEKAR\"]\n```\n\nAccess items by **zero-based index**: `waypoints[0]` returns `\"IGARI\"`. Negative indices count from the end: `waypoints[-1]` returns `\"MEKAR\"`.\n\nAdd items with `append()`:\n```python\nwaypoints.append(\"NILAM\")\nprint(len(waypoints))  # 4\n```\n\nCheck membership with `in`: `\"VAMPI\" in waypoints` returns `True`.",
    starterCode:
      "waypoints = [\"IGARI\", \"VAMPI\", \"MEKAR\"]\n\n# Print the first waypoint\nprint(waypoints[0])\n\n# Append \"NILAM\" to the list\nwaypoints.append(\"NILAM\")\n\n# Print the length of the list\nprint(len(waypoints))\n",
    solution:
      "waypoints = [\"IGARI\", \"VAMPI\", \"MEKAR\"]\n\nprint(waypoints[0])\nwaypoints.append(\"NILAM\")\nprint(len(waypoints))\n",
    tests: [
      { description: "first waypoint is IGARI", expectedOutput: "IGARI" },
      { description: "length after append is 4", expectedOutput: "4" },
    ],
    hint: "Index `[0]` gets the first item. After `append`, the list has one more element so `len()` increases by 1.",
    xp: 100,
    isMilestone: false,
  },

  {
    id: 42,
    regionId: 5,
    regionStage: 2,
    title: "Sequence Management",
    subtitle: "List Methods",
    briefing:
      "ATC resequences your waypoints — you need to sort, reverse, and remove entries on the fly. Master the essential list methods to keep your route current.",
    concept: "sort, reverse, pop, insert",
    lesson:
      "Lists come with powerful built-in methods:\n\n- `list.sort()` — sorts **in place** (modifies original)\n- `list.reverse()` — reverses **in place**\n- `list.pop()` — removes and returns the **last** item; `pop(i)` removes index `i`\n- `list.insert(i, val)` — inserts `val` before index `i`\n\n```python\naltitudes = [350, 100, 250, 150]\naltitudes.sort()\nprint(altitudes)  # [100, 150, 250, 350]\n\naltitudes.insert(0, 50)\nprint(altitudes[0])  # 50\n\nremoved = altitudes.pop()\nprint(removed)  # 350\n```\n\n`sorted(list)` returns a **new** sorted list without changing the original — use it when you need to preserve order.",
    starterCode:
      "altitudes = [350, 100, 250, 150]\n\n# Sort the list in place\naltitudes.sort()\nprint(altitudes[0])  # lowest altitude first\n\n# Insert 50 at index 0\naltitudes.insert(0, 50)\nprint(altitudes[0])  # should be 50\n\n# Pop the last element and print it\nremoved = altitudes.pop()\nprint(removed)\n",
    solution:
      "altitudes = [350, 100, 250, 150]\n\naltitudes.sort()\nprint(altitudes[0])\n\naltitudes.insert(0, 50)\nprint(altitudes[0])\n\nremoved = altitudes.pop()\nprint(removed)\n",
    tests: [
      { description: "sorted first element is 100", expectedOutput: "100" },
      { description: "after insert, index 0 is 50", expectedOutput: "50" },
    ],
    hint: "`sort()` modifies the list in place — the smallest value ends up at index 0 after sorting ascending.",
    xp: 100,
    isMilestone: false,
  },

  {
    id: 43,
    regionId: 5,
    regionStage: 3,
    title: "Aircraft Registry",
    subtitle: "Dict Basics",
    briefing:
      "The aircraft registry maps callsigns to aircraft types. Dictionaries let you look up any registration in O(1) time — no sequential search required.",
    concept: "dict basics",
    lesson:
      "A **dict** stores key-value pairs. Keys are unique; values can be anything.\n\n```python\naircraft = {\"SQ321\": \"B777\", \"SQ22\": \"A350\"}\n```\n\nAccess values by key: `aircraft[\"SQ321\"]` returns `\"B777\"`. Add or update: `aircraft[\"SQ841\"] = \"B787\"`.\n\nCheck for a key with `in`: `\"SQ22\" in aircraft` returns `True`.\n\n```python\naircraft[\"SQ841\"] = \"B787\"\nprint(aircraft[\"SQ841\"])  # B787\nprint(len(aircraft))       # 3\n```\n\nAccessing a missing key raises `KeyError` — use `.get(key)` to return `None` safely instead.",
    starterCode:
      "aircraft = {\"SQ321\": \"B777\", \"SQ22\": \"A350\"}\n\n# Access the type for SQ321\nprint(aircraft[\"SQ321\"])\n\n# Add a new entry: SQ841 -> B787\naircraft[\"SQ841\"] = \"B787\"\nprint(aircraft[\"SQ841\"])\n\n# Print total number of entries\nprint(len(aircraft))\n",
    solution:
      "aircraft = {\"SQ321\": \"B777\", \"SQ22\": \"A350\"}\n\nprint(aircraft[\"SQ321\"])\naircraft[\"SQ841\"] = \"B787\"\nprint(aircraft[\"SQ841\"])\nprint(len(aircraft))\n",
    tests: [
      { description: "SQ321 maps to B777", expectedOutput: "B777" },
      { description: "new entry SQ841 maps to B787", expectedOutput: "B787" },
    ],
    hint: "Assign a new key with `dict[new_key] = value` — Python creates the entry if it doesn't exist.",
    xp: 100,
    isMilestone: false,
  },

  {
    id: 44,
    regionId: 5,
    regionStage: 4,
    title: "Manifest Query",
    subtitle: "Dict Methods",
    briefing:
      "Ground ops needs to query the cargo manifest by keys, values, and pairs. Learn the dict methods that give you each view of the data without looping manually.",
    concept: ".keys(), .values(), .items(), .get()",
    lesson:
      "Dicts expose three **view objects** and a safe accessor:\n\n- `d.keys()` — all keys\n- `d.values()` — all values\n- `d.items()` — all `(key, value)` pairs as tuples\n- `d.get(key, default)` — value or `default` if key missing\n\n```python\ncargo = {\"fuel\": 42000, \"bags\": 180, \"cargo\": 5000}\n\nfor item, qty in cargo.items():\n    print(f\"{item}: {qty}\")\n\nprint(cargo.get(\"mail\", 0))  # 0 — key not found\n```\n\nViews are **live** — they update if the dict changes. Convert to a list with `list(d.keys())` when you need a static snapshot.",
    starterCode:
      "cargo = {\"fuel\": 42000, \"bags\": 180, \"cargo\": 5000}\n\n# Loop over items and print \"key: value\"\nfor item, qty in cargo.items():\n    print(f\"{item}: {qty}\")\n\n# Use .get() for a key that doesn't exist\nprint(cargo.get(\"mail\", 0))\n",
    solution:
      "cargo = {\"fuel\": 42000, \"bags\": 180, \"cargo\": 5000}\n\nfor item, qty in cargo.items():\n    print(f\"{item}: {qty}\")\n\nprint(cargo.get(\"mail\", 0))\n",
    tests: [
      { description: "fuel entry prints fuel: 42000", expectedOutput: "fuel: 42000" },
      { description: ".get for missing key returns 0", expectedOutput: "0" },
    ],
    hint: "Unpack `(item, qty)` directly in the `for` loop header — no need to access by index.",
    xp: 100,
    isMilestone: false,
  },

  {
    id: 45,
    regionId: 5,
    regionStage: 5,
    title: "Flight Log Review",
    subtitle: "List of Dicts",
    briefing:
      "Each flight in today's log is a dict inside a list. Loop through the manifest and print only the callsign and destination for each record — dispatch needs the highlights, not the full block.",
    concept: "looping a list of dicts",
    lesson:
      "Real-world data often arrives as a **list of dicts** — think JSON from an API or a CSV parsed into records.\n\n```python\nflights = [\n    {\"callsign\": \"SQ321\", \"dest\": \"LHR\", \"pax\": 280},\n    {\"callsign\": \"SQ22\",  \"dest\": \"LAX\", \"pax\": 300},\n]\n\nfor flight in flights:\n    print(flight[\"callsign\"], \"->\", flight[\"dest\"])\n# SQ321 -> LHR\n# SQ22  -> LAX\n```\n\nEach `flight` in the loop is a regular dict — access fields with `flight[\"key\"]` or `flight.get(\"key\")`. Use a condition inside the loop to filter: `if flight[\"pax\"] > 290:` prints only the heavy flights.",
    starterCode:
      "flights = [\n    {\"callsign\": \"SQ321\", \"dest\": \"LHR\", \"pax\": 280},\n    {\"callsign\": \"SQ22\",  \"dest\": \"LAX\", \"pax\": 300},\n    {\"callsign\": \"SQ841\", \"dest\": \"FRA\", \"pax\": 250},\n]\n\n# Loop and print \"callsign -> dest\" for each flight\nfor flight in flights:\n    print(flight[\"callsign\"], \"->\", flight[\"dest\"])\n",
    solution:
      "flights = [\n    {\"callsign\": \"SQ321\", \"dest\": \"LHR\", \"pax\": 280},\n    {\"callsign\": \"SQ22\",  \"dest\": \"LAX\", \"pax\": 300},\n    {\"callsign\": \"SQ841\", \"dest\": \"FRA\", \"pax\": 250},\n]\n\nfor flight in flights:\n    print(flight[\"callsign\"], \"->\", flight[\"dest\"])\n",
    tests: [
      { description: "prints SQ321 -> LHR", expectedOutput: "SQ321 -> LHR" },
      { description: "prints SQ841 -> FRA", expectedOutput: "SQ841 -> FRA" },
    ],
    hint: "Access dict values inside the loop with `flight[\"callsign\"]` — each iteration gives you one dict.",
    xp: 100,
    isMilestone: false,
  },

  {
    id: 46,
    regionId: 5,
    regionStage: 6,
    title: "Active Transponders",
    subtitle: "Sets",
    briefing:
      "TCAS tracks unique transponder codes — no duplicates allowed. Sets automatically enforce uniqueness. Use set operations to find which codes are active on both frequencies.",
    concept: "set literals, add, union, intersection",
    lesson:
      "A **set** is an unordered collection of **unique** items.\n\n```python\ncodes_a = {7700, 7600, 1200}\ncodes_b = {1200, 2000, 7700}\n\ncodes_a.add(3000)             # add one item\ncodes_a.discard(9999)         # remove if present — no error if missing\n\nprint(codes_a | codes_b)      # union — all unique codes\nprint(codes_a & codes_b)      # intersection — codes in BOTH\nprint(codes_a - codes_b)      # difference — in a but not b\n```\n\nSets are great for membership tests (`x in my_set` is O(1)) and deduplication: `unique = list(set(dupes))`.",
    starterCode:
      "codes_a = {7700, 7600, 1200}\ncodes_b = {1200, 2000, 7700}\n\n# Add code 3000 to codes_a\ncodes_a.add(3000)\n\n# Print the intersection (codes in both)\nprint(codes_a & codes_b)\n",
    solution:
      "codes_a = {7700, 7600, 1200}\ncodes_b = {1200, 2000, 7700}\n\ncodes_a.add(3000)\nprint(codes_a & codes_b)\n",
    tests: [
      { description: "intersection contains 1200", expectedOutput: "1200" },
      { description: "intersection contains 7700", expectedOutput: "7700" },
    ],
    hint: "The `&` operator returns items present in **both** sets. Sets print without guaranteed order, but both values will appear.",
    xp: 100,
    isMilestone: false,
  },

  {
    id: 47,
    regionId: 5,
    regionStage: 7,
    title: "Fixed Coordinates",
    subtitle: "Tuples",
    briefing:
      "A waypoint's lat/lon are fixed — they never change once filed. Tuples enforce immutability. Unpack coordinates directly into named variables for clean, readable navigation code.",
    concept: "tuple creation, immutability, unpacking",
    lesson:
      "A **tuple** is like a list but **immutable** — you cannot change it after creation. Use parentheses (or just commas):\n\n```python\nposition = (1.3521, 103.8198)  # Singapore lat, lon\nlat, lon = position            # tuple unpacking\nprint(lat)   # 1.3521\nprint(lon)   # 103.8198\n```\n\nTuples are great for **fixed data** (coordinates, RGB colours) and **multiple return values**:\n\n```python\ndef get_position():\n    return 1.3521, 103.8198   # returns a tuple\n\nlat, lon = get_position()\n```\n\nAttempting `position[0] = 99` raises a `TypeError` — that immutability is the feature, not a bug.",
    starterCode:
      "# Singapore Changi Airport coordinates\nposition = (1.3521, 103.8198)\n\n# Unpack into lat and lon\nlat, lon = position\nprint(\"Lat:\", lat)\nprint(\"Lon:\", lon)\n\n# A function returning a tuple\ndef get_waypoint():\n    return \"IGARI\", 6.9667, 103.5833\n\nname, wlat, wlon = get_waypoint()\nprint(name)\n",
    solution:
      "position = (1.3521, 103.8198)\nlat, lon = position\nprint(\"Lat:\", lat)\nprint(\"Lon:\", lon)\n\ndef get_waypoint():\n    return \"IGARI\", 6.9667, 103.5833\n\nname, wlat, wlon = get_waypoint()\nprint(name)\n",
    tests: [
      { description: "lat prints Lat: 1.3521", expectedOutput: "Lat: 1.3521" },
      { description: "waypoint name prints IGARI", expectedOutput: "IGARI" },
    ],
    hint: "Tuple unpacking assigns each element to a variable in order — number of variables must match tuple length.",
    xp: 100,
    isMilestone: false,
  },

  {
    id: 48,
    regionId: 5,
    regionStage: 8,
    title: "Altitude Filter",
    subtitle: "List Comprehension",
    briefing:
      "TCAS returns a raw list of all aircraft altitudes. Use a list comprehension to filter and transform in a single compact expression — no boilerplate loops.",
    concept: "[expr for x in iterable if condition]",
    lesson:
      "A **list comprehension** creates a new list in one expression:\n\n```python\n[expression for item in iterable if condition]\n```\n\nExamples:\n```python\naltitudes = [350, 120, 410, 80, 290]\n\n# All altitudes above 200\nhigh = [a for a in altitudes if a > 200]\nprint(high)  # [350, 410, 290]\n\n# Convert to flight levels (divide by 100)\nfl = [a // 100 for a in altitudes]\nprint(fl)  # [3, 1, 4, 0, 2]\n```\n\nThe `if` clause is optional — leave it out to transform every item. List comprehensions run faster than equivalent `for` + `append` loops and are idiomatic Python.",
    starterCode:
      "altitudes = [350, 120, 410, 80, 290, 180]\n\n# List comprehension: altitudes above 200\nhigh = [a for a in altitudes if a > 200]\nprint(high)\n\n# List comprehension: convert to flight levels (divide by 100)\nfl = [a // 100 for a in altitudes]\nprint(fl)\n",
    solution:
      "altitudes = [350, 120, 410, 80, 290, 180]\n\nhigh = [a for a in altitudes if a > 200]\nprint(high)\n\nfl = [a // 100 for a in altitudes]\nprint(fl)\n",
    tests: [
      { description: "high list contains 350", expectedOutput: "350" },
      { description: "flight level list contains 4", expectedOutput: "4" },
    ],
    hint: "The `if` filter goes at the end of the comprehension: `[x for x in data if x > threshold]`.",
    xp: 100,
    isMilestone: false,
  },

  {
    id: 49,
    regionId: 5,
    regionStage: 9,
    title: "Frequency Map",
    subtitle: "Dict Comprehension",
    briefing:
      "Convert a list of (callsign, frequency) pairs into a lookup dict with a single expression. Dict comprehensions let you build mappings as concisely as list comprehensions.",
    concept: "{k: v for k, v in ...}",
    lesson:
      "A **dict comprehension** builds a dict from any iterable:\n\n```python\n{key_expr: val_expr for item in iterable}\n```\n\nExample — build a callsign-to-frequency map from a list of tuples:\n\n```python\npairs = [(\"SQ321\", 121.9), (\"SQ22\", 119.1), (\"SQ841\", 121.5)]\n\nfreq_map = {cs: freq for cs, freq in pairs}\nprint(freq_map[\"SQ321\"])  # 121.9\n```\n\nYou can also transform values on the fly:\n```python\n# Square all altitudes\nalt_sq = {k: v**2 for k, v in {\"A\": 3, \"B\": 4}.items()}\n# {'A': 9, 'B': 16}\n```\n\nAdd an `if` clause to filter: `{k: v for k, v in d.items() if v > 0}`.",
    starterCode:
      "pairs = [(\"SQ321\", 121.9), (\"SQ22\", 119.1), (\"SQ841\", 121.5)]\n\n# Build a dict from the list of tuples\nfreq_map = {cs: freq for cs, freq in pairs}\n\n# Print the frequency for SQ321\nprint(freq_map[\"SQ321\"])\n\n# Print all callsigns and frequencies\nfor cs, freq in freq_map.items():\n    print(f\"{cs}: {freq}\")\n",
    solution:
      "pairs = [(\"SQ321\", 121.9), (\"SQ22\", 119.1), (\"SQ841\", 121.5)]\n\nfreq_map = {cs: freq for cs, freq in pairs}\n\nprint(freq_map[\"SQ321\"])\n\nfor cs, freq in freq_map.items():\n    print(f\"{cs}: {freq}\")\n",
    tests: [
      { description: "SQ321 frequency is 121.9", expectedOutput: "121.9" },
      { description: "SQ841 entry prints SQ841: 121.5", expectedOutput: "SQ841: 121.5" },
    ],
    hint: "Unpack each tuple directly in the `for`: `{cs: freq for cs, freq in pairs}`.",
    xp: 100,
    isMilestone: false,
  },

  {
    id: 50,
    regionId: 5,
    regionStage: 10,
    title: "Navigation Master",
    subtitle: "MILESTONE — Combined Data Structures",
    briefing:
      "MILESTONE: Navigation Suite certified. Build a flight registry from raw tuples, store it in a dict, then print all entries sorted by callsign — the complete data pipeline.",
    concept: "dict from tuples, sorted output",
    lesson:
      "Combine everything: build a dict from a list of tuples using a dict comprehension, then iterate in **sorted** order.\n\n```python\nraw = [(\"SQ841\", \"FRA\"), (\"SQ22\", \"LAX\"), (\"SQ321\", \"LHR\")]\n\nregistry = {cs: dest for cs, dest in raw}\n\nfor cs in sorted(registry):\n    print(f\"{cs} -> {registry[cs]}\")\n# SQ22  -> LAX\n# SQ321 -> LHR\n# SQ841 -> FRA\n```\n\n`sorted(dict)` iterates keys in alphabetical order. For numeric sort use `key=`: `sorted(data, key=lambda x: x[1])`.\n\nThis pattern — raw data, dict, sorted output — appears constantly in aviation data processing, log analysis, and reporting.",
    starterCode:
      "raw = [(\"SQ841\", \"FRA\"), (\"SQ22\", \"LAX\"), (\"SQ321\", \"LHR\")]\n\n# Build registry dict from the list of tuples\nregistry = {cs: dest for cs, dest in raw}\n\n# Print each entry sorted by callsign\nfor cs in sorted(registry):\n    print(f\"{cs} -> {registry[cs]}\")\n",
    solution:
      "raw = [(\"SQ841\", \"FRA\"), (\"SQ22\", \"LAX\"), (\"SQ321\", \"LHR\")]\n\nregistry = {cs: dest for cs, dest in raw}\n\nfor cs in sorted(registry):\n    print(f\"{cs} -> {registry[cs]}\")\n",
    tests: [
      { description: "SQ22 appears first in sorted output", expectedOutput: "SQ22 -> LAX" },
      { description: "SQ841 appears last in sorted output", expectedOutput: "SQ841 -> FRA" },
    ],
    hint: "`sorted(registry)` sorts the **keys** alphabetically — then use each key to look up the value.",
    xp: 500,
    isMilestone: true,
  },

  // ── REGION 6 — IFR Procedures (ids 51-60) ────────────────────────────────────

  {
    id: 51,
    regionId: 6,
    regionStage: 1,
    title: "Aircraft Blueprint",
    subtitle: "Class + __init__",
    briefing:
      "IFR Procedures begin with the type rating. Every aircraft in the fleet shares a common blueprint — a class. Define the Aircraft class and initialise it with make and model.",
    concept: "class definition, __init__",
    lesson:
      "A **class** is a blueprint for creating objects. The `__init__` method runs when you create an instance:\n\n```python\nclass Aircraft:\n    def __init__(self, make, model):\n        self.make = make\n        self.model = model\n\na = Aircraft(\"Boeing\", \"777-300ER\")\nprint(a.make)   # Boeing\nprint(a.model)  # 777-300ER\n```\n\n`self` refers to the **instance** being created — always the first parameter of every method. Attributes set with `self.x = y` belong to that specific object, not the class.",
    starterCode:
      "class Aircraft:\n    def __init__(self, make, model):\n        self.make = make\n        self.model = model\n\n# Create an instance\na = Aircraft(\"Boeing\", \"777-300ER\")\nprint(a.make)\nprint(a.model)\n",
    solution:
      "class Aircraft:\n    def __init__(self, make, model):\n        self.make = make\n        self.model = model\n\na = Aircraft(\"Boeing\", \"777-300ER\")\nprint(a.make)\nprint(a.model)\n",
    tests: [
      { description: "make prints Boeing", expectedOutput: "Boeing" },
      { description: "model prints 777-300ER", expectedOutput: "777-300ER" },
    ],
    hint: "`self.make = make` stores the argument as an **instance attribute** accessible anywhere via `instance.make`.",
    xp: 100,
    isMilestone: false,
  },

  {
    id: 52,
    regionId: 6,
    regionStage: 2,
    title: "Aircraft Readout",
    subtitle: "Instance Methods",
    briefing:
      "Ground crew needs a formatted aircraft description on the ACARS printout. Add a `describe()` method to the Aircraft class that returns a formatted string.",
    concept: "instance methods, self",
    lesson:
      "Any function defined inside a class (with `self` as first parameter) is an **instance method**. It can read and modify the instance's attributes.\n\n```python\nclass Aircraft:\n    def __init__(self, make, model):\n        self.make = make\n        self.model = model\n\n    def describe(self):\n        return f\"{self.make} {self.model}\"\n\na = Aircraft(\"Airbus\", \"A350-900\")\nprint(a.describe())  # Airbus A350-900\n```\n\nMethods can also **modify** state: `self.fuel -= burn_rate`. They can call other methods on the same object: `self.check_fuel()`.",
    starterCode:
      "class Aircraft:\n    def __init__(self, make, model):\n        self.make = make\n        self.model = model\n\n    def describe(self):\n        # Return a string like \"Airbus A350-900\"\n        return f\"{self.make} {self.model}\"\n\na = Aircraft(\"Airbus\", \"A350-900\")\nprint(a.describe())\n",
    solution:
      "class Aircraft:\n    def __init__(self, make, model):\n        self.make = make\n        self.model = model\n\n    def describe(self):\n        return f\"{self.make} {self.model}\"\n\na = Aircraft(\"Airbus\", \"A350-900\")\nprint(a.describe())\n",
    tests: [
      { description: "describe() returns Airbus A350-900", expectedOutput: "Airbus A350-900" },
    ],
    hint: "Inside the method, access instance data with `self.make` and `self.model` — the same as in `__init__`.",
    xp: 100,
    isMilestone: false,
  },

  {
    id: 53,
    regionId: 6,
    regionStage: 3,
    title: "Type Rating",
    subtitle: "Inheritance",
    briefing:
      "An Airliner is a specialised Aircraft with passenger capacity. Use inheritance so Airliner automatically has everything Aircraft has, then add what's unique to the subtype.",
    concept: "class Subclass(Parent), super()",
    lesson:
      "**Inheritance** lets a child class reuse everything from a parent. Pass the parent in parentheses:\n\n```python\nclass Airliner(Aircraft):\n    def __init__(self, make, model, capacity):\n        super().__init__(make, model)  # call parent __init__\n        self.capacity = capacity\n\n    def describe(self):\n        base = super().describe()\n        return f\"{base} [{self.capacity} pax]\"\n\na = Airliner(\"Boeing\", \"777-300ER\", 396)\nprint(a.describe())  # Boeing 777-300ER [396 pax]\n```\n\n`super()` gives access to the **parent** class — call `super().__init__(...)` to run the parent's setup before adding child-specific attributes. Override any method by simply redefining it in the child.",
    starterCode:
      "class Aircraft:\n    def __init__(self, make, model):\n        self.make = make\n        self.model = model\n    def describe(self):\n        return f\"{self.make} {self.model}\"\n\nclass Airliner(Aircraft):\n    def __init__(self, make, model, capacity):\n        super().__init__(make, model)\n        self.capacity = capacity\n\n    def describe(self):\n        base = super().describe()\n        return f\"{base} [{self.capacity} pax]\"\n\na = Airliner(\"Boeing\", \"777-300ER\", 396)\nprint(a.describe())\n",
    solution:
      "class Aircraft:\n    def __init__(self, make, model):\n        self.make = make\n        self.model = model\n    def describe(self):\n        return f\"{self.make} {self.model}\"\n\nclass Airliner(Aircraft):\n    def __init__(self, make, model, capacity):\n        super().__init__(make, model)\n        self.capacity = capacity\n\n    def describe(self):\n        base = super().describe()\n        return f\"{base} [{self.capacity} pax]\"\n\na = Airliner(\"Boeing\", \"777-300ER\", 396)\nprint(a.describe())\n",
    tests: [
      { description: "describe includes 777-300ER and capacity", expectedOutput: "Boeing 777-300ER [396 pax]" },
    ],
    hint: "`super().__init__(make, model)` runs the parent's `__init__` so you don't need to repeat `self.make = make`.",
    xp: 100,
    isMilestone: false,
  },

  {
    id: 54,
    regionId: 6,
    regionStage: 4,
    title: "Speed Governor",
    subtitle: "Encapsulation — @property",
    briefing:
      "Airspeed must never be set below zero. Use a private attribute and a property with a setter to validate the value at the point of assignment — the aircraft enforces its own limits.",
    concept: "private attrs, @property, setter",
    lesson:
      "**Encapsulation** hides internal state. Prefix with `_` to signal 'private'. Use `@property` to expose a controlled getter and `@name.setter` for validated writes:\n\n```python\nclass Aircraft:\n    def __init__(self, speed):\n        self._speed = speed\n\n    @property\n    def speed(self):\n        return self._speed\n\n    @speed.setter\n    def speed(self, value):\n        if value < 0:\n            raise ValueError(\"Speed cannot be negative\")\n        self._speed = value\n\na = Aircraft(250)\na.speed = 300\nprint(a.speed)  # 300\n```\n\nThe caller uses `a.speed = 300` (no parentheses) — it looks like attribute access but runs your validation logic behind the scenes.",
    starterCode:
      "class Aircraft:\n    def __init__(self, speed):\n        self._speed = speed\n\n    @property\n    def speed(self):\n        return self._speed\n\n    @speed.setter\n    def speed(self, value):\n        if value < 0:\n            raise ValueError(\"Speed cannot be negative\")\n        self._speed = value\n\na = Aircraft(250)\na.speed = 480\nprint(a.speed)\n",
    solution:
      "class Aircraft:\n    def __init__(self, speed):\n        self._speed = speed\n\n    @property\n    def speed(self):\n        return self._speed\n\n    @speed.setter\n    def speed(self, value):\n        if value < 0:\n            raise ValueError(\"Speed cannot be negative\")\n        self._speed = value\n\na = Aircraft(250)\na.speed = 480\nprint(a.speed)\n",
    tests: [
      { description: "speed prints 480 after setter", expectedOutput: "480" },
    ],
    hint: "`@speed.setter` must be defined right after `@property speed` and use the **same method name**.",
    xp: 100,
    isMilestone: false,
  },

  {
    id: 55,
    regionId: 6,
    regionStage: 5,
    title: "ACARS Printout",
    subtitle: "__str__ — String Representation",
    briefing:
      "When you `print()` an Aircraft object, Python defaults to a cryptic memory address. Implement `__str__` so the object prints a human-readable ACARS-style summary.",
    concept: "__str__",
    lesson:
      "`__str__` is a **dunder** (double-underscore) method called by `print()` and `str()`. Return a string from it:\n\n```python\nclass Aircraft:\n    def __init__(self, callsign, altitude):\n        self.callsign = callsign\n        self.altitude = altitude\n\n    def __str__(self):\n        return f\"[{self.callsign}] FL{self.altitude // 100}\"\n\na = Aircraft(\"SQ321\", 35000)\nprint(a)         # [SQ321] FL350\nprint(str(a))    # same\n```\n\n`__repr__` is the companion for debugging — `repr(a)` — typically shows how to recreate the object. If you only define `__str__`, Python falls back to it for both contexts in interactive mode.",
    starterCode:
      "class Aircraft:\n    def __init__(self, callsign, altitude):\n        self.callsign = callsign\n        self.altitude = altitude\n\n    def __str__(self):\n        return f\"[{self.callsign}] FL{self.altitude // 100}\"\n\na = Aircraft(\"SQ321\", 35000)\nprint(a)\n",
    solution:
      "class Aircraft:\n    def __init__(self, callsign, altitude):\n        self.callsign = callsign\n        self.altitude = altitude\n\n    def __str__(self):\n        return f\"[{self.callsign}] FL{self.altitude // 100}\"\n\na = Aircraft(\"SQ321\", 35000)\nprint(a)\n",
    tests: [
      { description: "print(aircraft) shows [SQ321] FL350", expectedOutput: "[SQ321] FL350" },
    ],
    hint: "`35000 // 100` is `350` (integer division) — use that for the flight level number.",
    xp: 100,
    isMilestone: false,
  },

  {
    id: 56,
    regionId: 6,
    regionStage: 6,
    title: "Fleet Comparison",
    subtitle: "__eq__ — Equality",
    briefing:
      "Two Aircraft objects are the same type if their model matches — regardless of which instance they are. Implement `__eq__` so the `==` operator compares by model attribute.",
    concept: "__eq__",
    lesson:
      "By default, `==` checks **identity** (same object in memory). Override `__eq__` to define logical equality:\n\n```python\nclass Aircraft:\n    def __init__(self, model):\n        self.model = model\n\n    def __eq__(self, other):\n        if not isinstance(other, Aircraft):\n            return NotImplemented\n        return self.model == other.model\n\na1 = Aircraft(\"A350\")\na2 = Aircraft(\"A350\")\na3 = Aircraft(\"B777\")\n\nprint(a1 == a2)  # True\nprint(a1 == a3)  # False\n```\n\nAlways check `isinstance(other, ClassName)` first — otherwise you might compare against unrelated types. Return `NotImplemented` (not `False`) for unsupported comparisons; Python then tries the other object's `__eq__`.",
    starterCode:
      "class Aircraft:\n    def __init__(self, model):\n        self.model = model\n\n    def __eq__(self, other):\n        if not isinstance(other, Aircraft):\n            return NotImplemented\n        return self.model == other.model\n\na1 = Aircraft(\"A350\")\na2 = Aircraft(\"A350\")\na3 = Aircraft(\"B777\")\n\nprint(a1 == a2)  # True\nprint(a1 == a3)  # False\n",
    solution:
      "class Aircraft:\n    def __init__(self, model):\n        self.model = model\n\n    def __eq__(self, other):\n        if not isinstance(other, Aircraft):\n            return NotImplemented\n        return self.model == other.model\n\na1 = Aircraft(\"A350\")\na2 = Aircraft(\"A350\")\na3 = Aircraft(\"B777\")\n\nprint(a1 == a2)\nprint(a1 == a3)\n",
    tests: [
      { description: "same model compares True", expectedOutput: "True" },
      { description: "different model compares False", expectedOutput: "False" },
    ],
    hint: "Return `self.model == other.model` — a simple string comparison that evaluates to `True` or `False`.",
    xp: 100,
    isMilestone: false,
  },

  {
    id: 57,
    regionId: 6,
    regionStage: 7,
    title: "Auto-Manifest",
    subtitle: "@dataclass",
    briefing:
      "Writing `__init__`, `__repr__`, and `__eq__` for every class is tedious. The `@dataclass` decorator auto-generates all three from your annotated field declarations.",
    concept: "@dataclass decorator",
    lesson:
      "Import `dataclass` from the `dataclasses` module and decorate your class. Annotate fields with type hints:\n\n```python\nfrom dataclasses import dataclass\n\n@dataclass\nclass FlightPlan:\n    callsign: str\n    origin: str\n    destination: str\n    altitude: int = 35000  # default value\n\nfp = FlightPlan(\"SQ321\", \"SIN\", \"LHR\")\nprint(fp)             # FlightPlan(callsign='SQ321', ...)\nprint(fp.destination) # LHR\n```\n\n`@dataclass` generates `__init__` (with optional defaults), `__repr__` (pretty print), and `__eq__` (compare all fields) automatically. Add `frozen=True` for immutable instances, or `order=True` to enable `<` / `>` comparisons.",
    starterCode:
      "from dataclasses import dataclass\n\n@dataclass\nclass FlightPlan:\n    callsign: str\n    origin: str\n    destination: str\n    altitude: int = 35000\n\nfp = FlightPlan(\"SQ321\", \"SIN\", \"LHR\")\nprint(fp)\nprint(fp.destination)\n",
    solution:
      "from dataclasses import dataclass\n\n@dataclass\nclass FlightPlan:\n    callsign: str\n    origin: str\n    destination: str\n    altitude: int = 35000\n\nfp = FlightPlan(\"SQ321\", \"SIN\", \"LHR\")\nprint(fp)\nprint(fp.destination)\n",
    tests: [
      { description: "dataclass repr contains SQ321", expectedOutput: "SQ321" },
      { description: "destination attribute is LHR", expectedOutput: "LHR" },
    ],
    hint: "`@dataclass` auto-generates `__repr__`, so `print(fp)` will show all field values without any extra code.",
    xp: 100,
    isMilestone: false,
  },

  {
    id: 58,
    regionId: 6,
    regionStage: 8,
    title: "Fleet Factory",
    subtitle: "@classmethod + @staticmethod",
    briefing:
      "Some operations belong to the class itself, not an instance. A factory method creates instances from alternate data; a static utility doesn't need any object at all.",
    concept: "@classmethod, @staticmethod",
    lesson:
      "**@classmethod** receives `cls` (the class) instead of `self`. Use it as a factory:\n\n```python\nclass Aircraft:\n    def __init__(self, model, range_nm):\n        self.model = model\n        self.range_nm = range_nm\n\n    @classmethod\n    def long_haul(cls):\n        return cls(\"A350-900ULR\", 9700)\n\n    @staticmethod\n    def nm_to_km(nm):\n        return round(nm * 1.852, 1)\n\na = Aircraft.long_haul()\nprint(a.model)                    # A350-900ULR\nprint(Aircraft.nm_to_km(9700))    # 17964.4\n```\n\n**@staticmethod** receives neither `cls` nor `self` — it's a plain function namespaced inside the class. Use it for utility calculations related to the class concept.",
    starterCode:
      "class Aircraft:\n    def __init__(self, model, range_nm):\n        self.model = model\n        self.range_nm = range_nm\n\n    @classmethod\n    def long_haul(cls):\n        return cls(\"A350-900ULR\", 9700)\n\n    @staticmethod\n    def nm_to_km(nm):\n        return round(nm * 1.852, 1)\n\na = Aircraft.long_haul()\nprint(a.model)\nprint(Aircraft.nm_to_km(9700))\n",
    solution:
      "class Aircraft:\n    def __init__(self, model, range_nm):\n        self.model = model\n        self.range_nm = range_nm\n\n    @classmethod\n    def long_haul(cls):\n        return cls(\"A350-900ULR\", 9700)\n\n    @staticmethod\n    def nm_to_km(nm):\n        return round(nm * 1.852, 1)\n\na = Aircraft.long_haul()\nprint(a.model)\nprint(Aircraft.nm_to_km(9700))\n",
    tests: [
      { description: "factory creates A350-900ULR", expectedOutput: "A350-900ULR" },
      { description: "nm_to_km(9700) gives 17964.4", expectedOutput: "17964.4" },
    ],
    hint: "`@classmethod` uses `cls(...)` to create and return a new instance — `cls` is the class itself, equivalent to calling `Aircraft(...)`.",
    xp: 100,
    isMilestone: false,
  },

  {
    id: 59,
    regionId: 6,
    regionStage: 9,
    title: "Dual Qualification",
    subtitle: "Multiple Inheritance",
    briefing:
      "Some crew hold both a commercial licence and an instructor rating — two parent qualifications. Python supports multiple inheritance; use `super()` to chain the MRO correctly.",
    concept: "multiple inheritance, MRO, super()",
    lesson:
      "Python allows a class to inherit from **multiple parents**:\n\n```python\nclass PilotLicence:\n    def qualification(self):\n        return \"CPL\"\n\nclass InstructorRating:\n    def rating(self):\n        return \"FI\"\n\nclass SeniorPilot(PilotLicence, InstructorRating):\n    pass\n\np = SeniorPilot()\nprint(p.qualification())  # CPL\nprint(p.rating())         # FI\n```\n\nPython resolves method lookup via the **MRO** (Method Resolution Order) — left to right, depth first. Call `SeniorPilot.__mro__` to inspect it. When `__init__` needs arguments from multiple parents, use `super().__init__()` carefully or initialise each parent explicitly.",
    starterCode:
      "class PilotLicence:\n    def qualification(self):\n        return \"CPL\"\n\nclass InstructorRating:\n    def rating(self):\n        return \"FI\"\n\nclass SeniorPilot(PilotLicence, InstructorRating):\n    pass\n\np = SeniorPilot()\nprint(p.qualification())\nprint(p.rating())\n",
    solution:
      "class PilotLicence:\n    def qualification(self):\n        return \"CPL\"\n\nclass InstructorRating:\n    def rating(self):\n        return \"FI\"\n\nclass SeniorPilot(PilotLicence, InstructorRating):\n    pass\n\np = SeniorPilot()\nprint(p.qualification())\nprint(p.rating())\n",
    tests: [
      { description: "qualification() returns CPL", expectedOutput: "CPL" },
      { description: "rating() returns FI", expectedOutput: "FI" },
    ],
    hint: "List both parent classes in the `class` header: `class SeniorPilot(PilotLicence, InstructorRating)` — no other code needed when you're just inheriting methods.",
    xp: 100,
    isMilestone: false,
  },

  {
    id: 60,
    regionId: 6,
    regionStage: 10,
    title: "Crew Scheduler",
    subtitle: "MILESTONE — Full OOP Mini-Program",
    briefing:
      "MILESTONE: IFR Procedures complete. Build a FlightCrew class that holds a list of crew by role and provides a `schedule()` method that prints the full crew brief — the complete OOP workflow.",
    concept: "OOP — class with list attribute + method",
    lesson:
      "Combine what you've learned: an `__init__` that sets up data structures, instance methods that operate on them, and a clean display method.\n\n```python\nclass FlightCrew:\n    def __init__(self, flight):\n        self.flight = flight\n        self.members = []\n\n    def add(self, name, role):\n        self.members.append({\"name\": name, \"role\": role})\n\n    def schedule(self):\n        print(f\"Crew brief — {self.flight}\")\n        for m in self.members:\n            print(f\"  {m['role']}: {m['name']}\")\n\ncrew = FlightCrew(\"SQ321\")\ncrew.add(\"Eric\", \"Captain\")\ncrew.add(\"Alex\", \"First Officer\")\ncrew.schedule()\n```\n\nThis pattern — a class wrapping a list of dicts with methods that loop them — is the backbone of most real OOP programs.",
    starterCode:
      "class FlightCrew:\n    def __init__(self, flight):\n        self.flight = flight\n        self.members = []\n\n    def add(self, name, role):\n        self.members.append({\"name\": name, \"role\": role})\n\n    def schedule(self):\n        print(f\"Crew brief — {self.flight}\")\n        for m in self.members:\n            print(f\"  {m['role']}: {m['name']}\")\n\ncrew = FlightCrew(\"SQ321\")\ncrew.add(\"Eric\", \"Captain\")\ncrew.add(\"Alex\", \"First Officer\")\ncrew.schedule()\n",
    solution:
      "class FlightCrew:\n    def __init__(self, flight):\n        self.flight = flight\n        self.members = []\n\n    def add(self, name, role):\n        self.members.append({\"name\": name, \"role\": role})\n\n    def schedule(self):\n        print(f\"Crew brief — {self.flight}\")\n        for m in self.members:\n            print(f\"  {m['role']}: {m['name']}\")\n\ncrew = FlightCrew(\"SQ321\")\ncrew.add(\"Eric\", \"Captain\")\ncrew.add(\"Alex\", \"First Officer\")\ncrew.schedule()\n",
    tests: [
      { description: "schedule prints crew brief header", expectedOutput: "Crew brief — SQ321" },
      { description: "Captain Eric appears in output", expectedOutput: "Captain: Eric" },
    ],
    hint: "Each `m` in the members list is a dict — access with `m['role']` and `m['name']` inside the f-string.",
    xp: 500,
    isMilestone: true,
  },

  // ── REGION 7 — Line Training (ids 61-70) ─────────────────────────────────────

  {
    id: 61,
    regionId: 7,
    regionStage: 1,
    title: "Fault Isolation",
    subtitle: "try / except",
    briefing:
      "On the line, instruments can return bad data. Wrap risky operations in `try/except` so a bad reading doesn't crash the entire system — print a friendly ECAM message instead.",
    concept: "try, except ValueError",
    lesson:
      "Wrap code that might fail in a `try` block. If an exception occurs, execution jumps to the matching `except` block:\n\n```python\ntry:\n    altitude = int(\"FL350\")  # ValueError — can't convert\nexcept ValueError:\n    print(\"Invalid altitude reading\")\n```\n\nYou can catch multiple exception types:\n```python\ntry:\n    result = 100 / speed\nexcept ZeroDivisionError:\n    print(\"Speed cannot be zero\")\nexcept TypeError:\n    print(\"Speed must be a number\")\n```\n\nUse `except Exception as e:` to catch anything and inspect the message with `str(e)`. Avoid bare `except:` — it hides bugs.",
    starterCode:
      "def parse_altitude(raw):\n    try:\n        return int(raw)\n    except ValueError:\n        print(\"ECAM: Invalid altitude —\", raw)\n        return None\n\nprint(parse_altitude(\"35000\"))\nparse_altitude(\"FL350\")\n",
    solution:
      "def parse_altitude(raw):\n    try:\n        return int(raw)\n    except ValueError:\n        print(\"ECAM: Invalid altitude —\", raw)\n        return None\n\nprint(parse_altitude(\"35000\"))\nparse_altitude(\"FL350\")\n",
    tests: [
      { description: "valid altitude prints 35000", expectedOutput: "35000" },
      { description: "invalid altitude prints ECAM message", expectedOutput: "ECAM: Invalid altitude — FL350" },
    ],
    hint: "`int(\"FL350\")` raises a `ValueError` because the string contains letters — catch that specific exception type.",
    xp: 100,
    isMilestone: false,
  },

  {
    id: 62,
    regionId: 7,
    regionStage: 2,
    title: "Post-Flight Check",
    subtitle: "try / except / finally",
    briefing:
      "After every flight — successful or aborted — the post-flight checklist must run. The `finally` block executes no matter what, making it perfect for cleanup routines.",
    concept: "try, except, finally",
    lesson:
      "Add a `finally` clause to guarantee cleanup runs regardless of success or failure:\n\n```python\ntry:\n    result = risky_operation()\nexcept ValueError as e:\n    print(\"Error:\", e)\nfinally:\n    print(\"Post-flight checklist complete\")\n```\n\n`finally` runs even if:\n- the `try` succeeded\n- an exception was caught by `except`\n- an unhandled exception propagates up\n- a `return` statement is hit inside `try`\n\nCommon uses: closing file handles, releasing network connections, resetting hardware state — anything that **must** happen.",
    starterCode:
      "def load_fuel(amount):\n    try:\n        if amount < 0:\n            raise ValueError(\"Negative fuel load\")\n        print(f\"Fuelled: {amount} kg\")\n    except ValueError as e:\n        print(\"FUEL ERROR:\", e)\n    finally:\n        print(\"Fuelling station: cleanup complete\")\n\nload_fuel(42000)\nload_fuel(-100)\n",
    solution:
      "def load_fuel(amount):\n    try:\n        if amount < 0:\n            raise ValueError(\"Negative fuel load\")\n        print(f\"Fuelled: {amount} kg\")\n    except ValueError as e:\n        print(\"FUEL ERROR:\", e)\n    finally:\n        print(\"Fuelling station: cleanup complete\")\n\nload_fuel(42000)\nload_fuel(-100)\n",
    tests: [
      { description: "finally always prints cleanup message", expectedOutput: "Fuelling station: cleanup complete" },
      { description: "valid load prints Fuelled: 42000 kg", expectedOutput: "Fuelled: 42000 kg" },
    ],
    hint: "`finally` runs after both the normal path and the error path — it will appear twice in the output (once per call).",
    xp: 100,
    isMilestone: false,
  },

  {
    id: 63,
    regionId: 7,
    regionStage: 3,
    title: "Custom ECAM",
    subtitle: "Custom Exceptions",
    briefing:
      "Generic exceptions don't carry enough context for aviation faults. Define a `FlightError` exception class, raise it with a specific message, and catch it precisely.",
    concept: "class FlightError(Exception), raise, catch",
    lesson:
      "Create a custom exception by subclassing `Exception`:\n\n```python\nclass FlightError(Exception):\n    pass\n```\n\nRaise it with `raise FlightError(\"message\")`:\n\n```python\ndef check_fuel(kg):\n    if kg < 5000:\n        raise FlightError(f\"Fuel critical: {kg} kg\")\n    return \"Fuel OK\"\n\ntry:\n    check_fuel(3000)\nexcept FlightError as e:\n    print(\"ECAM:\", e)\n```\n\nCustom exceptions can carry extra attributes — subclass `Exception`, call `super().__init__(msg)`, and add your own fields. They integrate with the normal `try/except` chain — catch `FlightError` specifically before a broader `Exception`.",
    starterCode:
      "class FlightError(Exception):\n    pass\n\ndef check_fuel(kg):\n    if kg < 5000:\n        raise FlightError(f\"Fuel critical: {kg} kg\")\n    return \"Fuel OK\"\n\ntry:\n    print(check_fuel(42000))\n    check_fuel(3000)\nexcept FlightError as e:\n    print(\"ECAM:\", e)\n",
    solution:
      "class FlightError(Exception):\n    pass\n\ndef check_fuel(kg):\n    if kg < 5000:\n        raise FlightError(f\"Fuel critical: {kg} kg\")\n    return \"Fuel OK\"\n\ntry:\n    print(check_fuel(42000))\n    check_fuel(3000)\nexcept FlightError as e:\n    print(\"ECAM:\", e)\n",
    tests: [
      { description: "sufficient fuel prints Fuel OK", expectedOutput: "Fuel OK" },
      { description: "low fuel raises ECAM error message", expectedOutput: "ECAM: Fuel critical: 3000 kg" },
    ],
    hint: "Subclass `Exception` with `pass` — that's all you need for a basic custom exception. Raise it like any built-in exception.",
    xp: 100,
    isMilestone: false,
  },

  {
    id: 64,
    regionId: 7,
    regionStage: 4,
    title: "Quick Sort Key",
    subtitle: "lambda Functions",
    briefing:
      "Dispatch needs the flight list sorted by altitude — no boilerplate function required. A lambda gives you a one-liner sort key on the spot.",
    concept: "lambda, sorted() with key=",
    lesson:
      "A **lambda** is an anonymous one-liner function: `lambda params: expression`.\n\n```python\ndouble = lambda x: x * 2\nprint(double(5))  # 10\n```\n\nMost useful as a `key=` argument to `sorted()`, `min()`, `max()`:\n\n```python\nflights = [\n    {\"callsign\": \"SQ321\", \"altitude\": 35000},\n    {\"callsign\": \"SQ22\",  \"altitude\": 12000},\n]\n\nby_alt = sorted(flights, key=lambda f: f[\"altitude\"])\nprint(by_alt[0][\"callsign\"])  # SQ22 — lowest altitude first\n```\n\nLambdas are limited to a single expression — use a regular `def` when you need multiple lines or statements.",
    starterCode:
      "flights = [\n    {\"callsign\": \"SQ321\", \"altitude\": 35000},\n    {\"callsign\": \"SQ22\",  \"altitude\": 12000},\n    {\"callsign\": \"SQ841\", \"altitude\": 28000},\n]\n\n# Sort by altitude ascending using a lambda\nby_alt = sorted(flights, key=lambda f: f[\"altitude\"])\nprint(by_alt[0][\"callsign\"])  # lowest altitude\nprint(by_alt[-1][\"callsign\"]) # highest altitude\n",
    solution:
      "flights = [\n    {\"callsign\": \"SQ321\", \"altitude\": 35000},\n    {\"callsign\": \"SQ22\",  \"altitude\": 12000},\n    {\"callsign\": \"SQ841\", \"altitude\": 28000},\n]\n\nby_alt = sorted(flights, key=lambda f: f[\"altitude\"])\nprint(by_alt[0][\"callsign\"])\nprint(by_alt[-1][\"callsign\"])\n",
    tests: [
      { description: "lowest altitude first is SQ22", expectedOutput: "SQ22" },
      { description: "highest altitude last is SQ321", expectedOutput: "SQ321" },
    ],
    hint: "`key=lambda f: f[\"altitude\"]` tells `sorted` to compare dicts by their altitude value — lowest first by default.",
    xp: 100,
    isMilestone: false,
  },

  {
    id: 65,
    regionId: 7,
    regionStage: 5,
    title: "Sensor Pipeline",
    subtitle: "map() + filter()",
    briefing:
      "Raw sensor data needs two passes — convert all readings to integers, then keep only the ones above minimum safe altitude. Chain `map()` and `filter()` for a clean pipeline.",
    concept: "map(), filter(), list()",
    lesson:
      "`map(fn, iterable)` applies a function to every item and returns a lazy iterator.\n`filter(fn, iterable)` keeps items where `fn(item)` is truthy.\n\n```python\nreadings = [\"100\", \"350\", \"80\", \"420\"]\n\n# Convert strings to ints\naltitudes = list(map(int, readings))\nprint(altitudes)  # [100, 350, 80, 420]\n\n# Keep only those above 200\nhigh = list(filter(lambda a: a > 200, altitudes))\nprint(high)  # [350, 420]\n```\n\nBoth return **iterators** — wrap with `list()` to materialise. You can chain them: `list(filter(fn, map(int, readings)))`. List comprehensions are often clearer for simple cases, but `map`/`filter` are useful when passing functions around.",
    starterCode:
      "readings = [\"100\", \"350\", \"80\", \"420\", \"250\"]\n\n# Use map to convert strings to ints\naltitudes = list(map(int, readings))\nprint(altitudes)\n\n# Use filter to keep altitudes above 200\nhigh = list(filter(lambda a: a > 200, altitudes))\nprint(high)\n",
    solution:
      "readings = [\"100\", \"350\", \"80\", \"420\", \"250\"]\n\naltitudes = list(map(int, readings))\nprint(altitudes)\n\nhigh = list(filter(lambda a: a > 200, altitudes))\nprint(high)\n",
    tests: [
      { description: "map converts to ints, list contains 350", expectedOutput: "350" },
      { description: "filter keeps only values > 200", expectedOutput: "[350, 420, 250]" },
    ],
    hint: "`map(int, readings)` passes each string directly to `int()` — no lambda needed. Wrap in `list()` to print.",
    xp: 100,
    isMilestone: false,
  },

  {
    id: 66,
    regionId: 7,
    regionStage: 6,
    title: "Flight Recorder",
    subtitle: "Decorators",
    briefing:
      "Every function call in the FMS must be logged automatically — without modifying each function. A decorator wraps any function transparently, injecting logging before and after.",
    concept: "decorator pattern, wraps",
    lesson:
      "A **decorator** is a function that takes a function and returns a modified version of it:\n\n```python\nfrom functools import wraps\n\ndef log_call(fn):\n    @wraps(fn)\n    def wrapper(*args, **kwargs):\n        print(f\"Calling {fn.__name__}\")\n        result = fn(*args, **kwargs)\n        print(f\"{fn.__name__} done\")\n        return result\n    return wrapper\n\n@log_call\ndef engage_autopilot(heading):\n    print(f\"AP engaged: {heading}\")\n\nengage_autopilot(270)\n# Calling engage_autopilot\n# AP engaged: 270\n# engage_autopilot done\n```\n\n`@log_call` is syntactic sugar for `engage_autopilot = log_call(engage_autopilot)`. `@wraps(fn)` preserves the original function's name and docstring.",
    starterCode:
      "from functools import wraps\n\ndef log_call(fn):\n    @wraps(fn)\n    def wrapper(*args, **kwargs):\n        print(f\"Calling {fn.__name__}\")\n        result = fn(*args, **kwargs)\n        print(f\"{fn.__name__} done\")\n        return result\n    return wrapper\n\n@log_call\ndef engage_autopilot(heading):\n    print(f\"AP engaged: {heading}\")\n\nengage_autopilot(270)\n",
    solution:
      "from functools import wraps\n\ndef log_call(fn):\n    @wraps(fn)\n    def wrapper(*args, **kwargs):\n        print(f\"Calling {fn.__name__}\")\n        result = fn(*args, **kwargs)\n        print(f\"{fn.__name__} done\")\n        return result\n    return wrapper\n\n@log_call\ndef engage_autopilot(heading):\n    print(f\"AP engaged: {heading}\")\n\nengage_autopilot(270)\n",
    tests: [
      { description: "decorator logs Calling engage_autopilot", expectedOutput: "Calling engage_autopilot" },
      { description: "original function still runs", expectedOutput: "AP engaged: 270" },
    ],
    hint: "The `wrapper` function must accept `*args, **kwargs` and pass them through to `fn(*args, **kwargs)` so the original function still works.",
    xp: 100,
    isMilestone: false,
  },

  {
    id: 67,
    regionId: 7,
    regionStage: 7,
    title: "Streaming Telemetry",
    subtitle: "Generators & yield",
    briefing:
      "ACARS streams telemetry one frame at a time — it doesn't compute all frames upfront. A generator function `yield`s values one at a time, saving memory for large data streams.",
    concept: "yield, next(), generator for loop",
    lesson:
      "A **generator** function uses `yield` instead of `return`. Each call to `next()` runs until the next `yield`, then pauses:\n\n```python\ndef altitude_stream(start, step, count):\n    alt = start\n    for _ in range(count):\n        yield alt\n        alt -= step\n\ngen = altitude_stream(35000, 1000, 4)\nprint(next(gen))  # 35000\nprint(next(gen))  # 34000\n\n# Or loop:\nfor alt in altitude_stream(10000, 2000, 3):\n    print(alt)\n# 10000, 8000, 6000\n```\n\nGenerators are **lazy** — they produce values on demand. This makes them memory-efficient for large sequences. `range()` itself is a generator-like object.",
    starterCode:
      "def altitude_stream(start, step, count):\n    alt = start\n    for _ in range(count):\n        yield alt\n        alt -= step\n\n# Get first value with next()\ngen = altitude_stream(35000, 1000, 4)\nprint(next(gen))\nprint(next(gen))\n\n# Loop over a fresh generator\nfor alt in altitude_stream(10000, 2000, 3):\n    print(alt)\n",
    solution:
      "def altitude_stream(start, step, count):\n    alt = start\n    for _ in range(count):\n        yield alt\n        alt -= step\n\ngen = altitude_stream(35000, 1000, 4)\nprint(next(gen))\nprint(next(gen))\n\nfor alt in altitude_stream(10000, 2000, 3):\n    print(alt)\n",
    tests: [
      { description: "first next() yields 35000", expectedOutput: "35000" },
      { description: "second next() yields 34000", expectedOutput: "34000" },
    ],
    hint: "Each `next()` call resumes execution after the last `yield` — the function's local state (including `alt`) is preserved between calls.",
    xp: 100,
    isMilestone: false,
  },

  {
    id: 68,
    regionId: 7,
    regionStage: 8,
    title: "Black Box",
    subtitle: "Context Managers — with open()",
    briefing:
      "The FDR writes data to a buffer and reads it back for verification. Use `with` and `io.StringIO` to simulate file I/O — the context manager guarantees the resource closes cleanly.",
    concept: "with, io.StringIO",
    lesson:
      "The `with` statement manages resources — it calls `__enter__` on entry and `__exit__` on exit (even if an exception occurs).\n\nFor in-memory I/O in Pyodide (no real filesystem), use `io.StringIO`:\n\n```python\nimport io\n\nbuffer = io.StringIO()\nbuffer.write(\"ALTITUDE: 35000\\n\")\nbuffer.write(\"HEADING: 270\\n\")\n\n# Rewind to beginning to read\nbuffer.seek(0)\ncontent = buffer.read()\nprint(content)\nbuffer.close()\n```\n\nWith a real file you'd write `with open(\"log.txt\", \"w\") as f: f.write(...)` — same pattern, Python closes the file automatically when the `with` block exits.",
    starterCode:
      "import io\n\n# Write flight data to a StringIO buffer\nbuffer = io.StringIO()\nbuffer.write(\"ALTITUDE: 35000\\n\")\nbuffer.write(\"HEADING: 270\\n\")\n\n# Rewind and read back\nbuffer.seek(0)\ncontent = buffer.read()\nprint(content)\nbuffer.close()\n",
    solution:
      "import io\n\nbuffer = io.StringIO()\nbuffer.write(\"ALTITUDE: 35000\\n\")\nbuffer.write(\"HEADING: 270\\n\")\n\nbuffer.seek(0)\ncontent = buffer.read()\nprint(content)\nbuffer.close()\n",
    tests: [
      { description: "reads back ALTITUDE: 35000", expectedOutput: "ALTITUDE: 35000" },
      { description: "reads back HEADING: 270", expectedOutput: "HEADING: 270" },
    ],
    hint: "`buffer.seek(0)` rewinds to the start — without it, `read()` would return an empty string because the cursor is already at the end.",
    xp: 100,
    isMilestone: false,
  },

  {
    id: 69,
    regionId: 7,
    regionStage: 9,
    title: "Reverse Approach",
    subtitle: "Advanced List Slicing",
    briefing:
      "The FMS replays waypoints in reverse for back-tracking. Master negative indices, step values, and the `[::-1]` reverse idiom to slice any portion of a route precisely.",
    concept: "list[start:stop:step], [::-1]",
    lesson:
      "Python list slices use `list[start:stop:step]`:\n\n- `a[2:5]` — indices 2, 3, 4\n- `a[:3]` — first three items\n- `a[-2:]` — last two items\n- `a[::2]` — every second item\n- `a[::-1]` — **reverse** the entire list\n\n```python\nroute = [\"SIN\", \"IGARI\", \"VAMPI\", \"MEKAR\", \"LHR\"]\n\nprint(route[-1])      # LHR\nprint(route[1:3])     # ['IGARI', 'VAMPI']\nprint(route[::-1])    # reversed route\nprint(route[::2])     # every other waypoint\n```\n\nSlicing always returns a **new list** — the original is unchanged. Negative step `[::-1]` is the Pythonic reverse; `list.reverse()` modifies in place.",
    starterCode:
      "route = [\"SIN\", \"IGARI\", \"VAMPI\", \"MEKAR\", \"LHR\"]\n\n# Print the last waypoint\nprint(route[-1])\n\n# Print middle two waypoints (index 1 to 3)\nprint(route[1:3])\n\n# Print the route in reverse\nprint(route[::-1])\n",
    solution:
      "route = [\"SIN\", \"IGARI\", \"VAMPI\", \"MEKAR\", \"LHR\"]\n\nprint(route[-1])\nprint(route[1:3])\nprint(route[::-1])\n",
    tests: [
      { description: "last waypoint is LHR", expectedOutput: "LHR" },
      { description: "reversed route starts with LHR", expectedOutput: "['LHR', 'MEKAR', 'VAMPI', 'IGARI', 'SIN']" },
    ],
    hint: "`route[::-1]` is the cleanest way to reverse a list in Python — start and stop are omitted (whole list), step is -1 (backwards).",
    xp: 100,
    isMilestone: false,
  },

  {
    id: 70,
    regionId: 7,
    regionStage: 10,
    title: "Line Training Complete",
    subtitle: "MILESTONE — Flight Roster Capstone",
    briefing:
      "MILESTONE: Line Training complete. Build a flight roster system combining classes, list comprehensions, error handling, and sorted output — your final AeroPython sign-off.",
    concept: "capstone — OOP + comprehensions + error handling",
    lesson:
      "This capstone combines every major concept:\n\n- **Class** to model a Roster with a list of flight dicts\n- **Method** to add flights with validation (`try/except`)\n- **List comprehension** to filter and summarise\n- **sorted()** with `lambda` for ordered output\n\n```python\nclass FlightRoster:\n    def __init__(self):\n        self.flights = []\n\n    def add(self, callsign, dest, altitude):\n        try:\n            altitude = int(altitude)\n        except ValueError:\n            print(f\"Bad altitude for {callsign}\")\n            return\n        self.flights.append({\"cs\": callsign, \"dest\": dest, \"alt\": altitude})\n\n    def high_flights(self, min_alt):\n        return [f[\"cs\"] for f in self.flights if f[\"alt\"] >= min_alt]\n\n    def print_sorted(self):\n        for f in sorted(self.flights, key=lambda x: x[\"alt\"]):\n            print(f\"{f['cs']} -> {f['dest']} @ FL{f['alt']//100}\")\n```\n\nNotice: one class, validation logic, a comprehension query, and a sorted display — all working together.",
    starterCode:
      "class FlightRoster:\n    def __init__(self):\n        self.flights = []\n\n    def add(self, callsign, dest, altitude):\n        try:\n            altitude = int(altitude)\n        except ValueError:\n            print(f\"Bad altitude for {callsign}\")\n            return\n        self.flights.append({\"cs\": callsign, \"dest\": dest, \"alt\": altitude})\n\n    def high_flights(self, min_alt):\n        return [f[\"cs\"] for f in self.flights if f[\"alt\"] >= min_alt]\n\n    def print_sorted(self):\n        for f in sorted(self.flights, key=lambda x: x[\"alt\"]):\n            print(f\"{f['cs']} -> {f['dest']} @ FL{f['alt']//100}\")\n\nroster = FlightRoster()\nroster.add(\"SQ321\", \"LHR\", 35000)\nroster.add(\"SQ22\",  \"LAX\", 41000)\nroster.add(\"SQ841\", \"FRA\", \"bad\")  # should print error\nroster.print_sorted()\nprint(roster.high_flights(38000))\n",
    solution:
      "class FlightRoster:\n    def __init__(self):\n        self.flights = []\n\n    def add(self, callsign, dest, altitude):\n        try:\n            altitude = int(altitude)\n        except ValueError:\n            print(f\"Bad altitude for {callsign}\")\n            return\n        self.flights.append({\"cs\": callsign, \"dest\": dest, \"alt\": altitude})\n\n    def high_flights(self, min_alt):\n        return [f[\"cs\"] for f in self.flights if f[\"alt\"] >= min_alt]\n\n    def print_sorted(self):\n        for f in sorted(self.flights, key=lambda x: x[\"alt\"]):\n            print(f\"{f['cs']} -> {f['dest']} @ FL{f['alt']//100}\")\n\nroster = FlightRoster()\nroster.add(\"SQ321\", \"LHR\", 35000)\nroster.add(\"SQ22\",  \"LAX\", 41000)\nroster.add(\"SQ841\", \"FRA\", \"bad\")\nroster.print_sorted()\nprint(roster.high_flights(38000))\n",
    tests: [
      { description: "sorted output shows SQ321 -> LHR @ FL350", expectedOutput: "SQ321 -> LHR @ FL350" },
      { description: "high_flights returns only SQ22", expectedOutput: "['SQ22']" },
    ],
    hint: "`sorted(..., key=lambda x: x[\"alt\"])` sorts dicts by the `alt` field. The comprehension in `high_flights` filters by `f[\"alt\"] >= min_alt`.",
    xp: 500,
    isMilestone: true,
  },
];
