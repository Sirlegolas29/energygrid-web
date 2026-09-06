@echo off
title EnergyGrid Web - Local Launcher
color 0b
echo ========================================================
echo          ENERGYGRID WEB EDITION - MODO LOCAL
echo ========================================================
echo.
echo 1. Iniciando Servidor Backend (FastAPI en puerto 8000)...
start "EnergyGrid Backend" cmd /k "cd /d %~dp0backend && python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000"

echo 2. Iniciando Servidor Frontend (Vite en puerto 5173)...
start "EnergyGrid Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ========================================================
echo  Todo listo! Abre tu navegador en:
echo  --> http://localhost:5173
echo.
echo  Credenciales por defecto:
echo  Usuario: admin
echo  Clave:   admin
echo ========================================================
pause