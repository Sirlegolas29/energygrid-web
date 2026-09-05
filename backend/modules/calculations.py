# -*- coding: utf-8 -*-
"""Módulo de cálculos principales"""
import math
import numpy as np

def k_factor_asimetria(X, R):
    """Calcula el factor de asimetría para corrientes de falla"""
    if X <= 0:
        return 1.02
    exponente = -(3 * R) / X 
    k = 1.02 + 0.98 * math.exp(exponente)
    return k

def resistividad_equivalente_detallado(strata, S, b):
    """Calcula la resistividad equivalente del terreno"""
    r = math.sqrt(S / math.pi)
    r0_sq = max(r*r - b*b, 0)
    q0_sq = 2*r*(r+b)
    
    detalles = {"r": r, "r0_sq": r0_sq, "q0_sq": q0_sq, 
                "u_sq": [], "v_sq": [], "F": [], "h_vals": []}
    Fi = []
    
    for i, st in enumerate(strata):
        rho_i, h_i = st['rho'], st['h']
        detalles["h_vals"].append(h_i)
        
        if h_i is None or h_i == float('inf'):
            detalles["u_sq"].append(float('inf'))
            detalles["v_sq"].append(0)
            Fi.append(1)
            detalles["F"].append(1)
            continue
            
        u2 = q0_sq + r0_sq + h_i**2
        detalles["u_sq"].append(u2)
        disc = max(u2**2 - 4*q0_sq*r0_sq, 0)
        v2 = 0.5*(u2 - math.sqrt(disc))
        detalles["v_sq"].append(v2)
        
        if r0_sq <= 1e-9:
            Fi.append(0)
            detalles["F"].append(0)
        else:
            val = 1 - (v2/r0_sq)
            F_val = math.sqrt(max(val, 0))
            Fi.append(F_val)
            detalles["F"].append(F_val)
    
    Fs = [0] + Fi
    denom = 0
    denom_str_list = []
    
    for i in range(1, len(Fs)):
        delta = Fs[i] - Fs[i-1]
        rho_i = strata[i-1]['rho']
        if rho_i > 0:
            denom += delta / rho_i
            denom_str_list.append(f"({Fs[i]:.3f} - {Fs[i-1]:.3f})/{rho_i:.2f}")
    
    rho_eq = 1.0 / denom if denom > 0 else np.mean([s["rho"] for s in strata])
    detalles["denom_str"] = " + ".join(denom_str_list)
    
    return rho_eq, detalles

def get_ucc_pct(s_kva):
    """Obtiene el porcentaje de tensión de cortocircuito según norma"""
    if s_kva <= 630:
        return 4.0
    if s_kva <= 800:
        return 4.5
    if s_kva <= 1000:
        return 5.0
    if s_kva <= 1250:
        return 5.5
    if s_kva <= 1600:
        return 6.0
    return 7.0

def resistencia_laurent(rho_eq, S, L):
    """Método Laurent para resistencia de malla"""
    if S <= 0 or L <= 0:
        return 0
    return rho_eq / (4 * math.sqrt(S / math.pi)) + rho_eq / L

def resistencia_sverak(rho_eq, S, L, h):
    """Método Sverak para resistencia de malla"""
    if S <= 0 or L <= 0:
        return 0
    sqrt20S = math.sqrt(20 * S)
    term_interno = 1 + h * math.sqrt(20 / S)
    if term_interno == 0:
        return 0
    term = 1 + (1 / term_interno)
    return rho_eq * (1/L + (1/sqrt20S)*term)

def resistencia_schwarz_detallado(rho_eq, S, L, A, B, r, h):
    """Método Schwarz detallado para resistencia de malla"""
    if S <= 0 or L <= 0 or B <= 0 or r <= 0:
        return 0, {}
    
    r_prime = math.sqrt(2 * h * r)
    if r_prime == 0:
        r_prime = 1e-9
    
    k1_term1 = 1.43
    k1_term2 = (2.3 * h) / math.sqrt(S)
    k1_term3 = 0.044 * (A / B)
    k1 = k1_term1 - k1_term2 - k1_term3
    
    k2_term1 = 5.5
    k2_term2 = (8 * h) / math.sqrt(S)
    k2_term3_factor1 = 0.15
    k2_term3_factor2 = h / math.sqrt(S)
    k2_term3_factor_total = (k2_term3_factor1 - k2_term3_factor2)
    k2_term3 = k2_term3_factor_total * (A / B)
    k2 = k2_term1 - k2_term2 + k2_term3
    
    R_term1_log = math.log(2 * L / r_prime)
    R_term2_k1 = (k1 * L) / math.sqrt(S)
    R_factor_inicial = (rho_eq / (math.pi * L))
    R_sch = R_factor_inicial * (R_term1_log + R_term2_k1 - k2)
    
    detalles = {
        "r_prime": r_prime, "k1": k1, "k2": k2,
        "k1_t1": k1_term1, "k1_t2": k1_term2, "k1_t3": k1_term3,
        "k2_t1": k2_term1, "k2_t2": k2_term2, "k2_t3": k2_term3,
        "R_log": R_term1_log, "R_k1": R_term2_k1, "R_fact": R_factor_inicial,
        "R_sch": R_sch
    }
    
    return R_sch, detalles

