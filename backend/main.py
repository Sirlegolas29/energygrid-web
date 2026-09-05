from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from auth import router as auth_router
from routers.malla import router as malla_router
from routers.transformador import router as trafo_router
from routers.alimentador import router as alim_router
from routers.tensiones import router as tens_router
from routers.seccion import router as secc_router
from routers.capacitores import router as cap_router
from routers.exports import router as exports_router

app = FastAPI(title="EnergyGrid Web API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(malla_router)
app.include_router(trafo_router)
app.include_router(alim_router)
app.include_router(tens_router)
app.include_router(secc_router)
app.include_router(cap_router)
app.include_router(exports_router)

@app.get("/")
def read_root():
    return {"status": "ok"}