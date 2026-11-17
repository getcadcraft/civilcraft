---
title: Från annan civil programvara
summary: Hur bekanta arbetsflöden för civil design motsvaras i CivilCraft, och skillnaderna som fäller erfarna användare under den första timmen.
keywords: byte, migrera, bekant, skillnader, arbetsflöde, kommandon, mappning, cogo, korridor, markplanering, ledningsnät, stilar, kommandorad
from: feae37d6
---

Om du har använt Civil 3D känner du redan till idéerna i CivilCraft: punkter och punktgrupper, TIN-ytor med brytlinjer och gränser, linjeföringar efter PI, profiler efter PVI, tvärsnitt svepta till korridorer, markplanering till släntkrön, självfallsledningsnät, LandXML. Det som är annorlunda är nästan allt runt omkring: det finns ingen ritningsfil, ingen kommandorad (om du inte väljer menystilen {{ui:Klassisk ritning}}), inga stilar, ingen Prospector och inga inställningsdialogrutor. CivilCraft är ett litet, fokuserat verktyg i en webbläsare, och i den här versionen gör det en bråkdel av vad ett fullständigt civilpaket gör. Den här sidan kopplar det du känner till till det som finns här.

:::tip
Om du gillar menyfliken i Civil 3D, välj menystilen {{ui:Civil-menyflik}} under {{ui:Inställningar}} › {{ui:CivilCraft}} › {{ui:Menyer, tangenter och mus}}: flikarna Start, Ytor, Ändra, Geolokalisering, Vy och Utdata, mittknappen panorerar, och {{key:Shift}} med mittknappen kretsar runt 3D-vyn. Om du skriver kommandon lägger {{ui:Klassisk ritning}} till en kommandorad (ALIGNMENT, PAD, PROFILE, ZOOM …). Se [Menyer, tangenter och mus](topic:menus-keys-and-mouse).
:::

## Arbetsflödeskarta

| Vad du vill göra | Det bekanta sättet | I CivilCraft |
|---|---|---|
| Ta in mätpunkter | Importera punkter med ett punktfilsformat | {{ui:Öppna}}, och kontrollera kolumnordningen i **Importera punkter** ([Importera mätpunkter](topic:import-points)) |
| Sortera punkter | Punktgrupper, beskrivningsnycklar | Automatiska grupper efter det första ordet i beskrivningen; inga beskrivningsnycklar |
| Redigera en punkt | Punkteditor, handtag | Klicka på den och skriv i Egenskaper, eller dra den ([Redigera en mätpunkt](topic:edit-points)) |
| Bygg befintlig mark | Skapa en yta, lägg till punktgrupper som data | Automatiskt: ytan byggs om när dess indata ändras |
| Lägg till brytlinjer | Lägg till brytlinjer från polylinjer eller funktionslinjer | Sätt en punktgrupp till {{ui:Brytlinje}}, eller klicka på punkter med verktyget {{ui:Brytlinje}} ({{key:B}}) |
| Trimma ytan | Yttre gräns, dold gräns, maximal trianglängd | {{ui:Gräns}} ({{key:O}}, bara yttre) och **Längsta yttre kant** |
| Visa höjdkurvor | Ytstil | **Visa** i vänstra panelen: intervall, huvudkurva var, etiketter, band, lutningspilar |
| Lägg ut en mittlinje | Verktyg för linjeföring, kurv- och klotoidinställningar | {{ui:Linjeföring}} ({{key:A}}): klicka på PI:er, {{key:Enter}}; radier och klotoidlängder i PI-tabellen |
| Skapa en profilvy | Guiden för profilvy, band | {{ui:Profil}} ({{key:R}}): en profilvy under planen, alltid anpassad |
| Utforma lutningen | Verktyg för profillayout | {{ui:Starta från marken}}, {{ui:Lägg till PVI}} ({{key:I}}), dra PVI:er, skriv **Kurva L** |
| Bygg en väg | Sektion, delsektioner, korridor, mål, regioner | Bocka i **Sveps en sektion längs designprofilen** under linjeföringen; ett körfält, en axelremsa och en sluttning på varje sida, eller varje sida byggd av delar (ränna, kantsten, gångbana …) |
| Utforma en byggplatta | Matarlinjer, markplaneringsgrupper, planeringskriterier | {{ui:Byggplatta}} ({{key:G}}): en plan byggplatta med schakt- och fyllningslutningar till släntkrön |
| Beräkna jordarbeten | Volymytor, volymdashboard | **Jordarbeten** i den högra panelen, rutnätsmetod, uppdateras direkt |
| Lägg ut dagvatten eller spillvatten | Ledningsnät med en delförteckning, regler | {{ui:Ledningar}} ({{key:P}}): klicka på brunnar nedströms; tre regler som du anger; automatiska bottennivåer |
| Utbyt med andra | LandXML-import och -export | {{ui:Öppna}} en LandXML-fil; {{ui:LandXML}} för att exportera ([Exportera LandXML](topic:landxml)) |
| Skicka linjearbete till CAD | Export till DWG | {{ui:DWG}} (format 2000 till 2018) eller {{ui:DXF}} (R12) |
| Skriva ut | Layouter, vyportar, bladsamlingar | {{ui:PDF}}: ett liggande blad med planen i vald skala; plan- och profilblad och tvärsnittsblad som PDF |
| Dela arbete mellan filer | Datagenvägar, referenser | Inte tillgängligt: ett projekt per fil |
| Ångra | Ångra | {{key:Mod+Z}} och {{key:Mod+Y}}, 200 steg; visningsinställningar är inga ångrasteg |

