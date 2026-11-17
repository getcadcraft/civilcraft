---
title: Oblikovanje železniškega tira
summary: Trasa kot železniški tir: prehodnice (klotoida, kubična parabola, Bloss, Helmert, sinusna polovična valovnica, sinus), nadvišanje na vsaki krivini z ravnotežnim nadvišanjem, primanjkljajem in presežkom, omejitve nadvišanja in geometrije tira kot opozorila, kretnice in prečne zveze po postajah, prosti profil, speljan vzdolž proge, ter tir s tirnicami, pragovi in tamponsko posteljico, zgrajen kot koridor, v tlorisu, prerezih, profilu, 3D in količinah.
keywords: železnica, tir, železniška proga, proga, tirnica, vlak, metro, tramvaj, nadvišanje, superelevacija, primanjkljaj nadvišanja, presežek nadvišanja, ravnotežno nadvišanje, prehodnica, prehodna krivina, klotoida, kubična parabola, bloss, helmert, sinusna polovična valovnica, kosinus, tirna širina, normalna tirna širina, široka tirna širina, metrska tirna širina, ozka tirna širina, prag, pragovi, tamponska plast, podtampon, posteljica, bankina, osni razmik tirov, 60E1, 54E1, UIC60, 115RE, 136RE, naklon nadvišanja, hitrost spremembe nadvišanja, kretnica, stikalo, jezik kretnice, prečna zveza, srčnik, število srčnika, vodilo, zaključna krivina, hitrost v odklonu, prosti profil, ovojnica prostora, profil prostih višin, peron, razmik na peronu, naklon, vertikalna krivina, najmanjši polmer, nadvišanje LandXML
from: 99de9745
---

Vsaka trasa je lahko železniški tir. Njene krivine dobijo prehodnice in nadvišanje (nagib tirnic), njen koridor pa je zgrajen kot tir: tirnice na pragovih na tamponski posteljici, izravnan v teren kot cesta. Kretnice in prečne zveze se postavijo na tir po postajah, vzdolž njega pa lahko speljete ovojnico prostega profila in jo preverite glede na to, kar stoji ob tiru.

Vse številke spodaj so **okvirne vrednosti**, ne standardi. Železnice si omejitve določijo glede na hitrost proge, vrsto tira in državo; nastavite jih po standardu vaše železnice. CivilCraft ne vsebuje nobene nacionalne tabele.

## Trasa kot železnica

1. Izberite trasa in poiščite **Železnica** v Lastnostih.
2. Označite **Ta trasa je železniški tir**. Vsaka sprememba je en korak razveljavitve.
3. Nastavite **Projektna hitrost** na vrhu Lastnosti trase: to je hitrost proge, glede na katero se preverja nadvišanje. **Najpočasnejši vlaki** (v bloku Železnica) je hitrost, glede na katero se preverja presežek nadvišanja.

## Prehodnice

Dajte vsaki krivini dolžino prehodnice na vsakem koncu v tabeli PI (**Prehodnica na vstopu**, **Prehodnica na izstopu**), nato izberite njeno vrsto v tabeli krivin bloka Železnica ali **Prehodnica za vsako krivino**:

| Vrsta | Ukrivljenost vzdolž prehodnice |
|---|---|
| Klotoida | narašča enakomerno (cestna prehodnica) |
| Kubična parabola | y = x³ / (6·R·L), kjer je L merjen vzdolž tangente; sama krivina je nekoliko daljša |
| Bloss | 3u² − 2u³ celotne ukrivljenosti (u = delež dolžine): začne se in konča nežno |
| Helmert | dve paraboli, 2u² nato 1 − 2(1 − u)² |
| Sinusna polovična valovnica | (1 − cos πu) / 2 |
| Sinus | u − sin(2πu) / 2π |

Vse razen kubične parabole se zasukajo za L / 2R, kot klotoida. Stacionaže tečejo po pravi dolžini. LandXML ohrani vrsto (spiType clothoid, cubicParabola, bloss, biquadratic, cosine, sinusoid).

## Nadvišanje

Vpišite **Nadvišanje** vsake krivine v milimetrih. Tabela za vsako krivino prikaže:

- **Ravnotežno nadvišanje** = G·v² / (g·R), kjer je G razdalja med središči tirnic (**Osni razmik tirnic**, tirna širina plus širina glave tirnice, razen če vpišete drugače). Pri G = 1500 mm je to znana enačba 11.8·V² / R (V v km/h, R v m).
- **Primanjkljaj** = ravnotežno nadvišanje pri hitrosti proge − uporabljeno nadvišanje.
- **Presežek** = uporabljeno nadvišanje − ravnotežno nadvišanje pri hitrosti najpočasnejših vlakov.
- **Rampa**: največji naklon nadvišanja vzdolž njegovih rampnih delov, v mm na meter.

