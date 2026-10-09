import os
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import FileResponse
from auth import get_current_user
from models import User

router = APIRouter(prefix="/api/files", tags=["Files"])

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.get("/view/{file_name}")
@router.get("/download/{file_name}")
def download_or_view_file(file_name: str):
    # Prevent path traversal
    safe_name = os.path.basename(file_name)
    file_path = os.path.join(UPLOAD_DIR, safe_name)

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Requested file was not found on server.")

    # Determine media type
    ext = os.path.splitext(safe_name)[1].lower()
    media_types = {
        ".pdf": "application/pdf",
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".webp": "image/webp",
        ".gif": "image/gif",
        ".svg": "image/svg+xml",
        ".doc": "application/msword",
        ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ".ppt": "application/vnd.ms-powerpoint",
        ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        ".zip": "application/zip",
        ".txt": "text/plain",
        ".csv": "text/csv",
        ".json": "application/json",
        ".md": "text/markdown"
    }
    media_type = media_types.get(ext, "application/octet-stream")

    return FileResponse(
        path=file_path,
        media_type=media_type,
        filename=safe_name,
        headers={"Content-Disposition": f"inline; filename={safe_name}"}
    )

@router.delete("/{file_name}")
def delete_file(file_name: str, current_user: User = Depends(get_current_user)):
    safe_name = os.path.basename(file_name)
    file_path = os.path.join(UPLOAD_DIR, safe_name)

    if os.path.exists(file_path):
        try:
            os.remove(file_path)
            return {"success": True, "message": f"File {safe_name} deleted."}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    return {"success": True, "message": "File removed or did not exist."}
