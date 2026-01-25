from fastapi import APIRouter

router = APIRouter(prefix="/api", tags=["url"])

@router.get("/url")
@router.get("/v1/url")
async def get_url(id: str):
    # Dummy URL redirection logic
    return {"id": id, "main_url": f"https://example.com/r/{id}"}
