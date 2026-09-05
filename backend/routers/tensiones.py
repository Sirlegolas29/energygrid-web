from fastapi import APIRouter, Depends
from pydantic import BaseModel
from auth import get_current_user
from modules.calculations import constantes_malla, tensiones_malla, tensiones_admisibles

router = APIRouter(prefix="/api/tensiones", tags=["tensiones"])

class TensionesRequest(BaseModel):
    rho_s: float
    hs: float
    ts: float
    rho_eq: float
    L_total: float
    area_S: float
    profundidad_h: float
    largo_A: float
    ancho_B: float
    n_conductores_A: int
    n_conductores_B: int
    radio_conductor_m: float
    I_falla: float

@router.post("/calcular")
def calcular_tensiones(req: TensionesRequest, current_user: dict = Depends(get_current_user)):
    admisibles = tensiones_admisibles(req.rho_eq, req.rho_s, req.hs, req.ts)
    consts = constantes_malla(
        req.largo_A, req.ancho_B, req.n_conductores_A, req.n_conductores_B,
        req.profundidad_h, req.radio_conductor_m, req.L_total, req.area_S
    )
    reales = tensiones_malla(req.rho_eq, req.I_falla, consts['L_m'], consts['L_s'], consts['K_m'], consts['K_s'], consts['K_i'])
    
    return {
        "admisibles": admisibles,
        "constantes": consts,
        "reales": reales,
        "cumple_paso": reales['Vp_real'] <= admisibles['Vp50'],
        "cumple_contacto": reales['Vc_real'] <= admisibles['Vc50']
    }