;; SPDX-License-Identifier: Apache-2.0
;; box-area.lsp — draw a rectangle with a command and report its area (CadCraft's LISP corpus, 0.4 Y.7).
;; Uses command (RECTANG), entlast, vlax-ename->vla-object, vla-get-area, rtos.
;; test: {"what": "a 4 x 2.5 rectangle, area 10.00", "command": "BOXAREA", "input": ["0,0", "4,2.5"], "expect": "doc.count() === 1 && log.some((l) => l === 'Area: 10.00')"}

(vl-load-com)
(defun c:boxarea ( / p1 p2 obj )
  (if (and (setq p1 (getpoint "\nFirst corner: "))
           (setq p2 (getcorner p1 "\nOther corner: ")))
    (progn
      (command "_.RECTANG" "_non" p1 "_non" p2)
      (setq obj (vlax-ename->vla-object (entlast)))
      (princ (strcat "\nArea: " (rtos (vla-get-area obj) 2 2)))
    )
  )
  (princ)
)