Nadvišanje narašča čez vsako prehodnico, oblikovano kot njena ukrivljenost: ravno za klotoido ali kubično parabolo, v obliki Blossa za Bloss itd. Konec krivine brez prehodnice se nadvišanje dvigne na premici pred njim, toliko, kolikor zahteva omejitev naklona nadvišanja, in to je tudi navedeno: nadvišanje se nato spremeni tam, kjer se ne spremeni ukrivljenost.

**Nadvišanje se zasuka okoli** pove, katera tirnica ostane na projektnem profilu: **nizka tirnica** (običajno), **notranja tirnica** ali **središče tira** (vsaka tirnica se premakne za polovico nadvišanja). Projektni profil je tam zgornji rob tirnice.

**Diagram nadvišanja** nariše višino vsake tirnice nad profilom vzdolž stacionaž; pogled profila ter listi tlorisa in profila dobijo isto kot pas pod profilom.

## Omejitve nadvišanja in opozorila

**Največje uporabljeno nadvišanje**, **Največji primanjkljaj nadvišanja**, **Največji presežek nadvišanja**, **Največji naklon nadvišanja** in **Najhitrejša sprememba nadvišanja** (naklon pri hitrosti proge, mm/s) se preverijo na vsaki krivini. Vrednost čez omejitev je opozorilo v bloku Železnica in v podoknu Težave, z navedbo omejitve in najdene vrednosti. Brez projektne hitrosti se primanjkljaj in hitrost spremembe ne preverjata (opomba to pove).

## Tir

Nastavite **Tirna širina** (standardna 1435 mm, široka, metrska ali ozka prednastavitev ali lastna), **Profil tirnice** (60E1, 54E1, 49E1, 115RE, 136RE: samo njihove objavljene mere), število **Tirov** in njihov **Osni razmik tirov**, nato **Pragovi in tamponska plast**: material pragov, dolžina, širina, višina in razmik; globina tampona pod pragom (pri nizki tirnici), bankina, naklon in kako globoko pod pragovi leži njegov vrh; globina podtampona, bankina čez peto tampona in prečni nagib posteljice.

Pritisnite **Zgradi tir**. Zgradi se na koridorju trase, izdelanem kot tir vzdolž projektnega profila: tirnice in pragovi se nagnejo z nadvišanjem, posteljica ne. Pobočja preseka potekajo od roba bankine na izkopnih in nasipnih pobočjih koridorja, tir pa se izravna v predlagano površino kot cesta.

- **Tloris**: obe tirnici vsakega tira (plast C-RAIL-TRAK) in, pri več tirih, središče vsakega tira (C-RAIL-CNTR), na zaslonu, v DXF, DWG, PDF ter listih tlorisa in profila.
- **Prerezi**: pragovi, tirnice ter spodnji robovi tampona in podtampona v vsakem prerezu.
- **3D**: tirnice, vsak prag in tamponska posteljica (Pokaži › Tir), tudi v GLB, OBJ in USD.
- **Količine**: dolžina tira, tirnice (obe tirnici vsakega tira, vzdolž lastne črte vsakega tira), pragovi, tamponska posteljica in tampon brez pragov ter podtampon, po povprečju prečnih ploskev med prerezi.

## Preverjanje geometrije tira

Poleg nadvišanja blok Železnica preveri samo progo še glede na šest omejitev (vse okvirne, vse vaše za nastavitev):

- **Največji naklon** projektnega profila v mm na meter.
- **Najmanjši polmer vertikalne krivine**, kot faktor k v R ≥ k·V² (R v metrih, V v km/h). Parabolična vertikalna krivina dolžine L med dvema naklonoma ima polmer L, deljen s spremembo naklona.
- **Najkrajša vertikalna krivina**.
- **Najmanjši polmer krivine** v tlorisu (0 izklopi preverjanje).
- **Najkrajši lok ali premica**, kot sekunde potovanja pri hitrosti proge: krožni lok ali premica med dvema krivinama, krajša od te razdalje, sproži opozorilo. 1.8 s je znana vrednost »polovica hitrosti v km/h, v metrih«.
- **Hitrost spremembe primanjkljaja nadvišanja** vzdolž vsake prehodnice, v mm/s pri hitrosti proge.

**Geometrija tira** našteje največji najdeni naklon in vsako vertikalno krivino z njenim polmerom ter polmerom, ki ga zahteva hitrost proge. Vertikalna krivina, ki leži na prehodnici ali rampi nadvišanja, dobi opombo. Brez projektnega profila ali projektne hitrosti se preverjanja, ki jih potrebujejo, preskočijo, opomba to pove.

## Kretnice in prečne zveze

Pod **Kretnice in prečne zveze** pritisnite **Dodaj kretnico**. Postavi se na najdaljšo premico; nastavite v tabeli:

