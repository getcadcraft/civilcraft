---
title: Vattenledningar: tryck, flöden och brandflöde
summary: Rita ett tryckledningsnät med noder, reservoarer, tankar, ledningar, pumpar och tryckreducerventiler i planen; CivilCraft beräknar tryckhöjderna, trycken och flödena (Hazen–Williams, maskade nät), flödet som finns tillgängligt för en brand och ett dygns förbrukning. En labbfunktion; varje resultat behöver en ingenjörs kontroll.
keywords: vatten, vattenledning, vattenfördelning, tryckledningsnät, tryckledning, maskat nät, hazen-williams, C-faktor, tryckförlust, restryck, brandflöde, brandpost, förbrukning, nod, reservoar, tank, pump, pumpkurva, tryckreducerventil, prv, backventil, utökad period, epanet, inp, hastighet
from: df46bf6d
---

Vattenledningar är tryckdelen av en plats: rör som alltid är fulla, med vatten som pressas fram av en reservoar, en tank eller en pump. CivilCraft beräknar tryckhöjden och trycket i varje nod och flödet i varje ledning, även i maskade nät där vattnet har fler än en väg att gå. Den finns i labbet medan den kontrolleras.

**Endast ett beräkningsstöd.** Varje tal behöver en kvalificerad ingenjörs kontroll: svaret är inte bättre än förbrukningarna, höjderna, ledningsdimensionerna och ruhetsvärdena du angav, och en stationär modell vet ingenting om vattenslag, vattenkvalitet eller en brandpumps verkliga beteende.

## Rita nätet

1. Under **Yta** › {{ui:Mer}}, välj {{ui:Vattenledningar…}}. Fönstret stannar öppet medan du arbetar i planen.
2. Välj {{ui:Reservoar}} och klicka i planen där försörjningen finns. Dess tryckhöjd startar 100 ft (30 m) över marken; ändra den i **Egenskaper**.
3. Välj {{ui:Nod}} och klicka på varje plats där vatten tas ut eller ledningar möts. En nod tar sin höjd från marken; skriv en annan i **Egenskaper** för att åsidosätta den.
4. Välj {{ui:Ledning}}, klicka på en nod och sedan på noden den ansluter till. Verktyget stannar på för nästa ledning. En {{ui:Pump}} och en {{ui:Tryckreducerventil}} ritas på samma sätt, från sugnoden (eller uppströmsnoden) till trycknoden (eller nedströmsnoden). En {{ui:Tank}} placeras som en nod.
5. Markera en nod och skriv in dess {{ui:Förbrukning}} (gpm, eller L/s i ett metriskt projekt). Markera en ledning och ställ in dess {{ui:Diameter}} (tum, eller mm) och, om du känner den, dess Hazen–Williams C.

Varje ändring är ett ångrasteg. {{key:Delete}} tar bort noden och de ledningar som slutar i den.

## Vad varje del betyder

- **Ledning.** Längden mäts längs planen om du inte skriver in en. C är Hazen–Williams ruhet (130 att börja med, ändra standardvärdet i fönstret). En koefficient för mindre förluster K lägger till förlusterna i krökar och kopplingsdelar. Bocka i **Backventil** för en ledning som inte får föra vatten bakåt; en **Stängd** ledning för inget vatten.
- **Reservoar.** En källa med fast tryckhöjd, den vattennivå den håller över referensnivån. Den ger eller tar det nätet behöver.
- **Tank.** En nivå som ändras under ett dygn. I de stationära resultaten är den en källa på sin aktuella nivå.
- **Pump.** En dimensionerande punkt (flöde och tryckhöjd) ger den vanliga kurvan genom den: tryckhöjden vid noll flöde är 133 % av den dimensionerande tryckhöjden, och tryckhöjden är noll vid dubbelt dimensionerande flöde. En pump pressar aldrig vatten bakåt.
- **Tryckreducerventil.** Håller det tryck du ställer in nedströms när tillförseln är högre. När tillförseln är lägre är den öppen och håller inget; om vattnet skulle gå bakåt stängs den.

## Läs resultaten

Fönstret visar varje nods tryckhöjd och tryck samt varje länks flöde, hastighet och tryckförlust per 1,000 ft (eller per km), med noderna färgade i planen: grönt är mellan ditt lägsta och högsta tryck, rött under, orange över. Flödespilar visar riktningen. Markera en nod eller ledning för att läsa dess värden i **Egenskaper**.

