---
title: Ingiza nukta za upimaji
summary: Fungua faili la nukta la CSV au maandishi, kagua mpangilio wa safu kwenye kisanduku cha Ingiza nukta, rekebisha mistari isiyoweza kusomwa, na panga nukta katika vikundi.
keywords: ingiza nukta, csv, txt, pnezd, penzd, faili la nukta, upimaji, nukta za cogo, vikundi vya nukta, safu, kaskazini, mashariki
from: ad33d88a
---

Faili la nukta ni faili la maandishi lenye nukta moja kwa kila mstari: namba ya nukta, kaskazini, mashariki, mwinuko na maelezo kwa mpangilio wowote, vikitenganishwa kwa koma, tabo, nusukoloni au nafasi. CivilCraft inalisoma kwenye kivinjari na kujenga uso kutoka humo papo hapo.

## Kabla ya kuanza

- Jua mpangilio wa safu za faili ukiweza (PNEZD na PENZD vinaonekana sawa kwa kompyuta).
- Jua vitengo vyake. CivilCraft haibadilishi: weka **Vitengo** kwenye paneli ya kushoto kulingana na faili (tazama [Vitengo, vituo na miundo ya namba](topic:units-and-stations)).
- Kuratibu zinaweza kuwa kubwa (kaskazini na mashariki za mfumo wa ndege wa jimbo za mamilioni ni sawa).

## Ingiza faili

1. Bofya {{ui:Fungua}} kwenye upau wa zana, au bonyeza {{key:Mod+O}}, kisha chagua faili. Pia unaweza kulivuta kwenye mpango.
   Kisanduku cha **Ingiza nukta** kinafunguka chenye jina la faili, orodha ya **Safu** iliyowekwa kwa {{ui:Tambua}}, mstari wa muhtasari na nukta sita za kwanza.
2. Soma mstari wa muhtasari. Unasema nukta ngapi zilizosomwa, kwa mpangilio gani wa safu, mpangilio huo ulipatikanaje, na kipi kinatenganisha safu. Njia tatu mpangilio unavyopatikana:
   - "kutoka safu ya kichwa": mstari wa kwanza unataja safu zake (Point, Northing, Easting, Elevation, Description, au X, Y, Z …). Hii ndiyo salama zaidi.
   - "kama ulivyochagua": umechagua mpangilio kwenye **Safu**.
   - "imekisiwa kutoka idadi ya safu na mpangilio wako wa safu za nukta (PNEZD) — hakikisha kaskazini na mashariki hazijabadilishwa": hakukuwa na kichwa kinachotumika. Ikiwa faili zako mara nyingi zina mashariki kwanza, weka **Safu za nukta** kuwa P, E, N, Z, D kwenye [mipangilio ya CivilCraft](topic:settings).
