---
title: Folhas de cálculo: tabelas ligadas aos objetos
summary: Folhas de cálculo guardadas com linhas de plantas, áreas plantadas, pavimentos, muros, degraus, modificadores do terreno ou todas as quantidades; as suas próprias colunas e fórmulas, grupos e totais; CSV, XLSX e uma tabela nas folhas, sempre atualizadas.
keywords: folha de cálculo, tabela, mapa de plantação, mapa de pavimentos, quantidades, colunas, fórmula, total, soma, contagem, grupo, filtro, csv, xlsx, tabela numa folha
from: 11bc1bac
---

{{ui:Folhas de cálculo}} (Paisagismo › Mais) abre as folhas de cálculo deste projeto. Na primeira vez, são criados para si o **mapa de plantação** e o **mapa de pavimentos e áreas**. Uma folha de cálculo é calculada a partir dos objetos sempre que é mostrada, exportada ou colocada numa folha: altere um canteiro e as suas contagens mudam em todo o lado.

- **Linhas a partir de**: plantas (uma linha por espécie, cultivar e tamanho), áreas plantadas, pavimentos, muros, degraus, modificadores do terreno (corte e aterro) ou todas as quantidades.
- **Colunas**: um campo (`qty`, `area`, `botanical`, ou um nome entre parênteses retos como `[Net area]`) ou uma fórmula: `+ - * / ^ %`, `&` para juntar texto, `= <> < <= > >=`, e `round`, `ceil`, `floor`, `abs`, `sqrt`, `min`, `max`, `if`, `and`, `or`, `not`, `concat`, `upper`, `lower`, `len`, `text`. Uma fórmula que não pode ser calculada mostra `#ERR` (ou `#DIV/0`) na sua célula. As fórmulas são lidas pelo analisador próprio do CadCraft; nada nelas é executado como código.
- **Total** por coluna (soma, contagem, média, menor, maior), **Agrupar por** (subtotais por grupo) e **Apenas linhas em que**.
- {{ui:Guardar como CSV}}, {{ui:Guardar como XLSX}}, e **Colocar esta folha de cálculo nas folhas** (Folhas › Folhas de cálculo desenha-a como uma tabela, distribuída pelas folhas que forem precisas).

As etiquetas nas plantas e áreas usam os mesmos nomes de campos (`{botanical}`, `{cultivar}`, `{size}`, `{qty}`).
