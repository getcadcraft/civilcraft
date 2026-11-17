---
title: Korridorskabeloner og terrænskabeloner
summary: Lav små genbrugelige skabeloner (kantsten og rendesten, fortov, mur, grøft), byg en korridor af dem efter station med venstre og højre side hver for sig, del et tracé op i flere korridorer, og læg lagdelte materialer ud på et terræn.
keywords: skabelon, skabeloner, skabelonbibliotek, skabelonoprettelse, typisk tværsnit, samling, delsamling, komponenter, punktkoder, slutbetingelse, skæring i terræn, grøft, støttemur, kantsten, rendesten, fortov, områder, stationsinterval, flere korridorer, venstre og højre, terrænskabelon, muldjord, belægning, underlag, læg ud, materialer, mængder
from: ce70e58b
---

En **skabelon** er et lille tværsnit, du tegner én gang og genbruger: punkter med forskydninger, hældninger og punktkoder, og komponenter med materialer. En korridor kan bygges af skabeloner efter station, hver side med sine egne belægningsskabeloner og sin egen slutbetingelse, og de samme skabeloner kan lægges ud på et terræn.

:::warning
Eksempelskabelonerne er pladsholdere at starte fra. Deres tal er ikke hentet fra en standard eller et myndighedskrav. En ingeniør skal kontrollere hver skabelon og hver værdi, du giver den, før den bruges i et design.
:::

## Åbn skabelonerne

Åbn {{ui:Overflade}} › {{ui:Mere}} › {{ui:Korridorskabeloner…}} (eller skriv {{cmd:TEMPLATES}}). Vinduet har tre lister:

- **I dette projekt**: de skabeloner, dette projekts korridorer og terrænskabeloner bruger. De gemmes i projektfilen.
- **Mit bibliotek**: skabeloner, der gemmes i denne browser og tilbydes i alle projekter. Brug {{ui:Gem i Mit bibliotek}} på en projektskabelon for at gemme den.
- **Eksempler**: to vognbaner med lag, kantsten og rendesten, fortov, skæring i terræn, grøft, støttemur, muldjord under terrænet og belægning på terrænet. Hver er markeret »Til kontrol af en ingeniør«.

{{ui:Brug i dette projekt}} kopierer en bibliotek- eller eksempelskabelon ind i projektet. {{ui:Eksportér dette projekts skabeloner}} gemmer dem som en `.cctemplates.json`-fil, og {{ui:Importér en fil}} læser en ind i projektet og Mit bibliotek. Brug filen til at dele skabeloner eller flytte dem til en anden computer.

## Lav en skabelon

{{ui:Ny skabelon}} (eller {{ui:Rediger}} på en projektskabelon) åbner skabelonredigeringen. Tegn højre side, udad fra skabelonens 0,0-punkt; venstre side bruger den samme skabelon udad til venstre.

1. Giv den et navn og en type: **Belægning** (den næste skabelon knytter sig til dens ende), **Slutbetingelse** (den møder terrænet) eller **Terrænskabelon**.
2. Tilføj **værdier**: navngivne tal som en bredde `w` eller en hældning `s`. Et talfelt hvor som helst i skabelonen tager et tal eller en værdis navn; `-t` er værdien `t` gjort negativ. En korridor kan give hver brug af skabelonen sine egne værdier, så én kantstensskabelon kan bruges til hver kantstenshøjde.
3. Tilføj **punkter** i rækkefølge. Hvert placeres ud fra et tidligere punkt (eller 0,0-punktet) efter sin betingelse:

| Betingelse | Placerer punktet |
|---|---|
| Forskydning ved en hældning | En forskydning udad og en hældning (stigning pr. vandret længde; −0.02 falder 2 %) |
| Forskydning og stigning | En forskydning og en stigning |
| Lige op eller ned | Kun en stigning |
| Sideskråning til terrænet | Ud fra sit punkt til terrænet, med skæringsforholdet, hvor terrænet ligger over, og fyldningsforholdet, hvor det ligger under |
| Til terrænet | En forskydning, og derefter lige op eller ned til terrænet |
| Støttemur | En mur med den tykkelse, du angiver: i skæring møder dens top terrænet ved vejkanten, i fyldning kører vejen hen over den, og dens ydre flade falder ned til terrænet |

   Sæt kryds i **Top** for de punkter, som den færdige overflade løber gennem. Det sidste top-punkt er, hvor den næste skabelon på den side starter. Et **Mål** lader en korridor flytte punktet: dets forskydning eller kote kommer fra en linje.
