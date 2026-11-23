---
title: WaterCraft: demandes, cabal d'incendi, interrupcions i edat de l'aigua
summary: Amb el complement WaterCraft, convertiu els clients en demandes a les vostres canonades d'aigua, comproveu el cabal disponible a cada boca d'incendi, veieu quina interrupció de canonada fa més mal, i seguiu l'edat de l'aigua i el clor al llarg d'un dia.
keywords: watercraft, distribució d'aigua, demandes, clients, factor de punta, patró de demanda, cabal d'incendi, boca d'incendi, pressió residual, criticitat, interrupció, tram amb vàlvules, edat de l'aigua, clor, residual, traçat de la font, cul-de-sac, csv, complement
from: 066fb17a
---

WaterCraft és un complement que treballa sobre la xarxa d'aigua que ja heu dibuixat amb les eines de Canonades d'aigua. Afegeix una pestanya a la fitxa de la dreta amb quatre seccions.

:::warning
Només és una ajuda al càlcul. Es va comprovar amb respostes fetes a mà sobre xarxes inventades, no sobre un model real d'una companyia. Un enginyer d'aigua ha de comprovar cada resultat. Els escenaris, les regles de control, les vàlvules i les lectures de camp tenen les seves pròpies pàgines, «Escenaris» i «Estudis», a l'ajuda del complement WaterCraft.
:::

## Què fareu

- Posar els clients a la xarxa com a demandes.
- Trobar les boques d'incendi que no arriben al cabal necessari.
- Trobar les canonades on la pèrdua importa més.
- Trobar aigua vella i clor baix.

## Passos

1. Obriu {{ui:Configuració}} › {{ui:Complements}} i activeu {{ui:WaterCraft (distribució d'aigua)}}. Apareix una pestanya {{ui:WaterCraft}} a la fitxa de la dreta.
2. Dibuixeu primer un dipòsit, nusos i canonades amb les eines de Canonades d'aigua (vegeu [Canonades d'aigua](topic:water-mains)). Sense xarxa, la pestanya us ho indica.
3. Sota {{ui:Demandes}}, enganxeu un client per línia: identificador, x, y, tipus, quantitat. Trieu el {{ui:Factor de punta}} i el {{ui:Patró horari}} (dia residencial, dia comercial, pla, o mantenir el patró tal com està). Premeu {{ui:Revisa}} per veure on cau cada client (el nus més proper), i després {{ui:Posa a la xarxa}}. Desfer-ho torna enrere les demandes.
4. Sota {{ui:Cabal d'incendi}}, definiu el cabal necessari i la pressió residual, trieu si la residual es manté {{ui:Només a la boca d'incendi}} o {{ui:A tota la xarxa (més estricte)}}, i premeu {{ui:Recorregut}}. Cada boca d'incendi es llista del pitjor al millor, com a compleix o insuficient.
5. Sota {{ui:Quina canonada importa més}}, trieu {{ui:una canonada cada vegada}} o {{ui:un tram amb vàlvules cada vegada}} i premeu {{ui:Recorregut}}. Cada interrupció mostra la demanda desconnectada, els nusos desconnectats, els nusos que queden de nou sota la pressió mínima i la pressió més baixa que queda.
6. Sota {{ui:Edat de l'aigua i clor}}, trieu què seguir (edat de l'aigua, clor o un traçat de la font), definiu les hores d'execució i els límits que voleu, i premeu {{ui:Recorregut}}. Es llisten els nusos fora dels vostres límits.
7. Premeu {{ui:Desa com a CSV}} sota qualsevol taula per conservar-la.

## Notes

- El cabal d'incendi necessari i el consum per casa o per acre són valors inicials, no normes. Useu les xifres pròpies de la vostra companyia.
- Una canonada tallada en part per una vàlvula es tanca sencera, de manera que la interrupció que es mostra és una mica pitjor que una de real.
- Feu córrer la secció de qualitat de l'aigua prou temps perquè el patró diari es repeteixi abans de llegir l'últim dia.
- {{ui:Atura}} acaba una execució llarga abans d'hora; la llista només mostra llavors el que s'ha fet.
- La vostra xarxa es queda en aquest projecte i en aquest ordinador. No s'envia enlloc.
