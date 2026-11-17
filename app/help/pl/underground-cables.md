---
title: Kable podziemne
summary: Trasy kabli w wykopach między podporami i urządzeniami, przykrycie i skrzyżowania, muffy według długości bębna oraz ilości wykopów i kabli.
keywords: kabel podziemny, trasa kabla, wykop, kanał, przykrycie, skrzyżowanie, skrzyżowanie z rurociągiem, muf, bęben, szafa, transformator, źródło, spadek napięcia
from: adfd2717
---

## Narysuj trasę kabla

1. Najpierw umieść urządzenie, jeśli kabel kończy się w szafie, transformatorze lub muffie: {{ui:Urządzenia}}, a potem kliknij.
2. Kliknij {{ui:Kabel}} i kliknij trasę; zacznij i zakończ na podporze lub urządzeniu, aby się do nich podłączyć. Enter kończy.

We właściwościach wybierz **Kabel**, **Typ wykopu**, ile **kabli obok siebie** i **luz** (%). Trasa pokazuje swoją długość, miejsce początku i końca oraz prąd, który przenosi.

## Co jest sprawdzane

- **Przykrycie**: wierzch kabla pod terenem wzdłuż trasy, porównywany z przykryciem typu wykopu (albo z najmniejszym przykryciem z zestawu reguł).
- **Skrzyżowania**: miejsca, w których trasa przecina rurociąg CivilCraft albo inny kabel; odstęp między nimi jest porównywany z regułą odległości: własnym **Odstępem skrzyżowania** trasy (we jej właściwościach), jeśli go wybrano, w przeciwnym razie regułą **Skrzyżowania podziemne** z zestawu reguł (zestawy przykładowe używają *Skrzyżowanie podziemne*, 0.3 m), w ostatniej kolejności odstępem typu wykopu od innych instalacji. Dwa przecinające się kable zachowują większą z dwóch wartości. Przecięta linia napowietrzna jest wymieniona dla informacji, a kabel pojawia się w profilu tej linii.
- **Muffy**: jeden co długość bębna kabla (z luzem), gdy pozycja kabla podaje długość bębna.

## Urządzenia

Urządzenie ma element biblioteki, **obciążenie** (kW) z jego **współczynnikiem mocy** i może być **źródłem**: sieć jest zasilana stamtąd. Napięcie źródła pochodzi z jego elementu biblioteki, a w przeciwnym razie z linii albo kabla, który zasila.

## Ilości

{{ui:Więcej}} › {{ui:Ilości…}} zlicza kabel (długość trasy × (1 + luz) × kable obok siebie + wzniesienie na każdym końcu), wykop według typu, objętości wykopu, obsypki i zasypki, kanały i muffy, wraz z przewodem linii napowietrznych, podporami i urządzeniami.
