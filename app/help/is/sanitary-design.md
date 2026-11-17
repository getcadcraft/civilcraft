---
title: Reikna hönnunarrennsli skolps og yfirfara skolplögnina
summary: Skráðu fólkið og flatarmálið sem kemur inn við hvern brunn í skolpneti; CivilCraft leggur það saman niður netið, reiknar hámarksrennslið með álagsstuðli og síun, og athugar afkastagetu og hraða hverrar pípu.
keywords: skolp, skolplögn, skolpvatn, hönnunarrennsli, hámarksrennsli, álagsstuðull, harmon, babbitt, síun, íbúafjöldi, á mann, hundraðshluti fullur, sjálfhreinsandi, hraði, stærð lagna, hönnunarblað
from: 73ba197a
---

Hönnunarrennsli skolps vinnur á [lagnanetinu](topic:pipe-network) þegar {{ui:Gerð}} þess er {{ui:Skolp}}. Þegar ekkert er valið sýnir hægri spjaldið þá **Hönnunarrennsli skolps** þar sem regnvatnsnet sýnir regnvatnsrennsli.

## Skráðu það sem kemur inn

1. Veldu brunn. Undir **Hönnunarrennsli skolps** skaltu skrifa inn {{ui:Íbúar sem koma hingað}} og {{ui:Flatarmál sem kemur hingað}} (hektarar í metraverkefni, ekrur í fetaverkefni).
2. Fyrir verslanir, skrifstofur eða iðnað skaltu skrifa inn jafngildan fjölda fólks: flatarmálið sinnum fjölda fólks á hektara (eða ekru) sem stofnunin þín notar. Flatarmálið telst fyrir síun hvort sem er.
3. Endurtaktu fyrir hvern brunn þar sem gata eða lóð tengist. Brunnur þar sem ekkert tengist heldur báðum gildum í 0.

Sérhver pípa ber allt sem kemur inn við efri brunn hennar og ofan við hann. Veldu brunn til að sjá hvað fer í gegnum hann.

## Stillingarnar

| Stilling | Hvað hún þýðir |
|---|---|
| {{ui:Rennsli á mann}} | meðalrennsli einnar manneskju á dag: lítrar (metraverkefni) eða bandarísk gallon (fetaverkefni) |
| {{ui:Síast}} | grunnvatn sem lekur inn: lítrar á sekúndu á hektara, eða gallon á dag á ekru |
| {{ui:Álagsstuðull}} | Harmon, 1 + 14 / (4 + √P), eða Babbitt, 5 / P^0,2, með P sem íbúafjölda í þúsundum |
| {{ui:Álagsstuðull að minnsta kosti}} / {{ui:Mesti álagsstuðull}} | stuðullinn er haldinn milli þessara tveggja gilda |
| {{ui:Manning n}} | fyrir afkastagetu og hraða |
| {{ui:Minnsti hraði}} / {{ui:Mesti hraði}} | við eigin dýpt hámarksrennslisins í pípunni |
| {{ui:Mesta hlutfall af fullri afkastagetu}} | hversu full pípa mega vera við hámark, sem hundraðshluti af því sem hún ber þegar hún rennur full |

Upphafsgildin eru bráðabirgðagildi, ekki staðall. Notaðu þau gildi sem stofnunin þín birtir.

## Það sem er reiknað

Fyrir hverja pípu, í rennslisröð:

- hámarksrennsli = fólk × rennsli á mann × álagsstuðull + flatarmál × síun
- afkastageta þegar hún rennur full (jafna Manning við halla pípunnar), og hversu full hámarkið gerir hana
- eðlilegt dýpi hámarksrennslisins og hraðinn þar

Taflan **Niðurstöður skolps** sýnir fólk, álagsstuðul, hámarksrennsli (L/s, eða gpm og rúmfet á sekúndu), hundraðshluta fulls og hraða hverrar pípu. Vandamál eru skráð undir henni: pípa sem er fyllri en mörkin, hægari en minnsti hraði (hún hreinsar sig kannski ekki), hraðari en mesti hraði, eða án falls. {{ui:Stilltu lagnirnar fyrir þessi rennsli}} velur fyrir hverja pípu minnstu staðlaða stærð (200 mm eða 8 tommur og upp) sem ber hámark hennar innan marka; ein {{key:Mod+Z}} afturkallar það.

:::note
Þetta er stöðugt hámarksrennsli sem hönnunarblað reiknar, og er borið saman við birt hönnunarblað að prentuðu námundunni. Þetta er ekki líkan af fráveitunni yfir tíma: engin rennslisrit, engin geymsla, engar dælur né yfirfall. Sjá [Ekki smíðað ennþá](topic:not-built-yet).
:::

Hraðar nota jöfnu Manning með sama n á hverju dýpi. Sumar stofnanir leyfa n að breytast með dýpi í hlutfallstöflum sínum, sem gefur örlítið lægri hraða í pípu sem rennur 60 til 70 prósent full (um 3 prósent minna).
