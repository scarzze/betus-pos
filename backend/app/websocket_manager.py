from fastapi import WebSocket
from typing import Dict, List

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, org_id: str, websocket: WebSocket):
        await websocket.accept()
        if org_id not in self.active_connections:
            self.active_connections[org_id] = []
        self.active_connections[org_id].append(websocket)

    def disconnect(self, org_id: str, websocket: WebSocket):
        if org_id in self.active_connections:
            self.active_connections[org_id].remove(websocket)
            if not self.active_connections[org_id]:
                del self.active_connections[org_id]

    async def broadcast(self, org_id: str, message: dict):
        connections = self.active_connections.get(org_id, [])
        for connection in connections:
            await connection.send_json(message)

manager = ConnectionManager()
