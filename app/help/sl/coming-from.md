---
title: Prihod iz drugih programov za civilno gradnjo
summary: Kako se znani postopki civilnega projektiranja preslikajo v CivilCraft in razlike, ki v prvi uri presenetijo izkušene uporabnike.
keywords: preklop, selitev, znano, razlike, potek dela, ukazi, preslikava, cogo, koridor, uravnavanje, omrežje cevi, slogi, ukazna vrstica
from: feae37d6
---

Če ste uporabljali Civil 3D, poznate ideje v CivilCraftu: točke in skupine točk, površja TIN s prelomnicami in mejami, trase po PI, profile po PVI, sestave, pometene v koridorje, uravnavanje do preseka s terenom, gravitacijska omrežja cevi, LandXML. Drugače je skoraj vse okoli njih: ni datoteke risbe, ni ukazne vrstice (razen če izberete slog menija {{ui:Klasično risanje}}), ni slogov, ni Prospectorja in ni pogovornih oken z nastavitvami. CivilCraft je majhno, osredotočeno orodje v brskalniku, in v tej različici opravi le delček tistega, kar opravi popoln paket za civilno gradnjo. Ta stran preslika, kar poznate, na to, kar je tu.

:::tip
Če vam je všeč trak Civil 3D, izberite slog menija {{ui:Civilni trak}} v {{ui:Nastavitve}} › {{ui:CivilCraft}} › {{ui:Meniji, tipke in miška}}: zavihki Domov, Površje, Urejanje, Geolokacija, Pogled in Izhod, srednji gumb pomika, s tipko {{key:Shift}} in srednjim gumbom pa se 3D pogled vrti. Če vnašate ukaze, {{ui:Klasično risanje}} doda ukazno vrstico (ALIGNMENT, PAD, PROFILE, ZOOM …). Glejte [Meniji, tipke in miška](topic:menus-keys-and-mouse).
:::

## Preslikava poteka dela

| Kaj želite narediti | Znan način | V CivilCraftu |
|---|---|---|
| Uvoz geodetskih točk | Uvoz točk v formatu datoteke točk | {{ui:Odpri}}, nato preverite vrstni red stolpcev v pogovornem oknu Uvoz točk ([Uvoz geodetskih točk](topic:import-points)) |
| Razvrstitev točk | Skupine točk, ključi opisa | Samodejne skupine po prvi besedi opisa; ni ključev opisa |
| Urejanje točke | Urejevalnik točk, ročice | Kliknite jo in vpišite v Lastnostih ali jo povlecite ([Urejanje geodetske točke](topic:edit-points)) |
| Izdelava obstoječega terena | Ustvarite površje, dodajte skupine točk kot podatke | Samodejno: površje se obnovi, kadar se spremenijo njegovi vhodi |
| Dodajanje prelomnic | Dodajte prelomnice iz polilinij ali karakterističnih črt | Nastavite skupino točk na {{ui:Prelomnica}} ali kliknite točke z orodjem {{ui:Prelomnica}} ({{key:B}}) |
| Obrezovanje površja | Zunanja meja, skrita meja, največja dolžina trikotnika | {{ui:Meja}} ({{key:O}}, samo zunanja) in **Najdaljši zunanji rob** |
| Prikaz plastnic | Slog površja | **Prikaz** v levem panelu: interval, glavna plastnica na vsakih, oznake, pasovi, puščice naklona |
| Izris središnice | Orodja za ustvarjanje trase, nastavitve lokov in spiral | {{ui:Trasa}} ({{key:A}}): kliknite lomne točke (PI), {{key:Enter}}; polmeri in dolžine spiral v tabeli lomnih točk |
| Ustvarjanje pogleda profila | Čarovnik za pogled profila, pasovi | {{ui:Vzdolžni profil}} ({{key:R}}): en pogled profila pod načrtom, vedno prilagojen |
| Oblikovanje naklona | Orodja za načrtovanje profila | {{ui:Začni s terena}}, {{ui:Dodaj lomne točke}} ({{key:I}}), povlecite lomne točke (PVI), vpišite **Dolžina loka L** |
| Izdelava ceste | Sestav, podsestavi, koridor, cilji, regije | Pod trasu označite **Potegni sestav vzdolž projektnega profila**; vozni pas, bankina in brežina na vsaki strani ali vsaka stran, zgrajena iz delov (obcestni jarek, robnik, pločnik …) |
| Uravnavanje ploščadi | Karakteristične črte, skupine uravnavanja, merila uravnavanja | {{ui:Ploščad}} ({{key:G}}): ravna ploščad z naklonoma izkopa in nasipa do preseka s terenom |
| Izračun zemeljskih del | Površja količin, nadzorna plošča količin | **Zemeljska dela** v desnem panelu, mrežna metoda, se posodablja sproti |
| Izris meteorne ali fekalne kanalizacije | Omrežje cevi s seznamom delov, pravila | {{ui:Cevi}} ({{key:P}}): kliknite objekte v smeri toka navzdol; tri pravila, ki jih nastavite; samodejna dna cevi |
| Izmenjava z drugimi | Uvoz in izvoz LandXML | {{ui:Odpri}} datoteko LandXML; {{ui:LandXML}} za izvoz ([Izmenjava LandXML](topic:landxml)) |
| Pošiljanje črt v CAD | Izvoz v DWG | {{ui:DWG}} (format 2000 do 2018) ali {{ui:DXF}} (R12) |
| Izris | Postavitve, pogledna okna, komplet listov | {{ui:PDF}}: en ležeč list načrta v izbranem merilu; listi načrta in profila ter listi prerezov kot PDF |
| Deljenje dela med datotekami | Bližnjice do podatkov, reference | Ni na voljo: en projekt na datoteko |
| Razveljavi | Razveljavi | {{key:Mod+Z}} in {{key:Mod+Y}}, 200 korakov; nastavitve prikaza niso koraki razveljavitve |

