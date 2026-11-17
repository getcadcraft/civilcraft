---
title: Oblaki točk iz drona ali skenerja
summary: S dodatkom Oblaki točk odprite datoteko LAS ali LAZ z milijoni točk, si jo oglejte v celoti, jo očistite, razvrstite na teren, rastje in stavbe ter iz nje zgradite teren, plastnice in prostornine.
keywords: oblak točk, las, laz, dron, fotogrametrija, recap, lidar, skeniranje, teren, razvrščanje, šum, kup, prostornina, izkop in nasip, plastnice, prelomnica, eye-dome, ortomozaik, ortho, drapiranje, sloj zemljevida, izvoz las, izvoz laz, stisni
from: e4a4901f
---

Večina ljudi tega nikoli ne potrebuje, zato je to dodatek. Vklopite {{ui:Oblaki točk}} v Nastavitve › Dodatki; na desni plošči se prikaže zavihek {{ui:Oblaki točk}}. Datoteka se prebere v vašem brskalniku in razreže na ploščice, ki se hranijo v shrambi vašega brskalnika (ali v mapi, ki jo izberete). **Nič se ne naloži.**

:::warning
Vse, kar ta zavihek prikaže, je število iz vaših podatkov, ne potrdilo. Preizkušeno je bilo na izmišljenem gradbišču, še ne na pravem posnetku z dronom: prve rezultate preberite previdno in nam sporočite, kaj ugotovite. Odločitev o tem, kaj so teren, plastnice in prostornine vredni, sprejme pooblaščeni inženir.
:::

## Odpri oblak

Pod {{ui:Odpri oblak}} izberite datoteko LAS ali LAZ. Zavihek pove, koliko točk vsebuje, njen koordinatni sistem in enote ter koliko prostora potrebuje gradnja; pritisnite {{ui:Zgradi oblak}}. Gradnjo lahko ustavite in jo nadaljujete z {{ui:Nadaljuj}} (znova izberite isto datoteko). Datoteka se nikoli ne spremeni. Datoteka s 100 milijonov točk se zgradi v nekaj minutah na delovni postaji in potrebuje približno toliko prostora kot sama datoteka.

Pod {{ui:Oblaki v tem računalniku}} odprete ali odstranite oblak. {{ui:Shrani oblake v mapo …}} (Chrome, Edge in aplikacija Studio) hrani ploščice v mapi, ki jo izberete, na primer v mapi za oblake CadCraft v Dokumentih, zato oblak velikosti 10 GB ni treba spraviti v shrambo brskalnika; prej zgrajeni oblaki ostanejo tam, kjer so bili zgrajeni. Brskalnik po ponovnem zagonu znova zahteva dovoljenje: pritisnite {{ui:Znova uporabi mapo …}}.

## Oglejte si oblak

{{ui:Oglej si v 3D}} nariše oblak iz grobih ploščic in ga izostri, ko se približate, vendar nikoli ne prikaže več kot {{ui:Največ prikazanih točk}} naenkrat (2.5 milijona; 500 tisoč na telefonu). Barvo določite glede na barvo datoteke, višino, razred, intenzivnost ali ostanek. {{ui:Osvetlitev eye-dome}} senči robove glede na globino, da je oblika razvidna brez normal (na telefonu izklopljeno); {{ui:Točke se z razdaljo manjšajo}} naredi oddaljene točke manjše in bližnje večje; {{ui:Velikost točke}} nastavi velikost. Tloris prikaže oblak kot rastrsko sliko pod vašo risbo in **se izostri, ko približate** k delu oblaka.

## Očistite oblak

Pod {{ui:Očisti}} narišite lasso, okvir ali mnogokotnik v tlorisu (ali v 3D iz pogleda od zgoraj: v 3D se obris vzame naravnost navzdol, zato je natančen le od zgoraj). Zavihek pokaže, koliko točk je znotraj, **preden** uporabite: {{ui:Izbriši te točke}}, {{ui:Spremeni njihov razred}}, {{ui:Obnovi izbrisane točke}} ali {{ui:Obreži na to mejo}}. {{ui:Razveljavi}} in {{ui:Uveljavi}} se pomikata po dnevniku urejanja; sama datoteka se nikoli ne spremeni. {{ui:Filter šuma …}} označi osamljene točke kot nizke točke (razred 7) ali visok šum (razred 18).

## Razvrstite oblak

{{ui:Poišči teren}} deluje ploščico za ploščico in označi teren (razred 2) ter nizke točke; toleranca je 0.15 m oziroma 0.08 m, če vklopite stikalo za geodetsko natančnost. Poroča o stikih ploščic, ki se ne ujemajo. Nato {{ui:Razvrsti rastje in stavbe}} označi nizko, srednje in visoko rastje ter stavbe glede na višino nad terenom in na to, kako ravna je okolica. Strojnega učenja ni, zato je lahko lopa z ravno streho pod drevesi napačno označena: preverite.

