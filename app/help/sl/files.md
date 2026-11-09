---
title: Datoteke, ki jih lahko odprete, shranite in izvozite
summary: Vhodne datoteke točk, LandXML in projekti CivilCraft; izhodni projekti, LandXML, DXF in PDF; kaj shrani posamezna datoteka, kam datoteke gredo in kaj se spremeni brez povezave.
keywords: odpri, shrani, izvozi, uvozi, formati datotek, csv, txt, landxml, xml, dxf, pdf, json, prenesi, datoteka projekta
from: a7debb61
---

CivilCraft odpre datoteke z vašega računalnika, shranjevanje pa poteka s prenosom datotek nazaj v računalnik. Ničesar ne naložimo in ničesar ne hranimo na strežniku. Glejte tudi [Vaše datoteke](common:your-files).

## Kaj odpre

Kliknite {{ui:Odpri}} (ali pritisnite {{key:Mod+O}}) in izberite datoteko ali povlecite datoteko iz {{pick:mac=Finder|windows=Raziskovalca datotek|linux=upravitelja datotek}} na načrt. Naenkrat ena datoteka; datoteke, večje od 200 MB, so zavrnjene.

| Vrsta | Imena datotek | Kaj se zgodi |
|---|---|---|
| Datoteka točk | `.csv`, `.txt`, `.pnt`, `.xyz` (katera koli besedilna datoteka) | Odpre se pogovorno okno **Uvoz točk**. Točke nadomestijo točke projekta; trase, ploščadi in cevi ostanejo. |
| LandXML | `.xml`, `.landxml` | Iz datoteke se ustvari **nov projekt** (najprej vas vprašamo, če ima trenutni projekt **neshranjene spremembe**). |
| Projekt CivilCraft | `.civilcraft.json` (katera koli `.json`) | Projekt se odpre tak, kot je bil shranjen (najprej vas vprašamo, če ima trenutni projekt neshranjene spremembe). |

CivilCraft vrsto določi po končnici datoteke, nato pa po njenih prvih znakih: besedilo, ki se začne z `{`, se prebere kot projekt, besedilo, ki se začne z `<`, kot LandXML, vse drugo pa kot datoteka točk. Datoteko, ki jo pogovorno okno za odpiranje sivi, lahko kljub temu spustite na načrt.

:::note
Uvoz datoteke točk v projekt, ki že ima točke, jih brez vprašanja zamenja in počisti zgodovino razveljavitve (odpiranje katere koli datoteke je nov začetek za razveljavitev). Če je površje nastalo iz LandXML, uvoz točk preklopi površje nazaj na površje, zgrajeno iz točk. Če bi stare točke morda potrebovali, najprej shranite.
:::

Podrobnosti: [Oblike datotek s točkami](topic:point-file-formats), [LandXML: kaj se bere in zapisuje](topic:landxml-reference).

## Kaj shrani

{{ui:Shrani}} ({{key:Mod+S}}) zapiše dve datoteki drugo ob drugi, poimenovani po **Ime** v levem podoknu: `<ime>.civilcraft.json`, projekt, ki ga nadaljujete z urejanjem, in `<ime>.ifc`, isti načrt v IFC 4.3 za vse ostale (glejte [Izvoz in uvoz IFC](topic:ifc)). Vsaka datoteka se sklicuje na drugo. IFC poleg tega vsebuje stisnjeno kopijo projekta, zato se IFC, poslan sam, še vedno odpre in ga je mogoče v celoti urejati.

- **V aplikaciji Studio** se obe datoteki zapišeta drugo ob drugi, na istem mestu.
- **V Chromu in Edgeu** prvo shranjevanje vpraša za mapo in vanjo zapiše obe datoteki; poznejša shranjevanja gredo v isto mapo. Če prekličete vprašanje o mapi, se obe datoteki namesto tega preneseta.
- **V drugih brskalnikih** se obe datoteki preneseta, najprej datoteka projekta.

