---
title: Nivelar unha plataforma de edificación
summary: Debuxar unha plataforma plana, fixar a súa cota e os seus taludes de desmonte e recheo, e deixar que CivilCraft a enlace co terreo existente e a engada á superficie proposta.
keywords: muro de contención, muros de contención, lado vertical, muro en lugar de talude, talude por lado, terraplén, movemento de terras, plataforma, plataforma de edificación, liña de encontro, liña característica, talude de desmonte, talude de recheo, rasante final, superficie proposta, nivelación do terreo
from: 482319a6
---

Unha plataforma é unha zona plana a unha cota. Desde o seu bordo, CivilCraft nivela cara a fóra co seu talude de desmonte onde o terreo está máis alto que a plataforma, e co seu talude de recheo onde está máis baixo, ata que o talude se atopa co terreo existente. Esa liña de encontro é a liña de encontro co terreo. A plataforma e os seus taludes substitúen o terreo existente dentro da liña de encontro co terreo para formar a superficie proposta.

## Debuxar a plataforma

Antes necesita unha superficie de terreo existente.

1. Prema {{key:G}}, ou prema {{ui:Plataforma}} no grupo **Deseño**.
   A indicación di: « Plataforma: prema as súas esquinas. Enter ou o dobre clic remata, Backspace quita a última, Escape cancela. »
2. Prema as esquinas da plataforma en orde, en calquera sentido. Un contorno azul segue o punteiro.
3. Prema {{key:Enter}} despois da última esquina (como mínimo tres).
   A plataforma debúxase e queda seleccionada. Empeza á cota do terreo no seu centro, redondeada a 0,1, cun talude de desmonte de 2 : 1 e un talude de recheo de 3 : 1. A barra de estado indica, por exemplo: « Plataforma 1 á cota 254,3 (o terreo no seu centro), desmonte 2:1, recheo 3:1. Cámbieos en Propiedades. »

:::warning
Remate con {{key:Enter}}. O dobre clic tamén remata, pero nesta versión elimina a esquina na que fixo dobre clic. Prema unha vez a última esquina e despois prema {{key:Enter}}.
:::

O contorno da plataforma non pode cruzarse a si mesmo (« O contorno da plataforma cruza a si mesmo. »).

## Fixar a cota e os taludes

Coa plataforma seleccionada, o panel dereito amosa **Plataforma**:

1. **Nome**.
2. **Cota**: a cota plana da plataforma.
3. **Talude de desmonte** e **Talude de recheo**, como H:V (2 significa 2 : 1). Os dous deben ser maiores que 0.
4. **Superficie da plataforma** e **Esquinas** amósanse como referencia.

Prema {{key:Enter}} despois de cada valor. A liña de encontro co terreo, a superficie proposta e os volumes actualízanse de inmediato.

Baixo os campos, unha liña indica por exemplo: « Liña de encontro co terreo: 48 liñas de talude (20 en desmonte, 28 en recheo), a máis lonxe, a 31,20 ft do bordo. » A planta amosa a liña de encontro co terreo e as liñas de talude en maxenta.

## Como se atopa o encontro co terreo

- As liñas de talude saen de cada bordo en ángulo recto, aproximadamente cada vixésimo do tamaño da plataforma.
- Nas esquinas exteriores abren en abanico cada 10°, así que o talude rodea a esquina.
- Nas esquinas interiores unha liña vai pola bisectriz, onde se encontran os taludes dos dous bordos.
- Cada liña sobe co talude de desmonte ou baixa co talude de recheo ata chegar ao terreo.

## Taludes por lado e muros de contención

Baixo **Lados e muros de contención** nas Propiedades dunha plataforma, dunha explanada ou dunha berma, cada lado pode nivelarse á súa maneira. O lado 1 vai desde a primeira esquina que marcou ata a segunda, o lado 2 da segunda á terceira, e así sucesivamente.

