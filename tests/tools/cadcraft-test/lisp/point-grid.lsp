;; SPDX-License-Identifier: Apache-2.0
;; point-grid.lsp — a grid of points from prompts (CadCraft's LISP corpus, 0.4 Y.7).
;; Uses initget, getint, getdist, getpoint, polar, entmake, a nested repeat.
;; test: {"what": "3 x 2 points 10 apart from 1,1", "command": "PTGRID", "input": ["3", "2", "10", "1,1"], "expect": "doc.count() === 6 && doc.all().some((e) => e.type === 'point' && e.x === 21 && e.y === 11)"}

(defun c:ptgrid ( / cols rows d base r c p )
  (initget 7)
  (setq cols (getint "\nColumns: "))
  (initget 7)
  (setq rows (getint "\nRows: "))
  (initget 7)
  (setq d (getdist "\nSpacing: "))
  (if (setq base (getpoint "\nLower-left point: "))
    (progn
      (setq r 0)
      (repeat rows
        (setq c 0)
        (repeat cols
          (setq p (polar (polar base 0.0 (* c d)) (/ pi 2) (* r d)))
          (entmake (list '(0 . "POINT") (cons 10 p)))
          (setq c (1+ c))
        )
        (setq r (1+ r))
      )
    )
  )
  (princ)
)
