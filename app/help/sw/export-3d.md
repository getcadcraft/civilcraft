---
title: Hamisha eneo kwa 3D
summary: Hifadhi kile mwonekano wa 3D unachoonyesha kama faili la GLB au OBJ kwa programu nyingine za 3D, kwa mita na Y juu, kuzunguka asili ya ndani ambayo faili inaihifadhi.
keywords: glb, gltf, obj, hamisha 3d, hamisha modeli, injini ya mchezo, taswira, kitazamaji 3d, mita, y juu, asili, asili ya ndani, state plane
from: 07d23992
---

Mwonekano wa 3D unahamisha kile unachoonyesha kama modeli ya 3D ambayo programu nyingine inaweza kuifungua: kitazamaji cha 3D, kifaa cha kumodeli, injini ya mchezo au zana ya taswira.

## Hamisha

1. Fungua mwonekano wa 3D ({{key:D}}) kisha uchague kinachoonekana kwa {{ui:Show}}. Kisichoonekana hakihamishwi.
2. Bofya {{ui:GLB}} au {{ui:OBJ}} kwenye upau.
   Faili linapakuliwa kama "*jina la mradi*-3d.glb" au "-3d.obj", na upau wa hali unaonyesha asili.

## Faili zinashikilia nini

| | GLB | OBJ |
|---|---|---|
| Nyuso | Matundu yenye kawaida na rangi za bendi au za uso | Matundu yenye kawaida (bila rangi) |
| Mabomba na miundo | Matundu ya mviringo, yenye matatizo kwa nyekundu | Matundu ya mviringo |
| Kontua, mistari ya kuvunja, mipangilio ya njia, alama, na mistari ya korido na majukwaa | Mistari, kila seti kwa rangi yake | Rekodi za mistari (`l`) |
| Nukta za upimaji | Nukta | Rekodi za nukta (`p`) |

Kila seti inahifadhi jina lake ("Ardhi iliyopo", "Mabomba", "Kontua kubwa" na kadhalika), kwa hiyo unaweza kuificha au kuipa mtindo kwenye programu nyingine.

## Vitengo, shoka na asili

- **Mita.** Mradi wa futi unabadilishwa kutoka futi za upimaji wa Marekani (1 ft = 1200/3937 m).
- **Y juu**, mkataba wa kawaida wa miundo hii: easting inakuwa +X, mwinuko +Y, na northing −Z.
- **Ukubwa halisi.** Ukuzaji wima wa mwonekano hautumiki.
- **Asili ya ndani.** Viwianishi vya state plane ni mamilioni ya futi, kubwa mno kwa nambari za usahihi-moja ambazo miundo hii inazihifadhi, kwa hiyo faili limeandikwa kulingana na asili iliyo karibu: asili ya ardhi iliyopo yenyewe kwa easting na northing, na mwinuko wake wa chini kabisa uliozungushwa chini. Asili, kwa vitengo vya mradi, imerekodiwa kwenye faili: kwenye GLB kama `extras` kwenye eneo na nodi yake ya juu, kwenye OBJ kama mstari wa maoni karibu na juu (`# origin easting … northing … elevation …`). Ili kuweka modeli tena kwenye viwianishi vya mradi, ongeza asili (baada ya kubadilisha mita kurudi kuwa futi kwenye mradi wa futi).

## Bado hazijajengwa

- Kuhamisha mwonekano uliokuzwa wima, au kuhamisha kwa vitengo vya mradi badala ya mita.
- Maumbo ya uso (textures), faili la nyenzo kwa OBJ (.mtl) na sifa za kila kitu (majina ya mabomba na miundo yapo CivilCraft pekee).
- Kuhamisha korido kama yabisi tofauti, au mwonekano wa wasifu kwa 3D.
