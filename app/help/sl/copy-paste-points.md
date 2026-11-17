---
title: Izbira, kopiranje in lepljenje geodetskih točk
summary: Izberite geodetske točke s klikom, s tipko Shift in okvirjem ali vse naenkrat; kopirajte, izrežite, prilepite, prilepite na isto mesto, podvojite in izbrišite jih z novimi številkami točk, ki se nikoli ne ujemajo; prilepite vrstice točk v preglednico in iz nje.
keywords: kopiraj, prilepi, izreži, podvoji, izbriši točke, izberi točke, izberi vse, izbira z okvirjem, okno, odložišče, preglednica, csv, preštevilči, številke točk, prilepi na isto mesto, kloniraj, zakoličba
from: 78a6aea7
---

Geodetske točke je mogoče kopirati in prilepiti znotraj projekta, med projekti v dveh zavihkih brskalnika ter v preglednico in iz nje. Vsaka sprememba je en korak razveljavitve, površje pa se takoj znova izdela iz novih točk.

## Izbira točk

Z {{ui:Izberi}} ({{key:V}}):

- **Kliknite** točko, da jo izberete (in samo njo). Njene številke so prikazane pod **Lastnosti**.
- {{key:Shift}} in **klik** doda točko k izboru ali jo odstrani iz njega.
- {{key:Shift}} in **vlečenje** nariše okvir: točke znotraj njega se dodajo izboru. Če vlečete okoli točk, postane to lasso; glejte [Izbira geodetskih točk z lasom](topic:lasso-selection). Vlečenje brez {{key:Shift}} pomika pogled, kot vedno.
- {{key:Mod+A}} (ali {{ui:Več}} › {{ui:Izberi vse točke}}) izbere vse točke.
- {{key:Esc}} (ali {{ui:Več}} › {{ui:Prekliči izbor}}) počisti izbor.

Izbrane točke imajo obroč. Če je izbranih več, **Lastnosti** prikažejo, koliko jih je, njihove številke, razpon višin in njihove skupine.

## Kopiranje, izrezovanje in brisanje

- {{ui:Kopiraj}} ali {{key:Mod+C}} kopira izbrane točke. CivilCraft hrani kopijo in jo hkrati da v sistemsko odložišče kot vrstice točk, tako da jo lahko neposredno prilepite v preglednico ali besedilno datoteko.
- {{ui:Več}} › {{ui:Izreži}} ali {{key:Mod+X}} jih kopira in izbriše v enem koraku.
- {{ui:Več}} › {{ui:Izbriši}} ali {{key:Delete}} jih izbriše. {{key:Mod+Z}} jih vrne.

Vrstice so: točka, severna (N), vzhodna (E), višina, opis (P,N,E,Z,D), ločene z vejicami, s tremi decimalkami. Če želite vzhodno koordinato pred severno, nastavite **Vrstice točk** v [Nastavitve CivilCraft](topic:settings). Opis, ki bi ga preglednica obravnavala kot formulo (začne se z =, +, - ali @), dobi pred sabo apostrof, da ostane besedilo.

## Lepljenje

1. Pritisnite {{key:Mod+V}} ali kliknite {{ui:Prilepi}}. Točke sledijo kazalcu kot majhni križci, s pikčasto črto nazaj do mesta, od koder so prišle.
2. Kliknite, kamor naj gredo. Sredina kopiranih točk pride na klik.
3. Ali pritisnite {{key:Enter}}, da jih postavite na njihove lastne koordinate, ali {{key:Esc}}, da prekličete.

{{ui:Več}} › {{ui:Prilepi na isto mesto}} ali {{key:Mod+Shift+V}} prilepi na lastne koordinate točk takoj. Prilepljene točke so nato izbrane, zato jih lahko znova kopirate, premaknete ali izbrišete.

:::note
Klik na {{ui:Prilepi}} na orodni vrstici prebere sistemsko odložišče. Prvič lahko brskalnik vpraša, ali sme CivilCraft videti odložišče. Če zavrnete, gumb na orodni vrstici prilepi samo lastno kopijo CivilCraft; {{key:Mod+V}} še vedno prilepi vrstice iz preglednice brez vprašanja.
:::

## Številke točk se nikoli ne ujemajo

Dve točki nikoli nimata iste številke. Ko prilepite:

- Prilepljena točka obdrži svojo številko, če je nobena točka v projektu nima. Zato se točke po **Izreži** prilepijo nazaj s svojimi številkami, točke, kopirane iz drugega projekta, pa obdržijo svoje, kjer so proste.
- Prilepljena točka, katere številka je zasedena, dobi novo celo število: eno več od najvišje številke v uporabi, štetje navzgor.
- Vrstica stanja pove, kaj se je zgodilo, na primer "1 točka je obdržala svojo številko; 9 točk je dobilo nove številke: 10–18 je postalo 277–285".

V [Nastavitve CivilCraft](topic:settings) lahko izberete **Vedno nove številke** in številko, pri kateri se začnejo nove številke, na primer 5000 za projektne točke.

:::warning
Skupine točk, ki površje izdelajo kot **prelomnico**, povežejo svoje točke po vrstnem redu številk. Prilepljene kopije točk prelomnice (na primer posnetki FL) dobijo nove, višje številke in se pridružijo koncu te prelomnice, morda z dolgim skokom. Po lepljenju takih točk preverite načrt ali nastavite njihovo skupino na {{ui:Točke}}.
:::

## Podvoji

{{ui:Več}} › {{ui:Podvoji}} ali {{key:Mod+D}} naredi kopijo izbranih točk, ki sledi kazalcu: kliknite, kamor naj gre. Kopije vedno dobijo nove številke, odložišče CivilCraft pa ostane nespremenjeno.

## Iz preglednice ali besedilne datoteke

V preglednici izberite vrstice točk (točka, severna (N), vzhodna (E), višina, opis) in jih kopirajte. V CivilCraft pritisnite {{key:Mod+V}} in kliknite, kamor naj gredo, ali pritisnite {{key:Mod+Shift+V}}, da jih postavite na njihove lastne koordinate, kar je običajno to, kar želite pri pravih podatkih izmere.

Vrstice se preberejo natanko kot [datoteka točk](topic:point-file-formats): vejice, tabulatorji ali presledki, vrstica z glavo, če obstaja. Brez glave vrstni red stolpcev določa **Vrstice točk** v [Nastavitve CivilCraft](topic:settings).

Kadar sta na voljo oboje, CivilCraft odloči glede na to, kaj je novejše: vrstice v sistemskem odložišču, ki se razlikujejo od zadnje kopije CivilCraft, so bile kopirane kasneje, zato se prilepijo. Besedilo, ki ne vsebuje točk, se prezre, namesto njega pa se prilepi lastna kopija CivilCraft.

## Med projekti in zavihki

Kopija se hrani v tem brskalniku, zato lahko drug zavihek CivilCraft to prilepi, tudi potem ko se prvi zavihek zapre. Točke, kopirane v projektu v metrih in prilepljene v projekt v čevljih, obdržijo svoje številke tako, kot so: nič se ne pretvori, vrstica stanja pa to pove.

## Kaj se ne kopira

Za zdaj se kopirajo le geodetske točke. Trase, ploščadi, cevna omrežja, prelomnice in meje še ni mogoče kopirati ali prilepiti. Lepljenje ne more premakniti obstoječih točk: uporabite {{ui:Izreži}} in prilepite ali premaknite po eno točko ([Urejanje geodetske točke](topic:edit-points)).
