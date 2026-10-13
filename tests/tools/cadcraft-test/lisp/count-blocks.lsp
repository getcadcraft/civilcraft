;; SPDX-License-Identifier: Apache-2.0
;; count-blocks.lsp — count block references by name, sorted (CadCraft's LISP corpus, 0.4 Y.7).
;; Uses ssget "X" with a filter, an association list updated with subst, vl-sort with a lambda, strcat / itoa.
;; test: {"what": "counts A 1, B 2, C 1, D 1 in the model", "drawing": "blocks", "command": "BCOUNT", "expect": "log.some((l) => l === 'A: 1') && log.some((l) => l === 'B: 2') && log.some((l) => l === 'D: 1')"}

(defun c:bcount ( / ss i name pair counts )
  (if (setq ss (ssget "_X" '((0 . "INSERT") (410 . "Model"))))
    (progn
      (setq i 0)
      (while (< i (sslength ss))
        (setq name (cdr (assoc 2 (entget (ssname ss i))))
              i (1+ i))
        (if (setq pair (assoc name counts))
          (setq counts (subst (cons name (1+ (cdr pair))) pair counts))
          (setq counts (cons (cons name 1) counts))
        )
      )
      (foreach pair (vl-sort counts '(lambda (a b) (< (car a) (car b))))
        (princ (strcat "\n" (car pair) ": " (itoa (cdr pair))))
      )
    )
    (princ "\nNo block references.")
  )
  (princ)
)
