---
title: Cables subterráneos
summary: Rutas de cable en zanxas entre soportes e equipos, recubrimento e cruzamentos, empalmes por lonxitude de tambor, e as cantidades de zanxa e de cable.
keywords: cable subterráneo, ruta de cable, zanxa, conduto, recubrimento, cruzamento, cruzamento de tubaxe, empalme, tambor, armario, transformador, fonte, caída de tensión
from: adfd2717
---

## Debuxar unha ruta de cable

1. Coloque primeiro o equipo se o cable remata nun armario, nun transformador ou nun empalme: {{ui:Equipo}}, despois prema.
2. Prema {{ui:Cable}} e prema sobre a ruta; comece e remate sobre un soporte ou sobre un equipo para conectarse a el. Enter remata.

En Propiedades, escolla o **Cable**, o **Tipo de zanxa**, cantos **cables xuntos** hai e a **folga** (%). A ruta mostra a súa lonxitude, onde comeza e onde remata, e a corrente que transporta.

## Que se comproba

- **Recubrimento**: a parte superior do cable debe estar por debaixo do terreo ao longo da ruta, segundo o recubrimento do tipo de zanxa (ou o recubrimento mínimo do conxunto de regras).
- **Cruzamentos**: onde a ruta cruza unha tubaxe ou outro cable de CivilCraft, a separación entre eles compárase cunha regra de separación: a **Separación en cruzamentos** propia da ruta (nas súas Propiedades) cando escolle unha, se non, a regra **Cruzamentos subterráneos** do conxunto de regras (os conxuntos de exemplo usan *Cruzamento subterráneo*, 0,3 m), se non, a separación do tipo de zanxa respecto a outros servizos. Cando se cruzan dous cables, consérvase a maior das dúas. Un cable aéreo cruzado aparece listado a título informativo, e o cable mostrarse no perfil desa liña.
- **Empalmes**: un por cada lonxitude de tambor do cable (coa folga), cando o elemento do cable indica unha lonxitude de tambor.

## Equipo

O equipo ten un elemento da biblioteca, unha **carga** (kW) co seu **factor de potencia**, e pode ser **unha fonte**: a rede aliméntase desde aí. A tensión dunha fonte vén do seu elemento da biblioteca, ou se non, da liña ou do cable que alimenta.

## Cantidades

{{ui:Máis}} › {{ui:Cantidades…}} conta o cable (lonxitude da ruta × (1 + folga) × cables xuntos + a subida en cada extremo), a zanxa por tipo, os volumes de escavación, asentamento e recheo, os condutos e os empalmes, e o condutor, os soportes e os equipos das liñas aéreas.
