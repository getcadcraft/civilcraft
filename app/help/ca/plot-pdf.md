---
title: Traça el plànol a PDF
summary: Traceu-ho tot o la vista actual a un PDF vectorial en un full estàndard a escala d'enginyeria o mètrica, amb colors de capa o en negre.
keywords: traça, imprimeix, pdf, full, escala, mida de paper, plànol de full, publica, caixetí, fletxa del nord, barra d'escala
from: 9af396ca
---

{{ui:PDF}} traça el plànol a un PDF vectorial en un sol full, amb un caixetí, una fletxa del nord i una barra d'escala. El PDF es genera al navegador i es baixa; no passa pel diàleg d'impressió del navegador.

## Traçar

1. Configureu el plànol a **Visualització**: la superfície mostrada, l'interval de corbes i què hi ha activat. El traçat segueix aquests paràmetres.
2. Si només voleu una part de l'emplaçament, feu zoom i desplaceu el plànol fins a ella.
3. Feu clic a {{ui:PDF}} al grup **Exporta**, o premeu {{key:Mod+P}}.
   S'obre el diàleg **Traça el plànol a PDF**.
4. Trieu l'**Àrea**: {{ui:Tot}} o {{ui:El que es veu a la pantalla}}.
5. Trieu el **Paper**: Letter, Tabloid, ANSI D, ARCH D, ISO A4, A3 o A1. Un projecte en peus comença amb Tabloid, un projecte en metres amb A3. Els fulls són sempre horitzontals.
6. Trieu l'**Escala**. La llista marca amb "(encaixa)" l'escala més gran que hi cap i la selecciona.
   - Peus: 1" = 5', 10', 20', 30', 40', 50', 60', 100', 200', 300', 400', 500', 1000'.
   - Metres: 1:50, 1:100, 1:200, 1:250, 1:500, 1:1000, 1:2000, 1:2500, 1:5000, 1:10000.
7. Trieu la **Tinta**: {{ui:Colors de capa}} o {{ui:Negre}}.
8. Llegiu la línia sota les opcions. Indica la mida de l'àrea al paper i la mida del full, per exemple: "L'àrea fa 297 × 222 mm a 1" = 40' en un full de 432 × 279 mm (horitzontal)."
9. Feu clic a {{ui:Baixa el PDF}}.
   El navegador baixa `<name>.pdf`. La barra d'estat diu "Traçat <name>.pdf a 1" = 40'."

Si l'àrea és més gran que el full a l'escala triada, el traçat es centra i les vores se surten. Trieu l'escala marcada amb "(encaixa)" o un full més gran.

## Què hi ha al full

- El plànol, centrat a l'àrea de dibuix, com a vectors reals: corbes, etiquetes, traçats amb PK, corredors, plataformes i línies de tall, canonades, punts.
- Gruixos de línia per capa: els traçats, les plataformes i les canonades més gruixuts; els triangles i les corbes secundàries més fins.
- Una franja de caixetí a la part inferior amb el **Nom** del projecte, l'escala, una nota de l'interval de corbes i quina superfície (existent o acabada), i la data i la versió a la dreta.
- Una fletxa del nord a la cantonada superior dreta (el nord del plànol va amunt) i una barra d'escala al caixetí.
- Les capes de mapa que es mostren sota el plànol (una imatge, mosaics de mapa o un servei de mapes), quan **Capes de mapa sota el plànol** està marcat: es dibuixen com una sola imatge de tota l'àrea de dibuix a 150 punts per polzada, sota les línies, i l'atribució d'un mapa va al caixetí. CivilCraft espera fins a 8 segons les imatges de mapa que encara arriben; si alguna falta, la barra d'estat ho diu.

El text fa servir la Helvetica integrada del PDF. Els caràcters fora del joc d'Europa occidental (Windows-1252) s'imprimeixen com a "?", i el missatge d'estat els compta.

## Què no es traça

- Bandes d'elevació.
- La vista de perfil. Traçar els perfils encara no està disponible.
- Més d'un full (per a un traçat, useu [fulls de planta i perfil](topic:plan-profile-sheets)), finestres gràfiques, un caixetí personalitzat o fulls en vertical.

:::note
El diàleg indica que les fletxes de talús són només de pantalla. En aquesta versió, les fletxes de talús que estiguin activades a **Visualització** sí que es tracen (i s'exporten al DXF). Desactiveu-les abans de traçar si no les voleu.
:::

## Imprimir al paper

Obriu el PDF baixat amb qualsevol visor de PDF i imprimiu-lo al 100 % (mida real) perquè l'escala sigui veritable. "Ajusta a la pàgina" canvia l'escala.
