---
title: Planilhas: tabelas vinculadas aos objetos
summary: Planilhas salvas com linhas de plantas, áreas plantadas, pavimentação, muros, degraus, modificadores de terreno ou todas as quantidades; suas próprias colunas e fórmulas, grupos e totais; CSV, XLSX e uma tabela nas folhas, sempre atualizada.
keywords: planilha, tabela, tabela de plantio, tabela de elementos construídos, quantitativos, colunas, fórmula, total, soma, contagem, grupo, filtro, csv, xlsx, planilha eletrônica, tabela na folha
from: 11bc1bac
---

{{ui:Planilhas}} (Paisagismo › Mais) abre as planilhas deste projeto. Na primeira vez, a **tabela de plantio** e a **tabela de elementos construídos e áreas** são criadas para você. Uma planilha é calculada a partir dos objetos toda vez que é mostrada, exportada ou colocada em uma folha: altere um canteiro e as contagens mudam em todos os lugares.

- **Linhas de**: plantas (uma linha por espécie, cultivar e tamanho), áreas plantadas, pavimentação, muros, degraus, modificadores de terreno (corte e aterro) ou todas as quantidades.
- **Colunas**: um campo (`qty`, `area`, `botanical`, ou um nome entre colchetes como `[Net area]`) ou uma fórmula: `+ - * / ^ %`, `&` para juntar textos, `= <> < <= > >=`, e `round`, `ceil`, `floor`, `abs`, `sqrt`, `min`, `max`, `if`, `and`, `or`, `not`, `concat`, `upper`, `lower`, `len`, `text`. Uma fórmula que não pode ser calculada mostra `#ERR` (ou `#DIV/0`) na sua célula. As fórmulas são lidas pelo analisador do próprio CadCraft; nada nelas é executado como código.
- **Total** por coluna (soma, contagem, média, menor, maior), **Agrupar por** (subtotais por grupo) e **Somente linhas em que**.
- {{ui:Salvar como CSV}}, {{ui:Salvar como XLSX}}, e **Colocar esta planilha nas folhas** (Folhas › Planilhas a desenha como uma tabela, em quantas folhas forem necessárias).

Os rótulos de plantas e áreas usam os mesmos nomes de campos (`{botanical}`, `{cultivar}`, `{size}`, `{qty}`).
