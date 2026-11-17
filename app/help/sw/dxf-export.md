---
title: Hamisha mpango kwenda DXF
summary: Andika mistari ya mpango kama DXF ya R12 kwenye matabaka yenye majina, kontua kwenye mwinuko wake na mistari ya kuvunja kwa 3D, kwa programu yoyote ya CAD.
keywords: dxf, dwg, cad, hamisha, mistari, r12, 2000, 2004, 2007, 2010, 2013, 2018, matabaka, kontua, kubadilishana mchoro, ramani ya msingi, mandharinyuma
from: f2d8ede9
---

{{ui:DXF}} inaandika kile mpango unachoonyesha kama faili la DXF katika muundo wa R12, toleo ambalo kila programu ya CAD hulifungua. Ukiwa umetumia AutoCAD au Civil 3D, lifungue auliingize kama DXF nyingine yoyote.

## Hamisha

1. Panga mpango upendavyo: chini ya **Mwonekano**, chagua uso (uliopo au uliopendekezwa), muda wa kontua, na vitu vipi vionekane (kontua, lebo, nukta, lebo za nukta, pembetatu, mistari ya kuvunja, ukingo wa uso, mabomba, mishale ya mteremko).
2. Bofya {{ui:DWG/DXF}} kwenye kikundi cha **Hamisha**, kisha chagua {{ui:DXF (R12, text) — the plain exchange file}}, kisha {{ui:Download}}.
3. Kivinjari kinapakua `<name>.dxf`. Upau wa hali unasema, kwa mfano, "Imehamishwa R12 DXF: vitu 2,140; maandishi yamepimwa kwa 1" = 40'. Bendi hazihamishwi."

Viwianishi vinaandikwa katika vitengo vya mradi wako, kwa thamani zake halisi (viwianishi vya state plane vinabaki vilivyo). Hakuna kinachopimwa upya wala kuhamishwa.

## Kilichomo kwenye faili

| Kitu | Huluki ya DXF | Tabaka |
|---|---|---|
| Kontua ndogo na kubwa | Polilaini 2D kwenye mwinuko wake | C-TOPO-MINR, C-TOPO-MAJR |
| Lebo za kontua | Maandishi | C-TOPO-TEXT |
| Pembetatu | Polilaini | C-TOPO-TINN |
| Mistari ya kuvunja na mpaka | Polilaini 3D | C-TOPO-BRKL |
| Ukingo wa uso | Polilaini | C-TOPO-BNDY |
| Mishale ya mteremko | Polilaini | C-TOPO-SLOP |
| Nukta za upimaji na lebo zake | Nukta (pamoja na mwinuko), maandishi | V-NODE, V-NODE-TEXT |
| Mistari kutoka misimbo ya mistari | Polilaini 3D | V-NODE-LINE |
| Mistari ya katikati ya mpangilio wa njia | Mistari na matao | C-ROAD-CNTR |
| Alama za kituo na lebo zake | Polilaini, maandishi | C-ROAD-STAN |
| Kingo za korido | Polilaini | C-ROAD-CORR |
| Mistari ya sampuli | Polilaini | C-ROAD-SCTN |
| Majukwaa, mistari ya mwanga wa mchana, mistari ya mteremko | Polilaini | C-GRAD-PADS, C-GRAD-DAYL, C-GRAD-SLOP |
| Mistari ya vipengele | Polilaini 3D (matao kama vipande ndani ya 0.01; angalia [Mistari ya vipengele](topic:feature-lines)) | C-GRAD-FEAT |
| Njia za mzunguko | Polilaini, maandishi | C-ROAD-SWPT |
| Mabomba, miundo na lebo zake | Polilaini, maandishi | C-STRM-PIPE, C-STRM-STRC, C-STRM-TEXT |
| Mabomba na miundo yenye matatizo | Polilaini | C-STRM-PROB |

Kila tabaka lina rangi. Orodha kamili iko katika [Tabaka za mpango](topic:plan-layers).

## Ukubwa wa lebo

Maandishi lazima yawe na ukubwa katika vitengo vya mchoro. CivilCraft hupima lebo kwa kipimo ambacho mpango wote unatoshea karatasi ya Tabloid (futi) au karatasi ya A3 (mita), na husema kipimo hicho katika ujumbe wa hali. Ukichapisha kwa kipimo kingine kwenye programu yako ya CAD, pima maandishi huko.

## Kisichohamishwa

- Bendi za mwinuko (kwenye skrini tu).
- Mwonekano wa wasifu. Wasifu hutolewa kama LandXML, si kama mchoro.
- Uso wenyewe kama kitu cha 3D. Tumia LandXML kwa TIN, au washa {{ui:Triangles}} upate kingo zake kama mistari.
- Chochote ulichozima chini ya **Mwonekano**.

## DWG

{{ui:DWG/DXF}} huandika mistari hiyo hiyo kama mchoro wa DWG pia. Kisanduku chake cha mazungumzo kinauliza muundo: DXF, au DWG ya 2000, 2004, 2007, 2010, 2013 au 2018. Muundo wa 2000 hufunguka karibu kila programu ya CAD, za zamani na mpya; chagua mpya zaidi pale anayepokea mchoro anapoomba. Chaguo lako linakumbukwa kwenye kivinjari hiki.

1. Bofya {{ui:DWG}} kwenye kikundi cha **Hamisha**.
2. Chagua **Muundo** kisha ubofye **Pakua DWG**.
3. Kivinjari kinapakua `<name>.dwg`. Upau wa hali unasema kilichoingia, kwa mfano "Imehamishwa DWG (muundo wa 2018): polilaini 12, lebo 40 kwenye matabaka 9".

DWG ina matabaka, rangi, kontua (kama polilaini kwenye mwinuko wake), mistari ya kuvunja ya 3D, lebo na nukta sawa na DXF, katika viwianishi vilevile. Majina ya matabaka ambayo DWG haiwezi kuyashikilia yanabadilishwa, na ujumbe wa hali unasema hivyo. CivilCraft huandika DWG kwa msimbo wake yenyewe, kwa hiyo hakuna kinachotoka kwenye kompyuta yako.

### Tabaka za ramani kwenye DWG

Mchoro wa DWG hauwezi kubeba picha ndani yake: programu za CAD huonyesha picha inayokaa kando ya mchoro. Tabaka za ramani zikionekana, kisanduku cha mazungumzo kinatoa **Tabaka za ramani kama picha kando ya mchoro**. Ukiitia alama, upakuaji ni faili la `.zip` lenye `<name>.dwg`, `<name>-map.png` (tabaka za ramani juu ya mchoro mzima, hadi pikseli 4,096 kwa upana) na `<name>-map.pgw` (faili lake la dunia, kwa programu za GIS). Mchoro unaonyesha picha kama picha kwenye tabaka G-MAP-IMAG, mahali pake. Fungua faili zote kwenye folda moja na uziweke pamoja.
