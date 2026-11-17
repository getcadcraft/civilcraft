---
title: CivilCraft iestatījumi
summary: Izvēlieties kopēto un ielīmēto punktu rindu kolonnu secību un failu kolonnu minēšanai, kā ielīmētie punkti tiek numurēti, ko rāda punktu uzraksti, stūra indikatoru, 3D vertikālo pārspīlējumu, kā rāda platumu un garumu un vai kartes slāņi nāk no interneta.
keywords: iestatījumi, preferences, pnezd, penzd, kolonnu secība, punktu rindas, pārnumurēt, punktu numuri, sākuma numurs, punktu uzraksti, uzraksti, apraksts, augstuma atzīme, skata kubs, asu ikona, stūra indikators, kompass, vertikālais pārspīlējums, 3d, platums, garums, dms, decimālie grādi, kartes slāņi, internets, privātums
from: 64b9cb92
---

Atveriet {{ui:Iestatījumi}} ar zobratu lietotnes joslā vai ar {{key:Mod+,}}. Pirmā cilne, {{ui:CivilCraft}}, satur iestatījumus, kas pieder šai lietotnei; {{ui:Vispārīgi}} satur tos, ko dalās katra CadCraft lietotne (motīvs, rīkjosla, paneļi). CivilCraft iestatījumi pastāv tikai lietotnē: jūs tos mainat šeit, un šis pārlūks tos atceras. {{ui:Atiestatīt CivilCraft iestatījumus}} atgriež katru iestatījumu sākuma vērtībā.

## Punktu rindas

**P, N, E, Z, D** (sākumā) vai **P, E, N, Z, D**: punkts, ziemeļkoordināta, austrumkoordināta, augstuma atzīme, apraksts vai austrumkoordināta pirms ziemeļkoordinātas. To izmanto trīs vietās:

- **Kopēt**: rindas, ko CivilCraft ieliek sistēmas starpliktuvē izklājlapai.
- **Ielīmēt**: rindas, kas ielīmētas no izklājlapas vai teksta faila bez galvenes rindas.
- **Importēt**: minējums dialogā **Importēt punktus**, kad failam nav galvenes rindas (fails ar četrām kolonnām tiek lasīts kā PENZ, ar trim kā ENZ). Skatiet [Punktu failu formāti](topic:point-file-formats).

Galvenes rinda, kas nosauc savas kolonnas, vienmēr uzvar, tāpat kā izvēle importēšanas dialoga sarakstā **Kolonnas**.

## Skaitļi ielīmētiem punktiem

- **Saglabāt brīvos numurus** (sākumā): ielīmētais punkts paturēs savu numuru, ja neviens punkts to nelieto; tikai konfliktējošiem punktiem tiks doti jauni numuri.
- **Vienmēr jauni numuri**: katrs ielīmētais punkts saņem jaunu numuru, pat ja tā paša numurs ir brīvs.

**Jaunie numuri sākas no**: atstājiet tukšu, lai skaitītu no viena vairāk par augstāko lietoto numuru. Ierakstiet skaitli, piemēram, 5000, lai dotu jauniem punktiem numurus no 5000; jau lietotie numuri tiek izlaisti. Divi punkti nekad neiegūst vienu numuru neatkarīgi no iestatījuma. Skatiet [Atlasīt, kopēt un ielīmēt uzmērījuma punktus](topic:copy-paste-points#point-numbers-never-clash).

## Punktu uzraksti

Ko punkta uzraksts rāda, kad {{ui:Punktu uzraksti}} ir ieslēgts sadaļā **Attēlošana**: **Numurs**, **Numurs un augstuma atzīme** vai **Numurs, augstuma atzīme un apraksts** (sākumā). DXF, DWG un PDF eksporti rāda tos pašus uzrakstus kā ekrānā.

## Stūra indikators

Kas atrodas plāna un 3D skata stūrī: **Skata kubs** (sākumā), **Asu ikona** vai **Nav**.

- **Skata kubs** (augšējā labajā). Plānā tas rāda augšu ar kompasa gredzenu: N ir režģa ziemeļi (plāna augšā). Noklikšķiniet jebkuru citu kuba pusi, malu vai stūri vai velciet to, un [3D skats](topic:site-3d) atveras, skatoties no turienes. {{ui:Sākums}} uz plāna kuba ietilpina plānu.
- 3D skatā kubs griežas kopā ar skatu: noklikšķiniet pusi, malu vai stūri, lai skatītos no turienes; velciet kubu, lai orbītu; velciet kompasa gredzenu, lai pagrieztu ap vertikāli; noklikšķiniet burtu, lai skatītos no tās puses; un izmantojiet {{ui:Sākums}} izometriskajam skatam uz visu objektu. Skatoties taisni uz pusi, mazās bultiņas pārslēdzas uz nākamo pusi, un izliektās bultiņas pagriež skatu par ceturtdaļu apgriezienu.
- **Asu ikona** (apakšējā kreisajā): mazs X (austrumi) un Y (ziemeļi) marķieris plānā, X, Y un Z (augšup) 3D.

## 3D vertikālais pārspīlējums

Cik stipri 3D skats izstiep augstuma atzīmes: **1×**, **2×** (sākumā), **3×**, **5×** vai **10×**. Saraksts 3D skata joslā ir tas pats iestatījums, tāpēc, mainot vienu, mainās abi. Apjomi, profili un 3D eksporti paliek patiesā mērogā.

## Platums un garums

Kā statusa joslā rāda rādītāja platumu un garumu, kad projektam ir koordinātu sistēma: **grādi, minūtes un sekundes** (sākumā, piemēram, `30°18′00.00″ N`) vai **decimālie grādi** (`30.300000° N`). Skatiet [Iestatīt projekta koordinātu sistēmu](topic:coordinate-systems#latitude-and-longitude-in-the-status-bar).

## Kartes slāņi no interneta

**Izslēgts** (sākumā) vai **Ieslēgts**. Ieslēgtā stāvoklī CivilCraft jautā kartes serveriem, ko pievienojat, attēlus par ekrānā redzamo apvidu. Jūsu zīmējums paliek šajā datorā; serveris redz apvidu un jūsu interneta adresi. Kamēr tas ir izslēgts, nevienam kartes serverim nejautā neko, pat ja atvērtais projekts to nosauc; georeferencēts attēls no faila darbojas abos gadījumos. Skatiet [Rādīt kartes slāņus zem plāna](topic:map-layers).

## Asistenti

**Ļaut MI asistentiem un skriptiem izmantot CivilCraft** (sākumā izslēgts) ļauj datora asistentam sasniegt atvērto objektu caur CadCraft Studio: **Lasīt** apraksta objektu un dod punktus, virsmas augstuma atzīmes, pikšetus, profilus, apjomus un zemesgabalus; **Rediģēt** ļauj tam atlasīt un pievienot uzmērījuma punktus; **Saglabāt** un **Eksportēt** ļauj tam saglabāt projektu un rakstīt LandXML vai DWG. **Mapes, ko tas var izmantot** (Studio) ir tās, kur tas var saglabāt un eksportēt. **Aktivitāte** uzskaita tā izsaukumus. Skatiet [Ļaut MI asistentam strādāt ar jūsu objektu](topic:assistants).
