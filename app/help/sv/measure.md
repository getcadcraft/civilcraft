---
title: Mät avstånd, areor och lutningar
summary: Mät i planen genom att klicka på punkter – varje sidas längd och riktning, den löpande summan, längden längs marken, lutningen samt area och omkrets för en sluten form – och mellan två punkter på en kraftledningsprofil.
keywords: mät, mätning, avstånd, längd, area, omkrets, riktning, lutning, stigning, linjal, måttband, längs marken, profil, höjdskillnad
from: d614eb25
---

{{ui:Terrängmodell}} › {{ui:Mer}} › {{ui:Mät}} (finns också i arbetsytan Kraftledningar under menyn {{ui:Mer}}, eller tryck på {{key:M}}) mäter utan att lägga till något i projektet.

## På planen

1. Välj {{ui:Mät}} och klicka sedan på punkter. Ett klick nära en mätpunkt tar dess plats och höjd.
2. Statusraden visar antalet punkter och den totala längden, den senaste sidans längd och riktning, dess lutning där marken är känd i båda ändarna, samt längden längs marken. Bredvid pekaren visas sidan som ritas och den löpande summan.
3. Klicka på första punkten igen för att sluta formen: statusraden lägger då till dess **area** och **omkrets**. Nästa klick startar en ny mätning.
4. {{key:Enter}} avslutar mätningen och behåller dess värden i statusraden; {{key:Backspace}} tar tillbaka den senaste punkten; {{key:Esc}} rensar den, och ytterligare ett {{key:Esc}} återgår till {{ui:Markera}}.

Längder anges i projektets enhet och areor i dess kvadratenhet. Lutningen och längden längs marken använder den föreslagna terrängmodellen där det finns en, annars den befintliga marken; utanför terrängmodellen utelämnas de.

## På en kraftledningsprofil

I [linjeprofilen](topic:overhead-line#the-line-profile) tar {{ui:Mät}} i profilens verktygsrad två klick och visar avståndet i sidled, höjdskillnaden, det raka avståndet och lutningen mellan dem. Ett klick nära marken, ledaren eller en stolpes topp fäster i den. Klicka på {{ui:Mät}} igen för att sluta.
