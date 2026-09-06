from fastapi import APIRouter, Depends
from pydantic import BaseModel
from auth import get_current_user
from modules.calculations import (
    Cs_factor, Vp50_tolerable, Vc50_tolerable,
    Vp70_tolerable, Vc70_tolerable
)
import math

router = APIRouter(prefix="/api/tensiones", tags=["tensiones"])

class TensionesRequest(BaseModel):
    rho_s: float = 3000.0
    hs: float = 0.10
    ts: float = 0.5
    I_falla: float = 5000.0
    rho_eq: float = 44.12
    R_malla: float = 4.18

@router.post("/calcular")
def calcular_tensiones(req: TensionesRequest, current_user: dict = Depends(get_current_user)):
    Cs = Cs_factor(req.rho_eq, req.rho_s, req.hs)
    Vp50 = Vp50_tolerable(Cs, req.rho_s, req.ts)
    Vc50 = Vc50_tolerable(Cs, req.rho_s, req.ts)
    Vp70 = Vp70_tolerable(Cs, req.rho_s, req.ts)
    Vc70 = Vc70_tolerable(Cs, req.rho_s, req.ts)
    
    # GPR estimado
    GPR = req.I_falla * req.R_malla
    
    return {
        "Cs": float(Cs),
        "Vp50": float(Vp50),
        "Vc50": float(Vc50),
        "Vp70": float(Vp70),
        "Vc70": float(Vc70),
        "GPR": float(GPR)
    }