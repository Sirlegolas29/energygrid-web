from fastapi import APIRouter, Depends
from pydantic import BaseModel
from auth import get_current_user
from modules.calculations import calcular_seccion_minima_material
from modules.constants import K_MATERIALS

router = APIRouter(prefix="/api/seccion", tags=["seccion"])

class SeccionRequest(BaseModel):
    I_falla: float
    ts: float
    material: str

@router.post("/calcular")
def calcular_seccion(req: SeccionRequest, current_user: dict = Depends(get_current_user)):
    s_calc, s_norm, mat = calcular_seccion_minima_material(197, req.I_falla, req.ts, req.material)
    
    return {
        "S_calc": s_calc,
        "S_final": s_norm,
        "material": mat,
        "cumple": s_norm >= 25.0,
        "materiales": K_MATERIALS
    }