---
title: WaterCraft: demandes, cabal d'incendi, interrupcions i edat de l'aigua
summary: Amb el complement WaterCraft, convertiu els clients en demandes a les vostres canonades d'aigua, comproveu el cabal disponible a cada hidrant, veieu quina interrupció de canonada afecta més i seguiu l'edat de l'aigua i el clor al llarg d'un dia.
keywords: watercraft, distribució d'aigua, demandes, clients, factor de punta, patró de demanda, cabal d'incendi, hidrant, pressió residual, criticitat, interrupció, tram amb vàlvules, edat de l'aigua, clor, residual, traçat de la font, final mort, csv, complement
from: 76809f01
---

WaterCraft és un complement que treballa sobre la xarxa d'aigua que ja heu dibuixat amb les eines de canonades d'aigua. Afegeix una pestanya al tauler de la dreta amb quatre seccions.

:::warning
Només és una eina de càlcul. S'ha comprovat amb càlculs manuals en xarxes inventades, no en un model real d'una empresa d'aigües. Un enginyer d'aigües ha de revisar cada resultat. Encara no hi ha estacions de rebombament, ni decaïment de segon ordre, ni escenaris.
:::

## Què podeu fer

- Posar els clients a la xarxa com a demandes.
- Trobar els hidrants que no arriben al cabal necessari.
- Trobar les canonades la interrupció de les quals és més greu.
- Trobar aigua vella i clor baix.

## Passos

1. Obriu {{ui:Configuració}} › {{ui:Complements}} i activeu {{ui:WaterCraft (distribució d'aigua)}}. Apareix una pestanya {{ui:WaterCraft}} al tauler de la dreta.
2. Dibuixeu primer un dipòsit, nusos i canonades amb les eines de canonades d'aigua (vegeu [Canonades d'aigua](topic:water-mains)). Sense xarxa, la pestanya us ho indica.
3. A {{ui:Demandes}}, enganxeu un client per línia: identificador, x, y, tipus, quantitat. Trieu el {{ui:Factor de punta}} i el {{ui:Patró horari}} (dia residencial, dia comercial, constant, o conservar el patró tal com és). Premeu {{ui:Revisa}} per veure on cau cada client (el nus més proper) i després {{ui:Posa a la xarxa}}. Desfés retira les demandes.
4. A {{ui:Cabal d'incendi}}, definiu el cabal necessari i la pressió residual, trieu si la residual es manté {{ui:Només a l'hidrant}} o {{ui:A tot el sistema (més estricte)}}, i premeu {{ui:Recorregut}}. Cada hidrant apareix ordenat del pitjor al millor, com a compleix o insuficient.
5. A {{ui:Quina canonada importa més}}, trieu {{ui:una canonada cada vegada}} o {{ui:un tram amb vàlvules cada vegada}} i premeu {{ui:Recorregut}}. Cada interrupció mostra la demanda que queda sense servei, els nusos que queden sense servei, els nusos que passen a estar per sota de la pressió mínima i la pressió més baixa que queda.
6. A {{ui:Edat de l'aigua i clor}}, trieu què seguir (edat de l'aigua, clor o un traçat de la font), definiu les hores d'execució i els límits que voleu, i premeu {{ui:Recorregut}}. Es llisten els nusos fora dels vostres límits.
7. Premeu {{ui:Desa com a CSV}} sota qualsevol taula per conservar-la.

## Notes

- El cabal d'incendi necessari i el consum per casa o per acre són valors de partida, no normes. Useu les xifres pròpies de la vostra empresa d'aigües.
- Una canonada parcialment tallada per una vàlvula es tanca sencera, així que la interrupció que es mostra és una mica pitjor que una de real.
- Executeu la secció de qualitat de l'aigua prou temps perquè el patró diari es repeteixi abans de llegir l'últim dia.
- {{ui:Atura}} acaba una execució llarga abans d'hora; la llista mostra llavors només el que s'ha fet.
- La vostra xarxa es queda en aquest projecte i en aquest ordinador. No s'envia res enlloc.