- **Postaja konice stikala**: kje se kretnica začne na tej trasi.
- **Srčnik**: število srčnika N (1:N). Kot srčnika je 2·atan(1 / 2N).
- **Stran**: levo ali desno, gledano v smeri naraščajočih stacionaž.
- **Razmik prečne zveze** v metrih: nad 0 postane kretnica prečna zveza do vzporednega tira na tej razdalji (dve kretnici in premica med njima).

Tabela prikaže **Vodilo** (konica stikala do srčnika), **Polmer** zaključne krivine in **Hitrost v odklonu**, ki ga ta polmer dopušča pri vaši omejitvi primanjkljaja nadvišanja in brez nadvišanja. **Naredi njen tir** spremeni odklonsko pot v lastno trasa (stikalo, zaključna krivina, nato naravnost pod kotom srčnika) z enakimi nastavitvami železnice, pripravljeno za podaljšanje.

Tloris nariše dve odklonski tirnici vsake kretnice, njeno središnico, oznako pri konici stikala in pri srčniku ter „1:N“ (plast C-RAIL-TURN), na zaslonu in v DXF, DWG, PDF ter listih. Pogled 3D nariše odklonski tirnici na ravni glavnega tira.

Oblika je **okvirna**: ravno stikalo in ena zaključna krivina iz števila srčnika. Zgrajena kretnica sledi standardu železnice in risbi proizvajalca. Opozorila: kretnica, ki sega čez trasa, leži na krivini, prehodnici, nadvišanju ali vertikalni krivini ali se prekriva z drugo; in opomba, kadar je hitrost proge višja od njene hitrosti v odklonu.

## Ovojnica prostega profila

Označite **Speljite ovojnico prostega profila vzdolž tega tira**. Izberite **Obris** (dve okvirni obliki ali **Lasten obris**, vnesen kot ena točka na vrstico: zamik od središča tira, nato višina nad vrhom tirnice, v metrih), **Dolžina vozila** in **Osni razmik podvozja** ter, če obstaja, **Rob perona** (stran, razdalja od središča tira, višina nad tirnico).

Na vsaki postaji je obris nagnjen z nadvišanjem okoli nizke tirnice in razširjen zaradi krivine: sredina vozila se pomakne navznoter za b² / 8R, njegovi konci navzven za (L² − b²) / 8R (b osni razmik podvozja, L dolžina vozila, R polmer tam, po prehodnici). Blok nariše prerez na premici in tam, kjer je najširši, ter našteje:

- **najširšo ovojnico** in kje,
- **osne razmike tirov** v primerjavi z razmiki, ki jih zahtevata dve sosednji ovojnici,
- prostor, ki ostane ob **robu perona**, oziroma koliko je znotraj njega,
- vsako karakteristično črto, cevno konstrukcijo in drugo železniško trasa, ki leži **znotraj ovojnice**.

Karakteristična črta z višinami se presodi glede na obris pri njeni višini nad tirnico; brez projektnega profila ali za točko brez višine se presodi samo v tlorisu, seznam to pove. Tloris prikaže dva robova ovojnice (plast C-RAIL-CLRN) s križcem pri vsaki stvari znotraj.

Ponujeni obrisi so **okvirni, niso profil nobene železnice**. Pred zanašanjem na rezultat vnesite prosti profil vaše železnice.

## V drugih programih

- **LandXML**: železniška trasa se zapiše s prehodnicami (spiType) in blokom `Cant`: tirna širina, točka zasuka, hitrost proge ter postaja, kjer se vsaka rampa nadvišanja začne in konča, z uporabljenim nadvišanjem, ravnotežnim nadvišanjem in primanjkljajem. Odprtje datoteke LandXML z blokom `Cant` naredi to trasa za železnico s temi nadvišanji.
- **IFC**: trasa s segmenti nadvišanja, tirnice, pragovi, tampon in podtampon.

## Še ni izdelano

Kretnice v izvozu IFC, družine kretnic onkraj enojne zaključne krivine (ukrivljena stikala, srčniki z nihajočim jezikom, križanja, diamanti), pravila kinematičnega profila (ovojnica je fiksen obris s premikom krivine), nadzemni vodi in signalizacija.

**Kateri standard.** V bloku Železnica „Standard za navajanje“ izberete **Brez** ali **Evropski** (UIC in EN). Če izberete Evropski, se navedejo dokumenti, ki jih evropski projekt citira (EN 13803 za parametre trase, EN 13232 za kretnice in križanja, EN 15273 za profile, EN 13848 za kakovost geometrije tira), in vsaka omejitev dobi polje za člen, iz katerega izhaja. Iz nobenega standarda ni vgrajena nobena številka: omejitve nadvišanja, primanjkljaja, presežka, naklona in hitrosti, geometrija kretnic in prosti profil so še vedno okvirni, okno to pove. Železniški inženir preveri vsako vrednost glede na besedilo standarda in pred gradnjo zapiše člen ob njej. Južnoafriške in tabele AREMA niso v tej izdaji.
