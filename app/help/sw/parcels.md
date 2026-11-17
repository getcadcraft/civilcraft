---
title: Chora viwanja na uandike maelezo yao ya kisheria
summary: Chora kiwanja kwa pembe zake au ingiza mistari ya hati, kagua jinsi mistari inavyofungana, weka lebo za mwelekeo na umbali kwenye mpango, fanya kozi yoyote kuwa mkunjo, na nakili rasimu ya maelezo ya kisheria.
keywords: viwanja, mistari ya mali, mpaka, hati, ramani ya mpaka, mwelekeo, umbali, kufunga, usahihi, maelezo ya kisheria, nukta ya kuanzia, mkunjo, radius, eneo, ekari
from: 6793d6ce
---

Viwanja vinakaa kwenye mpango na mwelekeo na umbali kando ya kila kozi ya moja kwa moja (mkunjo unaonyesha radius yake, urefu na pembe kuu ya kati), pamoja na jina lake na eneo lake katikati. Vinaingia kwenye chapisho la PDF na eksporti za DWG na DXF, kwenye tabaka `V-PROP` (mistari) na `V-PROP-TEXT` (lebo). Kila kitu kiko chini ya **Viwanja** kwenye paneli ya kulia wakati hakuna kilichochaguliwa.

## Chora kiwanja

1. Bofya **Chora kiwanja**.
2. Bofya pembe, ukianza kwenye nukta ya kuanzia. Bofya karibu na pointi ya upimaji huchukua mahali halisi pa pointi hiyo.
3. Bofya pembe ya kwanza tena, au bonyeza {{key:Enter}}, kumaliza. {{key:Backspace}} hutendua pembe ya mwisho; {{key:Esc}} huondoa pembe zilizowekwa hadi sasa; bonyeza tena ili uondoke kwenye zana.

## Weka mistari kutoka kwenye hati

1. Bofya **Weka mistari ya hati**.
2. Sema mistari inapoanzia: nambari ya pointi ya upimaji, au northing na easting.
3. Andika au bandika mistari, moja kwa kila mstari:
   - mstari: mwelekeo na umbali, kama `N 45°30'15" E 125.50`. `N45-30-15E`, `N 45 30 15 E`, `N 45.5 E` na azimuth (`AZ 45°30'15"`) pia zinafanya kazi, na "thence", koma na "feet" hupuuzwa.
   - mkunjo: `C R 300 L 52.36 right` (radius na urefu wa upinde), au `C R 300 D 10°00'00" left` (radius na pembe kuu ya kati). Mkunjo unafuata kozi iliyo kabla yake; usipofanya hivyo, ongeza mwelekeo wa chord yake: `C R 300 L 52.36 right CB N 50 00 00 E`.
   - `#` huanza mstari wa maoni.
4. Unapoandika, kisanduku kinaonyesha urefu wa mistari, **kutofunga** (mbali kiasi gani kutoka mwanzo yanapoishia, na upande gani), **usahihi** (urefu ukigawanywa kwa kutofunga, 1 : 10,000 na kadhalika) na eneo. Mistari isiyosomeka inaorodheshwa pamoja na nambari zake za mstari.
5. **Ongeza kiwanja**. Mistari isipofunga, kiwanja kinafungwa kwa kozi ya moja kwa moja kuvuka pengo: kagua mistari dhidi ya hati. Ili kusambaza kosa la traverse ya shambani kwenye kozi zake, rekebisha kwanza.

## Mikunjo

Kwenye **Sifa** za kiwanja, kila kozi ina **Radius**. Andika moja ili kufanya kozi hiyo kuwa mkunjo kupitia pembe mbili zile zile (radius ndogo kuliko nusu ya umbali kati ya pembe haifikii, kwa hiyo inakataliwa), na chagua **Kulia** au **Kushoto** kwenye **Mikunjo**: mkunjo wa kulia una kituo chake upande wa kulia wa mwelekeo wa kusafiri, kama kwenye hati. Futa radius ili kuifanya tena moja kwa moja. Kila mabadiliko ni hatua moja: {{key:Mod+Z}} inaitendua.

## Maelezo ya kisheria

Sifa za kiwanja huisha na maelezo yake ya kisheria, yaliyoandikwa kutoka kwenye mchoro:

- "Beginning at" **Nukta ya kuanzia** unayoandika (kwa mfano "kona ya kaskazini-mashariki ya Lot 4"), vinginevyo northing na easting ya pembe ya kwanza, au pointi ya upimaji ambayo mistari ilianzia.
- "thence" kila kozi: mwelekeo na umbali, au mkunjo wenye radius yake, urefu wa upinde, pembe kuu ya kati, na mwelekeo na umbali wa chord.
- "Containing" eneo lake kwa feet za mraba na acres (mita za mraba na hectares katika mradi wa mita).

**Nakili** huiweka kwenye ubao wa kunakili; **Pakua kama maandishi** huhifadhi faili ya `.txt`.

:::warning
Maelezo ya kisheria ni rasimu kutoka kwenye mchoro, si upimaji rasmi. Mpima ardhi mwenye leseni lazima aikague dhidi ya rekodi na aisaini kabla ya mtu yeyote kuitegemea.
:::

Bofya ndani ya kiwanja kwenye mpango ili kukichagua; {{key:Delete}} kinakiondoa. Viwanja vinahifadhiwa kwenye faili ya mradi.
