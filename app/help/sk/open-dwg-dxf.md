---
title: Otvorenie DWG alebo DXF ako čiarovej grafiky
summary: Otvorte čiarovú grafiku výkresu v pôdoryse vrstvu po vrstve, použite jeho vrstevnice, 3D polylinie a uzavreté obrysy pre povrch a premeňte jeho bodové bloky na body zamerania.
keywords: kontrola zamerania, výšky v texte, dwg, dxf, cad, výkres, čiarová grafika, vrstevnice, hrany zlomu, hranica, polylinia, 3D polylinia, vrstvy, podkladová mapa, topo, výkres zamerania, bloky, odkazy na bloky, body zamerania z blokov, atribúty, bodové bloky, bod vloženia
from: da0f4c58
---

Topografické zameranie často prichádza ako výkres: vrstevnice ako polylinie vo svojej výške, hrany zlomu ako 3D polylinie, hranica lokality ako uzavretá polylinia. CivilCraft otvorí **priestor modelu** výkresu ako vrstvy v pôdoryse a dokáže tieto čiary premeniť priamo na povrch.

## Otvorenie výkresu

1. Kliknite na {{ui:Linework}} v skupine **Povrch** (alebo na {{ui:Open}}, alebo pretiahnite súbor do pôdorysu) a vyberte súbor `.dwg` alebo `.dxf`. Výkres sa načíta na tomto počítači; nič sa nenahráva. Čítajú sa DWG od verzie 2000 po 2018 a ASCII DXF.
2. Dialóg **Čiary** vypíše vrstvy výkresu, ktoré obsahujú čiary, uzavreté tvary alebo body, a či majú **výšky**. Vrstvy, ktoré sú vo výkrese vypnuté, sú spočiatku odškrtnuté. Text, šrafovanie, kóty a ďalšie objekty, ktoré nie sú čiarovou grafikou, sa spočítajú a vynechajú (dialóg uvedie, ktoré).
3. Skontrolujte **Jednotky výkresu**. Keď výkres uvádza svoje jednotky, CivilCraft ich prevedie na jednotky projektu (milimetre na metre, metre na stopy, palce na stopy). Výkres v stopách sa číta ako americké prieskumné stopy bez prepočtu: rozdiel je 2 milióntiny, a ak by sa súradnice štátnej roviny prepočítali o túto hodnotu, posunuli by sa o stopy. Ak výkres svoje jednotky neuvádza, jeho čísla sa čítajú v jednotkách projektu; ak nie sú správne, vyberte správne jednotky v zozname.
4. V **Použiť pre povrch** vyberte, čo každá vrstva dá povrchu (alebo ponechajte **Iba zobraziť**). Vrstvy pomenované ako vrstevnice (TOPO, CONT, CNTR), ktoré majú výšky, sa spustia ako hrany zlomu.
5. Kliknite na {{ui:Add}}. Vrstvy sa zobrazia v časti **Vrstvy GIS** v ľavom paneli; každé použitie sa vloží do povrchu. Každá časť je samostatný krok: {{key:Mod+Z}} ich vráti späť jednu po druhej.

## Čo každý druh vrstvy môže dať

| Vrstva obsahuje | Použiť pre povrch |
|---|---|
| Vrstevnice (polylinie vo výške) | Hrany zlomu vo výške samotných čiar, alebo podľa poľa ELEV |
| 3D polylinie | Hrany zlomu vo ich vlastných výškach |
| Uzavretý obrys | Hranica povrchu (najväčší uzavretý tvar, alebo ten, ktorý ste vybrali) |
| Body s výškou | Body zamerania, popísané názvom vrstvy |
| Čiary vo výške 0 (čiarová grafika pôdorysu) | Nič: zostane v pôdoryse ako podkladový výkres |

