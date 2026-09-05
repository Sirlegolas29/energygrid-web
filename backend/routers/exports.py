import os
import tempfile
from fastapi import APIRouter, Depends
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Dict, Any
from auth import get_current_user
from modules.pdf_report import generar_informe_pdf

router = APIRouter(prefix="/api/exports", tags=["exports"])

class PDFRequest(BaseModel):
    session_data: Dict[str, Any]

@router.post("/pdf")
def export_pdf(req: PDFRequest, current_user: dict = Depends(get_current_user)):
    try:
        fd, temp_path = tempfile.mkstemp(suffix=".pdf")
        os.close(fd)
        
        generar_informe_pdf(temp_path, req.session_data)
        
        return FileResponse(
            path=temp_path, 
            filename="EnergyGrid_Reporte.pdf", 
            media_type="application/pdf",
            background=None # No borrar de inmediato para que FileResponse lo pueda enviar
        )
    except Exception as e:
        return {"error": str(e)}