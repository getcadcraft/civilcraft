---
title: Mga menu, key at mouse
summary: Pumili ng menu style na tugma sa paraan ng pagtatrabaho mo, bigyan ang anumang command ng sarili mong key, ilipat ang mga command sa pagitan ng ribbon tab, at itakda kung ano ang gagawin ng wheel at ng mga button ng mouse sa plan at sa 3D.
keywords: menu style, menus, ribbon, civil ribbon, toolbar, command line, drafting classic, keyboard shortcuts, hotkeys, keys, customize, remap, rebind, mouse, wheel, invert, direksyon ng zoom, middle button, right button, pan, orbit, export, import, paglipat, pamilyar
from: 07ac73a0
---

Pareho ang mga command ng CivilCraft anuman ang paraan ng pag-abot mo sa mga ito. Ang **menu style** ay nagpapasya lamang kung saan sila nakalagay sa screen, ano ang tawag sa mga ito roon at aling mga key ang nagpapatakbo sa mga ito, kaya maaari mong panatilihin ang mga nakasanayan mo. Pumili sa {{ui:Mga setting}} ({{key:Mod+,}}) › {{ui:CivilCraft}} › {{ui:Mga menu, key at mouse}}; agad ang pagbabago, at natatandaan ito ng browser na ito.

## Ang tatlong style

| Style | Ano ang makukuha mo |
|---|---|
| {{ui:CivilCraft}} | Sariling toolbar ng CivilCraft (File, I-export, Surface, Design, Edit, GIS, View) at mga single key: {{key:A}} alignment, {{key:G}} pad, {{key:P}} pipes, {{key:B}} breakline, {{key:O}} boundary, {{key:L}} feature line, {{key:R}} profile, {{key:X}} sections, {{key:E}} grades, {{key:D}} 3D, {{key:F}} fit, {{key:V}} piliin. Ang panimulang style. |
| {{ui:Drafting classic}} | Maliit na ribbon ({{ui:Home}}, {{ui:Insert}}, {{ui:Output}}) at isang command line, para sa mga taong nagta-type ng command: ALIGNMENT, PAD, PIPE, FEATURELINE, BREAKLINE, PROFILE, SECTIONS, U (I-undo), ZOOM, 3D, PLOT, LANDXML, XATTACH, MAPIMPORT, HELP. Magsimulang mag-type kahit saan at mapupunta ang mga letra sa command line; pinapatakbo ng {{key:Enter}}, inuulit ng {{key:Enter}} sa walang laman ang huling command, at nililinis ito ng {{key:Esc}}. Ang middle button ay nagpa-pan. |
| {{ui:Civil ribbon}} | Mga tab ng malalaking button na pinagrupo ayon sa paraan ng pagpapangkat ng mga civil design program sa kanilang mga tool: {{ui:Home}} (ground data, create design, profile at section views), {{ui:Surfaces}}, {{ui:Modify}}, {{ui:Geolocation}}, {{ui:View}} at {{ui:Output}}, kasama ang menu na {{ui:File}} at mga quick button sa kanan. Nananatili ang mga single key. Ang middle button ay nagpa-pan sa plan; sa 3D, nagpa-pan ang middle button at ang {{key:Shift}} kasama ang middle button ay nag-o-orbit. |

Pinananatili ng bawat style ang mga {{key:Mod}} key: {{key:Mod+Z}}, {{key:Mod+Y}}, {{key:Mod+S}}, {{key:Mod+O}}, {{key:Mod+P}}, {{key:Mod+C}}, {{key:Mod+X}}, {{key:Mod+V}}, {{key:Mod+D}}, {{key:Mod+A}}.

:::tip
Ang key na kabilang sa sariling layout ng CivilCraft pero ibinigay ng iyong style sa ibang command ay walang gagawin, at sinasabi ng status line kung saan napunta ang command nito ("Sa Sariling keys, Pad ay Ctrl+Alt+G"). Palaging nananatili ang kahulugan ng {{key:Delete}}, {{key:Esc}}, {{key:Enter}}, {{key:Tab}}, {{key:Space}} at ng mga arrow, at habang gumuguhit ka ng linya, nananatili sa kanilang mga key ang mga punto nito ({{key:Backspace}}, {{key:Enter}}).
:::

## Gawing sarili mo ito

1. Piliin ang style na pinakamalapit sa gusto mo, saka i-click ang {{ui:I-customize…}}.
2. Sa {{ui:Mga key at menu}}, hanapin ang isang command (nakakatulong ang search box). I-click ang {{ui:Magdagdag ng key}} at pindutin ang key, o dalawang key nang sunod-sunod para sa dalawang-letrang key. I-click ang isang key para alisin ito.
3. Sa isang ribbon, inililipat ng {{ui:Kung saan ito nakalagay}} ang command sa ibang tab at panel, sa menu na {{ui:File}}, o sa {{ui:Keys lamang}}.
4. Sa {{ui:Mouse}}, itakda ang wheel, ang mga button na nagpa-pan sa plan, at kung ano ang gagawin ng bawat button sa 3D view.
5. Bigyan ito ng pangalan at i-click ang {{ui:I-save}}.

Ang pag-save ng built-in na style ay gumagawa ng sarili mong kopya ("My Civil ribbon"); hindi nagbabago ang built-in. Ang key na ibinigay sa dalawang command, o ang key na tatakbo bago pa ma-type ang isang dalawang-letrang key, ay ipinapakitang pula at kailangang ayusin bago mo ma-save ito.

## Mouse

- **Mouse wheel**: {{ui:Ang pag-scroll pataas ay nag-zoom in}} (ang panimula) o {{ui:Ang pag-scroll pataas ay nag-zoom out}}, at kung gaano kabilis, sa plan at sa 3D. Ang pinch sa trackpad ay laging nag-zo-zoom ayon sa galaw ng mga daliri mo.
- **Pan the plan with**: ang middle button, ang right button, o pareho. Ang {{key:Space}} at drag ay nagpa-pan din. Ang left button ay laging pumipili at gumuguhit.
- **Drag in the 3D view**: {{ui:Bawat view ang sariling setting}} ay pinananatili ang mga button ng CivilCraft (left ay nag-o-orbit, right ay nagpa-pan). O itakda ang bawat button na mag-orbit, mag-pan, mag-zoom o walang gawin; ang {{key:Shift}} kasama ang button ay nagpapalit ng orbit at pan. Ang click na walang drag ay pumipili pa rin.

## Dalhin mo ito kahit saan

{{ui:I-export}} ay nag-i-save ng style na ginagamit bilang maliit na `.ccinput.json` file; ang {{ui:Mag-import…}} ay nagdadagdag ng isa, mula sa ibang computer o katrabaho. Ang na-import na file ay maaari lamang tumuro sa sariling command ng CivilCraft: anumang iba pa ay inaalis at binibilang sa status line. Inaalis ng {{ui:Burahin ang istilong ito}} ang isa sa sarili mo.

:::note
Nananatili sa browser na ito ang mga setting na ito. Ang {{ui:Gamitin ang istilong ito sa bawat app}} sa ilalim ng style cards ay nagpapabukas ng bawat app sa katugmang style nito (sariling toolbar, ribbon o Drafting classic), kasama ang mga pagbabagong ginawa mo sa bawat app. Walang menu-bar style ang CivilCraft: kapag ang menu bar ng ibang app ang pinili para sa bawat app, pinananatili ng CivilCraft ang sarili nitong toolbar.
:::

Kaugnay: [Keyboard at mouse](topic:keyboard) · [Mga setting ng CivilCraft](topic:settings) · [Galing sa ibang civil software](topic:coming-from)