## Razlike, ki zmotijo ljudi

**Ukazne vrstice ni**, razen če izberete slog menija {{ui:Klasično risanje}}. Orodja so gumbi na orodni vrstici in posamezne črke: {{key:A}} trasa, {{key:G}} ploščad, {{key:P}} cevi, {{key:B}} prelomnica, {{key:O}} meja, {{key:R}} profil, {{key:I}} dodaj lomne točke, {{key:V}} izberi, {{key:F}} prilagodi. V drugih slogih menija vpis imena ukaza ne naredi ničesar. Glejte [Tipke in miška](topic:keyboard).

**Enter konča; dvojni klik je tvegan.** Enkrat kliknite zadnjo točko, nato pritisnite {{key:Enter}}. V tej različici dvojni klik tudi konča, vendar odstrani točko, na katero ste dvakrat kliknili. Desni klik ne konča in ne ponovi ukaza; pomakne pogled samo, če z njim vlečete.

**Vse je ves čas dinamično.** Spremenite skupino točk, polmer, PVI ali naklon ploščadi, in površje, plastnice, koridor, črte preseka s terenom in prostornine se takoj posodobijo. Ničesar ni treba obnoviti in nič ne zastari.

**Nič ni objekt risbe.** Načrt je pogled na projekt, ne risba, ki bi jo lahko urejali s CAD ukazi. Svojih črt ali besedila ne morete dodati, barve sloja spremeniti ali česa razstaviti. Izvozite v DXF in risbo dokončajte v CAD programu.

**Ni slogov.** Barve, debeline črt, velikosti oznak in imena slojev so nespremenljivi (glejte [Sloji načrta](topic:plan-layers)). Papir in Model v vrstici aplikacije preklapljata med svetlim in temnim zaslonom.

**Po ena.** Ena površina obstoječega terena, en urejen rezultat in eno omrežje cevi na projekt. Trasa in ploščad je lahko več.

**Enote so le oznake.** Izbira {{ui:Ameriški čevlji}} ali {{ui:Metri}} ničesar ne pretvori. Merila risbe ni. Koordinatni sistem je neobvezen: nastavite ga pod {{ui:Koordinate}} in nič se ne premakne, le pove, kaj številke pomenijo (glejte [Nastavitev koordinatnega sistema projekta](topic:coordinate-systems)). Čevlji se pri zapisu v LandXML obravnavajo kot ameriški geodetski čevlji.

**Skupine prelomnic se povežejo po številkah točk.** Skupina, nastavljena na {{ui:Prelomnica}}, postane ena črta skozi vse svoje točke, po vrstnem redu številk. Skupne kode (dve tokovnici, obe s kodo „FL“) naredita eno cik-cak črto; te narišite ročno.

**Stacionaže so videti enake, metri pa se razlikujejo.** Čevlji uporabljajo stacionaže po 100 ft (12+34.56); metri uporabljajo stacionaže po 1000 m (1+234.567).

**Izbris na Macu.** Tipka z oznako delete na Macu v brskalniku deluje kot Backspace. Za izbris izbora uporabite Fn in delete ali gumb {{ui:Izbriši}}.

**Datoteke so prenosi.** {{ui:Shrani}} vsakič prenese datoteko `.civilcraft.json`; ni „shranjevanja čez odprto datoteko“. Rezervna kopija neshranjenega dela se hrani v tem brskalniku ([Obnovitev neshranjenega dela](common:recover)). Odpiranje datoteke s točkami zamenja točke brez vprašanja. Glejte [Datoteke, ki jih lahko odprete, shranite in izvozite](topic:files).

**Pravila so vaša.** Pravila omrežja cevi in sestav koridorja se začnejo z začasnimi vrednostmi, ki niso standard. Nastavite svoje, preden zaupate kateremu koli preverjanju.

**Prostornine temeljijo na mreži.** Izkop in nasip izhajata iz fine mreže med obema površjema, znotraj črt preseka s terenom, brez napihovanja ali krčenja. So blizu, a niso enake, prostornini TIN na TIN.

## Kaj manjka

Spirale razen klotoidne, sestavi, ki se vzdolž ceste spreminjajo, ploščadi z nagibom, zmogljivost vtokov in zadrževanje, katalogi delov, cevi v profilu, postavitve parcel in določanje velikosti parcel, izravnava po metodi najmanjših kvadratov in geodetske baze podatkov, odpiranje DWG in še več. Celoten seznam s tem, kaj narediti namesto tega danes, je v [Še ni izdelano](topic:not-built-yet).
