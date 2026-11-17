---
title: Configuración de CivilCraft
summary: Escolla a orde das columnas para as filas de puntos copiadas e pegadas e para adiviñar as columnas dun ficheiro, como se numeran os puntos pegados, o que mostran as etiquetas dos puntos, o indicador de esquina, a exaxeración vertical 3D, como se mostran a latitude e a lonxitude, e se as capas de mapa veñen de internet.
keywords: configuración, preferencias, pnezd, penzd, orde das columnas, filas de puntos, renumerar, números de punto, número inicial, etiquetas de puntos, etiquetas, descrición, cota, cubo de vista, icona de eixos, indicador de esquina, brúxula, exaxeración vertical, 3d, latitude, lonxitude, gms, graos decimais, capas de mapa, internet, privacidade
from: 64b9cb92
---

Abra {{ui:Configuración}} coa roda dentada da barra de aplicación ou con {{key:Mod+,}}. A primeira lapela, {{ui:CivilCraft}}, contén a configuración propia desta aplicación; {{ui:Xeral}} contén a que comparten todas as aplicacións de CadCraft (tema, barra de ferramentas, paneis). A configuración de CivilCraft existe só na aplicación: cámbiaa aquí, e este navegador lembrao. {{ui:Restablecer configuración de CivilCraft}} devolve cada opción ao seu valor inicial.

## Filas de puntos

**P, N, E, Z, D** (o inicial) ou **P, E, N, Z, D**: punto, norte, este, cota, descrición, ou este antes que norte. Úsase en tres lugares:

- **Copiar**: as filas que CivilCraft pon no portapapeis do sistema para unha folla de cálculo.
- **Pegar**: filas pegadas desde unha folla de cálculo ou un ficheiro de texto que non teñen fila de cabeceira.
- **Importar**: a adiviñanza no diálogo **Importar puntos** cando un ficheiro non ten fila de cabeceira (un ficheiro de catro columnas lese como PENZ, e o de tres como ENZ). Vexa [Formatos de ficheiros de puntos](topic:point-file-formats).

Unha fila de cabeceira que nomee as súas columnas sempre prevalece, e tamén a elección na lista **Columnas** do diálogo de importación.

## Números para os puntos pegados

- **Manter os números libres** (o inicial): un punto pegado conserva o seu número cando ningún punto o ten; só os puntos en conflito reciben números novos.
- **Sempre números novos**: cada punto pegado recibe un número novo, aínda que o seu propio estea libre.

**Os números novos comezan en**: déixeo baleiro para contar desde un máis do número máis alto en uso. Escriba un número, por exemplo 5000, para dar aos puntos novos números desde o 5000 en diante; os números xa en uso sáltanse. Dous puntos nunca comparten número de ningún xeito. Vexa [Seleccionar, copiar e pegar puntos de levantamento](topic:copy-paste-points#point-numbers-never-clash).

## Etiquetas de puntos

O que mostra unha etiqueta de punto cando {{ui:Etiquetas de puntos}} está activado en **Visualización**: **Número**, **Número e cota**, ou **Número, cota e descrición** (o inicial). As exportacións DXF, DWG e PDF mostran as mesmas etiquetas que a pantalla.

## Indicador de esquina

O que aparece na esquina da planta e da vista 3D: **Cubo de vista** (o inicial), **Icona de eixos** ou **Ningún**.

- **Cubo de vista** (arriba á dereita). Na planta mostra a parte superior, co anel da brúxula: N é o norte da cuadrícula (cara arriba na planta). Faga clic en calquera outro lado, bordo ou esquina do cubo, ou arrástreo, e a [vista 3D](topic:site-3d) abre mirando desde aí. {{ui:Inicio}} no cubo da planta encaixa a planta.
- Na vista 3D o cubo xira coa vista: faga clic nun lado, bordo ou esquina para mirar desde aí, arrastre o cubo para orbitar, arrastre o anel da brúxula para xirar arredor da vertical, faga clic nunha letra para mirar desde ese lado, e use {{ui:Inicio}} para a vista iso de todo o emprazamento. Cando mira de fronte a un lado, pequenas frechas pasan ao seguinte lado e as frechas curvas xiran a vista un cuarto de volta.
- **Icona de eixos** (abaixo á esquerda): un pequeno marcador X (este) e Y (norte) na planta, X, Y e Z (arriba) en 3D.

## Exaxeración vertical 3D

Canto estira a vista 3D as cotas: **1×**, **2×** (o inicial), **3×**, **5×** ou **10×**. A lista da barra da vista 3D é a mesma configuración, así que cambiar unha cambia as dúas. Os volumes, os perfís e as exportacións 3D quedan á escala real.

## Latitude e lonxitude

Como mostra a barra de estado a latitude e a lonxitude do punteiro cando o proxecto ten un sistema de coordenadas: **graos, minutos e segundos** (o inicial, por exemplo `30°18′00.00″ N`) ou **graos decimais** (`30.300000° N`). Vexa [Estableza o sistema de coordenadas do proxecto](topic:coordinate-systems#latitude-and-longitude-in-the-status-bar).

## Capas de mapa desde internet

**Desactivado** (o inicial) ou **Activado**. Cando está activado, CivilCraft pide aos servidores de mapas que engada imaxes da zona da pantalla. O seu debuxo queda neste ordenador; o servidor ve a zona e o seu enderezo de internet. Mentres estea desactivado, ningún servidor de mapas recibe peticións, aínda cando un proxecto que abra nomee un; unha imaxe xeorreferenciada dun ficheiro funciona en calquera caso. Vexa [Mostrar capas de mapa baixo a planta](topic:map-layers).

## Asistentes

**Permitir que os asistentes de IA e os scripts usen CivilCraft** (desactivado ao principio) permite que un asistente do seu ordenador acceda ao emprazamento aberto a través de CadCraft Studio: **Ler** describe o emprazamento e dá puntos, cotas de superficie, estacas, perfís, volumes e parcelas; **Editar** permite seleccionar e engadir puntos de levantamento; **Gardar** e **Exportar** permiten gardar o proxecto e escribir LandXML ou DWG. **Cartafoles que pode usar** (en Studio) son onde pode gardar e exportar. **Actividade** lista as súas chamadas. Vexa [Deixe que un asistente de IA traballe co seu emprazamento](topic:assistants).
