from fastapi import APIRouter, Depends
from pydantic import BaseModel
from auth import get_current_user
from modules.calculations import calcular_potencia_reactiva
import math

router = APIRouter(prefix="/api/capacitores", tags=["capacitores"])

class CapRequest(BaseModel):
    potencia_kw: float = 150.0
    fp_actual: float = 0.75
    fp_objetivo: float = 0.95
    V_servicio: float = 380.0

@router.post("/calcular")
def calcular_cap(req: CapRequest, current_user: dict = Depends(get_current_user)):
    q_req = float(calcular_potencia_reactiva(req.potencia_kw, req.fp_actual, req.fp_objetivo))
    
    bancos_estandar = [5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 90, 100, 120, 150, 200]
    banco_sugerido = bancos_estandar[-1]
    for b in bancos_estandar:
        if b >= q_req:
            banco_sugerido = b
            break
            
    I_banco = (banco_sugerido * 1000.0) / (math.sqrt(3) * req.V_servicio) if req.V_servicio > 0 else 0
    
    return {
        "Q_kvar_calculado": float(q_req),
        "banco_sugerido_kvar": float(banco_sugerido),
        "I_banco_A": float(I_banco),
        "fp_actual": req.fp_actual,
        "fp_objetivo": req.fp_objetivo,
        "P_kw": req.potencia_kw
    }