Výkres, ktorý zapísal CivilCraft, obsahuje svoje charakteristické čiary ako 3D polylinie, ktoré si pamätajú svoje oblúky. Dialóg potom zobrazí **Charakteristické čiary**: nechajte ho zaškrtnutý, aby sa vrátili ako charakteristické čiary s oblúkmi a použitiami (jeden krok späť), alebo ho odškrtnite, aby sa čítali ako čiarová grafika ako každá iná vrstva.

Neskôr použite {{ui:Use for the surface}} v ponuke vrstvy v časti **Vrstvy GIS**, aby ste to isté urobili pre vrstvu, ktorú ste iba zobrazili.

## Body zamerania z blokov

Prieskumné výkresy často nesú body ako bloky: malý symbol pri každom zameraní, s atribútmi pre číslo bodu, popis a výšku. Keď výkres obsahuje odkazy na bloky, dialóg má časť **Body zamerania z blokov**:

1. Zaškrtnite bloky, ktoré chcete zobrať (tabuľka uvedie, koľko odkazov má každý, na akých vrstvách a s akými atribútmi), alebo zaškrtnite vrstvy, aby ste zobrali každý odkaz na blok na nich.
2. Vyberte, odkiaľ pochádza **číslo**, **popis** a **výška** každého bodu: z atribútu, z názvu bloku alebo vrstvy, z najbližších voľných čísel, alebo zo Z bodu vloženia. CivilCraft začína na pravdepodobných atribútoch (PT, DESC, ELEV a podobne) a výšku z atribútu prevezme iba vtedy, keď bloky ležia na nulovej výške.
3. Ak chcete iba body, odškrtnite vrstvy čiarovej grafiky, potom kliknite na {{ui:Add}}.

Každý odkaz sa stane jedným bodom zamerania v jeho bode vloženia. Počítajú sa iba odkazy umiestnené v priestore modelu; bloky vnorené do iných blokov sa nepočítajú. Čísla, ktoré už sú v projekte alebo sa vo výkrese použili dvakrát, dostanú nové čísla za najvyšším; atribút výšky, ktorý nie je číslo, nechá bod bez výšky; stavový riadok obe skutočnosti spočíta. Výkres sa nikdy nemení a každý bod si pamätá svoj blok: jeho Vlastnosti zobrazia **Z bloku** s blokom, vrstvou a identifikátorom (handle). Pridanie bodov je jeden krok, takže {{key:Mod+Z}} ich odstráni všetky.

## Výšky zapísané textom a kontrola

Bodové výšky zapísané ako text (alebo v atribúte bloku, ktorý nie je blokom bodu zamerania) nie sú čiarová grafika. Časť **Výšky zamerania a kontrola** ich môže zobrať ako body zamerania a vypíše, čo na výkrese vyzerá zle: jednotky, súradnicový systém, vzdialenosť od nuly, ploché vrstevnice, zvláštne výšky, zdvojené body. Pozri [Kontrola prieskumného výkresu pri importe](topic:survey-check).

## Ako sa výkres číta

- Oblúky, kružnice, elipsy, vypuklé segmenty polylinií a splajny sa stanú krátkymi rovnými úsekmi (najviac každých 5°).
- Odkazy na bloky sa kreslia tam, kde sú umiestnené, aj vnorené bloky; čo blok obsahuje na vrstve 0, prevezme vrstvu odkazu.
- Objekty nakreslené v inej rovine (iný smer vytlačenia) sa umiestnia do svetových súradníc.
- Každý objekt dostane tri polia: LAYER, TYPE (typ objektu) a ELEV (jeho výšku, keď všetky jeho body zdieľajú jednu).
- Súradnice sa berú tak, ako sú: výkres musí používať tie isté súradnice ako projekt (napríklad rovnakú zónu štátnej roviny). Prepojené výkresy (xref) sa neotvárajú: otvorte ich samostatne.

:::tip
Výkres vrstevníc dá najlepší povrch s niekoľkými bodovými výškami na vrcholoch kopcov a v priehlbinách, kde samotné vrstevnice nechajú ploché trojuholníky. Pridajte ich ako body zamerania, alebo z vrstvy bodov vo výkrese.
:::
