---
title: Plotta planen till PDF
summary: Plotta allt eller den aktuella vyn till en vektor-PDF på ett standardblad i teknisk eller metrisk skala, i lagerfärger eller svart.
keywords: plotta, skriv ut, pdf, blad, skala, pappersstorlek, planblad, publicera, ritningshuvud, nordpil, skalstapel
from: 9af396ca
---

{{ui:PDF}} plottar planen till en vektor-PDF på ett blad, med ett titelfält, en nordpil och en skalstapel. PDF-filen görs i webbläsaren och laddas ner; den går inte via webbläsarens utskriftsdialog.

## Plotta

1. Ställ in planen under **Visa**: den yta som visas, höjdkurvsintervallet och vad som är på. Plotten följer dessa inställningar.
2. Om du bara vill ha en del av tomten, zooma och panorera planen till den.
3. Klicka på {{ui:PDF}} i gruppen **Exportera**, eller tryck på {{key:Mod+P}}.
   Dialogrutan **Plotta planen till PDF** öppnas.
4. Välj **Område**: {{ui:Allt}} eller {{ui:Det som syns på skärmen}}.
5. Välj **Papper**: Letter, Tabloid, ANSI D, ARCH D, ISO A4, A3 eller A1. Ett projekt i fot startar på Tabloid, ett projekt i meter på A3. Bladen är alltid liggande.
6. Välj **Skala**. Listan markerar den största skalan som ryms med "(ryms)" och väljer den.
   - Fot: 1" = 5', 10', 20', 30', 40', 50', 60', 100', 200', 300', 400', 500', 1000'.
   - Meter: 1:50, 1:100, 1:200, 1:250, 1:500, 1:1000, 1:2000, 1:2500, 1:5000, 1:10000.
7. Välj **Bläck**: {{ui:Lagerfärger}} eller {{ui:Svart}}.
8. Läs raden under valen. Den anger områdets storlek på papper och bladstorleken, till exempel "Området är 297 × 222 mm vid 1" = 40' på ett 432 × 279 mm blad (liggande)."
9. Klicka på {{ui:Ladda ner PDF}}.
   Webbläsaren laddar ner `<name>.pdf`. Statusfältet säger "Plottade <name>.pdf vid 1" = 40'."

Om området är större än bladet i den skala du valt centreras plotten och kanterna klipps av. Välj skalan markerad "(ryms)" eller ett större blad.

## Vad som finns på bladet

- Planen, centrerad i ritområdet, som sanna vektorer: höjdkurvor, etiketter, linjeföringar med stationering, korridorer, byggplattor och släntkrönslinjer, ledningar, punkter.
- Linjetjocklek per lager: linjeföringar, byggplattor och ledningar tjockare; trianglar och tunna höjdkurvor fina.
- Ett titelfält längs nederkanten med projektets **Namn**, skalan, en notering om höjdkurvsintervallet och vilken yta (befintlig eller planerad), samt datum och version till höger.
- En nordpil i övre högra hörnet (plannord är upp) och en skalstapel i titelfältet.
- Kartlagren under planen (en bild, kartrutor eller en karttjänst), när **Kartlager under planen** är ikryssad: de ritas som en bild av hela ritområdet vid 150 bildpunkter per tum, under linjerna, och en kartas källangivelse hamnar i titelfältet. CivilCraft väntar högst 8 sekunder på kartbilder som fortfarande kommer; om någon saknas säger statusfältet det.

Text använder PDF:ens inbyggda Helvetica. Tecken utanför den västeuropeiska uppsättningen (Windows-1252) skrivs ut som "?", och statusmeddelandet räknar dem.

## Vad som inte plottas

- Höjdband.
- Profilvyn. Plottning av profiler finns inte ännu.
- Mer än ett blad (för en linjeföring, använd [plan- och profilblad](topic:plan-profile-sheets)), vyportar, ett anpassat titelfält eller stående blad.

:::note
Dialogrutan anger att lutningspilar bara syns på skärmen. I den här versionen plottas lutningspilar som är påslagna under **Visa** (och exporteras till DXF). Stäng av dem före plottning om du inte vill ha dem.
:::

## Utskrift på papper

Öppna den nedladdade PDF-filen i valfri PDF-läsare och skriv ut den i 100 % (verklig storlek) så att skalan stämmer. "Anpassa till sida" ändrar skalan.
