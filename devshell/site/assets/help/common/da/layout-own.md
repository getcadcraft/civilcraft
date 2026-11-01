---
title: Arrangér dit eget layout og gem dine opsætninger
summary: Vælg hvilket panel der viser projektbrowseren, Egenskaber eller panelets eget indhold, hvor værktøjskassen sidder, og hvad linjerne rummer, gem det som dit eget layout, og behold hele opsætninger under et navn, så du kan skifte mellem dem.
keywords: layout, arbejdsområde, arrangér, tilpas, mit layout, eget layout, paneler, editorer, projektbrowser, egenskaber, værktøjskasse, hurtiglinje, infoboks, arbejdsmiljø, opsætning, profil, gem opsætning, skift opsætning, eksportér opsætning, importér opsætning, ccenv
from: 2a71af43
---

Ud over de tre indbyggede layouts kan du arrangere et eget og gemme hele din opsætning under et navn, så du kan skifte tilbage til den i ét trin.

## Arrangér dit eget layout

1. Åbn {{ui:Indstillinger}} (tandhjulet, eller {{key:Mod+,}}), vælg {{ui:Globalt}} og derefter {{ui:Layout}}.
2. Vælg {{ui:Arrangér dit eget layout…}}. Dialogboksen starter ud fra det layout, du bruger nu.
3. Giv det et navn, og vælg derefter:
   - **Over tegningen:** appens værktøjslinje, et bånd eller ingen af dem; en titellinje; en infoboks og hvilke kontroller den rummer.
   - **Ved siden af tegningen:** værktøjskassen til venstre, til højre eller slet ikke, med eller uden {{ui:Mine værktøjer}}; hvilket panel der rummer paletterne, hvilken der er øverst (for eksempel projektbrowseren eller Egenskaber), og hvilke der er faner under den.
   - **Tegneområdet:** visningsfaner, en hurtiglinje og en visningslinje med de kontroller, du sætter flueben ved, redigeringspaletten, en statuslinje.
   - **Udseende:** størrelse, knapomrids og fanestil.
4. Vælg {{ui:Brug dette layout}}. Appen skifter til det med det samme, og hver app, der har layouts, bruger det også.

Kun det, denne app har, tilbydes. Dit layout står under {{ui:Fra add-ons og filer}}; {{ui:Eksportér dette layout}} gemmer det som en fil, du kan give en kollega, og fjern-knappen tager det væk. De paneler, det fylder, kan stadig fastgøres, frigøres og flyttes til egne vinduer, som i [Arrangér panelerne](common:arrange-panels).

## Gem din opsætning som et arbejdsmiljø

Et arbejdsmiljø er hele din opsætning for hver app i denne browser: layoutet, menustilen og dine taster, værktøjslinjens stil, panelerne og deres størrelser samt {{ui:Mine værktøjer}}. Temaet og sproget er ikke en del af det.

- **Gem:** skriv et navn under {{ui:Arbejdsmiljøer}}, og vælg {{ui:Gem min opsætning}}. Gemmer du under et navn, der findes, erstattes den opsætning.
- **Skift:** vælg en opsætning på listen, og vælg {{ui:Skift til den}}. Appen genindlæses i den opsætning; hvis du har ikke-gemt arbejde, spørger appen først, som den gør ved enhver genindlæsning.
- **Del:** {{ui:Eksportér}} gemmer den valgte opsætning som en `.ccenv.json`-fil; {{ui:Importér en opsætning…}} tilføjer en fra en fil. En fil sætter kun disse valg, intet andet.
- **Fjern:** vælg en opsætning, og vælg {{ui:Fjern}}.

Du kan beholde op til tolv opsætninger.

For at prøve de indbyggede opstillinger først, se [layoutet med værktøjskasse og infoboks](common:layout-toolbox) og [layoutet med bånd og projektbrowser](common:layout-ribbon).
