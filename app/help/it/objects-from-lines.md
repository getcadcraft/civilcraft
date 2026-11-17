---
title: Oggetti dalle linee, collegati
summary: Creare una pavimentazione, un'area piantumata, un'aiuola, una siepe, un percorso, un muro, un cordolo, dei gradini, una rampa, una piattaforma, una depressione o una linea caratteristica da una linea; segue la linea quando questa si sposta, finché non si interrompe il collegamento.
keywords: da una linea, linee, DWG, DXF, collegamento, collegato, seguire, rigenerare, interrompi collegamento, linea caratteristica, linea caratteristica da linee, layer importato, contorno, supercad studio, linea di disegno
from: eb67a0c6
---

{{ui:Da una linea}} (Paesaggio › {{ui:Altro}}): cliccare una linea caratteristica, oppure una linea o un contorno di un layer DWG/DXF importato. Una linea chiusa può creare una pavimentazione, un prato, un'aiuola piantumata, un prato fiorito, una copertura del suolo, un'aiuola o una piattaforma; una linea aperta un percorso, un muro, un cordolo, dei gradini (il suo primo e ultimo punto), una rampa, una siepe o una depressione. Entrambi i tipi possono creare una **linea caratteristica**, tranne una linea caratteristica stessa.

## Una linea caratteristica da una linea

Una linea caratteristica creata da una linea ne prende i punti, chiusa se la linea era chiusa. Le sue quote sono impostate sul terreno esistente (0 dove non ce n'è ancora), e il suo uso è **Off**: non modella alcun terreno finché non si sceglie un uso e non si impostano le sue quote nelle sue Proprietà. Quando la linea si sposta, una linea caratteristica con lo stesso numero di punti mantiene ciascuna quota impostata; quando la linea guadagna o perde punti, le quote vengono ricalcolate sul terreno. Vedere [Linee caratteristiche](topic:feature-lines).

Il nuovo oggetto conserva un **collegamento** alla sua linea. Quando la linea si sposta (trascinando i suoi punti, oppure quando il disegno viene spostato o riletto), l'oggetto assume la nuova forma nello stesso passo di annullamento, e attraverso i modificatori del terreno il terreno di progetto la segue. Le Proprietà indicano a cosa è collegato; {{ui:Interrompi collegamento}} lo rende libero.

Le linee vengono controllate per prime: una linea richiede almeno 2 punti (3 per un contorno), al massimo 5000, numeri reali; un contorno deve essere chiuso e non deve incrociarsi. Una linea che non supera la verifica non viene usata: l'oggetto resta com'era e il pannello Problemi ne indica il motivo. Se la linea viene eliminata, l'oggetto resta e il pannello Problemi lo annota.

## In SuperCad Studio

Aprire il sito e il disegno 2D nello stesso progetto. Selezionare una linea o una polilinea nel disegno 2D, premere Ctrl+K ed eseguire {{ui:Oggetto paesaggistico dalla linea di disegno selezionata}}: CivilCraft chiede cosa creare, come sopra, e l'oggetto resta collegato a quella linea del disegno. Dopo aver modificato le linee nel disegno, Ctrl+K {{ui:Aggiorna il paesaggio dal disegno}} fa seguire gli oggetti, con un passo di annullamento per ogni linea. Il file dei collegamenti del progetto registra quale oggetto segue quale linea. La guida di SuperCad Studio ha un argomento dedicato al Paesaggio.
