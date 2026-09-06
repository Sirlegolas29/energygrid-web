from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List, Optional
from auth import get_current_user
from modules.calculations import (
    resistividad_equivalente_detallado, 
    resistencia_laurent, 
    resistencia_sverak,
    resistencia_schwarz_detallado,
    resistencia_ieee80_simple
)
import math

router = APIRouter(prefix="/api/malla", tags=["malla"])

class Stratum(BaseModel):
    rho: float
    h: Optional[float] = None

class MallaRequest(BaseModel):
    rho1: float = 37.0
    h1: float = 0.44
    rho2: float = 185.0
    h2: float = 2.20
    rho3: float = 24.0
    largo_A: float = 5.0
    ancho_B: float = 4.0
    profundidad_h: float = 0.6
    n_conductores_A: int = 5
    n_conductores_B: int = 6
    radio_conductor_m: float = 0.0032
    L_R_barras: int = 0

@router.post("/calcular")
def calcular_malla(req: MallaRequest, current_user: dict = Depends(get_current_user)):
    # Estratos acumulados
    h1_cum = req.h1
    h2_cum = req.h1 + req.h2
    strata_list = [
        {"rho": req.rho1, "h": h1_cum},
        {"rho": req.rho2, "h": h2_cum},
        {"rho": req.rho3, "h": None}
    ]
    
    # Geometría
    S_area = req.largo_A * req.ancho_B
    L_total = (req.n_conductores_A * req.largo_A) + (req.n_conductores_B * req.ancho_B)
    
    # 1. Resistividad Equivalente
    rho_eq, detalles = resistividad_equivalente_detallado(strata_list, S_area, req.profundidad_h)
    
    # 2. Resistencias
    r_laurent = resistencia_laurent(rho_eq, S_area, L_total)
    r_sverak = resistencia_sverak(rho_eq, S_area, L_total, req.profundidad_h)
    r_schwarz, d_sch = resistencia_schwarz_detallado(
        rho_eq, S_area, L_total, req.largo_A, req.ancho_B, req.radio_conductor_m, req.profundidad_h
    )
    r_ieee = resistencia_ieee80_simple(rho_eq, S_area, L_total)
    
    return {
        "rho_eq": float(rho_eq),
        "R_laurent": float(r_laurent),
        "R_sverak": float(r_sverak),
        "R_schwarz": float(r_schwarz),
        "R_ieee": float(r_ieee),
        "R_referencia": float(r_schwarz),
        "S_area": float(S_area),
        "L_total": float(L_total),
        "detalles": detalles if isinstance(detalles, dict) else {},
        "cumple": bool(r_schwarz <= 20.0)
    }