# Splitter Design

Superseded by `2026-09-11-splitter-and-overlay-gestures-design.md`.

This document described a family holding two panes with a separator between
them. The family holds no panes: it is the separator alone, and the consumer
applies its value to their own layout. Section 2 of the superseding document
records why, and section 11 records what was dropped with the panes — collapse,
responsive pagination, and N-pane coupling.

The decision this document made that still holds is the unit, and it is now
stated where it belongs: `packages/core/src/extent/extent.ts`.