- **Todos os lados**: **Con talude** usa os taludes de desmonte e recheo de enriba en cada lado; **Vertical: muros de contención** pon un muro en cada lado.
- Por lado: **Taludes de enriba**, **Taludes propios** (escriba un talude de desmonte e un de recheo para ese lado) ou **Vertical (muro de contención)**.
- Escriba un talude como `3` ou `3:1` (horizontal a 1 vertical), `33%` ou `18.4°`; amósase como H:1. Os **Talude de desmonte** e **Talude de recheo** propios da plataforma aceptan o mesmo.
- Un lado vertical non ten terraplén: un muro de contención vai ao longo do bordo, desde a plataforma ata o terreo existente (en recheo) ou desde o terreo ata a plataforma (en desmonte). O **Espesor do muro** (0,3 m ou 1 ft ao principio) é canto avanza o terreo desde o bordo da plataforma ata o terreo existente. Os volumes de desmonte e recheo non contan o terraplén que ese lado xa non ten.
- Onde un muro se atopa cun lado con talude, o talude rodea o extremo do muro; dous muros únense en inglete.
- Baixo os campos: a lonxitude dos muros, a cara exposta (altura × lonxitude), a altura máxima e a media.

A planta debuxa a cara exterior de cada muro con pequenos trazos transversais e a súa altura nos dous extremos e na máis alta (na capa de muros de contención, que tamén vai a DXF e DWG). A vista 3D amosa os muros como sólidos (Amosar › Muros de contención), e as exportacións GLB, OBJ e USD inclúenos. As seccións transversais ao bordo amosan o chanzo.

**Avisos** (en Propiedades e no panel de Problemas): un muro máis alto que **Avisar por enriba dunha altura de muro de** (1,0 m ou 3,3 ft ao principio) « pode necesitar un muro de enxeñaría ou un permiso; comprobe as normas locais », e, cando escriba **Talude máximo que aguanta o terreo**, calquera lado cuio talude de desmonte ou recheo sexa máis pronunciado que iso. Son avisos: o movemento de terras constrúese igual. Cada cambio é un paso para {{key:Mod+Z}}.

## Mover esquinas

Seleccione a plataforma e arrastre un agarre cadrado nunha esquina. Cada arrastre é un paso de desfacer. Engadir ou quitar unha esquina aínda non está dispoñible: elimine a plataforma e debúxea de novo.

## Cando non se nivela

Un cadro vermello baixo **Movemento de terras** indica a plataforma e o problema:

| Mensaxe | Que facer |
|---|---|
| « 3 liñas de talude saen da superficie antes de encontrala: a plataforma está demasiado preto do bordo da superficie ou demasiado alta/baixa. » | Mova a plataforma para dentro desde o bordo da superficie, ou achegue a súa cota ao terreo. |
| « A liña de encontro co terreo cruza a si mesma (os taludes de lados diferentes da plataforma entran uns nos outros). Redeseñe a plataforma ou cambie os taludes. » | Típico de plataformas estreitas ou en L en desmonte profundo ou recheo alto. Ensanche a plataforma, achate a diferenza ou faga os taludes máis pronunciados. |
| « O contorno da plataforma cruza a si mesmo. » | Debuxe de novo as esquinas en orde arredor da plataforma. |

Unha plataforma con problemas queda fóra da superficie proposta e dos volumes ata que se corrixa.

## Ver o resultado

1. Baixo **Visualización**, estableza **Superficie** en {{ui:Proposto (nivelado)}}.
   As curvas de nivel agora pasan planas pola plataforma e seguen os taludes ata a liña de encontro co terreo.
2. Mova o punteiro sobre a plataforma: a barra de estado amosa as cotas de **Terreo** e **Nivelada**.
3. Lea o desmonte e o recheo baixo **Movemento de terras**; vexa [Volumes de movemento de terras](topic:volumes).

As plataformas nivélanse despois dos corredores, pola orde en que se debuxaron. Unha plataforma posterior substitúe calquera cousa anterior dentro da súa propia liña de encontro co terreo.

## Eliminar unha plataforma

Seleccióneo e prema {{key:Delete}} (nun Mac, Fn e delete), ou prema {{ui:Eliminar}}.

## Aínda non implementado

As plataformas son planas: as plataformas con pendente, as liñas características con pendente variable, as bancadas e a nivelación ata unha distancia ou unha cota obxectivo aínda non están dispoñibles. Vexa [Aínda non implementado](topic:not-built-yet).
