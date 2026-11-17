---
title: "Hojas de cálculo: cuadros vinculados a los objetos"
summary: Hojas de cálculo guardadas con filas de plantas, áreas plantadas, pavimentos, muros, escalones, modificadores del terreno o todas las cantidades; sus propias columnas y fórmulas, grupos y totales; CSV, XLSX y una tabla en las hojas, siempre al día.
keywords: hoja de cálculo, cuadro, cuadro de plantas, cuadro de elementos duros, cantidades, columnas, fórmula, total, suma, conteo, grupo, filtro, csv, xlsx, hoja de cálculo, tabla en hoja
from: 11bc1bac
---

{{ui:Hojas de cálculo}} (Paisajismo › Más) abre las hojas de cálculo de este proyecto. La primera vez se crean para usted el **cuadro de plantas** y el **cuadro de elementos duros y áreas**. Una hoja de cálculo se calcula a partir de los objetos cada vez que se muestra, se escribe o se pone en una hoja: si cambia un arriate, sus conteos cambian en todas partes.

- **Filas de**: plantas (una fila por especie, cultivar y tamaño), áreas plantadas, pavimentos, muros, escalones, modificadores del terreno (corte y relleno) o todas las cantidades.
- **Columnas**: un campo (`qty`, `area`, `botanical`, o un nombre entre corchetes como `[Net area]`) o una fórmula: `+ - * / ^ %`, `&` para unir texto, `= <> < <= > >=`, y `round`, `ceil`, `floor`, `abs`, `sqrt`, `min`, `max`, `if`, `and`, `or`, `not`, `concat`, `upper`, `lower`, `len`, `text`. Una fórmula que no se puede calcular muestra `#ERR` (o `#DIV/0`) en su celda. Las fórmulas las lee el analizador propio de CadCraft; nada de lo que contienen se ejecuta como código.
- **Total** por columna (suma, conteo, promedio, mínimo, máximo), **Agrupar por** (subtotales por grupo) y **Solo filas donde**.
- {{ui:Guardar como CSV}}, {{ui:Guardar como XLSX}}, y **Poner esta hoja de cálculo en las hojas** (Hojas › Hojas de cálculo la dibuja como una tabla, en tantas hojas como necesite).

Las etiquetas de plantas y áreas usan los mismos nombres de campo (`{botanical}`, `{cultivar}`, `{size}`, `{qty}`).
