;; SPDX-License-Identifier: Apache-2.0
;; layer-split.lsp — move each object to a layer named after its type (CadCraft's LISP corpus, 0.4 Y.7).
;; Uses tblsearch, entmake of a LAYER, entnext from the start, entget / entmod, strcat.
;; test: {"what": "the line goes to TYPE-LINE, the circle to TYPE-CIRCLE (new layers, colour 3)", "setup": "(entmake '((0 . \"LINE\") (10 0.0 0.0 0.0) (11 1.0 0.0 0.0))) (entmake '((0 . \"CIRCLE\") (10 0.0 0.0 0.0) (40 . 1.0)))", "command": "LAYSPLIT", "expect": "doc.all().map((e) => e.layer).sort().join(',') === 'TYPE-CIRCLE,TYPE-LINE' && doc.layers.get('TYPE-LINE').color === 3"}

(defun layer-for ( type / name )
  (setq name (strcat "TYPE-" type))
  (if (not (tblsearch "LAYER" name))
    (entmake (list '(0 . "LAYER") '(100 . "AcDbSymbolTableRecord") '(100 . "AcDbLayerTableRecord") (cons 2 name) '(70 . 0) '(62 . 3)))
  )
  name
)
(defun c:laysplit ( / e ed )
  (setq e (entnext))
  (while e
    (setq ed (entget e))
    (entmod (subst (cons 8 (layer-for (cdr (assoc 0 ed)))) (assoc 8 ed) ed))
    (setq e (entnext e))
  )
  (princ)
)