def Cs_factor(rho, rho_s, Hs):
    """Factor de reducción para capa superficial"""
    if rho_s == 0:
        return 1.0
    denominador = (2 * Hs) + 0.09
    if denominador == 0:
        return 1.0
    numerador = 0.09 * (1 - (rho / rho_s))
    return 1 - (numerador / denominador)

def Vp50_tolerable(Cs, rho_s, ts):
    """Tensión de paso tolerable para 50kg"""
    if ts <= 0:
        return 0
    return (1000 + 6 * Cs * rho_s) * 0.116 / math.sqrt(ts)

def Vc50_tolerable(Cs, rho_s, ts):
    """Tensión de contacto tolerable para 50kg"""
    if ts <= 0:
        return 0
    return (1000 + 1.5 * Cs * rho_s) * 0.116 / math.sqrt(ts)

def Vp70_tolerable(Cs, rho_s, ts):
    """Tensión de paso tolerable para 70kg"""
    if ts <= 0:
        return 0
    return (1000 + 6 * Cs * rho_s) * 0.157 / math.sqrt(ts)

def Vc70_tolerable(Cs, rho_s, ts):
    """Tensión de contacto tolerable para 70kg"""
    if ts <= 0:
        return 0
    return (1000 + 1.5 * Cs * rho_s) * 0.157 / math.sqrt(ts)

def calcular_impedancia_transformador(S_kva, V_ll, ucc_pct):
    """Calcula la impedancia del transformador"""
    if ucc_pct <= 0:
        ucc_pct = get_ucc_pct(S_kva)
    
    Zt_total_mOhm = (V_ll**2 / S_kva) * (ucc_pct / 100)
    
    factor_Xt = 0.99
    factor_Rt = 0.1
    
    Xt_mOhm = Zt_total_mOhm * factor_Xt
    Rt_mOhm = Xt_mOhm * factor_Rt
    Z_final_mOhm = math.sqrt(Rt_mOhm**2 + Xt_mOhm**2)
    
    return {
        "S_kva": S_kva, "V_ll": V_ll, "ucc_pct": ucc_pct,
        "Zt_total_mOhm": Zt_total_mOhm, "Xt_mOhm": Xt_mOhm,
        "Rt_mOhm": Rt_mOhm, "Z_final_mOhm": Z_final_mOhm
    }

def calcular_geometria_malla(A_largo, B_ancho, n_conductores_A, m_conductores_B):
    """Calcula geometría de la malla"""
    S_area = A_largo * B_ancho
    L_total = (n_conductores_A * A_largo) + (m_conductores_B * B_ancho)
    D = (A_largo / (n_conductores_A - 1)) if n_conductores_A > 1 else 0
    return {"S_area": S_area, "L_total": L_total, "D": D}

def calcular_constantes_malla(L_c, L_R, n, h, D, d_conductor):
    """Calcula constantes geométricas para tensiones de paso/contacto"""
    h0 = 1.0
    
    L_s = 0.75 * L_c + 0.85 * L_R
    L_m = L_c + L_R
    K_i = 0.644 + 0.148 * n
    K_h = math.sqrt(1 + (h / h0))
    
    if L_R > 0:
        K_ii = 1.0
        kii_formula_str = "1.0 (Con barras verticales)"
    else:
        K_ii = 1 / math.pow(2 * n, 2 / n) if n > 1 else 1.0
        kii_formula_str = f"1/(2*{n})^(2/{n}) = {K_ii:.3f}"
    
    K_s_t1 = 1 / (2 * h)
    K_s_t2 = 1 / (D + h)
    K_s_t3 = (1 / D) * (1 - math.pow(0.5, n - 2)) if n >= 2 else 0
    K_s = (1 / math.pi) * (K_s_t1 + K_s_t2 + K_s_t3)
    
    # Cálculo de Km
    km_t1 = (D**2) / (16 * h * d_conductor)
    km_t2 = ((D + 2 * h)**2) / (8 * D * d_conductor)
    km_t3 = h / (4 * d_conductor)
    km_suma = km_t1 + km_t2 - km_t3
    
    if km_suma <= 0:
        raise ValueError("La suma dentro del logaritmo de K_m es negativa o cero")
    
    km_log = math.log(km_suma)
    km_t4_log = math.log(8 / (math.pi * (2 * n - 1))) if n > 0 else 0
    km_t4_val = (K_ii / K_h) * km_t4_log
    K_m = (1 / (2 * math.pi)) * (km_log + km_t4_val)
    
    return {
        "L_s": L_s, "L_m": L_m, "K_i": K_i, "K_h": K_h,
        "K_ii": K_ii, "kii_formula_str": kii_formula_str,
        "K_s": K_s, "K_m": K_m,
        "km_t1": km_t1, "km_t2": km_t2, "km_t3": km_t3,
        "km_log": km_log, "km_t4": km_t4_val
    }

