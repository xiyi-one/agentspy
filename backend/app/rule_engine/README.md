# Rule Engine

Placeholder boundary for future deterministic rule evaluation.

This module will eventually prepare stateless rule definitions and evaluate normalized events against compiled rules.

Current boundaries:

- `compiler.py` will validate and prepare structured rules for evaluation.
- `evaluator.py` will evaluate normalized events against compiled rules and return match results.
- `operators.py` defines the supported operator surface.
- `builtins.py` is reserved for future system-provided rules.

Explicitly not implemented yet:

- rule execution
- alert creation
- notification sending
- persistence
- queue or worker integration
- ingest-flow integration
