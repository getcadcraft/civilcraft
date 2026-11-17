---
title: Vodovod - tlaki, pretoki in pretok za gašenje
summary: Narišite tlačno omrežje vozlišč, zbiralnikov, rezervoarjev, cevi, črpalk in reducirnih ventilov na načrtu; CivilCraft izračuna višine, tlake in pretoke (Hazen–Williams, zankasta omrežja), pretok, ki je na voljo za gašenje, in dan porabe. Laboratorijska funkcija; vsak rezultat potrebuje preverjanje inženirja.
keywords: voda, vodovod, razvod vode, tlačno omrežje, tlačna cev, zankasto omrežje, hazen-williams, faktor C, izguba višine, preostali tlak, pretok za gašenje, hidrant, poraba, vozlišče, zbiralnik, rezervoar, črpalka, krivulja črpalke, reducirni ventil, prv, nepovratni ventil, podaljšano obdobje, epanet, inp, hitrost
from: df46bf6d
---

Vodovod je tlačna stran mesta: cevi, ki so vedno polne, vodo potiska zbiralnik, rezervoar ali črpalka. CivilCraft izračuna višino in tlak v vsakem vozlišču ter pretok v vsaki cevi, tudi pri zankastih omrežjih, kjer ima voda več poti. Funkcija je v laboratoriju, dokler se preverja.

**Samo pomožni izračun.** Vsako število potrebuje preverjanje kvalificiranega inženirja: odgovor je tako dober, kot so dobre porabe, kote, velikosti cevi in hrapavosti, ki ste jih vpisali, stacionarni model pa ne ve nič o vodnem udaru, kakovosti vode ali dejanskem obnašanju gasilske črpalke.

## Narišite omrežje

1. Pod **Površje** › {{ui:Več}} izberite {{ui:Vodovod …}}. Okno ostane odprto, medtem ko delate na načrtu.
2. Izberite {{ui:Zbiralnik}} in kliknite na načrt, kjer je vir. Njegova višina se začne 100 ft (30 m) nad terenom; spremenite jo v Lastnostih.
3. Izberite {{ui:Vozlišče}} in kliknite vsako mesto, kjer se voda odvzema ali se cevi srečajo. Vozlišče vzame svojo koto iz terena; v Lastnostih vpišite drugo, da jo preglasite.
4. Izberite {{ui:Cev}}, kliknite vozlišče, nato vozlišče, na katero se priključi. Orodje ostane vklopljeno za naslednjo cev. {{ui:Črpalka}} in {{ui:Reducirni ventil}} se rišeta enako, od sesalnega (ali zgornjega) vozlišča do odvodnega (ali spodnjega) vozlišča. {{ui:Rezervoar}} se postavi kot vozlišče.
5. Izberite vozlišče in vpišite njegovo {{ui:Poraba}} (gpm, ali L/s v projektu v metrih). Izberite cev in nastavite njen {{ui:Premer}} (in ali mm) ter, če ga poznate, njen Hazen–Williams C.

Vsaka sprememba je en korak razveljavitve. Tipka Delete odstrani vozlišče in cevi, ki se vanj končajo.

## Kaj pomeni vsak del

- **Cev.** Dolžina se meri vzdolž načrta, razen če jo vpišete. C je Hazen–Williams hrapavost (130 za začetek, privzeto spremenite v oknu). Koeficient manjših izgub K doda izgube upogibov in fitingov. Označite **Nepovratni ventil** za cev, ki ne sme prenašati vode nazaj; **Zaprta** cev ne prenaša ničesar.
- **Zbiralnik.** Vir pri stalni višini, nivo vode, ki jo drži nad referenčno ravnino. Dá ali odvzame, kar omrežje potrebuje.
- **Rezervoar.** Nivo, ki se spreminja čez dan. V stacionarnih rezultatih je to vir pri svojem trenutnem nivoju.
- **Črpalka.** Ena projektna točka (pretok in višina) da običajno krivuljo skozi njo: višina pri nič pretoka je 133 % projektne višine, višina pa je nič pri dvakratnem projektnem pretoku. Črpalka nikoli ne potisne vode nazaj.
- **Reducirni ventil.** Drži tlak, ki ga nastavite za seboj, medtem ko je dovod višji. Ko je dovod nižji, je odprt in ne drži ničesar; če bi voda tekla nazaj, se zapre.

## Preberite rezultate

Okno prikaže višino in tlak vsakega vozlišča ter pretok, hitrost in izgubo višine na 1,000 ft (ali na km) za vsako povezavo. Vozlišča na načrtu so obarvana: zeleno je med vašim najnižjim in najvišjim tlakom, rdeče pod njim, oranžno nad njim. Puščice pretoka kažejo smer. Izberite vozlišče ali cev, da v Lastnostih preberete njene številke.

