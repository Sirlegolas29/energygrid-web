from fastapi import APIRouter, Depends
from pydantic import BaseModel
from auth import get_current_user
from modules.calculations import (
    calcular_falla_monofasica, 
    calcular_cortocircuito_trifasico,
    calcular_caida_tension
)

router = APIRouter(prefix="/api/alimentador", tags=["alimentador"])

class FallaRequest(BaseModel):
    V_ll: float
    S_kva: float
    ucc_pct: float
    R_malla: float
    R_linea_ohm_km: float
    X_linea_ohm_km: float
    longitud_m: float
    I_nom_bt: float

@router.post("/falla")
def calcular_falla(req: FallaRequest, current_user: dict = Depends(get_current_user)):
    Z_falla = calcular_falla_monofasica(
        req.V_ll, req.S_kva, req.ucc_pct, req.R_malla,
        req.R_linea_ohm_km, req.X_linea_ohm_km, req.longitud_m
    )
    Z_trif = calcular_cortocircuito_trifasico(
        req.V_ll, req.S_kva, req.ucc_pct,
        req.R_linea_ohm_km, req.X_linea_ohm_km, req.longitud_m
    )
    caida = calcular_caida_tension(req.I_nom_bt, req.R_linea_ohm_km, req.longitud_m, req.V_ll)
    
    return {
        "falla_monofasica": Z_falla,
        "falla_trifasica": Z_trif,
        "caida_tension": caida
    }