---
title: Lägg ut ett självfallsledningsnät
summary: Rita dagvatten- eller spillvattenledningar konstruktion för konstruktion, ange dina regler för lutning, täckning och fall, låt CivilCraft sätta bottennivåerna, och åtgärda de problem det listar.
keywords: konstruktionsbyggare, konstruktionstyp, rektangulär konstruktion, brunn, ram, täckning, väggtjocklek, biblioteksobjekt, ledningsnät, dagvatten, spillvatten, avlopp, konstruktioner, brunnar, inlopp, bottennivåer, täckning, lutning, fall, kant, sump, självfallsrör
from: 10a3c14d
---

Ett projekt innehåller ett självfallsledningsnät, dagvatten eller spillvatten. Det består av konstruktioner (brunnar, inlopp) och raka rör mellan dem. Flödet går i den riktning du ritar. CivilCraft kontrollerar varje rör och konstruktion mot tre regler som du anger, och kan sätta alla bottennivåer utifrån dem.

## Rita en sträcka

Du kan rita rör utan terrängmodell, men kanter, täckning och automatiska bottennivåer behöver en.

1. Tryck på {{key:P}}, eller klicka på {{ui:Ledningar}} i gruppen **Design**.
   Hjälptexten säger: "Ledningar: klicka på konstruktioner från början av sträckan och nedåt (klicka på en befintlig för att ansluta). Enter avslutar."
2. Klicka där den uppströms belägna konstruktionen ska stå. En konstruktion placeras.
3. Klicka på varje nästa konstruktion nedströms. För att ansluta till en konstruktion som redan finns, klicka på den: statusfältet säger "Ansluten till S3."
4. Tryck på {{key:Enter}}.
   Rören ritas, deras bottennivåer sätts utifrån reglerna, och statusfältet säger till exempel "3 rör ritade, 12, bottennivåer satta från reglerna; alla kontroller godkända."

Nya konstruktioner får namnen S1, S2 … med diametern 48 in (1200 mm). Nya rör får namnen P1, P2 … med diametern 12 in (300 mm). Diametrarna anges i tum i ett fotprojekt och i millimeter i ett meterprojekt.

Avsluta med {{key:Enter}}. Dubbelklick fungerar också, men när du dubbelklickar på en befintlig konstruktion för att avsluta sträckan där, släpps anslutningen: klicka en gång på den och tryck sedan på {{key:Enter}}.

## Ställ in dina regler

När inget är markerat har den högra panelen (**Projekt**) ett block för **Ledningsnät**:

| Inställning | Startvärde | Betydelse |
|---|---|---|
| Typ | Dagvatten | {{ui:Dagvatten}} eller {{ui:Spillvatten}}; skrivs till LandXML |
| Minsta lutning | 0.50% | Varje rör måste falla minst så här mycket |
| Minsta täckning | 2 ft (0.6 m) | Från marken till rörets krön, längs hela röret |
| Fall i konstruktioner | 0.10 ft (0.03 m) | Utloppets bottennivå måste ligga minst så här långt under varje inloppsbottennivå |

**Dessa startvärden är platshållare, inte en standard.** Ange de värden som din myndighet eller ditt projekt kräver. Täckningen mäts från marken till krönet (bottennivå plus innerdiameter); väggtjockleken räknas inte. Där plattor eller korridorer planeras är den planerade ytan marken.

## Låt CivilCraft sätta bottennivåer

- {{ui:Sätt alla bottennivåer från reglerna}} (i blocket **Ledningsnät**) sätter alla rör.
- {{ui:Sätt dess bottennivåer från reglerna}} (med ett rör markerat) sätter endast det röret.

Nedströms räknat börjar varje sträcka med minst täckning vid sin övre konstruktion, faller minst den minsta lutningen, faller minst fallet genom varje konstruktion, och går djupare där marken längs röret skulle ge mindre än den minsta täckningen. Bottennivåerna avrundas nedåt till 0.01, aldrig uppåt. Statusfältet säger "Bottennivåer satta: minsta täckning vid början av varje sträcka, minst den minsta lutningen, minst fallet i varje konstruktion." eller anger vad det inte kunde göra.

## Redigera konstruktioner och rör

Klicka på en konstruktion eller ett rör med {{ui:Markera}} för att se den i den högra panelen.

**Konstruktion**: **Namn**, **Kant**, **Sumpdjup**, **Diameter**, sedan **Kant använd**, **Sump**, **Östvärde** och **Nordvärde**, och rören in och ut med deras bottennivåer.

- Lämna **Kant** tom för att ta den från terrängmodellen; rutan visar då terrängmodellens värde i grått. Skriv in ett värde för att låsa kanten.
- Dra konstruktionens handtag på planen för att flytta den. Dess rör följer med; deras bottennivåer ligger kvar som de var, så kontrollera problemen efteråt.

