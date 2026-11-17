---
title: Datoteke, ki jih lahko odprete, shranite in izvozite
summary: Vnos datotek s točkami, LandXML in projektov CivilCraft; izvoz projektov, LandXML, DXF in PDF; kaj vsaka hrani, kam gredo datoteke in kaj se spremeni brez povezave.
keywords: odpri, shrani, izvozi, uvozi, formati datotek, csv, txt, landxml, xml, dxf, pdf, json, prenos, projektna datoteka
from: 82bff559
---

CivilCraft odpira datoteke z vašega računalnika in shranjuje tako, da jih prenese nazaj v računalnik. Ničesar ne naloži in ničesar ne hrani na strežniku. Glejte tudi [Vaše datoteke](common:your-files).

## Kaj odpre

Kliknite {{ui:Odpri}} (ali pritisnite {{key:Mod+O}}) in izberite datoteko ali povlecite datoteko iz {{pick:mac=Finder|windows=File Explorer|linux=vaš upravitelj datotek}} na načrt. Naenkrat ena datoteka; datoteke, večje od 200 MB, se zavrnejo. LandXML ali projektna datoteka, večja od 32 MB, se bere po kosih po približno 4 MB, nikoli kot en blok besedila; med odpiranjem LandXML pričakujte, da bo v pomnilniku zasedla približno 13-kratnik velikosti datoteke (69 MB datoteka je v našem preizkusu zasedla približno 0.9 GB).

| Vrsta | Imena datotek | Kaj se zgodi |
|---|---|---|
| Datoteka s točkami | `.csv`, `.txt`, `.pnt`, `.xyz` (katera koli besedilna datoteka) | Odpre se pogovorno okno **Uvozi točke**. Točke nadomestijo točke projekta; trase, podlage in cevi ostanejo. |
| LandXML | `.xml`, `.landxml` | Iz datoteke se ustvari **nov projekt** (najprej vas vprašamo, če ima trenutni projekt neshranjene spremembe). |
| Projekt CivilCraft | `.civilcraft.json` (katera koli `.json`) | Projekt se odpre tako, kot je bil shranjen (najprej vas vprašamo, če ima trenutni projekt neshranjene spremembe). |

CivilCraft se odloči po končnici datoteke, nato po prvih znakih: besedilo, ki se začne z `{`, se prebere kot projekt, besedilo, ki se začne z `<`, kot LandXML, vse drugo kot datoteka s točkami. Datoteko, ki jo okno za odpiranje zatemni, lahko še vedno spustite na načrt.

:::note
Uvoz datoteke s točkami v projekt, ki že ima točke, jih brez vprašanja nadomesti in izbriše zgodovino razveljavitev (odprtje katere koli datoteke je za razveljavitev nov začetek). Če je površje prišlo iz LandXML, uvoz točk ga preklopi nazaj na površje, zgrajeno iz točk. Če bi se stare točke morda hoteli vrniti, najprej shranite.
:::

Podrobnosti: [Oblike datotek s točkami](topic:point-file-formats), [LandXML: kaj se bere in zapiše](topic:landxml-reference).

## Kaj shrani

{{ui:Shrani}} ({{key:Mod+S}}) zapiše dve datoteki druga ob drugi, poimenovani po polju **Ime** v levem podoknu: `<ime>.civilcraft.json`, projekt, ki ga še naprej urejate, in `<ime>.ifc`, isto zasnovo v IFC 4.3 za vse druge (glejte [Izvoz in uvoz IFC](topic:ifc)). Vsaka datoteka se sklicuje na drugo, IFC pa vsebuje tudi stisnjeno kopijo projekta, zato se IFC, poslan sam, še vedno odpre v celoti urejljiv.

- **V Studiu** se obe datoteki zapišeta druga ob drugi, na mestu.
- **V Chromu in Edgeu** prvo shranjevanje vpraša za mapo in obe zapiše vanjo; poznejša shranjevanja gredo v isto mapo. Če prekličete vprašanje o mapi, se namesto tega preneseta obe datoteki.
- **V drugih brskalnikih** se obe datoteki preneseta, najprej projektna datoteka.