Odpiranje katere koli od obeh datotek poišče drugo. Odprite obe skupaj (ali ju spustite skupaj) ali pa odprite le eno: v aplikaciji Studio se druga najde v isti mapi; v brskalniku vas CivilCraft vpraša, ali jo želite dodati, ali pa želite nadaljevati z eno, ki jo imate. Če je drug program IFC spremenil potem, ko ga je CivilCraft shranil, ali je ena datoteka starejša od druge, se projekt odpre iz novejše zasnove, podokno **Težave** pa pove, kaj se je zgodilo, z gumboma **Shrani zdaj** (znova zapiše obe datoteki) in **Pokaži geometrijo IFC kot referenco**. IFC sam, ki ga je spremenil drug program, se odpre iz svoje kopije projekta z delom, ki se še ujema: trase, ki jih je spremenil, prevzamejo njegovo geometrijo, izbrisani predmeti se izpustijo, ostale spremembe pa so navedene, niso pa sprejete. Datoteka projekta, starejša od različice 0.7.1, se odpre kot prej.

Datoteka projekta hrani:

- vsako točko (številka, koordinate, višina, opis) in ime datoteke s točkami, iz katere je prišla
- nastavitve površja: izbire skupin, narisane prelomnice, mejo, najdaljši zunanji rob in TIN, prebran iz LandXML
- nastavitve prikaza
- trase s PI-ji, polmeri in začetno stacionažo, njihove projektne profile (PVI-je in dolžine krivin) ter nastavitve koridorja
- ploščadi in cevno omrežje s pravili

Ne hrani zgodovine razveljavitve. Površja, plastnice, dnevne linije in prostornine se ne shranjujejo; ob odpiranju projekta se iz shranjenih vhodov ponovno zgradijo. Datoteko projekta z novejšega CivilCrafta zavrnemo s sporočilom, ki navede njegovo različico.

## Kaj izvozi

| Gumb | Datoteka | Vsebina |
|---|---|---|
| {{ui:LandXML}} | `<ime>.xml` | LandXML 1.2: točke, obstoječi teren (in izravnano površje, če obstaja) kot površja TIN, trase, profili terena in projektni profili, cevno omrežje |
| {{ui:DXF}} | `<ime>.dxf` | DXF R12 črt načrta, kakor so prikazane, v imenovanih slojih |
| {{ui:DWG}} | `<ime>.dwg` | Iste črte kot risba DWG, v formatu, ki ga izberete (od 2000 do 2018) |
| {{ui:PDF}} | `<ime>.pdf` | Vektorski izris načrta na list v merilu, ki ga izberete |
| {{ui:GLB}} ali {{ui:OBJ}} (na orodni vrstici pogleda 3D) | `<ime>-3d.glb`, `<ime>-3d.obj` | Kar pogled 3D prikazuje kot 3D model: v metrih, Y navzgor, v pravem merilu, okoli zabeleženega lokalnega izhodišča |

Kaj posamezen izvoz izpusti: [Izmenjava LandXML](topic:landxml), [Izvoz načrta v DXF](topic:dxf-export) (tudi DWG), [Izris načrta v PDF](topic:plot-pdf), [Izvoz lokacije v 3D](topic:export-3d).

## Kam gredo datoteke

Shranjene in izvožene datoteke gredo tja, kamor brskalnik shranjuje prenose, običajno v mapo Prenosi. Če želite vsakič izbrati mapo:

:::chromium
Odprite **Nastavitve** brskalnika, nato **Prenosi**, in vklopite **Pred prenosom vsake datoteke vprašaj, kam jo shraniti**.
:::

:::firefox
Odprite **Nastavitve**, nato **Splošno**, in pod **Datoteke in aplikacije** izberite **Vedno vprašaj, kam shraniti datoteke**.
:::

:::safari
Odprite **Safari > Nastavitve > Splošno** in nastavite **Mesto prenosa datotek** na **Vprašaj za vsak prenos**.
:::

Če shranite dvakrat z istim imenom, lahko brskalnik drugi datoteki doda številko, na primer `Site (1).civilcraft.json`. Naslednjič odprite najnovejšo.

## Na spletu in brez povezave

