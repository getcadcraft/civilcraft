---
title: Paving, mga pader at hakbang
summary: Paving na may bagsak papunta sa drain o cross-fall, pattern at build-up nito; mga path na sumusunod sa ground; retaining at freestanding na pader na may stepped footing; kerb; ramp at hakbang na sinusuri laban sa kanilang limit; IFC out.
keywords: hardscape, paving, pavers, patio, terasa, falls, drain, crossfall, herringbone, stretcher bond, path, daanan, retaining wall, pader ng hardin, footing, coping, kerb, curb, edging, ramp, accessibility, steps, hagdan, risers, treads, landing
from: d34b4466
---

Muling kinukuwenta ang hardscape mula sa ground sa tuwing magbabago ito, kaya sinusundan nito ang terrain at muling nabubuo kapag gumalaw ang ground o ang linya nito. I-drag ang mga sulok nito sa plano gaya ng alinmang linya. Buksan ito mula sa {{ui:Hardscape}} sa Landscape group.

## Paving

I-click ang mga sulok at pindutin ang {{key:Enter}}. Sa Properties:

- **Level**: walang laman = ang average na ground sa ilalim nito.
- **Falls**: level, isang **cross-fall** (isang % papunta sa isang direksyon) o **to a drain**: hihingin ng CivilCraft na i-click mo kung saan pupunta ang drain, saka tataas ang bawat sulok mula sa drain ayon sa bagsak. Ipinapakita ng mga arrow sa plano ang mga bagsak.
- **Pattern** (grid, stretcher bond, herringbone) kasama ang unit size, joint at anggulo; lapad ng **Edging**. Sa sheet, inaalis ang mga joint na mas malapit sa isang millimeter.
- Bahagi ng proposed surface ang paving. Ang mga layer nito (pavers, bedding, base) ay napupunta sa IFC at sa mga dami.

## Paths

I-click sa kahabaan ng path at pindutin ang {{key:Enter}}. Sinusundan nito ang ground, na may **Cross-fall** patungo sa kanang bahagi nito. Ang path na mas matarik kaysa sa **Steepest allowed** ay minarkahan ng `!` sa plano kung saan ito naroon, at sinasabi ng Properties kung gaano ito katarik.

Kung saan nagtatagpo ang path at ang kalsadang binuo ng corridor, humihinto ito sa panlabas na gilid ng kalsada, kapantay ng walk o shoulder doon, sa proposed surface at sa 3D view. Ang path na tumatawid sa kalsada ay ginagrade at ipinapakitang dalawang piraso, at ang dulong iginuhit na kulang hanggang dalawang beses ng lapad ng path mula sa kalsada ay dinadala hanggang sa gilid nito. Ipinapakita pa rin ng plano ang path gaya ng iginuhit mo, at ang haba at area nito ay binibilang ang buong linya. Tingnan ang [I-sweep ang road corridor](topic:corridor).

## Mga pader

I-click sa kahabaan ng pader at pindutin ang {{key:Enter}}. Ang pader ay **retaining** o **freestanding**. Kung walang **Top**, tatayo ito nang buong haba sa taas nitong **Height** mula sa ground; mag-type ng top para panatilihin itong pantay. Ang **footing** nito ay nasa itinakdang lalim sa ibaba ng ground at bumababa nang buong hakbang, kaya nananatili itong pantay sa pagitan nila. Ibinibigay ng Properties ang haba, taas, face area at footing step nito; nilalagyan ng label ng plano ang tuktok at ibaba ng pader (TW / BW) sa bawat dulo.

:::warning
Ang retaining wall na mas mataas sa 1.2 m (4 ft) ay minamarkahan: dinidisenyo ito ng isang engineer.
:::

## Mga kerb

I-click sa kahabaan ng kerb at pindutin ang {{key:Enter}}; itakda ang lapad at taas nito.

## Mga ramp

I-click mula sa ibaba papunta sa itaas at pindutin ang {{key:Enter}}. Ang mga lebel ay mula sa ground sa bawat dulo maliban kung ito ay itype mo. Ang ramp ay nakakakuha ng landing sa bawat pagtaas ng 750 mm (2.5 ft) at sinusuri laban sa **Steepest allowed** (1:12 sa umpisa) at sa pinakamababang lapad; sinasabi ng Properties kung gaano ito kahaba dapat.

## Mga hakbang

I-click ang harap na gilid ng pinakamababang hakbang, saka kung saan umaabot ang mga hakbang sa tuktok, at pindutin ang {{key:Enter}}. Ang bilang ng riser ay nanggagaling sa taas at sa **Largest riser**; ang going mula sa comfort rule na 2R + G ≈ 630 mm, hindi kailanman mas mababa sa **Smallest going**; isang landing sa bawat **Risers per flight at most**. Sinasabi ng Properties kung kasya ang mga ito sa pagitan ng dalawang punto o gaano pa kahaba ang kailangan nila.

:::note
Ang mga limit para sa ramp at hakbang ay mga default na may label. Itakda ang mga kailangan ng iyong building code.
:::

## Labas sa CivilCraft

- More › {{ui:I-export ang landscape IFC}}: paving at path bilang `IfcPavement`, pader bilang `IfcWall` (ang retaining wall bilang RETAININGWALL) kasama ang kanilang layer, kerb bilang `IfcKerb`, ramp bilang `IfcRamp`, hakbang bilang `IfcStair` kasama ang kanilang riser at tread.
- Dinadala ng **Send to TakeoffCraft** ng plant schedule ang mga area ng paving at volume ng layer, face area at haba ng pader, haba ng kerb at bilang ng hakbang.
- Iginuguhit ng details sheet ang section ng bawat pader, ang build-up ng bawat paving at ang bawat flight ng hakbang. Tingnan ang [Landscape sheets](topic:landscape-sheets).
