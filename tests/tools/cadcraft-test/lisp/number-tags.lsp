;; SPDX-License-Identifier: Apache-2.0
;; number-tags.lsp — place numbered text at picked points until Enter (CadCraft's LISP corpus, 0.4 Y.7).
;; Uses a while loop on getpoint, a global counter kept between runs, itoa, command TEXT.
;; test: {"what": "three tags 1 2 3 at three clicks; Enter ends", "command": "NTAG", "input": [[0, 0], [10, 0], [20, 0], ""], "expect": "doc.all().map((e) => e.s).join(',') === '1,2,3'"}

(if (not *ntag-next*) (setq *ntag-next* 1))
(defun c:ntag ( / p )
  (while (setq p (getpoint (strcat "\nPoint for tag " (itoa *ntag-next*) " <done>: ")))
    (entmake (list '(0 . "TEXT") (cons 10 p) '(40 . 2.5) (cons 1 (itoa *ntag-next*))))
    (setq *ntag-next* (1+ *ntag-next*))
  )
  (princ)
)
