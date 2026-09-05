from fastapi import APIRouter, Depends
from pydantic import BaseModel
from auth import get_current_user
from modules.calculations import calcular_impedancia_trafo, calculo_ecm

router = APIRouter(prefix="/api/transformador", tags=["transformador"])

class TrafoRequest(BaseModel):
    S_kva: float
    V_ll: float
    ucc_pct: float
    V_mt_kv: float

@router.post("/calcular")
def calcular_trafo(req: TrafoRequest, current_user: dict = Depends(get_current_user)):
    # Impedancia
    imp = calcular_impedancia_trafo(req.S_kva, req.V_ll, req.ucc_pct)
    
    # Potencia y corrientes nominales
    I_nom_bt = (req.S_kva * 1000) / (math.sqrt(3) * req.V_ll) if req.V_ll > 0 else 0
    I_nom_mt = (req.S_kva * 1000) / (math.sqrt(3) * req.V_mt_kv * 1000) if req.V_mt_kv > 0 else 0
    
    # ECM y Fusible
    ecm = calculo_ecm(req.S_kva, req.V_mt_kv, I_nom_mt)
    
    return {
        "impedancia": imp,
        "potencia": {
            "S_kva": req.S_kva,
            "I_nom_bt": I_nom_bt,
            "I_nom_mt": I_nom_mt
        },
        "ecm": ecm
    }

import math