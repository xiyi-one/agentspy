from fastapi import HTTPException, status

API_KEYS: dict[str, str] = {
    "test_key_123": "ws_demo",
}


def resolve_workspace_id(api_key: str | None) -> str:
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing X-API-Key header.",
        )

    workspace_id = API_KEYS.get(api_key)
    if not workspace_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid X-API-Key.",
        )

    return workspace_id
