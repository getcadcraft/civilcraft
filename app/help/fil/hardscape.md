---
title: Paving, mga pader at hagdan
summary: Paving na may falls papunta sa drain o cross-fall, pattern at build-up nito; mga path na sumusunod sa ground; retaining at freestanding na pader na may stepped footing; kerbs; ramps at hagdan na sinusuri laban sa kanilang limit; IFC palabas.
keywords: hardscape, paving, pavers, patio, terrace, falls, drain, crossfall, herringbone, stretcher bond, path, walkway, retaining wall, garden wall, footing, coping, kerb, curb, edging, ramp, accessibility, hagdan, stairs, risers, treads, landing
from: 51475877
---

Muling kinakalkula ang Hardscape mula sa ground sa bawat pagkakataon, kaya sinusundan nito ang terrain at muling bumubuo kapag gumalaw ang ground o ang linya nito. I-drag ang mga sulok nito sa plano gaya ng anumang linya. Buksan ito mula sa {{ui:Hardscape}} sa Landscape group.

## Paving

I-click ang mga sulok at pindutin ang {{key:Enter}}. Sa Properties:

- **Level**: blangko = ang average na ground sa ilalim nito.
- **Falls**: level, isang **cross-fall** (% patungo sa isang direksyon), o **to a drain**: tinatanong ka ng CivilCraft na i-click kung saan pupunta ang drain, pagkatapos ay tumataas ang bawat sulok mula sa drain sa falls. Ipinapakita ng mga arrow sa plano ang falls.
- **Pattern** (grid, stretcher bond, herringbone) kasama ang unit size, joint at angle; lapad ng **Edging**. Sa sheet, hindi isinasama ang mga joint na mas malapit sa isang milimetro.
- Bahagi ng proposed surface ang paving. Napupunta sa IFC at sa mga quantity ang mga layer nito (pavers, bedding, base).

## Mga path

I-click sa kahabaan ng path at pindutin ang {{key:Enter}}. Sinusundan nito ang ground, na may **Cross-fall** nito sa kanang bahagi nito. Ang path na mas matarik sa **Pinakatarik na pinapayagan** ay minamarkahan ng `!` sa plano kung saan ito naroroon, at sinasabi ng Properties kung gaano ito katarik.

## Mga pader

I-click sa kahabaan ng pader at pindutin ang {{key:Enter}}. Ang pader ay **retaining** o **freestanding**. Kapag walang **Top**, nakatayo ito sa **Height** nito sa ibabaw ng ground sa buong haba; mag-type ng top para panatilihin itong pantay. Ang **footing** nito ay nasa itinakdang lalim sa ibaba ng ground at bumababa sa buong hakbang, kaya nananatili itong pantay sa pagitan nila. Ibinibigay ng Properties ang haba, taas, face area at footing steps nito; nilalagyan ng label ng plano ang top at bottom ng pader (TW / BW) sa bawat dulo.

:::warning
Minamarkahan ang retaining wall na mas mataas sa 1.2 m (4 ft): dinidisenyo ito ng isang engineer.
:::

## Kerbs

I-click sa kahabaan ng kerb at pindutin ang {{key:Enter}}; itakda ang lapad at upstand nito.

## Ramps

I-click mula sa ibaba papunta sa itaas at pindutin ang {{key:Enter}}. Galing ang mga level sa ground sa bawat dulo maliban kung ita-type mo ang mga ito. Nakakakuha ang ramp ng landing sa bawat rise na 750 mm (2.5 ft) at sinusuri ito laban sa **Pinakatarik na pinapayagan** (1:12 bilang panimula) at sa pinakamababang lapad; sinasabi ng Properties kung gaano ito dapat kahaba.

## Hagdan

I-click ang front edge ng pinakaibabang step, pagkatapos kung saan umaabot ang mga hagdan sa itaas, at pindutin ang {{key:Enter}}. Nagmumula ang bilang ng risers sa taas at sa **Largest riser**; ang going ay mula sa comfort rule na 2R + G ≈ 630 mm, hindi kailanman mas mababa sa **Smallest going**; isang landing sa bawat **Risers per flight at most**. Sinasabi ng Properties kung kasya ang mga ito sa pagitan ng dalawang punto o kung gaano pa kahaba ang kailangan nila.

:::note
Ang mga limit para sa ramps at hagdan ay mga default na may label. Itakda ang mga kailangan ng iyong building code.
:::

## Palabas sa CivilCraft

- Higit pa › {{ui:Export landscape IFC}}: paving at mga path bilang `IfcPavement`, mga pader bilang `IfcWall` (ang retaining wall bilang RETAININGWALL) kasama ang kanilang mga layer, kerbs bilang `IfcKerb`, ramps bilang `IfcRamp`, hagdan bilang `IfcStair` kasama ang kanilang risers at treads.
- Dinadala ng **Ipadala sa TakeoffCraft** ng plant schedule ang mga area ng paving at volume ng layer, face area at haba ng pader, haba ng kerb, at bilang ng step.
- Iginuguhit ng details sheet ang section ng bawat pader, ang build-up ng bawat paving at ang bawat flight ng hagdan. Tingnan ang [Landscape sheets](topic:landscape-sheets).