Pod tabelami je seznam, na kaj paziti: nizek ali visok tlak, cev, hitrejša od vaše meje, vozlišče, odrezano od vseh virov, ali reševalnik, ki se ni ustalil. Enake ugotovitve so v podoknu Težave. Meje nastavite v oknu (20 psi, 100 psi in 10 ft/s za začetek; 140 kPa, 700 kPa in 3 m/s v projektu v metrih).

## Pretok za gašenje

{{ui:Pretok za gašenje …}} nariše pretok na enem vozlišču in pokaže tlak tam ter najnižji tlak kjerkoli v omrežju. Prav tako poišče pretok, ki je na voljo na tem vozlišču, medtem ko najšibkejše vozlišče v omrežju ohranja preostali tlak, ki ga vpišete. Druge porabe ostanejo, kakršne so.

## Dan porabe

{{ui:Dan porabe …}} zažene omrežje uro za uro. Vpišite vzorec porabe v nastavitvah datoteke (seznam množiteljev, ki se ponavlja); rezervoarji se polnijo in praznijo s pretokom noter in ven, črpalka pa lahko sledi vzorcu vklop/izklop. Rezervoar, ki doseže svojo najvišjo ali najnižjo raven, je naveden na seznamu: CivilCraft zanj ne zapre njegovega dotoka ali odtoka, zato to berite kot „ta rezervoar je premajhen ali črpalka prevelika“.

## Besedilo EPANET

{{ui:Shrani kot besedilo EPANET (.inp)}} zapiše omrežje v navadnem besedilnem formatu, ki ga številni vodovodni programi berejo, {{ui:Odpri besedilo EPANET (.inp) …}} pa jih prebere. Prenese se samo tisto, kar CivilCraft modelira: vozlišča, zbiralniki, rezervoarji, cevi, črpalke s krivuljo višine, reducirni ventili, vzorci porabe in časi. Drugi tipi ventilov, črpalke, podane z močjo, in druge formule izgube so poimenovane in izpuščene. Datoteka mora uporabljati iste enote kot projekt.

## Hidranti, ventili in fitingi

Izberite vozlišče in označite **Hidrant**, da ga tam postavite; izberite glavno cev in pritisnite **Dodaj na sredino**, da nanjo postavite ventil, zračni ventil, izpust ali merilnik. So predmeti omrežja: premikajo se z njim in en korak razveljavitve jih odstrani.

Razporeditev nakazuje tudi fitinge, CivilCraft jih našteje brez vprašanja: **T-kos** tam, kjer se srečajo tri glavne cevi, **križ**, kjer se srečajo štiri, **koleno** (z svojim kotom), kjer se dve glavni cevi obrneta za 5° ali več, **reducirni kos**, kjer se srečata dve velikosti, in **zaporni pokrov** na slepem koncu. {{ui:Razpredelnica fitingov (CSV)}} jih prešteje ter glavne cevi po velikosti. To je tisto, kar nakazuje razporeditev, popis količin za preverjanje glede na vaše podrobnosti, ne seznam za naročilo.

Glavne cevi so položene na teren zmanjšan za kritje (4 ft ali 1.2 m), da jih je mogoče narisati in modelirati v 3D; zgornji tlaki od tega nikoli niso odvisni.

## Na načrtu in v datotekah

Načrt, PDF in DWG ali DXF nosijo glavne cevi na **C-WATR-MAIN**, njihove velikosti na **C-WATR-TEXT**, hidrante na **C-WATR-HYDR**, ventile na **C-WATR-VALV** in fitinge na **C-WATR-FITT**. LandXML izvoz zapiše vodovodno cevno omrežje (konstrukcija za vsako vozlišče, cev za vsako glavno cev, hidranti poimenovani); LandXML uvoz ga prebere nazaj kot vodovod brez porab, črpalk in ventilov, ki jih LandXML ne nosi. IFC izvoz zapiše glavne cevi kot segmente cevi, hidrante, ventile in fitinge v enem vodnem sistemu. Te datoteke so bile preverjene z našim branjem in pisanjem; preizkusite jih v drugih programih in nam sporočite, kaj pravijo.

## Česa še ni

Kakovost in starost vode, krmiljenje in pravila onkraj vklop/izklop vzorca črpalke, drugi tipi ventilov, poraba glede na tlak, cevi s spreminjajočim se premerom in pretoki kanalizacije skozi čas. Glejte [Še ni izdelano](topic:not-built-yet). Sanitarni projektni pretoki, ki so drug izračun, so v [Sanitarni projektni pretoki](topic:sanitary-design).
