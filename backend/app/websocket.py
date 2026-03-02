from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.websocket_manager import manager

router = APIRouter()

@router.websocket("/ws/{org_id}")
async def websocket_endpoint(websocket: WebSocket, org_id: str):
    await manager.connect(org_id, websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(org_id, websocket)
