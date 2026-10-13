;; SPDX-License-Identifier: Apache-2.0
;; zero-length.lsp — erase lines that start and end at the same point (CadCraft's LISP corpus, 0.4 Y.7).
;; Uses ssget "X" with a filter, sslength / ssname, entget, equal with a fuzz, entdel.
;; test: {"what": "two zero-length lines erased, the real one kept", "setup": "(entmake '((0 . \"LINE\") (10 0.0 0.0 0.0) (11 0.0 0.0 0.0))) (entmake '((0 . \"LINE\") (10 5.0 5.0 0.0) (11 5.0 5.0000000001 0.0))) (entmake '((0 . \"LINE\") (10 0.0 0.0 0.0) (11 3.0 0.0 0.0)))", "command": "ZEROLEN", "expect": "doc.count() === 1 && log.some((l) => l === 'Erased 2 zero-length lines.')"}

(defun c:zerolen ( / ss i e ed n )
  (setq n 0)
  (if (setq ss (ssget "_X" '((0 . "LINE"))))
    (progn
      (setq i 0)
      (repeat (sslength ss)
        (setq e (ssname ss i)
              ed (entget e)
              i (1+ i))
        (if (equal (cdr (assoc 10 ed)) (cdr (assoc 11 ed)) 1e-8)
          (progn (entdel e) (setq n (1+ n)))
        )
      )
    )
  )
  (princ (strcat "\nErased " (itoa n) " zero-length line" (if (= n 1) "" "s") "."))
  (princ)
)
