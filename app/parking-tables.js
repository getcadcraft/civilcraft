/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: reference data (cited, unverified), words shown to people come from lang/en.json */
export default {
  "format": "cadcraft-parking-tables",
  "version": 1,
  "note": "Reference values for the parking layout tool. The accessible-space numbers are the 2010 ADA Standards for Accessible Design as the session remembered them; the stall and aisle values are typical design values from parking design guides. NOTHING HERE WAS CHECKED AGAINST THE PRINTED SOURCE: every table carries verified:false until a person reads it against the standard and local code. Local code and the owner of the lot decide; the person can overwrite every number in the tool.",
  "units": "feet and inches as the sources print them; the tool converts for a metric project",
  "regions": {
    "us": {
      "name": "United States (ADA 2010 for accessible spaces; typical design values for stalls)",
      "accessible": {
        "source": "2010 ADA Standards for Accessible Design, section 208.2 Table 208.2 (number of accessible spaces), 208.2.4 (van spaces), 502.2 (space width), 502.3 (access aisle), 502.4 (floor slope), 208.3.1 (route to an entrance); U.S. Department of Justice, 28 CFR part 36, Appendix D",
        "verified": false,
        "total": [[25, 1], [50, 2], [75, 3], [100, 4], [150, 5], [200, 6], [300, 7], [400, 8], [500, 9]],
        "over500": { "to": 1000, "percent": 2, "rule": "2 percent of the total, rounded up" },
        "over1000": { "base": 20, "per": 100, "rule": "20, plus 1 for each 100, or fraction thereof, over 1000" },
        "vanOneIn": 6,
        "carWidthIn": 96, "vanWidthIn": 132, "vanWidthNarrowIn": 96, "aisleWidthIn": 60, "aisleWidthVanNarrowIn": 96,
        "maxSlope": 0.0208333,
        "maxSlopeText": "1:48 in any direction (502.4)"
      },
      "stall": {
        "source": "Typical design values (for example the stall and aisle dimensions tabulated in ITE and Urban Land Institute parking design guides); local zoning sets the real minimums",
        "verified": false,
        "wFt": 9, "lFt": 18, "parallelWFt": 8, "parallelLFt": 22
      },
      "aisle": {
        "source": "Typical design values, same as the stall row above; one-way aisles for angled stalls",
        "verified": false,
        "ftByAngle": { "90": { "one": 22, "two": 24 }, "75": { "one": 20, "two": 24 }, "60": { "one": 18, "two": 22 }, "45": { "one": 13, "two": 22 }, "30": { "one": 12, "two": 20 }, "0": { "one": 12, "two": 20 } }
      }
    },
    "custom": {
      "name": "Custom (the person enters the accessible count rule and every dimension)",
      "accessible": { "source": "the person's own code", "verified": false, "percent": 5, "min": 1, "vanOneIn": 6, "carWidthIn": 96, "vanWidthIn": 132, "vanWidthNarrowIn": 96, "aisleWidthIn": 60, "aisleWidthVanNarrowIn": 96, "maxSlope": 0.0208333, "maxSlopeText": "set by the person" },
      "stall": { "source": "the person's own code", "verified": false, "wFt": 9, "lFt": 18, "parallelWFt": 8, "parallelLFt": 22 },
      "aisle": { "source": "the person's own code", "verified": false, "ftByAngle": { "90": { "one": 22, "two": 24 }, "75": { "one": 20, "two": 24 }, "60": { "one": 18, "two": 22 }, "45": { "one": 13, "two": 22 }, "30": { "one": 12, "two": 20 }, "0": { "one": 12, "two": 20 } } }
    }
  }
}
;
