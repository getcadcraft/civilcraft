;; SPDX-License-Identifier: Apache-2.0
;; text-upper.lsp — make every text upper case (CadCraft's LISP corpus, 0.4 Y.7).
;; Uses ssget "X" with a list of types, entget / subst / entmod, strcase.
;; test: {"what": "both texts upper case", "setup": "(entmake '((0 . \"TEXT\") (10 0.0 0.0 0.0) (40 . 2.5) (1 . \"door\"))) (entmake '((0 . \"TEXT\") (10 0.0 5.0 0.0) (40 . 2.5) (1 . \"Window 2\")))", "command": "TXTUPPER", "expect": "doc.all().map((e) => e.s).sort().join(',') === 'DOOR,WINDOW 2'"}

(defun c:txtupper ( / ss i ed )
  (if (setq ss (ssget "X" '((0 . "TEXT,MTEXT"))))
    (repeat (setq i (sslength ss))
      (setq ed (entget (ssname ss (setq i (1- i)))))
      (entmod (subst (cons 1 (strcase (cdr (assoc 1 ed)))) (assoc 1 ed) ed))
    )
  )
  (princ)
)
