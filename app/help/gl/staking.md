---
title: Facer un informe de replanteo
summary: Listar piquetes ao longo dun trazado en estacas e afastamentos, ou os puntos de levantamento próximos, con estaca, afastamento, norte, este, cotas de proxecto e do terreo, e desmonte ou terrapleo, e gardar o informe en CSV ou PDF.
keywords: replanteo, piquetes, informe de replanteo, planilla de desmonte, planilla de rasante, estaca, afastamento, desmonte, terrapleo, disposición, replanteo de obra, como construído
from: d8a4e9f1
---

Seleccione un trazado e prema **Informe de replanteo** nas súas **Propiedades**.

## Piquetes en estacas e afastamentos

1. **Desde** e **ata**: as estacas a replantear (1+50 ou 150).
2. **cada**: o intervalo. Os piquetes van en cada múltiplo del, nos dous extremos e (coa caixa marcada) onde comezan e rematan as curvas do trazado.
3. **Afastamentos**: a esquerda e a dereita do trazado, mirando cara á estaca: `12 L, 0, 12 R`, `L12 CL R12` ou `-12, 0, 12` (a esquerda é menos). Un trazado cun corredor comeza cos bordos do pavimento e das bermas.
4. **Numerar desde** e **con prefixo** nomean os piquetes: 1, 2, 3, ou S101, S102.

## Puntos de levantamento preto do trazado

Escolla **puntos de levantamento preto do trazado** e a distancia. Cada punto dentro desa distancia recibe a súa estaca e afastamento, o proxecto alí e a súa propia cota como terreo: unha comprobación de puntos replanteados ou medidos como construídos.

## O que di o informe

| Columna | Que é |
|---|---|
| Punto | O nome do piquete, ou o número do punto de levantamento |
| Estaca, Afastamento | Onde está ao longo do trazado: L para a esquerda, R para a dereita |
| Norte, Este | As súas coordenadas |
| Cota de proxecto | A superficie do corredor deseñado alí (desde a liña de talude ata a liña de talude), senón o perfil de proxecto no eixe |
| Cota do terreo | A superficie existente alí, ou a cota propia do punto de levantamento |
| Desmonte/Terrapleo | C cando o terreo está por riba do proxecto (hai que rebaixalo), F cando está por baixo (hai que recheralo), ata a centésima |

Un piquete sen cota de proxecto (fóra do corredor, ou nun trazado sen ela lonxe do eixe) non ten desmonte nin terrapleo; o diálogo indica cantos son.

## Gardalo

- **CSV**: unha liña de título, despois as columnas anteriores, máis o desmonte ou terrapleo como número con signo (terreo menos proxecto), para follas de cálculo e colectores de datos.
- **PDF**: páxinas de táboa no papel que escolla, un piquete por fila, os desmontes en laranxa e os terrapleos en verde, coa franxa de título das outras follas.

:::note
Os piquetes calcúlanse a partir do proxecto do ficheiro. Compróbeos cos planos aprobados antes de construír nada.
:::
