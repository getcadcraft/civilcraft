---
title: Skipuleggja þyngdarlagnanet
summary: Teiknaðu regnvatns- eða skolplagnir mannvirki fyrir mannvirki, settu reglur þínar um halla, yfirdekkingu og fall, láttu CivilCraft setja botnkóta og lagaðu vandamálin sem það listar.
keywords: smíði mannvirkis, gerð mannvirkis, rétthyrnt mannvirki, niðurfallsbrunnur, rammi, yfirdekking, veggþykkt, safnatriði, lagnanet, regnvatn, skolp, holræsi, mannvirki, brunnar, niðurföll, botnkótar, halli, fall, brún, sökkull, þyngdarlagnir
from: 10a3c14d
---

Verkefni geymir eitt þyngdarlagnanet, regnvatn eða skolp. Það er samsett úr mannvirkjum (brunnum, niðurföllum) og beinum lögnum á milli þeirra. Flæðið fer í þá átt sem þú teiknar. CivilCraft athugar hverja lögn og mannvirki gegn þremur reglum sem þú setur, og getur sett alla botnkóta eftir þeim reglum.

## Teiknaðu rennu

Þú getur teiknað lagnir án yfirborðs, en brúnir, yfirdekking og sjálfvirkir botnkótar þurfa það.

1. Ýttu á {{key:P}}, eða smelltu á {{ui:Pípur}} í hópnum **Hönnun**.
   Vísbendingin segir „Pípur: smelltu á mannvirki frá efst rennunnar niður (smelltu á fyrirliggjandi mannvirki til að tengja). Enter lýkur.“
2. Smelltu þar sem efra mannvirkið á að vera. Mannvirki er sett.
3. Smelltu á hvert næsta mannvirki neðar í rennunni. Til að tengjast mannvirki sem er þegar til, smelltu á það: stöðustikan segir „Tengt S3.“
4. Ýttu á {{key:Enter}}.
   Lagnirnar eru teiknaðar, botnkótar þeirra settir eftir reglunum, og stöðustikan segir til dæmis „3 lagnir teiknaðar, 12 botnkótar settir eftir reglunum; allar athuganir standast.“

Ný mannvirki heita S1, S2 … með 48 in (1200 mm) þvermál. Nýjar lagnir heita P1, P2 … með 12 in (300 mm) þvermál. Þvermál eru í tommum í fet-verkefni og í millimetrum í metra-verkefni.

Ljúktu með {{key:Enter}}. Tvísmellur virkar líka, en þegar þú tvísmellir á fyrirliggjandi mannvirki til að ljúka rennunni þar, tapast tengingin: smelltu einu sinni á það, og ýttu síðan á {{key:Enter}}.

## Stilltu reglurnar þínar

Þegar ekkert er valið hefur hægra spjaldið (**Verkefni**) **Lagnanet**-blokk:

| Stilling | Upphafsgildi | Merking |
|---|---|---|
| Gerð | Regnvatn | {{ui:Regnvatn}} eða {{ui:Skolp}}; skrifað í LandXML |
| Minnsti halli | 0.50% | Hver lögn verður að falla að minnsta kosti svo mikið |
| Minnsta yfirdekking | 2 ft (0.6 m) | Frá landi upp á topp röranna, alla lögnina |
| Fall í mannvirkjum | 0.10 ft (0.03 m) | Botnkóti úttaksins verður að vera að minnsta kosti svo langt undir botnkóta hvers inntaks |

**Þessi upphafsgildi eru bráðabirgðagildi, ekki staðall.** Settu þau gildi sem stofnun þín eða verkefnið krefst. Yfirdekking er mæld frá landi upp á topp (botnkóti plús innanmál); veggþykkt er ekki talin með. Þar sem pallar eða vegstokkar eru mótaðir er mótaða yfirborðið landið.

## Láttu CivilCraft setja botnkóta

- {{ui:Set every invert from the rules}} (í **Lagnanet**-blokkinni) setur allar lagnir.
- {{ui:Setja botnkóta hennar eftir reglunum}} (með einni lögn valinni) setur aðeins þá lögn.

Unnið niður á við: hver renna byrjar með að minnsta kosti yfirdekkingu við efsta mannvirki sitt, fellur að minnsta kosti um minnsta halla, fellur að minnsta kosti um fallið í gegnum hvert mannvirki, og fer dýpra alls staðar þar sem landið meðfram lögninni myndi skilja eftir minni yfirdekkingu en lágmarkið. Botnkótar eru námundaðir niður í 0.01, aldrei upp. Stöðustikan segir „Botnkótar settir: minnsta yfirdekking efst í hverri rennu, að minnsta kosti minnsti halli, að minnsta kosti fallið í hverju mannvirki.“ eða nefnir hvað það gat ekki gert.

## Breyttu mannvirkjum og lögnum

Smelltu á mannvirki eða lögn með {{ui:Velja}} til að sjá hana í hægra spjaldinu.

**Mannvirki**: **Heiti**, **Brún**, **Dýpt sökkuls**, **Þvermál**, síðan **Notuð brún**, **Sökkull**, **Austurhnit** og **Norðurhnit**, og lagnirnar inn og út með botnkótum sínum.

- Skildu **Brún** eftir auða til að taka hana úr yfirborðinu; reiturinn sýnir þá yfirborðsgildið í gráu. Sláðu inn gildi til að festa brúnina.
- Dragðu grip mannvirkisins á grunnmynd til að færa það. Lagnirnar fylgja; botnkótar þeirra haldast eins og þeir voru, svo athugaðu vandamálin á eftir.

