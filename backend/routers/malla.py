from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List, Optional
from auth import get_current_user
from modules.calculations import (
    resistividad_equivalente_detallado, 
    resistencia_laurent, 
    resistencia_sverak, 
    resistencia_schwarz
)

router = APIRouter(prefix="/api/malla", tags=["malla"])

class Stratum(BaseModel):
    rho: float
    h: Optional[float] = None

class MallaRequest(BaseModel):
    strata: List[Stratum]
    largo_A: float
    ancho_B: float
    n_conductores_A: int
    n_conductores_B: int
    profundidad_h: float
    radio_conductor_m: float
    largo_total_L: float
    area_S: float

@router.post("/calcular")
def calcular_malla(req: MallaRequest, current_user: dict = Depends(get_current_user)):
    # 1. Resistividad Equivalente (Burgsdorf-Yakobs)
    b_radio = math.sqrt(req.area_S / math.pi) if req.area_S > 0 else 0
    strata_dicts = [{"rho": s.rho, "h": s.h if s.h else float('inf')} for s in req.strata]
    
    rho_eq, det = resistividad_equivalente_detallado(strata_dicts, req.area_S, b_radio)
    
    # 2. Resistencias
    r_laurent = resistencia_laurent(rho_eq, req.area_S, req.largo_total_L)
    r_sverak = resistencia_sverak(rho_eq, req.area_S, req.largo_total_L, req.profundidad_h)
    r_schwarz, det_sch = resistencia_schwarz(
        rho_eq, req.largo_total_L, req.area_S, req.profundidad_h, 
        req.largo_A, req.ancho_B, req.n_conductores_A, req.n_conductores_B, 
        req.radio_conductor_m
    )
    
    return {
        "rho_eq": rho_eq,
        "R_laurent": r_laurent,
        "R_sverak": r_sverak,
        "R_schwarz": r_schwarz,
        "R_referencia": r_schwarz,  # Usamos Schwarz por defecto en RPTD N06
        "detalles_schwarz": det_sch,
        "cumple": r_schwarz <= 20.0
    }

import math