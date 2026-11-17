---
title: Cuadros de mediciones: listados vinculados a los objetos
summary: Cuadros de mediciones guardados con filas de plantas, áreas plantadas, pavimentos, muros, escaleras, modificadores del terreno o todas las cantidades; sus propias columnas y fórmulas, grupos y totales; CSV, XLSX y una tabla en las hojas, siempre al día.
keywords: cuadro de mediciones, listado, listado de plantas, listado de pavimentos, cantidades, columnas, fórmula, total, suma, recuento, grupo, filtro, csv, xlsx, hoja de cálculo, tabla en hoja
from: 11bc1bac
---

{{ui:Cuadros de mediciones}} (Paisajismo › Más) abre los cuadros de mediciones de este proyecto. La primera vez se crean para usted el **listado de plantas** y el **listado de pavimentos y superficies**. Un cuadro de mediciones se calcula a partir de los objetos cada vez que se muestra, se escribe o se pone en una hoja: si cambia una zona, sus recuentos cambian en todas partes.

- **Filas de**: plantas (una fila por especie, cultivar y tamaño), áreas plantadas, pavimentos, muros, escaleras, modificadores del terreno (desmonte y terraplén) o todas las cantidades.
- **Columnas**: un campo (`qty`, `area`, `botanical`, o un nombre entre corchetes como `[Net area]`) o una fórmula: `+ - * / ^ %`, `&` para unir texto, `= <> < <= > >=`, y `round`, `ceil`, `floor`, `abs`, `sqrt`, `min`, `max`, `if`, `and`, `or`, `not`, `concat`, `upper`, `lower`, `len`, `text`. Una fórmula que no se puede calcular muestra `#ERR` (o `#DIV/0`) en su celda. Las fórmulas las interpreta el analizador propio de CadCraft; nada de lo que contienen se ejecuta como código.
- **Total** por columna (suma, recuento, media, mínimo, máximo), **Agrupar por** (subtotales por grupo) y **Solo filas donde**.
- {{ui:Guardar como CSV}}, {{ui:Guardar como XLSX}} y **Poner este cuadro de mediciones en las hojas** (Hojas › Cuadros de mediciones lo dibuja como una tabla, repartida en tantas hojas como haga falta).

Las etiquetas de plantas y áreas usan los mismos nombres de campo (`{botanical}`, `{cultivar}`, `{size}`, `{qty}`).
