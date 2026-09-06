import sys
import math
sys.path.append("c:\\Users\\Claudio\\OneDrive\\Desktop\\energygrid-web\\backend")

from routers.malla import calcular_malla, MallaRequest, Stratum

req = MallaRequest(
    strata=[Stratum(rho=100.0, h=1.0)],
    largo_A=10.0,
    ancho_B=10.0,
    n_conductores_A=3,
    n_conductores_B=3,
    profundidad_h=0.6,
    radio_conductor_m=0.005,
    largo_total_L=60.0,
    area_S=100.0
)

try:
    res = calcular_malla(req, {"username": "admin"})
    print("EXITO:", res)
except Exception as e:
    import traceback
    traceback.print_exc()