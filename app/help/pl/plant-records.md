---
title: Rekordy roślin, odmiany i rozmiary dostawy
summary: Własna lista roślin projektu jako tabela: odmiany, rozmiary dostawy (pojemnik, bryła korzeniowa, obwód, wolny pień), zagęszczenie, notatki specyfikacji, CSV na wejściu i wyjściu; każda umieszczona roślina podaje rozmiar; symbole roślin wg skali oraz własne symbole i modele 3D.
keywords: tabela roślin, baza roślin, odmiana, deklarowany rozmiar, pojemnik, bryła korzeniowa, goły korzeń, obwód pnia, wolny pień, zagęszczenie, rośliny na metr kwadratowy, specyfikacja, notatki specyfikacji, symbol rośliny, blok, własny symbol, roślina 3D, szczegółowość, skala
from: 12251beb
---

Otwórz {{ui:Tabela roślin}} z menu {{ui:Więcej}} grupy Krajobraz albo z sekcji Rośliny. Każdy wiersz to rekord rośliny we własnej liście projektu (rekord z listy roślin jest kopiowany po jego dodaniu). Każda edycja jest sprawdzana tak jak zaimportowany plik i stanowi jeden krok cofnięcia.

## Kolumny

- **Nazwa botaniczna**, **Nazwa zwyczajowa**, **Typ**, **Wysokość** i **Rozpiętość** w dojrzałości (metry).
- **Rozstaw** (od środka do środka) albo **Zagęszczenie** (rośliny na m²). Rabata z rekordem, który ma zagęszczenie i nie ma rozstawu, jest wypełniana tym zagęszczeniem, według jego własnego wzoru (trójkątnego lub kwadratowego).
- **Rozmiary dostawy**: jeden wpis na rozmiar, oddzielone `;`. Każdy wpis to identyfikator, rodzaj (`container`, `rootball`, `wrapped`, `bareroot`, `plug`, `seed`), a potem dowolne z: objętość `10L`, wysokość `h0.6`, rozpiętość `s0.4`, obwód `g14-16` (cm), wolny pień `st1.8`. Przykład: `c10 container 10L h0.6; rb rootball h3 g14-16 st1.8`.
- **Odmiany**: nazwy oddzielone `;`. Odmiana zachowuje własne rozmiary i notatki, jeśli zaimportowany plik je miał.
- **Notatki specyfikacji**.

{{ui:Duplikuj}} kopiuje wiersz pod nowym kluczem; {{ui:Zapisz jako CSV}} i {{ui:Zapisz jako plik roślin}} zapisują listę (wiersze CSV odmian znajdują się pod swoim gatunkiem, z `cultivar_of`). Import pliku CSV lub pliku roślin scala go z listą.

## Twoja lista roślin z biblioteki

Zaloguj się na swoje konto CadCraft (Ustawienia, Twoje dodatki, Zaloguj się), a tabela roślin może korzystać z listy, którą przechowujesz w Bibliotece:

- {{ui:Z mojej listy w bibliotece}} dodaje twoje własne elementy roślin (także te, które czekają na sprawdzenie). Roślina, którą już masz tutaj, jest aktualizowana z Biblioteki; odmiany, rozmiary dostawy, zagęszczenie i specyfikacja dodane tutaj są zachowane.
- {{ui:Zapisz jako listę roślin}} zapisuje każdy wiersz jako twój własny element roślin z Biblioteki, po jednym elemencie na gatunek: nowa roślina to nowy element, zmieniona roślina to nowa wersja, a niezmieniona zostaje bez zmian. Najpierw zaznacz pole wyboru: zapisanie udostępnia rośliny publicznie na licencji CC0. Pierwsze publiczne przesłanie od osoby, która nie jest jeszcze zaufana, jest sprawdzane przez człowieka, zanim się pojawi, jak każde przesłanie.

Biblioteka przechowuje podstawowy rekord rośliny. Odmiany, rozmiary dostawy, zagęszczenie i notatki specyfikacji pozostają w projekcie i w pliku roślin ({{ui:Zapisz jako plik roślin}}); okno dialogowe podaje za każdym zapisem, ile wierszy to dotyczy.

## Umieszczona roślina podaje rozmiar

Zaznacz roślinę, żywopłot albo wiersz mieszanki rabaty lub obszaru nasadzeń: gdy rekord ma odmiany lub rozmiary dostawy, {{ui:Odmiana i rozmiar}} wybiera jeden z nich. Zestawienie roślin liczy wtedy według gatunku, odmiany i rozmiaru, a etykieta może je pokazać: `{botanical} '{cultivar}' {size}` lub `{full}`.

## Symbole roślin wg skali

{{ui:Grafika roślin}} (Krajobraz › Więcej) określa, jak rośliny są rysowane w planie: **automatycznie** (przy skali mniejszej niż 1:500 okrąg o rozpiętości, między 1:200 a 1:500 zarys ze środkiem, przy większej skali szczegółowy symbol; obie skale można zmienić) albo jeden poziom dla wszystkich skal. Okno Arkusze ma własną **Szczegółowość roślin w planie** dla tego zestawu.

Przy rekordzie w sekcji Rośliny {{ui:Własny symbol…}} odczytuje plik SVG albo blok z rysunku DXF/DWG i rysuje go w rozpiętości rośliny na poziomie szczegółowym. {{ui:Własny model 3D…}} odczytuje plik OBJ, STL lub GLB; w Grafice roślin wybierz **Własny model każdego rekordu**, aby zobaczyć go w 3D. Pliki mają limity (512 KB SVG, 2000 kształtów, 50 000 trójkątów) i są zapisywane w projekcie. Przekształceń SVG nie stosuje się (program informuje, gdy plik je zawiera). Poziomy, limity i zawartość pliku GLB opisano w [Grafika roślin, własne symbole i rośliny 3D](topic:plant-graphics).