4. Tilføj **komponenter**: lukkede figurer gennem punktkoder (`0` er 0,0-punktet), hver med et navn, et materiale og en type. Deres arealer giver volumenerne.

Tegningen følger hver ændring i sand skala, og listen under den siger, hvad der er galt (et punkt, der møder terrænet før slutningen, en værdi skabelonen ikke har, en komponent uden areal). {{ui:Tilføj til dette projekt}} eller {{ui:Gem}} beholder den som ét fortrydelsestrin.

## Byg en korridor af skabeloner

Vælg et tracé med en korridor, og slå {{ui:Byg ud fra skabeloner efter station}} til i dets **Egenskaber**. Korridoren starter med eksemplerne for to vognbaner og skæring i terræn på begge sider.

- **Områder.** Hvert område starter ved en station og løber til næste områdes start. {{ui:Tilføj et område}} tilføjer et; ændr dets startstation i dets felt.
- **Venstre og højre hver for sig.** Hver side af hvert område har sin egen liste **Belægning**, fra midtlinjen udad, og sin egen **Slutbetingelse**: skæring i terræn, en grøft, en mur eller en hvilken som helst skabelon, der møder terrænet. Uden slutbetingelse skærer siden ind i terrænet ved korridorens skære- og fyldningshældninger. {{ui:Kopiér fra venstre til højre}} kopierer en side.
- **Værdier og mål.** Under hver skabelon på en side er der et felt pr. værdi (tomt = skabelonens egen værdi) og, for et punkt der tager et mål, den feature-linje eller korridorlinje fra en anden korridor, der flytter det.
- **Fra og Til** begrænser korridoren til en del af tracéet.

Snittene, planlinjerne for hver punktkode, den planerede overflade, udsætning og jordarbejde følger alle. Egenskaber lister hver komponents volumen pr. side og område (gennemsnitlige endearealer langs midtlinjen). Overhøjning og korridorens kantmål bruges ikke, mens korridoren bygges af skabeloner.

## Flere korridorer på ét tracé

Under **Korridorer på dette tracé** tilføjer {{ui:Tilføj en korridor}} en korridor på resten af tracéet: den første korridor får en slutstation i midten (eller beholder sin egen), og den nye starter der med den første korridors sidste område af skabeloner. Hver korridor har sit eget navn, stationsinterval, skabeloner og jordarbejde. Slå en fra med dens {{ui:Til}}-felt. Hvor to intervaller overlapper, planerer den senere korridor over den tidligere.

## Terrænskabeloner

En terrænskabelon lægger en skabelons lag ud på et terræn fra dens 0,0-punkt: et lag under 0,0-punktet går ned i terrænet (muldjord, der skal skrælles af), et lag over det ligger på terrænet (underlag og belægning på en parkeringsplads). Bredder og hældninger betyder ikke noget, kun hver komponents dybde over eller under 0,0-punktet.

Åbn {{ui:Overflade}} › {{ui:Mere}} › {{ui:Terrænskabeloner…}} (eller skriv {{cmd:TERRAINTEMPLATES}}); blokken findes også i projektets egenskaber. {{ui:Tilføj en terrænskabelon}} tilføjer en med muldjords-eksemplet. For hver vælger du:

- **skabelonen** (dens værdier kan ændres for denne),
- **terrænet**: det eksisterende terræn eller den planerede overflade,
- **formen**, der klipper den: hele terrænet, en matrikel, et byggeplateau eller en lukket feature-linje. Flere terrænskabeloner kan bruge forskellige former på samme terræn.

Hvert lag viser sin tykkelse, sit planareal og sit volumen. Volumen er planarealet gange tykkelsen, målt lodret nedad; arealet måles på et gitter, og det udlagte (skrå) areal oplyses også. Formerne tegnes på planen på laget C-TOPO-TMPL. Terrænskabeloner ændrer ikke den planerede overflade.

## Materialer og mængder

Projektets blok **Jordarbejde** lister **Materialer fra skabeloner**: hver korridorkomponent og terrænskabelonlag med dets volumen. {{ui:Send til TakeoffCraft}} skriver dem ind i mængdefilen efter afgravning og fyldning, én post hver, i kubikyard (fodprojekter) eller kubikmeter.

## Filer

Skabeloner, områder, de ekstra korridorer og terrænskabelonerne gemmes i projektfilen. Et projekt, der ikke bruger nogen af dem, gemmes præcis som før, og ældre CivilCraft-versioner åbner et projekt, der bruger dem (de ignorerer skabelonerne og bygger korridorens egen samling).
