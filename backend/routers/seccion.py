from fastapi import APIRouter, Depends
from pydantic import BaseModel
from auth import get_current_user
from modules.calculations import calcular_seccion_minima_material, seccion_normalizada
from modules.constants import K_MATERIALS

router = APIRouter(prefix="/api/seccion", tags=["seccion"])

class SeccionRequest(BaseModel):
    I_falla: float = 5000.0
    ts: float = 0.5
    material: str = "Cobre recocido sólido"

@router.post("/calcular")
def calcular_seccion(req: SeccionRequest, current_user: dict = Depends(get_current_user)):
    k_val = K_MATERIALS.get(req.material, {}).get("K", 197)
    s_calc, s_norm, mat = calcular_seccion_minima_material(k_val, req.I_falla, req.ts, req.material)
    
    # Comparativa con otros materiales
    comparativa = []
    for m_nombre, m_data in K_MATERIALS.items():
        k_m = m_data["K"]
        sc, sn, _ = calcular_seccion_minima_material(k_m, req.I_falla, req.ts, m_nombre)
        comparativa.append({
            "material": m_nombre,
            "K": k_m,
            "S_calc": float(sc),
            "S_norm": float(sn)
        })
        
    return {
        "S_calc": float(s_calc),
        "S_norm": float(s_norm),
        "material": req.material,
        "K": k_val,
        "cumple_norma": bool(s_norm >= 25.0),
        "comparativa": comparativa
    }