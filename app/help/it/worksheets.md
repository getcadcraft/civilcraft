---
title: Abachi: tabelle collegate agli oggetti
summary: Abachi salvati con righe da piante, aree piantumate, pavimentazioni, muri, gradini, modificatori del terreno o tutte le quantità; colonne e formule proprie, gruppi e totali; CSV, XLSX e una tabella sulle tavole, sempre aggiornati.
keywords: abaco, tabella, abaco delle piante, abaco delle superfici dure, quantità, colonne, formula, totale, somma, conteggio, gruppo, filtro, csv, xlsx, foglio di calcolo, tabella sulla tavola
from: 11bc1bac
---

{{ui:Abachi}} (Paesaggio › Altro) apre gli abachi di questo progetto. La prima volta vengono creati per l'utente l'**abaco delle piante** e l'**abaco delle superfici dure e delle aree**. Un abaco viene calcolato a partire dagli oggetti ogni volta che viene mostrato, scritto su file o messo su una tavola: se si modifica un'aiuola, i suoi conteggi cambiano ovunque.

- **Righe da**: piante (una riga per specie, cultivar e misura), aree piantumate, pavimentazioni, muri, gradini, modificatori del terreno (scavo e riporto) oppure tutte le quantità.
- **Colonne**: un campo (`qty`, `area`, `botanical`, oppure un nome tra parentesi quadre come `[Net area]`) oppure una formula: `+ - * / ^ %`, `&` per unire testi, `= <> < <= > >=`, e `round`, `ceil`, `floor`, `abs`, `sqrt`, `min`, `max`, `if`, `and`, `or`, `not`, `concat`, `upper`, `lower`, `len`, `text`. Una formula che non può essere calcolata mostra `#ERR` (o `#DIV/0`) nella sua cella. Le formule sono lette dal parser di CadCraft; nulla in esse viene eseguito come codice.
- **Totale** per colonna (somma, conteggio, media, minimo, massimo), **Raggruppa per** (subtotali per gruppo) e **Solo le righe dove**.
- {{ui:Salva come CSV}}, {{ui:Salva come XLSX}}, e **Metti questo abaco sulle tavole** (Tavole › Abachi lo disegna come tabella, su tante tavole quante ne servono).

Le etichette su piante e aree usano gli stessi nomi di campo (`{botanical}`, `{cultivar}`, `{size}`, `{qty}`).
