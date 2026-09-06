from fastapi import APIRouter, Depends
from pydantic import BaseModel
from auth import get_current_user
from modules.calculations import calcular_caida_tension, calcular_corrientes_falla, k_factor_asimetria
import math

router = APIRouter(prefix="/api/alimentador", tags=["alimentador"])

class FallaRequest(BaseModel):
    V_ll: float = 380.0
    S_kva: float = 500.0
    ucc_pct: float = 4.5
    R_malla: float = 4.18
    R_linea_ohm_km: float = 0.387
    X_linea_ohm_km: float = 0.08
    longitud_m: float = 50.0
    I_nom_bt: float = 759.6
    factor_U: float = 1.05

@router.post("/calcular")
def calcular_alim(req: FallaRequest, current_user: dict = Depends(get_current_user)):
    # Caída de tensión
    caida = calcular_caida_tension(req.I_nom_bt, req.R_linea_ohm_km, req.longitud_m, req.V_ll)
    
    # Impedancia línea
    Ra = (req.R_linea_ohm_km * req.longitud_m) / 1000.0 # ohms
    Xa = (req.X_linea_ohm_km * req.longitud_m) / 1000.0 # ohms
    
    # Impedancia trafo referida a BT
    Z_base = (req.V_ll ** 2) / (req.S_kva * 1000.0) if req.S_kva > 0 else 0
    Zt = (req.ucc_pct / 100.0) * Z_base
    Rt = 0.1 * Zt
    Xt = math.sqrt(max(Zt**2 - Rt**2, 0))
    
    # Totales mOhm
    R_tot_3ph_mOhm = (Rt + Ra) * 1000.0
    X_tot_3ph_mOhm = (Xt + Xa) * 1000.0
    Z_tot_3ph_mOhm = math.sqrt(R_tot_3ph_mOhm**2 + X_tot_3ph_mOhm**2)
    
    R_tot_1ph_mOhm = R_tot_3ph_mOhm + (Ra * 1000.0) + (req.R_malla * 1000.0)
    X_tot_1ph_mOhm = X_tot_3ph_mOhm + (Xa * 1000.0)
    Z_tot_1ph_mOhm = math.sqrt(R_tot_1ph_mOhm**2 + X_tot_1ph_mOhm**2)
    
    U_vacio = req.V_ll * req.factor_U
    falla = calcular_corrientes_falla(
        U_vacio, Z_tot_3ph_mOhm, Z_tot_1ph_mOhm,
        R_tot_3ph_mOhm, X_tot_3ph_mOhm,
        R_tot_1ph_mOhm, X_tot_1ph_mOhm
    )
    
    return {
        "caida_tension": caida,
        "corrientes_falla": {
            "I_cc3_sym_kA": float(falla["I_cc3_sym"] / 1000.0),
            "I_cc3_asym_kA": float(falla["I_cc3_asym"] / 1000.0),
            "I_cc1_sym_kA": float(falla["I_cc1_sym"] / 1000.0),
            "I_cc1_asym_kA": float(falla["I_cc1_asym"] / 1000.0),
            "k3": float(falla["k_3"]),
            "k1": float(falla["k_1"])
        }
    }