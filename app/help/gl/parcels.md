---
title: Debuxar parcelas e escribir as súas descricións legais
summary: Debuxe unha parcela polos seus cantos ou introduza as chamadas dunha escritura ou plano, comprobe como pecha o perímetro, etiquete rumbos e distancias na planta, converta calquera tramo nunha curva e copie un borrador de descrición legal.
keywords: parcelas, lotes, liñas de propiedade, límite, escritura, plano, medidas e linderos, rumbo, distancia, pechamento, erro de pechamento, precisión, descrición legal, punto de comezo, curva, radio, superficie, acres
from: 6793d6ce
---

As parcelas sitúanse na planta co rumbo e a distancia ao longo de cada tramo recto (unha curva amosa o seu radio, lonxitude e ángulo central) e o seu nome e superficie no centro. Van ao trazado PDF e ás exportacións DWG e DXF, nas capas `V-PROP` (liñas) e `V-PROP-TEXT` (etiquetas). Todo está baixo **Parcelas** no panel dereito cando non hai nada seleccionado.

## Debuxar unha parcela

1. Prema **Debuxar unha parcela**.
2. Prema nos cantos, comezando polo punto de comezo. Un clic preto dun punto topográfico toma o lugar exacto dese punto.
3. Prema de novo no primeiro canto, ou prema {{key:Enter}}, para rematar. {{key:Backspace}} quita o último canto; {{key:Esc}} descarta os cantos ata o momento; prémao de novo para saír da ferramenta.

## Introducir as chamadas dunha escritura

1. Prema **Introducir chamadas de escritura**.
2. Diga por onde comezan as chamadas: o número dun punto topográfico, ou un norte e un este.
3. Escriba ou pegue as chamadas, unha por liña:
   - unha liña: un rumbo e unha distancia, como `N 45°30'15" E 125.50`. `N45-30-15E`, `N 45 30 15 E`, `N 45.5 E` e acimutes (`AZ 45°30'15"`) tamén funcionan, e "thence", as comas e "feet" ignóranse.
   - unha curva: `C R 300 L 52.36 right` (radio e lonxitude do arco), ou `C R 300 D 10°00'00" left` (radio e ángulo central). Unha curva continúa o tramo anterior; cando non o fai, engada o seu rumbo de corda: `C R 300 L 52.36 right CB N 50 00 00 E`.
   - `#` inicia unha liña de comentario.
4. Mentres escribe, o diálogo amosa a lonxitude das chamadas, o **erro de pechamento** (a que distancia do inicio rematan e en que dirección), a **precisión** (a lonxitude dividida polo erro, 1 : 10.000 e así) e a superficie. As liñas que non pode ler listanse cos seus números de liña.
5. **Engadir a parcela**. Cando as chamadas non pechan, a parcela pecha cun tramo recto sobre o oco: comprobe as chamadas coa escritura. Para repartir o erro dunha poligonal de campo polos seus tramos, axústeo antes.

## Curvas

Nas **Propiedades** dunha parcela, cada tramo ten un **Radio**. Escriba un para converter ese tramo nunha curva entre os mesmos dous cantos (un radio menor que a metade da distancia entre os cantos non se pode trazar, así que se rexeita), e escolla **Dereita** ou **Esquerda** en **Curvas**: unha curva á dereita ten o seu centro á dereita da dirección de percorrido, como nunha escritura. Borre o radio para que volva ser recto. Cada cambio é un paso: {{key:Mod+Z}} desfaino.

## A descrición legal

As Propiedades dunha parcela rematan coa súa descrición legal, escrita a partir do debuxo:

- "Comezando en" o **Punto de comezo** que escriba (por exemplo "a esquina nordeste do lote 4"); se non, o norte e o este do primeiro canto, ou o punto topográfico do que partiron as chamadas.
- "e logo" cada tramo: un rumbo e unha distancia, ou unha curva co seu radio, lonxitude do arco, ángulo central, e rumbo e distancia de corda.
- "Contendo" a súa superficie en pés cadrados e acres (metros cadrados e hectáreas nun proxecto en metros).

**Copiar** pon a descrición no portapapeis; **Descargar como texto** garda un ficheiro `.txt`.

:::warning
A descrición legal é un borrador a partir do debuxo, non un levantamento. Un topógrafo habilitado ten que a comprobar coa escritura e asinala-la antes de que alguén confíe nela.
:::

Prema dentro dunha parcela na planta para a seleccionar; {{key:Delete}} elimínaa. As parcelas gárdanse no ficheiro de proxecto.
