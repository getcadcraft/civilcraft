;; SPDX-License-Identifier: Apache-2.0
;; safe-osmode.lsp — the usual *error* pattern: change system variables, put them back on Esc (CadCraft's LISP corpus, 0.4 Y.7).
;; Uses a local *error*, getvar / setvar, wcmatch on the message, getpoint cancelled.
;; test: {"what": "Esc at the prompt restores OSMODE and CMDECHO, no error line", "command": "SAFEPICK", "input": ["ESC"], "cancelled": true, "eval_after": "(list (getvar \"OSMODE\") (getvar \"CMDECHO\"))", "expect": "res.after === '(4133 1)' && !log.some((l) => /error/i.test(l)) && log.some((l) => l === 'Restored.')"}

(defun c:safepick ( / *error* old )
  (defun *error* ( msg )
    (if old (mapcar 'setvar '("OSMODE" "CMDECHO") old))
    (if (not (wcmatch (strcase msg t) "*break,*cancel*,*exit*"))
      (princ (strcat "\nError: " msg))
    )
    (princ "\nRestored.")
    (princ)
  )
  (setq old (mapcar 'getvar '("OSMODE" "CMDECHO")))
  (setvar "OSMODE" 0)
  (setvar "CMDECHO" 0)
  (getpoint "\nPick a point (or press Esc): ")
  (*error* "end")
)
