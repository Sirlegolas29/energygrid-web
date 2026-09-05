from fastapi import APIRouter, Depends
from pydantic import BaseModel
from auth import get_current_user
from modules.calculations import calcular_banco_capacitores

router = APIRouter(prefix="/api/capacitores", tags=["capacitores"])

class CapRequest(BaseModel):
    potencia_kw: float
    fp_actual: float
    fp_objetivo: float

@router.post("/calcular")
def calcular_cap(req: CapRequest, current_user: dict = Depends(get_current_user)):
    res = calcular_banco_capacitores(req.potencia_kw, req.fp_actual, req.fp_objetivo)
    return res