## Skillnader som fäller folk

**Det finns ingen kommandorad** om du inte väljer menystilen {{ui:Klassisk ritning}}. Verktyg är verktygsfältsknappar och enskilda bokstäver: {{key:A}} linjeföring, {{key:G}} byggplatta, {{key:P}} ledningar, {{key:B}} brytlinje, {{key:O}} gräns, {{key:R}} profil, {{key:I}} lägg till PVI, {{key:V}} markera, {{key:F}} anpassa. I de andra menystilarna gör det ingenting att skriva ett kommandonamn. Se [Tangenter och mus](topic:keyboard).

**Enter avslutar; dubbelklick är riskabelt.** Klicka en gång på den sista punkten och tryck sedan på {{key:Enter}}. I den här versionen avslutar ett dubbelklick också, men tar bort punkten du dubbelklickade på. Högerklick avslutar inte och upprepar inte; det panorerar bara när du drar med det.

**Allt är dynamiskt, hela tiden.** Ändra en punktgrupp, en radie, en PVI eller en byggplattas lutning, så uppdateras ytan, höjdkurvorna, korridoren, släntkrönslinjerna och volymerna direkt. Det finns inget att bygga om och ingenting blir inaktuellt.

**Inget är ett ritningsobjekt.** Planen är en vy av designen, inte en ritning du kan redigera med CAD-kommandon. Du kan inte lägga till egna linjer eller text, ändra ett lagers färg eller spränga något. Exportera till DXF och slutför ritningen i ett CAD-program.

**Inga stilar.** Färger, linjetjocklekar, etikettstorlekar och lagernamn är fasta (se [Lager i planen](topic:plan-layers)). Papper och Modell i appfältet byter mellan en ljus och en mörk skärm.

**Ett av varje.** En befintlig markyta, en planerad resultatyta, ett ledningsnät per projekt. Många linjeföringar och byggplattor är bra.

**Enheter är etiketter.** Att välja {{ui:US feet}} eller {{ui:Metres}} omvandlar inget. Det finns ingen ritningsskala. Ett koordinatsystem är valfritt: ange ett under {{ui:Koordinater}} och ingenting flyttas, det anger bara vad siffrorna betyder (se [Ange projektets koordinatsystem](topic:coordinate-systems)). Fot behandlas som US survey feet när de skrivs till LandXML.

**Brytlinjegrupper går samman i punktnummerordning.** En grupp satt till {{ui:Brytlinje}} blir en linje genom alla dess punkter, i nummerordning. Delade koder (två flödeslinjer kodade "FL") gör en sicksacklinje; rita dem för hand.

**Stationer ser likadana ut, metrarna skiljer sig.** Fot använder 100 ft-stationer (12+34.56); meter använder 1000 m-stationer (1+234.567).

**Radera på en Mac.** Mac-tangenten märkt delete är Backspace i webbläsaren. Använd Fn och delete, eller knappen {{ui:Ta bort}}, för att ta bort en markering.

**Filer är nedladdningar.** {{ui:Spara}} laddar ner en `.civilcraft.json`-fil varje gång; det finns inget "spara över den öppna filen". En återställningskopia av osparat arbete sparas i den här webbläsaren ([Återställ osparat arbete](common:recover)). Att öppna en punktfil ersätter punkterna utan att fråga. Se [Filer du kan öppna, spara och exportera](topic:files).

**Reglerna är dina.** Regler för ledningsnät och korridorsektionen börjar med platshållarvärden som inte är en standard. Ställ in dina egna innan du litar på någon kontroll.

**Volymer är rutnätsbaserade.** Schakt och fyllning kommer från ett fint rutnät mellan de två ytorna, innanför släntkrönslinjerna, utan svällning eller krympning. De ligger nära, men är inte samma sak som en TIN-till-TIN-volym.

## Vad som saknas

Andra spiraler än klotoider, sektioner som ändras längs vägen, lutande byggplattor, inloppskapacitet och fördröjning, komponentkataloger, ledningar i profil, fastighetsindelning och tomtstorlekar, utjämning enligt minsta kvadratmetoden, mätdatabaser, att öppna DWG och mer. Hela listan, med vad du gör i stället idag, finns i [Ännu inte byggt](topic:not-built-yet).