3. Kagua jedwali la onyesho. Safu zake daima ni **Nukta**, **Kaskazini**, **Mashariki**, **Mwinuko** na **Maelezo**, bila kujali faili linatumia mpangilio gani. Kaskazini na mashariki za eneo halisi kwa kawaida ni ukubwa tofauti kwa uwazi: zikionekana zimebadilishwa, ukisio ulikuwa mbaya.
4. Ikiwa mpangilio si sahihi, chagua sahihi kwenye **Safu** (kwa mfano {{ui:PENZD — nukta, mashariki, kaskazini, mwinuko, maelezo}}). Muhtasari na onyesho vinasasishwa papo hapo.
5. Tazama chini ya onyesho kwa **Mistari isiyosomwa**. Kila mstari unataja namba ya mstari kwenye faili, sababu na mwanzo wa safu hiyo. Tazama [Mistari isiyosomwa](topic:import-points#rows-that-are-not-read).
6. Bofya {{ui:Ingiza}}.
   Nukta zinaonekana kwenye mpango, mwonekano unakuza kwazo na uso unajengwa. Upau wa hali unasema, kwa mfano, "Imeingizwa nukta 276 kutoka site.csv; uso: pembetatu 546."

Ikiwa mradi haukuwa na jina bado, unachukua jina la faili.

## Angalia vikundi

Kila nukta ni ya kikundi kinachotajwa kwa **neno la kwanza la maelezo yake**, kwa herufi kubwa: "GRD", "FL 12" na "fl" ni vikundi GRD, FL na FL. Nukta zisizo na maelezo huingia kwenye "(hakuna maelezo)".

1. Angalia jedwali chini ya **{{ui:Nukta}}** kwenye paneli ya kushoto: kikundi, idadi ya nukta na chaguo la **Uso**.
2. Kila kikundi kinaanza kama {{ui:Nukta}}. Badilisha mistari ya mtiririko, kingo za lami, juu na chini ya miteremko, mistari ya matuta na mistari mingine iliyopangiwa msimbo kuwa {{ui:Mstari wa kuvunja}}. Weka vikundi visivyopaswa kuunda ardhi (nukta za udhibiti, juu za miti, nguzo za huduma zilizopigwa juu) kuwa {{ui:Imeachwa}}.
3. Bofya nukta kwenye mpango (kwa {{ui:Chagua}}) ili kuona namba yake, kuratibu zake, mwinuko, maelezo na kikundi chake kwenye paneli ya kulia.

:::warning
Kikundi cha {{ui:Mstari wa kuvunja}} kinaunganisha nukta **zote** kuwa **mstari mmoja**, kwa mpangilio wa namba za nukta. Hilo hufanya kazi pale kila mstari uliopigwa ulipigwa kwa mpangilio wake na msimbo wake. Mistari miwili tofauti ya mtiririko yote ikiwa na msimbo "FL" inakuwa mstari mmoja unaozunguka kati yake. Ikiwa misimbo yako inashirikiwa, tumia zana ya {{ui:Mstari wa kuvunja}} kubofya nukta za kila mstari (tazama [Jenga na boresha uso](topic:build-surface)).
:::

## Mistari isiyosomwa

| Sababu inayoonyeshwa | Maana yake | Cha kufanya |
|---|---|---|
| "northing au easting si namba" | Safu ya kuratibu ina maandishi | Angalia mpangilio wa safu, au mstari wa maandishi uliopotea katikati ya faili |
| "mwinuko si namba" | Safu ya mwinuko ina maandishi | Mpangilio mbaya wa safu, au maelezo kwenye safu ya mwinuko |
| "hakuna namba ya nukta" | Safu ya nukta ni tupu | Ipe nukta namba, au chagua mpangilio bila P (NEZD, NEZ …): nukta basi zinahesabiwa 1, 2, 3 … |
| "nukta 12 inaonekana mara mbili (ya kwanza imehifadhiwa)" | Safu mbili zina namba moja | Badilisha namba ya moja kati yao kwenye faili ikiwa yote ni upigaji halisi |
| "safu 3, zinatarajiwa 5 (PNEZD)" | Safu ni fupi | Mstari uliovunjika, au mpangilio mbaya wa safu |

Nukta yenye mwinuko tupu inahifadhiwa, lakini haitumiki kwenye uso. Takwimu za **Nukta** zinaonyesha nukta ngapi zina mwinuko.

Mistari inayoanza na `#`, `;` au `//` ni maoni na huruka. Mistari tupu huruka.

## Badilisha au ongeza nukta

Kuingiza tena **kunabadilisha** nukta zote; hazioongezi. Mistari yako, miraba, mabomba, mistari ya kuvunja uliyochora na mpaka vinabaki. Historia ya kutendua inafutwa, hivyo hifadhi mradi kwanza ikiwa unaweza kutaka nukta za zamani tena. Ili kuunganisha faili mbili, ziunganishe kwenye kihariri cha maandishi au lahajedwali kabla ya kuingiza (angalia namba za nukta zinazojirudia).

Nukta bado haziwezi kuhamishwa, kuhaririwa au kufutwa ndani ya CivilCraft. Zirekebishe kwenye faili kisha uingize tena.

## Husika

- [Miundo ya faili za nukta](topic:point-file-formats): kila mpangilio wa safu na jinsi vichwa vinavyotambuliwa.
- [Jenga na boresha uso](topic:build-surface).
