---
title: Objekt från linjer, kvar länkade
summary: Gör läggning, en planterad yta, en rabatt, en häck, en gång, en mur, en kantsten, steg, en ramp, en plattform, ett dike eller en funktionslinje från en linje; objektet följer med när linjen flyttas, tills du bryter länken.
keywords: från en linje, linjer, DWG, DXF, länk, länkad, följ, generera om, bryt länken, funktionslinje, funktionslinje från linjer, importerat lager, kontur, ritlinje, supercad studio
from: eb67a0c6
---

{{ui:Från en linje}} (Landskap › {{ui:Mer}}): klicka på en funktionslinje, eller på en linje eller kontur i ett importerat DWG/DXF-lager. En sluten linje kan bli läggning, en gräsmatta, en planterad rabatt, en äng, marktäckare, en bädd eller en plattform; en öppen linje kan bli en gång, en mur, en kantsten, steg (dess första och sista punkt), en ramp, en häck eller ett dike. Båda typerna kan bli en **funktionslinje**, utom en funktionslinje själv.

## En funktionslinje från en linje

En funktionslinje gjord av en linje tar dess punkter, och är sluten om linjen var sluten. Dess nivåer läggs på befintlig mark (0 där det ännu inte finns någon), och dess användning är **Av**: den formar ingen mark förrän du väljer en användning och anger dess nivåer i dess Egenskaper. När linjen flyttas behåller en funktionslinje med samma antal punkter varje nivå du angett; när linjen får eller förlorar punkter läggs nivåerna på marken igen. Se [Funktionslinjer](topic:feature-lines).

Det nya objektet behåller en **länk** till sin linje. När linjen flyttas (du drar dess punkter, eller ritningen flyttas eller läses om) tar objektet den nya formen i samma ångra-steg, och genom markmodifierarna följer den föreslagna marken. Egenskaper anger vad det är länkat till; {{ui:Bryt kopplingen}} gör det fritt.

Linjer kontrolleras först: en linje behöver minst 2 punkter (3 för en kontur), högst 5000, reella tal, och en kontur måste vara sluten och får inte korsa sig själv. En linje som inte klarar kontrollen används inte: objektet förblir som det var och panelen Problem anger varför. Om linjen tas bort finns objektet kvar, och panelen Problem noterar det.

## I SuperCad Studio

Öppna platsen och 2D-ritningen i samma projekt. Välj en linje eller polylinje i 2D-ritningen, tryck på Ctrl+K och kör {{ui:Landskapsobjekt från den valda ritlinjen}}: CivilCraft frågar vad som ska skapas, som ovan, och objektet förblir länkat till just den linjen i ritningen. När du ändrar linjer i ritningen gör Ctrl+K {{ui:Uppdatera landskapet från ritningen}} att objekten följer, med ett ångra-steg för varje linje. Projektets länkfil noterar vilket objekt som följer vilken linje. Hjälpen i SuperCad Studio har ett ämne om Landskap.
