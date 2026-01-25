from fastapi import APIRouter

router = APIRouter(prefix="/api/v1/vehicle/commands", tags=["commands"])

@router.post("/sync")
async def command_sync(params: dict):
    return {"status": "success", "msg": "Commands synced"}

@router.post("/trigger")
async def command_trigger(params: dict):
    return {"status": "success", "msg": "Command triggered"}

@router.get("/status")
async def command_status(id: str):
    return {"status": "completed", "id": id}
