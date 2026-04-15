from typing import Any


def build_summary(category: str, action: str, target: dict[str, Any]) -> str:
    target_text = str(target.get("value", target))

    if category == "browser" and action == "navigate":
        return f"Opened {target_text}"
    if category == "file" and action == "read":
        return f"Read file {target_text}"
    if category == "email" and action == "send":
        return f"Sent email to {target_text}"

    return f"{category}.{action}"