## Teren, plastnice, prelomnice

{{ui:Zgradi teren}} ustvari obstoječi teren iz točk terena in ga doda projektu enako kot uvoz LAS (en korak razveljavitve). Nato primerja točke z njim: povprečje, RMS, 95. percentil, delež znotraj tolerance in deset mest, ki se najbolj razlikujejo, vsako z {{ui:Pojdi tja}}. Barva po {{ui:Ostanek}} pokaže, kje se teren in oblak ne ujemata.

**Prelomnica** (robnik, jarek ali vrh brežine) se izbere na oblaku: {{ui:Izberi prelomnico na oblaku}} v pogledu 3D vzame najbližjo prikazano točko ob vsakem kliku, {{ui:Izberi prelomnico v tlorisu}} pa pod vsakim klikom vzame najbližjo točko oblaka (najprej teren); dvojni klik ali Enter konča črto. Naslednji {{ui:Zgradi teren}} jo uporabi. {{ui:Pokaži plastnice}} nariše plastnice čez oblak na majhni sliki in nastavi interval projekta.

## Prostornine

{{ui:Prostornina kupa …}} izračuna prostornino površja nad osnovo znotraj meje, ki jo narišete. Mejo narišite na ravnem terenu okoli kupa in izberite osnovo: najnižja točka meje, ravnina, gladka ukrivljena osnova, površje skozi mejo ali višina, ki jo vnesete. Na nagnjenem ali ukrivljenem terenu uporabite ravnino ali ukrivljeno osnovo; najnižja točka da previsoko vrednost. Točke meje, ki štrlijo nad ostale (drevo na črti), so izpuščene iz osnove. {{ui:Od preleta do preleta}} da izkop in nasip med dvema oblakoma. Oba rezultata lahko shranite kot CSV.

## Ortomozaik

Pod {{ui:Ortomozaik (slika od zgoraj)}} izberite ortomozaik z dronom skupaj z njegovo svetovno datoteko in `.prj`, če ju ima: GeoTIFF, PNG ali JPEG. Postane **sloj zemljevida** projekta, zato ga tloris prikaže pod vašo risbo, pogled 3D (barva {{ui:Zemljevid}}) pa ga nariše na zgrajeni teren, zato najprej {{ui:Zgradi teren}}. Zavihek pove, kolikšen del oblaka slika pokriva, in opozori, če ga ne pokrije nič: pogosti vzrok je drug koordinatni sistem, zato dodajte datoteko `.prj`. Če datoteke `.prj` ni, program vpraša, kje so koordinate. Slika se hrani v datoteki projekta; GeoTIFF, večji od 200 MB, je zavrnjen, zelo velik mozaik pa se zmanjša na 16 megapikslov, zato pri velikem snemanju mozaik najprej izrežite na gradbišče.

## Izvoz

{{ui:Izvoz}} zapiše očiščen, razvrščen oblak kot novo datoteko (vse točke, samo očiščene razrede ali samo teren). Pod {{ui:Vrsta datoteke}} izberite:

- **LAS 1.4 (nestisnjeno)**: format točk 6 ali 7 z barvo.
- **LAZ (stisnjeno)**: iste točke, stisnjene brez izgube, zato se vsaka točka vrne natanko. Zapiše se kot format točk 0 ali 2 z barvo v datoteki LAS 1.4. Na izmišljenem gradbišču 300 m je bil LAZ približno petina velikosti datoteke LAS 1.4. Formata LAZ 0 in 2 hranita le razrede od 0 do 31: točka z višjim razredom je zavrnjena s sporočilom, zato ta oblak izvozite kot LAS 1.4.

LAZ zapiše lastni stiskalnik CadCraft, izdelan po objavljeni specifikaciji LAZ. Preverili smo, da naš lastni bralnik in dva neodvisna bralnika LAZ (laz-perf, ki ga aplikacija uporablja za odpiranje datotek LAZ, ter laspy z lazrs) vsako točko vrneta natanko, in da so datoteke LAZ, ustvarjene s programom laspy, ob ponovnem zapisu njihovih točk bajt za bajtom enake. Drugi programi še niso bili preizkušeni, zato nam sporočite, katerega, če ta ne odpre datoteke.

Kjer brskalnik lahko zapisuje datoteko sproti, izberete datoteko najprej, zelo velik oblak pa se vanjo zapisuje po ploščicah, namesto da bi se zbiral v pomnilniku; sicer se datoteka zbere in prenese, kar je v redu do nekaj sto megabajtov.

## Česa ne počne

Bere samo LAS in LAZ (E57, PLY in PCD še nista povezana s tem zavihkom, več datotek enega preleta pa se ne združuje), oblaka ne projicira na novo (predpostavljata se sistem in metri projekta), ne bere datotek Autodesk RCP ali RCS, iz fotografij ne ustvari površja in sama ne najde drogov, robnikov ali cevi.
