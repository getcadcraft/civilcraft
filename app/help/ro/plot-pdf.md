---
title: Trasarea planului în PDF
summary: Trasați totul sau vederea curentă într-un PDF vectorial pe o foaie standard, la o scară inginerească sau metrică, în culorile straturilor sau în negru.
keywords: trasare, imprimare, pdf, foaie, scară, dimensiune hârtie, foaie de plan, publicare, cartuș, săgeată nord, bară de scară
from: 9af396ca
---

{{ui:PDF}} trasează planul într-un PDF vectorial pe o singură foaie, cu un cartuș, o săgeată a nordului și o bară de scară. PDF-ul este realizat în browser și descărcat; nu trece prin caseta de dialog de imprimare a browserului.

## Trasarea

1. Stabiliți planul din **Afișare**: suprafața afișată, intervalul curbelor de nivel și ce elemente sunt active. Trasarea urmează aceste setări.
2. Dacă doriți doar o parte din amplasament, măriți și deplasați planul până la ea.
3. Faceți clic pe {{ui:PDF}} din grupul **Export** sau apăsați {{key:Mod+P}}.
   Se deschide caseta de dialog **Trasarea planului în PDF**.
4. Alegeți **Zona**: {{ui:Tot}} sau {{ui:Ce este pe ecran}}.
5. Alegeți **Formatul hârtiei**: Letter, Tabloid, ANSI D, ARCH D, ISO A4, A3 sau A1. Un proiect în picioare (ft) pornește pe Tabloid, iar unul metric pe A3. Foile sunt întotdeauna orientate orizontal.
6. Alegeți **Scara**. Lista marchează cea mai mare scară care încape cu „(încape)” și o selectează.
   - Picioare (ft): 1" = 5', 10', 20', 30', 40', 50', 60', 100', 200', 300', 400', 500', 1000'.
   - Metri: 1:50, 1:100, 1:200, 1:250, 1:500, 1:1000, 1:2000, 1:2500, 1:5000, 1:10000.
7. Alegeți **Cerneala**: {{ui:Culorile straturilor}} sau {{ui:Negru}}.
8. Citiți rândul de sub alegeri. Acesta arată mărimea zonei pe hârtie și dimensiunea foii, de exemplu „Zona are 297 × 222 mm la 1" = 40' pe o foaie de 432 × 279 mm (orizontală).”
9. Faceți clic pe {{ui:Descărcare PDF}}.
   Browserul descarcă `<name>.pdf`. Bara de stare spune „<name>.pdf trasat la 1" = 40'.”

Dacă zona este mai mare decât foaia la scara aleasă, trasarea este centrată și marginile sunt tăiate. Alegeți scara marcată „(încape)” sau o foaie mai mare.

## Ce este pe foaie

- Planul, centrat în zona de desen, ca vectori adevărați: curbe de nivel, etichete, trasee cu pichetaj, coridoare, platforme și linii de intersecție cu terenul, conducte, puncte.
- Grosimi de linie după strat: traseele, platformele și conductele mai groase; triunghiurile și curbele secundare fine.
- O bandă de titlu de-a lungul marginii de jos cu **Numele** proiectului, scara, o notă despre intervalul curbelor de nivel și ce suprafață (existentă sau sistematizată), iar în dreapta data și versiunea.
- O săgeată a nordului în colțul din dreapta sus (nordul planului este în sus) și o bară de scară în banda de titlu.
- Straturile de hartă afișate sub plan (o imagine, plăci de hartă sau un serviciu de hartă), când **Straturi de hartă sub plan** este bifat: ele sunt desenate ca o singură imagine a întregii zone de desen, la 150 de puncte pe inch, sub liniile desenului, iar atribuirea hărții merge în banda de titlu. CivilCraft așteaptă până la 8 secunde imaginile de hartă care mai sosesc; dacă unele lipsesc încă, bara de stare o spune.

Textul folosește fontul Helvetica încorporat în PDF. Caracterele din afara setului Europei de Vest (Windows-1252) se tipăresc ca „?”, iar mesajul de stare le numără.

## Ce nu este trasat

- Benzile de altitudine.
- Vederea profilului. Trasarea profilelor nu este încă disponibilă.
- Mai mult de o foaie (pentru un traseu, folosiți [planșe de plan și profil](topic:plan-profile-sheets)), ferestre de vizualizare, un cartuș personalizat sau foi în portret.

:::note
Caseta de dialog spune că săgețile de pantă sunt doar pentru ecran. În această versiune, săgețile de pantă activate în **Afișare** sunt trasate (și exportate în DXF). Dezactivați-le înainte de trasare dacă nu le doriți.
:::

## Imprimarea pe hârtie

Deschideți PDF-ul descărcat în orice vizualizator de PDF și imprimați-l la 100% (dimensiune reală), pentru ca scara să rămână corectă. „Potrivire la pagină” schimbă scara.
