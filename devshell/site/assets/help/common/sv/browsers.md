---
title: Webbläsare och datorer
summary: Vilka webbläsare apparna körs i, vad som skiljer dem åt och vad din dator behöver.
keywords: chrome, edge, firefox, safari, brave, webbläsare, mac, windows, linux, ipad, surfplatta, webgl, krav, minne
from: a11b09b1
---

Apparna körs i en webbläsare. De gör arbetet på din egen dator: dina filer öppnas där och skickas aldrig till oss (se [Vart dina filer tar vägen](common:your-files)).

## Vilken webbläsare

Använd en uppdaterad version av någon av dessa:

| Webbläsare | Motor | Anmärkningar |
|---|---|---|
| Chrome, Edge, Brave, Opera, Vivaldi | Chromium | Den mest kompletta: val av mapp, sparande för offlineanvändning, filhantering. |
| Firefox | Gecko | Fungerar. Att öppna en hel mapp använder en enklare väljare. Offlinesparande kanske inte fungerar i privata fönster. |
| Safari | WebKit | Fungerar på Mac och iPad. Att öppna en hel mapp använder en enklare väljare. Safari kan ta bort en offlinekopia du inte har använt på några veckor. |

Alla tre motorerna fungerar bra för vardagligt arbete. Där en app gör något annorlunda i en av dem visar dess hjälp stegen för din webbläsare.

## Vad som skiljer webbläsarna åt

- **Att öppna en mapp.** Chromium-webbläsare visar en riktig mappväljare och kan läsa mappen direkt. Firefox och Safari ber dig välja en mapp och läser sedan varje fil i den, vilket tar längre tid för stora projektmappar; att dra mappen till appen fungerar i alla tre.
- **Sparande.** Apparna sparar genom att ladda ner en fil. Din webbläsare avgör vart nedladdningar hamnar och om den frågar först.

:::chromium
I Chrome eller Edge slår du på ”Fråga var varje fil ska sparas före nedladdning” (i Inställningar, under Hämtade filer) för att välja mapp varje gång.
:::

:::firefox
I Firefox öppnar du Inställningar, sedan Allmänt, sedan Filer och program, och väljer ”Fråga alltid var filer ska sparas” för att välja mapp varje gång.
:::

:::safari
I Safari öppnar du Inställningar, sedan Allmänt, och ställer in ”Placering för hämtade filer” på ”Fråga för varje hämtning” för att välja mapp varje gång.
:::

## Mac, Windows och Linux

Apparna är likadana på alla datorer. Det som ändras är tangentbordet: kortkommandon skrivs automatiskt för din dator. Se [Tangenter, möss och styrplattor](common:keys).

## Surfplattor och pekskärmar

Vissa appar tar emot touch (ett finger ritar eller markerar, två fingrar nyper för att zooma och panorera). Varje apps hjälp säger om den gör det. På en iPad använder du Safari eller Chrome. Ett tangentbord hjälper i appar som använder skrivna kommandon.

## Äldsta webbläsare och system

Vi har läst detta ur koden i 0.7-apparna, inte gissat: varje fil analyserades och varje språkfunktion den använder slogs upp i webbläsarnas publicerade kompatibilitetsdata. Under dessa versioner kan apparna inte ens starta, eftersom webbläsaren inte förstår koden.

| | Äldsta version som kan starta apparna |
|---|---|
| Chrome, Edge, Brave, Opera, Vivaldi | Chromium 94 |
| Firefox | 93 |
| Safari (Mac, iPad, iPhone) | 16.4 (macOS 13.3, iPadOS och iOS 16.4) |

CadCraft Studio har sin egen webbmotor i Windows, så det kräver Windows 10 eller 11; på en Mac använder det systemets, så det kräver macOS 13.3 eller senare. Inställningar › Uppdateringar i Studio visar vad din kopia kör på.

Detta är den äldsta version som *startar*, avläst ur koden. Det är ingen lista över gamla webbläsare vi har kört apparna i, så en äldre som startar kan ändå sakna en funktion.

## Vad din dator behöver

Det här är planerade miniminivåer för apparna, inte uppmätta krav:

- 8 GB minne (16 GB rekommenderas för stora federerade modeller).
- Ett grafikchip med WebGL 2 för 3D-apparna. Om en 3D-vy förblir tom kontrollerar du att maskinvaruacceleration är påslagen i webbläsarens inställningar.
- En skärm som är minst 1280 pixlar bred för de fullständiga verktygsfälten; mindre skärmar bryter dem på flera rader.

Mycket stora filer (stora ritningsuppsättningar, stora modeller) använder mycket minne i en webbläsarflik. Stäng andra tunga flikar om en app blir långsam.