**Gerð**: veldu eina af gerðum mannvirkja netsins (hér að neðan), eða engin fyrir kringlótt mannvirki með eigið þvermál.

**Lögn**: **Heiti**, mannvirkin sem hún liggur á milli, **Þvermál**, **Efri botnkóti**, **Neðri botnkóti**, og síðan **Lengd**, **Halli** og **Minnsta yfirdekking**.

Ýttu á {{key:Enter}} eftir hvert gildi.

## Lestu og lagaðu vandamál

Lagnanet-blokkin listar hvert vandamál (að 40); smelltu á eitt til að velja lögnina eða mannvirkið. Valin lögn eða mannvirki listar sitt eigið. Þegar ekkert er valið segir hún „Allar lagnir og mannvirki standast reglurnar.“

| Skilaboð (dæmi) | Hvað á að gera |
|---|---|
| „P2 rennur upp í móti (-0.40%).“ eða „… rennur flatt …“ | Skiptu um botnkótana, eða stilltu þá eftir reglunum. |
| „P2 við 0.30% er flatara en lágmarkið 0.50%.“ | Lækkaðu botnkóta niðurstreymis eða hækkaðu þann efri. |
| „P3 hefur 1.40 af yfirdekkingu 35 eftir sér, minna en lágmarkið 2.“ | Lækkaðu lögnina; stilltu botnkóta hennar eftir reglunum. |
| „Í S3 fer P4 út í 245.20, minna en 0.1 undir P3 sem kemur inn í 245.25.“ | Lækkaðu efri botnkóta úttakslagnarinnar. |
| „Hvel P1 er yfir brún S1.“ | Lögnin er of há fyrir mannvirkið. |
| „S2 hefur 2 lagnir sem fara út úr sér; þyngdarnet ætti að hafa eina útleið úr hverju mannvirki.“ | Fjarlægðu eina útgangslögn, eða teiknaðu hana aftur í réttri átt. |
| „Lagnirnar mynda lykkju; flæðið verður að enda í úttaki.“ | Rennan var teiknuð til baka í sjálfa sig; eyddu einni lögn. |
| „S5 er utan yfirborðsins og hefur enga brúnarhæð.“ | Sláðu inn brún, eða færðu mannvirkið á yfirborðið. |
| „P6 liggur að hluta utan yfirborðsins; yfirdekking þar er óþekkt.“ | Lengdu yfirborðið, eða sættu þig við að yfirdekking sé ekki athuguð þar. |
| „P7 hefur enga botnkóta enn.“ | Sláðu þá inn, eða stilltu þá eftir reglunum. |

Lagnir og mannvirki með vandamál eru einnig merkt rauð á grunnmynd.

## Gerðir mannvirkja

Gerð mannvirkis er mannvirki smíðað út frá breytum sínum: brunnur, niðurfall, tengikassi eða úttak, **kringlótt** (innanmál þvermál) eða **rétthyrnt** (innanmál breidd og lengd), með **veggþykkt** sinni, **gólfplötu**, **sökkli** fyrir neðan lægstu lögnina og **ramma og loki** (kringlótt eða rétthyrnt op, hæð ramma). Gerðir tilheyra netinu, undir **Gerðir mannvirkja** í Eiginleikum verkefnisins.

1. Smelltu á {{ui:Ný gerð mannvirkis}}. Glugginn teiknar mannvirkið á grunnmynd og í sniði þegar þú slærð inn.
2. Smelltu á {{ui:Bæta gerðinni við}}.
3. Veldu mannvirki og veldu gerðina undir **Gerð**. Það tekur stærð gerðarinnar og sökkul hennar; eigin sökkul þess má samt breyta.

Breyttu gerð og hvert mannvirki af þeirri gerð fylgir stærðum hennar. Fjarlægðu gerð og mannvirki hennar verða áfram kringlótt mannvirki af sömu breidd. Hver breyting er eitt skref: {{key:Mod+Z}} afturkallar hana.

Rétthyrnt mannvirki er teiknað á grunnmynd, í DXF, DWG og PDF, og í þrívídd sem rétthyrningur með lengd sína meðfram úttakslögn sinni; lagnir byrja við vegg þess. LandXML skrifar það sem rétthyrnt mannvirki (`RectStruct`) með veggþykkt sinni, og les slík mannvirki aftur sem gerðir.

### Deildu gerð í gegnum safnið

{{ui:Vista sem safnatriði}} skrifar gerðina sem CadCraft-safnatriði (`.json`-skrá): tákn hennar á grunnmynd, þrívíddarlíkama niður á dæmigerða dýpt, og allar stærðir. Hlaðið því upp í safnið til að deila. {{ui:Opna safnatriði}} les mannvirki sem var vistað þannig aftur inn í netið, breytt í einingar verkefnisins. Safnatriði sem eru ekki mannvirki gerð í CivilCraft eru hafnað, með ástæðu.

## Eyða

Veldu lögn og ýttu á {{key:Delete}} til að fjarlægja hana. Að eyða mannvirki fjarlægir líka lagnirnar sem tengjast því. Á Mac ýtirðu á Fn og Delete, eða smellir á {{ui:Eyða}}.

## Ekki útfært enn

Flæði, stærðir lagna og vatnshæðarlínan eru í [Regnvatnsrennsli](topic:storm-drainage). Lagnaskrár, óhringlaga lagnir, lagnir í langsniðssýninni, bognar lagnir og fleiri en eitt net í hverju verkefni eru ekki tiltæk enn. Sjá [Ekki útfært enn](topic:not-built-yet).