Pri odpiranju ene datoteke se išče druga. Odprite obe skupaj (ali ju spustite skupaj) ali pa odprite eno: v Studiu se druga najde v isti mapi; v brskalniku vas CivilCraft vpraša, ali jo želite dodati, ali pa nadaljujete z eno, ki jo imate. Če je IFC po tem, ko ga je CivilCraft shranil, spremenil drug program ali je ena datoteka starejša od druge, se projekt odpre iz novejše zasnove, podokno Težave pa pove, kaj se je zgodilo, z gumboma **Shrani zdaj** (znova zapiše obe datoteki) in **Pokaži geometrijo IFC kot referenco**. IFC sam, ki ga je spremenil drug program, se odpre iz svoje kopije projekta s tem, kar se še ujema: trase, ki jih je spremenil, prevzamejo njegovo geometrijo, predmeti, ki jih je odstranil, so izpuščeni, preostale spremembe pa so naštete, ne pa uveljavljene. Projektna datoteka iz različice pred 0.7.1 se odpre kot prej.

Projektna datoteka hrani:

- vsako točko (številka, koordinate, višina, opis) in ime datoteke s točkami, iz katere so prišle
- nastavitve površja: izbire skupin, narisane prelomnice, mejo, najdaljši zunanji rob in TIN, prebran iz LandXML
- nastavitve prikaza
- trase z njihovimi PI, polmeri in začetno stacionažo, njihove projektne profile (PVI in dolžine krivin) in nastavitve koridorja
- podlage in omrežje cevi s pravili

Zgodovine razveljavitev ne hrani. Površja, plastnice, linije preseka s terenom in prostornine se ne shranijo; ob odpiranju projekta se ponovno zgradijo iz shranjenih vhodnih podatkov. Projektna datoteka iz novejšega CivilCraft se zavrne s sporočilom, ki navaja njegovo različico.

## Kaj izvozi

| Gumb | Datoteka | Vsebina |
|---|---|---|
| {{ui:LandXML}} | `<ime>.xml` | LandXML 1.2: točke, obstoječi teren (in izdelano površje, če obstaja) kot površja TIN, trase, terenski in projektni profili, omrežje cevi |
| {{ui:DXF}} | `<ime>.dxf` | DXF R12 črt načrta, kot so prikazane, na imenovanih slojih |
| {{ui:DWG}} | `<ime>.dwg` | Iste črte kot risba DWG, v formatu, ki ga izberete (2000 do 2018) |
| {{ui:PDF}} | `<ime>.pdf` | Vektorski izris načrta na listu, v merilu, ki ga izberete |
| {{ui:GLB}} ali {{ui:OBJ}} (na orodni vrstici 3D-pogleda) | `<ime>-3d.glb`, `<ime>-3d.obj` | Kar 3D-pogled prikazuje kot 3D-model: metri, Y navzgor, pravo merilo, okoli zabeleženega lokalnega izhodišča |

Kaj vsak izpusti: [Izmenjava LandXML](topic:landxml), [Izvoz načrta v DXF](topic:dxf-export) (enako za DWG), [Izris načrta v PDF](topic:plot-pdf), [Izvoz gradbišča v 3D](topic:export-3d).

## Kam gredo datoteke

Shranjene in izvožene datoteke gredo tja, kamor brskalnik shranjuje prenose, ponavadi v mapo Prenosi. Če želite vsakič izbrati mapo:

:::chromium
Odprite **Nastavitve** brskalnika, nato **Prenosi**, in vklopite **Vprašaj, kam shraniti vsako datoteko pred prenosom**.
:::

:::firefox
Odprite **Nastavitve**, nato **Splošno**, in pod **Datoteke in aplikacije** izberite **Vedno vprašaj, kam shraniti datoteke**.
:::

:::safari
Odprite **Safari > Nastavitve > Splošno** in **Lokacija prenosa datotek** nastavite na **Vprašaj za vsak prenos**.
:::

Če shranite dvakrat z istim imenom, lahko brskalnik drugi datoteki doda številko, na primer `Site (1).civilcraft.json`. Naslednjič odprite najnovejšo.

