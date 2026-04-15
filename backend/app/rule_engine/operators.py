from typing import Final

OPERATOR_EQ: Final = "eq"
OPERATOR_CONTAINS: Final = "contains"
OPERATOR_GT: Final = "gt"

SUPPORTED_OPERATORS: Final[tuple[str, ...]] = (
    OPERATOR_EQ,
    OPERATOR_CONTAINS,
    OPERATOR_GT,
)


def matches_operator(operator: str, actual: object, expected: object) -> bool:
    if operator == OPERATOR_EQ:
        return actual == expected
    if operator == OPERATOR_CONTAINS:
        return isinstance(actual, str) and str(expected) in actual
    if operator == OPERATOR_GT:
        actual_number = _as_number(actual)
        expected_number = _as_number(expected)
        return (
            actual_number is not None
            and expected_number is not None
            and actual_number > expected_number
        )

    return False


def _as_number(value: object) -> float | None:
    if isinstance(value, bool):
        return None
    if isinstance(value, int | float):
        return float(value)
    return None
