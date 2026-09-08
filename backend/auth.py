import os
from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
import bcrypt
import jwt
from pydantic import BaseModel, EmailStr
from database import get_db

SECRET_KEY = os.environ.get("SECRET_KEY", "tu_clave_secreta_super_segura_para_jwt_cambiar_en_prod")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 dias

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

router = APIRouter(prefix="/api/auth", tags=["auth"])

class UserRegister(BaseModel):
    username: str
    password: str
    full_name: Optional[str] = ""
    email: Optional[str] = ""

class UserLoginJSON(BaseModel):
    username: str
    password: str

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False

def get_password_hash(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(token: Optional[str] = Depends(oauth2_scheme)):
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No se proporcionó token de autenticación",
            headers={"WWW-Authenticate": "Bearer"},
        )
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudo validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception
        
    conn = get_db()
    user = conn.execute("SELECT id, username, full_name, email, role, created_at FROM users WHERE username = ?", (username,)).fetchone()
    conn.close()
    
    if user is None:
        raise credentials_exception
    return dict(user)

@router.post("/register")
def register(user_data: UserRegister):
    username = user_data.username.strip()
    if len(username) < 3:
        raise HTTPException(status_code=400, detail="El nombre de usuario debe tener al menos 3 caracteres.")
    if len(user_data.password) < 4:
        raise HTTPException(status_code=400, detail="La contraseña debe tener al menos 4 caracteres.")

    conn = get_db()
    c = conn.cursor()
    
    # Verificar si el usuario ya existe
    existing = c.execute("SELECT id FROM users WHERE username = ?", (username,)).fetchone()
    if existing:
        conn.close()
        raise HTTPException(status_code=400, detail="El nombre de usuario ya está registrado.")
        
    # Verificar email si se ingresó
    email = user_data.email.strip() if user_data.email else None
    if email:
        existing_email = c.execute("SELECT id FROM users WHERE email = ?", (email,)).fetchone()
        if existing_email:
            conn.close()
            raise HTTPException(status_code=400, detail="El correo electrónico ya está registrado.")
            
    hashed_pwd = get_password_hash(user_data.password)
    full_name = user_data.full_name.strip() if user_data.full_name else username
    
    c.execute(
        "INSERT INTO users (username, full_name, email, hashed_password, role, created_at) VALUES (?, ?, ?, ?, 'Ingeniero', datetime('now'))",
        (username, full_name, email, hashed_pwd)
    )
    conn.commit()
    
    new_user = c.execute("SELECT id, username, full_name, email, role, created_at FROM users WHERE username = ?", (username,)).fetchone()
    conn.close()
    
    user_dict = dict(new_user)
    access_token = create_access_token(data={"sub": username})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_dict,
        "message": "Usuario registrado exitosamente"
    }

@router.post("/login")
async def login(request: Request):
    # Soporta tanto application/x-www-form-urlencoded como application/json
    content_type = request.headers.get("content-type", "")
    username = ""
    password = ""
    
    if "application/json" in content_type:
        body = await request.json()
        username = body.get("username", "").strip()
        password = body.get("password", "")
    else:
        form = await request.form()
        username = form.get("username", "").strip()
        password = form.get("password", "")

    conn = get_db()
    user = conn.execute("SELECT * FROM users WHERE username = ?", (username,)).fetchone()
    conn.close()
    
    # Si no existe en BD o no valida contraseña
    if not user or not verify_password(password, user["hashed_password"]):
        # Fallback de seguridad para admin inicial
        if username == "admin" and password == "admin":
            access_token = create_access_token(data={"sub": "admin"})
            return {
                "access_token": access_token, 
                "token_type": "bearer",
                "user": {
                    "id": 1,
                    "username": "admin",
                    "full_name": "Administrador EnergyGrid",
                    "email": "admin@energygrid.com",
                    "role": "Administrador"
                }
            }
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    access_token = create_access_token(data={"sub": user["username"]})
    user_data = {
        "id": user["id"],
        "username": user["username"],
        "full_name": user["full_name"] or user["username"],
        "email": user["email"] or "",
        "role": user["role"] or "Ingeniero"
    }
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user": user_data
    }

@router.get("/me")
def get_me(current_user: dict = Depends(get_current_user)):
    return current_user