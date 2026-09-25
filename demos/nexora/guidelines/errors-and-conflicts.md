---
topic: errors and conflicts
prefix: ER
triggers:
  [
    error,
    conflict,
    refusal,
    failed,
    retry,
    stale,
    version,
    409,
    503,
    transport,
    degraded,
    permission,
    forbidden,
    state,
    transition,
  ]
families: [inline-message, toast, result-state, button, dialog]
---

# Errors and conflicts

What a screen does with an answer that is not the one it asked for. The
library gives `inline-message` five tones, `result-state` four statuses and
`toast` a place for what is passing; it does not say which of them a refusal
belongs in, or that two refusals a reader must answer differently should not
look the same.

### ER-01 · A refusal is classed before it is shown

Level: MUST
Applies to: every command a screen sends
Rule: The screen sorts the backend's answer into the class the reader must act on — a conflict (the record moved), a transport failure (nothing was written), a permission (this persona never will) or a state (the record cannot do this now) — and says the class, not the code.
Why: "Request failed" makes the reader guess whether to try again, to read the page again, or to ask someone else; those are three different next steps and the answer already knows which one it is.
Do: Keep one map from code to class in the module's store — §78.2's conflicts, 503, 403 and the state transitions — and one sentence per class beside the message: what happened, and what the reader does now. The words are the product's where the module knows the code, and the server's sentence where it does not.
Don't: Show the code, show "Something went wrong", or answer every failure with the same toast.
Seen in: Nexora · the sales order workspace and the approvals queue · corrected
Check: Spec: the order store suite, "says in the module's words that a shipped order cannot be cancelled whole" and "tells a persona who may not hold an order that the command is not theirs".

### ER-02 · A conflict is answered by reading the record again

Level: MUST
Applies to: `STALE_VERSION`, `ORDER_ALREADY_CANCELLED`, `APPROVAL_ALREADY_DECIDED`, `INVENTORY_CHANGED` (§78.2)
Rule: The screen re-reads the record before it shows the message, so what the reader sees under the message is what the backend now holds; the message says that it has done so.
Why: A conflict means the reader's picture is out of date. Leaving the old picture under a warning invites the same command again, and the second refusal teaches nothing.
Do: Re-read on the conflict codes and on those alone — a transport failure changed nothing, so the picture is still true — and word the message as what happened elsewhere ("Another approver decided this one a moment ago"), not as what the reader did wrong.
Don't: Ask the reader to refresh, or clear the screen and start over.
Seen in: Nexora · a held order whose version had moved; a queue row decided by another approver · corrected
Check: Spec: the order store suite, "answers a version someone else moved past by reading the order again"; the queue suite, "answers a request decided elsewhere by reading the queue again".

### ER-03 · The version a command carries is the version the page read

Level: MUST
Applies to: every command under §53.11
Rule: The screen holds the version as a number at the moment it read the record, and sends that; it never reads the version out of an answer it is still holding at the moment it sends.
Why: The simulated backend hands out answers that share their `metadata` with the store, so an object read minutes ago carries whoever wrote last — and a command built from it is never refused for being stale, which silently overwrites the other writer.
Do: Copy the number when the record loads, and again after every command that succeeds. Where a screen holds many records — a queue — keep the number per row.
Don't: Write `record.metadata.version` inside the call that sends the command.
Seen in: Nexora · the order, the quote and the approvals queue · corrected, with the ledger row "an answer shares its nested objects with the store"
Check: Spec: the order store suite, "answers a version someone else moved past by reading the order again" — it fails when the version is read at command time.

### ER-04 · Two failures that read alike are two failures the reader cannot tell apart

Level: SHOULD
Applies to: a screen that can meet both a conflict and a transport failure — every screen with a command, under the degraded profile (§78)
Rule: A conflict and a transport failure carry different tones and different second lines: the conflict is a warning that the page has been read again, the transport failure is a danger that nothing was written and the same action can be tried again.
Why: Under the degraded profile both arrive within a minute of each other, and a reader who cannot tell them apart either retries a command that already ran or abandons one that never did.
Do: Reserve the danger tone for what did not happen, and the warning tone for what happened somewhere else.
Don't: Give every refusal the danger tone because it is a failure.
Seen in: Nexora · the order workspace under the degraded transport · corrected
Check: With the transport degraded, a failed command says "Nothing was changed. Try the same action again in a moment."; a conflict says the page has been read again.
