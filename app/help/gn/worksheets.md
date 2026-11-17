---
title: Planillas: cronogramas vinculados a los objetos
summary: Planillas guardadas con filas de plantas, áreas plantadas, pavimento, muros, escalones, modificadores de terreno o todas las cantidades; tus propias columnas y fórmulas, grupos y totales; CSV, XLSX y una tabla en las hojas, siempre al día.
keywords: planilla, cronograma, planilla de plantas, planilla de obras duras, cantidades, columnas, fórmula, total, suma, conteo, grupo, filtro, csv, xlsx, planilla de cálculo, tabla en hoja
from: 11bc1bac
---

{{ui:Planillas}} (Paisajismo › Más) abre las planillas de este proyecto. La primera vez, se preparan para vos la **planilla de plantas** y la **planilla de obras duras y áreas**. Una planilla se calcula a partir de los objetos cada vez que se muestra, se escribe o se pone en una hoja: si cambiás un cantero, sus conteos cambian en todas partes.

- **Filas desde**: plantas (una fila por especie, cultivar y tamaño), áreas plantadas, pavimento, muros, escalones, modificadores de terreno (corte y relleno) o todas las cantidades.
- **Columnas**: un campo (`qty`, `area`, `botanical`, o un nombre entre corchetes como `[Net area]`) o una fórmula: `+ - * / ^ %`, `&` para unir texto, `= <> < <= > >=`, y `round`, `ceil`, `floor`, `abs`, `sqrt`, `min`, `max`, `if`, `and`, `or`, `not`, `concat`, `upper`, `lower`, `len`, `text`. Una fórmula que no se puede calcular muestra `#ERR` (o `#DIV/0`) en su celda. Las fórmulas las lee el analizador propio de CadCraft; nada de lo que contienen se ejecuta como código.
- **Total** por columna (suma, conteo, promedio, mínimo, máximo), **Agrupar por** (subtotales por grupo) y **Solo filas donde**.
- {{ui:Guardar como CSV}}, {{ui:Guardar como XLSX}}, y **Poner esta planilla en las hojas** (Hojas › Planillas la dibuja como tabla, en tantas hojas como necesite).

Los rótulos de plantas y áreas usan los mismos nombres de campo (`{botanical}`, `{cultivar}`, `{size}`, `{qty}`).
