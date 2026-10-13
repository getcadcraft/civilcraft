# SPDX-License-Identifier: Apache-2.0
"""Sun azimuth and altitude from PyEphem (XEphem's own VSOP87 theory, independent of NOAA's equations) for the cases
on stdin: one JSON list of [iso UTC, lat, lon]; prints a JSON list of [azimuth, altitude] (degrees, with refraction at
standard pressure and 10 °C, as NOAA's approximation assumes about)."""
import json, math, sys
import ephem

out = []
for iso, lat, lon in json.load(sys.stdin):
    o = ephem.Observer()
    o.lat, o.lon = str(lat), str(lon)
    o.elevation = 0
    o.pressure = 1010
    o.temp = 10
    o.date = iso.replace('T', ' ').replace('Z', '')
    s = ephem.Sun(o)
    out.append([math.degrees(s.az), math.degrees(s.alt)])
print(json.dumps(out))
