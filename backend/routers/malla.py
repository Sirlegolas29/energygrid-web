from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List, Optional
from auth import get_current_user
from modules.calculations import (
    resistividad_equivalente_detallado, 
    resistencia_laurent, 
    resistencia_sverak,
    resistencia_ieee80_simple
)
import math

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
    
    # Usaremos IEEE 80 simple o Sverak como referencia
    r_ieee = resistencia_ieee80_simple(rho_eq, req.area_S, req.largo_total_L)
    
    # Convertir a tipos estándar de Python para evitar errores de serialización JSON con NumPy
    return {
        "rho_eq": float(rho_eq),
        "R_laurent": float(r_laurent),
        "R_sverak": float(r_sverak),
        "R_schwarz": float(r_ieee), # Enviamos IEEE bajo el nombre schwarz temporalmente para no romper el frontend
        "R_referencia": float(r_sverak),
        "detalles_schwarz": {},
        "cumple": bool(r_sverak <= 20.0)
    }