CivilCraft deluje le na vašem računalniku, ne glede na to: odpiranje prebere datoteko v brskalniku, shranjevanje jo prenese. Če želite CivilCraft odpreti brez kakršne koli povezave, ga najprej shranite za delo brez povezave:

1. Ko ste na spletu, kliknite {{ui:Shrani za delo brez povezave}} v aplikacijski vrstici na vrhu.
2. Gumb šteje navzgor („Shranjujem 12 od 30“), nato pa prikaže {{ui:Pripravljeno za delo brez povezave}}. CivilCraft je majhen (približno 0.6 MB), zato to traja trenutek. Shranjena kopija vključuje to pomoč in vzorčno zemljišče.
3. Brez povezave odprite isti naslov (ali zaznamek nanj). Vse deluje, vključno z {{ui:Odpri vzorčno zemljišče}}.

Gumba drugih stanj:

- {{ui:Shranjevanje ni uspelo}}: nekatere datoteke se niso prenesle. Preverite povezavo in kliknite gumb za nov poskus.
- {{ui:Delo brez povezave ni na voljo}}: to okno brskalnika ne more hraniti kopije za delo brez povezave (zasebna okna in nekateri upravljani računalniki to preprečijo). Uporabite običajno okno.

Kliknite {{ui:Pripravljeno za delo brez povezave}}, da vidite, kdaj je bila kopija shranjena, z dvema možnostma: {{ui:Shrani znova (pridobi najnovejšo različico)}} in {{ui:Odstrani kopijo brez povezave}}. Pred obiskom lokacije shranite znova, da se kopija ujema z najnovejšo različico. Več v [Delo brez povezave](common:offline).

:::offline
Zdaj ste brez povezave. Če je bil CivilCraft shranjen za delo brez povezave, vse deluje, vključno z vzorčnim zemljiščem. Če ni, delajte naprej v tem zavihku, vendar ga ne osvežujte, dokler ne boste znova na spletu; brez shranjene kopije {{ui:Odpri vzorčno zemljišče}} ne uspe s sporočilom „Vzorca ni mogoče naložiti“.
:::

:::tip
Za delo na terenu shranite CivilCraft za delo brez povezave in datoteke točk prenesite na prenosnik. Projekti in izvozi se brez povezave shranijo kot prenosi, zato lahko uvozite dnevne meritve, preverite površje in shranite projekt na terenu.
:::

Shranjevanje v oblak še ni na voljo, namizne različice pa še niso na voljo. Trenutno so datoteke, ki jih shranite, edina kopija: hranite jih na mestu, ki se varnostno kopira.

## Dodatki, ki jih datoteka uporablja

Ko shranite projekt, ki vsebuje podatke iz dodatka (kljukice predpisov za gradnjo ali vir Naslov v lokacijo), datoteka zabeleži, kateri dodatki in katere različice. Če jo odprete na računalniku, kjer enega od njih ni, se nad načrtom prikaže vrstica, ki to pove, in ponudi namestitev iz seznama vašega računa. Zapis je le opomba: datoteka se odpre v vsakem primeru.

## Razveljavitev iz aplikacije Studio

V aplikaciji CadCraft Studio se vsak korak, ki ga končate v CivilCraftu, sporoči Studiu, da lahko njegova razveljavitev na ravni projekta prekliče zadnji korak čez vse aplikacije. Studio razveljavi korak le, če je razveljavitvena zgodovina CivilCrafta točno v stanju, ki ga je ta korak pustil; po odprtju druge datoteke to okno preskoči.

## Zapiranje z neshranjenimi spremembami

Če ima projekt neshranjene spremembe in zaprete zavihek, osvežite stran ali zapustite stran, brskalnik vpraša, ali želite oditi. Njegovo besedilo in videz pripadata brskalniku in ju CivilCraft ne more spremeniti. {{ui:Novo}} ter odpiranje projekta ali datoteke LandXML pa namesto tega vprašata v lastnem polju CivilCrafta **Neshranjene spremembe**, z gumbi {{ui:Prekliči}}, {{ui:Ne shrani}} in {{ui:Shrani kopijo}}.