Under tabellerna finns en lista över vad du bör titta på: lågt eller högt tryck, en ledning snabbare än din gräns, en nod avskuren från varje källa, eller en lösare som inte konvergerade. Samma fynd finns i Problempanelen. Ställ in gränserna i fönstret (20 psi, 100 psi och 10 ft/s att börja med; 140 kPa, 700 kPa och 3 m/s i ett metriskt projekt).

## Brandflöde

{{ui:Brandflöde…}} ritar ett flöde vid en nod och visar trycket där och det lägsta trycket någonstans i nätet. Det hittar också flödet som finns tillgängligt vid den noden, medan den svagaste noden i nätet behåller det restryck du anger. Andra förbrukningar ligger kvar som de är.

## Ett dygns förbrukning

{{ui:Ett dygns förbrukning…}} kör nätet timme för timme. Ange förbrukningsmönstret i filens inställningar (en lista med multiplikatorer som upprepas); tankar fylls och töms med flödet in och ut, och en pump kan följa ett på/av-mönster. En tank som når sin högsta eller lägsta nivå anges i listan: CivilCraft stänger inte dess in- eller utlopp åt dig, så läs det som "den här tanken är för liten eller pumpen för stor".

## EPANET-text

{{ui:Spara som EPANET-text (.inp)}} skriver nätet i textformatet som många vattenprogram läser, och {{ui:Öppna EPANET-text (.inp)…}} läser in en sådan. Bara det CivilCraft modellerar följer med: noder, reservoarer, tankar, ledningar, pumpar med tryckhöjdskurva, tryckreducerventiler, förbrukningsmönster och tider. Andra ventiltyper, pumpar angivna med effekt och andra formler för tryckförlust namnges och utelämnas. Filen måste använda samma enheter som projektet.

## Brandposter, ventiler och kopplingsdelar

Markera en nod och bocka i **Brandpost** för att placera en där; markera en huvudledning och tryck på **Lägg till i mitten** för att placera en ventil, en luftventil, en avtappning eller en mätare på den. De är objekt i nätet: de flyttas med det, och ett ångrasteg tar bort dem.

Layouten innebär också kopplingsdelar, och CivilCraft listar dem utan att du ber om det: ett **T-stycke** där tre huvudledningar möts, ett **kors** där fyra gör det, en **böj** (med sin vinkel) där två huvudledningar vrids 5° eller mer, en **reducering** där två dimensioner möts, och ett **blindlock** vid en återvändsända. {{ui:Armaturförteckning (CSV)}} räknar dem och huvudledningarna per dimension. Detta är vad layouten innebär, en mängdavtagning att kontrollera mot dina egna detaljer, inte en lista att beställa från.

Huvudledningarna läggs under markytan minus en täckning (4 ft eller 1.2 m) så att de kan ritas och modelleras i 3D; trycken ovan beror aldrig på den.

## I planen och i filer

PDF-filen och DWG- eller DXF-filen bär huvudledningarna på **C-WATR-MAIN**, med deras dimensioner på **C-WATR-TEXT**, brandposter på **C-WATR-HYDR**, ventiler på **C-WATR-VALV** och kopplingsdelarna på **C-WATR-FITT**. LandXML-export skriver ett vattenledningsnät (en konstruktion för varje nod, en ledning för varje huvudledning, brandposter namngivna); LandXML-import läser tillbaka ett sådant som vattenledningar, utan förbrukningar, pumpar eller ventiler, eftersom LandXML inte bär dem. IFC-exporten skriver huvudledningarna som rörsegment, brandposter, ventiler och kopplingsdelar i ett vattensystem. Filerna har kontrollerats mot våra egna läsare och skrivare; prova dem i dina andra program och berätta vad de säger.

## Vad som inte finns ännu

Vattenkvalitet och vattnets ålder, styrning och regler utöver en pumps på/av-mönster, andra ventiltyper, förbrukning beroende av tryck, ledningar med varierande diameter och avloppsflöden över tid. Se [Finns inte ännu](topic:not-built-yet). Dimensionerande spillvattenflöden, som är en annan beräkning, finns i [Dimensionerande spillvattenflöden](topic:sanitary-design).