**Typ**: välj en av nätets konstruktionstyper (nedan), eller ingen för en rund konstruktion med sin egen diameter.

**Rör**: **Namn**, de konstruktioner det går mellan, **Diameter**, **Övre bottennivå**, **Undre bottennivå**, sedan **Längd**, **Lutning** och **Minsta täckning**.

Tryck på {{key:Enter}} efter varje värde.

## Läs och åtgärda problem

Blocket **Ledningsnät** listar varje problem (upp till 40); klicka på ett för att markera röret eller konstruktionen. Ett markerat rör eller en markerad konstruktion listar sina egna. När inget är markerat står det "Alla rör och konstruktioner klarar reglerna."

| Meddelande (exempel) | Vad du gör |
|---|---|
| "P2 går uppför (-0.40%)." eller "… går plant …" | Byt bottennivåerna, eller sätt dem utifrån reglerna. |
| "P2 på 0.30% är flackare än minimum 0.50%." | Sänk den nedströms belägna bottennivån eller höj den uppströms belägna. |
| "P3 har 1.40 i täckning, 35 längs sig, mindre än minimum 2." | Sänk röret; sätt dess bottennivåer utifrån reglerna. |
| "I S3 går P4 ut vid 245.20, mindre än 0.1 under P3 som kommer in vid 245.25." | Sänk utloppsrörets övre bottennivå. |
| "P1:s krön ligger över S1:s brunnskant." | Röret är för högt för konstruktionen. |
| "S2 har 2 rör som går ut ur den; ett självfallsnät ska ha en utgång från varje konstruktion." | Ta bort ett utgående rör, eller rita om det i rätt riktning. |
| "Rören bildar en slinga; flödet måste sluta vid ett utlopp." | En sträcka har ritats tillbaka in i sig själv; ta bort ett rör. |
| "S5 ligger utanför terrängmodellen och har ingen höjd för brunnskanten." | Skriv in en kant, eller flytta konstruktionen till terrängmodellen. |
| "P6 går delvis utanför terrängmodellen; täckningen där är okänd." | Utöka terrängmodellen, eller acceptera att täckningen inte kontrolleras där. |
| "P7 har ännu inga bottennivåer." | Skriv in dem, eller sätt dem utifrån reglerna. |

Problemrör och -konstruktioner markeras också i rött på planen.

## Konstruktionstyper

En konstruktionstyp är en konstruktion byggd från sina parametrar: en brunn, ett inlopp, en förgreningsbrunn eller ett utlopp, **rund** (innerdiameter) eller **rektangulär** (innerbredd och innerlängd), med dess **väggtjocklek**, **bottenplatta**, en **sump** under lägsta röret och en **ram och lock** (rund eller rektangulär öppning, ramens höjd). Typerna hör till nätet, under **Konstruktionstyper** i projektets Egenskaper.

1. Klicka på {{ui:Ny konstruktionstyp}}. Dialogrutan ritar konstruktionen i plan och i sektion medan du skriver.
2. Klicka på {{ui:Lägg till typen}}.
3. Markera en konstruktion och välj typen under **Typ**. Den tar typens storlek och sump; dess egen sump kan fortfarande ändras.

Redigerar du en typ följer varje konstruktion av den typen dess mått. Tar du bort en typ blir dess konstruktioner kvar som runda konstruktioner med samma bredd. Varje ändring är ett steg: {{key:Mod+Z}} ångrar den.

En rektangulär konstruktion ritas på planen, i DXF, DWG och PDF, och i 3D som en rektangel med sin längd längs dess utloppsrör; rör startar vid dess vägg. LandXML skriver den som en rektangulär konstruktion (`RectStruct`) med sin väggtjocklek, och läser sådana konstruktioner tillbaka som typer.

### Dela en typ via biblioteket

{{ui:Spara som biblioteksobjekt}} skriver typen som ett CadCraft-biblioteksobjekt (en `.json`-fil): dess symbol för planen, en 3D-kropp till ett typiskt djup och alla mått. Ladda upp den till biblioteket för att dela den. {{ui:Öppna ett biblioteksobjekt}} läser in en konstruktion som sparats på det här sättet tillbaka i nätet, omvandlad till projektets enheter. Biblioteksobjekt som inte är konstruktioner gjorda i CivilCraft avvisas, med skälet angivet.

## Ta bort

Markera ett rör och tryck på {{key:Delete}} för att ta bort det. Tar du bort en konstruktion tas även de rör som är kopplade till den bort. På Mac trycker du på Fn och Delete, eller klickar på {{ui:Ta bort}}.

## Ännu inte byggt

Flöden, rördimensioner och den hydrauliska trycklinjen finns i [Dagvattendränering](topic:storm-drainage). Rörkataloger, icke-runda rör, rör i profilvyn, krökta rör och mer än ett nät per projekt finns inte ännu. Se [Finns inte ännu](topic:not-built-yet).