## Na spletu in brez povezave

CivilCraft v vsakem primeru deluje samo na vašem računalniku: odpiranje prebere datoteko v brskalniku, shranjevanje pa jo prenese. Če želite CivilCraft odpreti brez kakršne koli povezave, ga najprej shranite za delo brez povezave:

1. Na spletu kliknite {{ui:Shrani za delo brez povezave}} v zgornji vrstici aplikacije.
2. Gumb šteje navzgor („Shranjevanje 12 od 30“) in nato prikaže {{ui:Pripravljeno za delo brez povezave}}. CivilCraft je majhen (približno 0.6 MB), zato to traja trenutek. Shranjena kopija vključuje to pomoč in vzorčno gradbišče.
3. Brez povezave odprite isti naslov (ali zaznamek nanj). Vse deluje, vključno z {{ui:Odpri vzorčno gradbišče}}.

Druga stanja gumba:

- {{ui:Shranjevanje ni uspelo}}: nekatere datoteke se niso prenesle. Preverite povezavo in kliknite za nov poskus.
- {{ui:Delo brez povezave ni na voljo}}: to okno brskalnika ne more hraniti kopije za delo brez povezave (zasebna okna in nekateri upravljani računalniki to preprečijo). Uporabite običajno okno.

Kliknite {{ui:Pripravljeno za delo brez povezave}}, da vidite, kdaj je bila kopija shranjena, z dvema izbirama: {{ui:Shrani znova (pridobi najnovejšo različico)}} in {{ui:Odstrani kopijo brez povezave}}. Pred obiskom gradbišča znova shranite, da se kopija ujema z najnovejšo različico. Več v [Brez povezave](common:offline).

:::offline
Zdaj ste brez povezave. Če je bil CivilCraft shranjen za delo brez povezave, vse deluje, vključno z vzorčnim gradbiščem. Če ne, delajte naprej v tem zavihku, vendar ga ne osvežujte, dokler ponovno niste na spletu; brez shranjene kopije {{ui:Odpri vzorčno gradbišče}} ne uspe s sporočilom „Vzorca ni bilo mogoče naložiti“.
:::

:::tip
Za delo na terenu shranite CivilCraft za delo brez povezave in točkovne datoteke prinesite na sam prenosnik. Projekti in izvozi se brez povezave shranijo kot prenosi, zato lahko uvozite dnevne meritve, preverite površje in shranite projekt na terenu.
:::

Shranjevanje v oblak še ni na voljo, namizne različice pa še niso izdane. Datoteke, ki jih shranite, so danes edina kopija: hranite jih na mestu, kjer so varnostno kopirane.

## Dodatki, ki jih datoteka uporablja

Ko shranite projekt, ki vsebuje podatke iz dodatka (kljukice Gradbenih predpisov ali vir Naslov do gradbišča), datoteka zabeleži, kateri dodatki in katere različice. Če jo odprete na računalniku, na katerem enega od njih ni, vrstica nad načrtom to pove in ponudi, da ga dodate s seznama vašega računa. Zapis je le opomba: datoteka se vseeno odpre.

## Razveljavitev iz Studia

V CadCraft Studiu se vsak korak, ki ga dokončate v CivilCraftu, sporoči Studiu, da lahko njegova razveljavitev na ravni projekta povrne zadnji korak med aplikacijami. Studio razveljavi korak samo, kadar je sklad razveljavitev CivilCraft natanko tak, kot ga je ta korak pustil; ko odprete drugo datoteko, to okno preskoči.

## Zapiranje z neshranjenimi spremembami

Ko ima projekt neshranjene spremembe in zaprete zavihek, ponovno naložite stran ali zapustite stran, brskalnik vpraša, ali želite oditi. Njegovo besedilo in videz pripadata brskalniku in ju CivilCraft ne more spremeniti. {{ui:Novo}} ter odpiranje projektne ali LandXML datoteke pa namesto tega vprašata v lastnem oknu CivilCraft **Neshranjene spremembe** z gumbi {{ui:Prekliči}}, {{ui:Ne shrani}} in {{ui:Shrani kopijo}}.