def calcular_corrientes_falla(U_vacio, Z_total_3ph_mOhm, Z_total_1ph_mOhm, 
                              R_total_3ph_mOhm, X_total_3ph_mOhm,
                              R_total_1ph_mOhm, X_total_1ph_mOhm):
    """Calcula corrientes de falla trifásica y monofásica"""
    
    Z_total_3ph_Ohms = Z_total_3ph_mOhm / 1000.0
    Z_total_1ph_Ohms = Z_total_1ph_mOhm / 1000.0
    
    I_cc3_sym = U_vacio / (math.sqrt(3) * Z_total_3ph_Ohms) if Z_total_3ph_Ohms > 0 else 0
    k_3 = k_factor_asimetria(X_total_3ph_mOhm, R_total_3ph_mOhm)
    I_cc3_asym = I_cc3_sym * k_3
    
    I_cc1_sym = U_vacio / (math.sqrt(3) * Z_total_1ph_Ohms) if Z_total_1ph_Ohms > 0 else 0
    k_1 = k_factor_asimetria(X_total_1ph_mOhm, R_total_1ph_mOhm)
    I_cc1_asym = I_cc1_sym * k_1
    
    return {
        "I_cc3_sym": I_cc3_sym, "k_3": k_3, "I_cc3_asym": I_cc3_asym,
        "I_cc1_sym": I_cc1_sym, "k_1": k_1, "I_cc1_asym": I_cc1_asym
    }

def calcular_seccion_minima(K, I_f, ts):
    """Calcula la sección mínima del conductor según IEEE 80"""
    if ts <= 0:
        return 0, 0
    S_min_calc = (K * I_f * math.sqrt(ts)) / 1973
    S_min_final = max(S_min_calc, 25.0)
    return S_min_calc, S_min_final

def calcular_potencia_reactiva(P_kw, fp_inicial, fp_objetivo):
    """Calcula los kVAR necesarios para corrección de FP"""
    phi_1 = math.acos(fp_inicial)
    phi_2 = math.acos(fp_objetivo)
    tan_phi_1 = math.tan(phi_1)
    tan_phi_2 = math.tan(phi_2)
    kvar_calculado = P_kw * (tan_phi_1 - tan_phi_2)
    return max(kvar_calculado, 0)


def resistencia_ieee80_simple(rho_eq, S, L):
    """Método simplificado IEEE 80 §16.5 para resistencia de malla.
    R = ρ * (1/L + 1/√(20·S))
    Adecuado para mallas rectangulares con profundidad normal."""
    if S <= 0 or L <= 0:
        return 0
    return rho_eq * (1.0 / L + 1.0 / math.sqrt(20.0 * S))


def calcular_caida_tension(I_a, R_ohm_km, longitud_m, V_nom_V, num_conductores=1):
    """Calcula caída de tensión en un alimentador.

    Args:
        I_a: Corriente nominal (A)
        R_ohm_km: Resistencia del conductor (Ω/km)
        longitud_m: Longitud del alimentador (m)
        V_nom_V: Tensión nominal de línea (V)
        num_conductores: Conductores en paralelo por fase

    Returns:
        dict con dVp (caída monofásica V), dVl (caída línea V), pct (porcentaje)
    """
    if V_nom_V <= 0 or num_conductores <= 0:
        return {"dVp": 0, "dVl": 0, "pct": 0}

    R_total = (R_ohm_km * longitud_m / 1000.0) / num_conductores
    # Caída trifásica: ΔV = √3 · I · R (solo resistiva, FP=1 simplificado)
    dVl = math.sqrt(3) * I_a * R_total
    dVp = dVl / math.sqrt(3)  # Caída fase-neutro
    pct = (dVl / V_nom_V) * 100.0

    return {"dVp": dVp, "dVl": dVl, "pct": pct, "R_total": R_total}


def seccion_normalizada(s_calc_mm2):
    """Retorna la sección normalizada comercial inmediata superior (mm²).
    Cumple con series de conductores IEC 60228."""
    from modules.constants import SECCIONES_NORMALIZADAS, S_CONDUCTOR_MIN_MM2
    s_minima = max(s_calc_mm2, S_CONDUCTOR_MIN_MM2)
    for s in SECCIONES_NORMALIZADAS:
        if s >= s_minima:
            return s
    return SECCIONES_NORMALIZADAS[-1]  # Mayor disponible


def calcular_seccion_minima_material(K, I_f, ts, material="Cobre recocido sólido"):
    """Calcula sección mínima con factor K por material (IEEE 80 §11.3).
    S = I_f * sqrt(ts) / K   [en mm²]
    """
    from modules.constants import K_MATERIALS
    k_mat = K_MATERIALS.get(material, {}).get("K", K)
    if ts <= 0 or k_mat <= 0:
        return 0, 0, material
    s_calc = (I_f * math.sqrt(ts)) / k_mat
    s_norm = seccion_normalizada(s_calc)
    return s_calc, s_norm, material