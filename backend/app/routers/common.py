from fastapi import APIRouter

router = APIRouter(tags=["common"])

@router.get("/health")
@router.get("/healthcheck")
def health_check():
    return {"status": "healthy", "message": "OK"}

@router.get("/api/v1/fetch-reverse-geoencode")
async def fetch_reverse_geoencode(lat: float, lng: float):
    # Mocking geo-encoding logic
    return {
        "resp": [
            {
                "formatted_address": f"Mock Location at {lat}, {lng}",
                "address_components": []
            }
        ]
    }
