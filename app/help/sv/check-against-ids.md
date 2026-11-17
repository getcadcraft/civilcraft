---
title: Kontrollera IFC-exporten mot en kunds IDS
summary: Läs in .ids-filen som en kund eller vägmyndighet gav dig och se varje exporterat element som inte uppfyller den i Problem.
keywords: ids, information delivery specification, buildingsmart, krav, leverans, kontroll, validering, kvalitetssäkring, ifc-export, ifc 4.3, linjeföring, väg, upphandling
from: 183d9a0e
---

## Vad du gör

En IDS (Information Delivery Specification, en buildingSMART-standard) är listan över vad en IFC måste innehålla. Offentlig upphandling skickar ofta en med uppdraget. CivilCraft kontrollerar den IFC som projektet exporterar, i den IFC-version du valde för exporten, mot den och listar varje element som inte uppfyller kraven.

## Steg

1. Öppna ditt projekt.
2. Klicka på {{ui:IFC}} i gruppen Export i verktygsfältet. Välj i dialogrutan den IFC-version du ska leverera.
3. Klicka på {{ui:Kontrollera mot IDS…}}.
4. Klicka på {{ui:Läs in en .ids-fil…}} och välj filen. Inget laddas upp.
5. Läs resultatet: varje specifikation med {{ui:Uppfylld}} eller {{ui:Underkänd}} och hur många element den gäller för.
6. Öppna Problem ({{key:Ctrl+Shift+M}}) och klicka på ett fel för att markera linjeföringen, byggplattan, ledningen, brunnen eller byggnadsvolymen det kommer från.

## Vad du bör se

- En varning per exporterat element och krav det inte uppfyller, med specifikationens namn, vad IDS:en kräver och vad exporten har.
- Kontrollrapporten (i Problem) börjar med IDS:en: dess titel, version, författare och varje specifikations antal.

## Bra att veta

- IDS:en sparas i projektfilen, så den kontrolleras igen när du öppnar projektet. Att läsa in eller glömma den är ett steg som du kan ångra.
- Varje ändring kontrolleras igen en stund senare. Stora ytor tar längre tid att skriva, så kontrollen väntar då lite längre mellan körningarna.
- Kontrollen använder samma fil som exporten {{ui:IFC}} skriver, i den version som senast valdes där (IFC 4.3 om du inte har valt någon).
- Tal jämförs i SI-enheter: ett projekt i fot omvandlas först till meter.
- Mönster i IDS:en läses som hela värdet. Ett `^` i början och ett `$` i slutet tas också som "hela värdet", som de flesta IDS-filer avser dem.

## Nästa

- [Exportera IFC](topic:ifc)
