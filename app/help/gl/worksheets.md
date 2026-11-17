---
title: Follas de cálculo: cadros ligados aos obxectos
summary: Follas de cálculo gardadas con filas de plantas, áreas plantadas, pavimentos, muros, escaleiras, modificadores do terreo ou todas as cantidades; as súas propias columnas e fórmulas, grupos e totais; CSV, XLSX e unha táboa nas follas, sempre ao día.
keywords: folla de cálculo, cadro, cadro de plantas, cadro de obra dura, cantidades, columnas, fórmula, total, suma, conta, grupo, filtro, csv, xlsx, folla de cálculo, táboa na folla
from: 11bc1bac
---

{{ui:Follas de cálculo}} (Paisaxismo › Máis) abre as follas de cálculo deste proxecto. A primeira vez créanse para vostede o **cadro de plantas** e o **cadro de obra dura e superficies**. Unha folla de cálculo elabórase a partir dos obxectos cada vez que se mostra, se escribe ou se pon nunha folla: cambie un canteiro e as súas cifras cambian en todas partes.

- **Filas de**: plantas (unha fila por especie, cultivar e tamaño), áreas plantadas, pavimentos, muros, escaleiras, modificadores do terreo (desmonte e terraplén) ou todas as cantidades.
- **Columnas**: un campo (`qty`, `area`, `botanical`, ou un nome entre corchetes como `[Net area]`) ou unha fórmula: `+ - * / ^ %`, `&` para unir texto, `= <> < <= > >=`, e `round`, `ceil`, `floor`, `abs`, `sqrt`, `min`, `max`, `if`, `and`, `or`, `not`, `concat`, `upper`, `lower`, `len`, `text`. Unha fórmula que non se pode calcular mostra `#ERR` (ou `#DIV/0`) na súa celda. As fórmulas as le o analizador propio de CadCraft; nada do que contén se executa como código.
- **Total** por columna (suma, conta, media, mínimo, máximo), **Agrupar por** (subtotais por grupo) e **Só as filas nas que**.
- {{ui:Gardar como CSV}}, {{ui:Gardar como XLSX}}, e **Pór esta folla de cálculo nas follas** (Follas › Follas de cálculo debúxaa como táboa, nas follas que faga falta).

As etiquetas das plantas e das áreas usan os mesmos nomes de campo (`{botanical}`, `{cultivar}`, `{size}`, `{qty}`).
