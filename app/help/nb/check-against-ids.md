---
title: Kontroller IFC-eksporten mot en kundes IDS
summary: Last inn .ids-filen som en kunde eller veimyndighet ga deg, og se hvert eksporterte element som ikke oppfyller den, i Problemer.
keywords: ids, information delivery specification, buildingsmart, krav, leveranse, kontroll, validering, kvalitetssikring, IFC-eksport, ifc 4.3, veglinje, vei, anskaffelse
from: 183d9a0e
---

## Hva du gjør

En IDS (Information Delivery Specification, en buildingSMART-standard) er listen over hva en IFC-fil må inneholde. Offentlige anskaffelser sender ofte en med oppdraget. CivilCraft kontrollerer IFC-filen dette prosjektet eksporterer, i den IFC-versjonen du valgte for eksporten, mot den, og lister hvert element som kommer til kort.

## Steg

1. Åpne prosjektet ditt.
2. Klikk {{ui:IFC}} i gruppen Eksport på verktøylinjen. Velg i dialogboksen IFC-versjonen du skal levere.
3. Klikk {{ui:Kontroller mot IDS…}}.
4. Klikk {{ui:Last inn en .ids-fil…}} og velg filen. Ingenting lastes opp.
5. Les resultatet: hver spesifikasjon med {{ui:Bestått}} eller {{ui:Feil}}, og hvor mange elementer den gjelder for.
6. Åpne Problemer ({{key:Ctrl+Shift+M}}) og klikk på en feil for å velge veglinjen, byggeplaten, røret, konstruksjonen eller bygningsvolumet den kom fra.

## Hva du bør se

- En advarsel per eksportert element og krav det ikke oppfyller, med spesifikasjonens navn, hva IDS-en krever, og hva eksporten har.
- Kontrollrapporten (i Problemer) starter med IDS-en: tittel, versjon, forfatter og hver spesifikasjons antall.

## Godt å vite

- IDS-en lagres i prosjektfilen, så den kontrolleres på nytt når du åpner prosjektet. Å laste den inn eller glemme den er ett steg du kan angre.
- Hver endring kontrolleres på nytt et øyeblikk senere. Store terrengmodeller tar lengre tid å skrive, så kontrollen venter da litt lenger mellom kjøringene.
- Kontrollen bruker den samme filen som eksporten {{ui:IFC}} skriver, i versjonen sist valgt der (IFC 4.3 når du ikke har valgt en).
- Tall sammenlignes i SI-enheter: et prosjekt i fot konverteres til meter først.

- Mønstre i IDS-en leses som hele verdien. Et `^` i starten og et `$` på slutten tas også som «hele verdien», slik de fleste IDS-filer mener dem.

## Neste

- [Eksporter IFC](topic:ifc)
