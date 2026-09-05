# -*- coding: utf-8 -*-
"""Módulo de base de datos para gestión de datos de fabricantes y normativas"""
import json
import os
from typing import Dict, Any, Optional, List, Tuple

class DatabaseManager:
    """Gestor de bases de datos de componentes eléctricos"""
    
    def __init__(self, data_dir: str = None):
        self.data_dir = data_dir or os.path.dirname(__file__)
        self.cache = {}
        self._load_all_data()
    
    def _load_all_data(self):
        """Carga todas las bases de datos desde constants"""
        from modules.constants import (
            CABLE_RESISTANCE_OHM_KM, DATA_RIC_4, DATA_RVK_MONOPOLAR,
            ECM_TC_DATABASE, ECM_TP_DATABASE, CAP_BANK_PROTECTION_DB,
            CAP_BANK_CABLE_DB, COOPER_FUSE_MT_SELECTION, COOPER_FUSE_MT_SPECS,
            FUSE_SIZES_BT_A, FUSE_BREAKING_CAPACITY_KA
        )
        
        self.cables = CABLE_RESISTANCE_OHM_KM
        self.ric4 = DATA_RIC_4
        self.rvk = DATA_RVK_MONOPOLAR
        self.ecm_tc = ECM_TC_DATABASE
        self.ecm_tp = ECM_TP_DATABASE
        self.cap_protection = CAP_BANK_PROTECTION_DB
        self.cap_cable = CAP_BANK_CABLE_DB
        self.cooper_fuse_mt = COOPER_FUSE_MT_SELECTION
        self.cooper_fuse_specs = COOPER_FUSE_MT_SPECS
        self.fuse_bt_sizes = FUSE_SIZES_BT_A
        self.fuse_bt_breaking = FUSE_BREAKING_CAPACITY_KA
    
    # ============= MÉTODOS PARA CABLES =============
    
    def get_cable_resistance(self, calibre: str) -> Optional[float]:
        """Obtiene la resistencia de un cable por su calibre"""
        return self.cables.get(calibre)
    
    def get_cable_by_resistance(self, resistance: float, tolerance: float = 0.001) -> Optional[str]:
        """Busca calibre por resistencia"""
        for calibre, res in self.cables.items():
            if abs(res - resistance) < tolerance:
                return calibre
        return None
    
    def list_cables(self) -> List[str]:
        """Lista todos los calibres disponibles"""
        return list(self.cables.keys())
    
    # ============= MÉTODOS PARA RIC N°4 =============
    
    def get_ric4_ampacity(self, seccion_mm2: str, metodo: str) -> Optional[int]:
        """Obtiene ampacidad según RIC N°4"""
        data = self.ric4.get(seccion_mm2)
        if data:
            return data.get(metodo)
        return None
    
    def find_ric4_conductor(self, current_a: float, metodo: str) -> Tuple[Optional[str], Optional[int], Optional[str]]:
        """Encuentra conductor mínimo según corriente"""
        for seccion, data in self.ric4.items():
            amp = data.get(metodo)
            if amp is not None and amp >= current_a:
                return seccion, amp, data.get("AWG", "-")
        return None, None, None
    
    # ============= MÉTODOS PARA RV-K =============
    
    def get_rvk_ampacity(self, seccion_mm2: str, trazado: str) -> Optional[int]:
        """Obtiene ampacidad según tabla RV-K"""
        data = self.rvk.get(seccion_mm2)
        if data:
            return data.get(trazado)
        return None
    
    def find_rvk_conductor(self, seccion_requerida: float, trazado: str) -> Tuple[Optional[str], Optional[str], Optional[int]]:
        """Encuentra conductor RV-K según sección"""
        for seccion_str in sorted(self.rvk.keys(), key=float):
            if float(seccion_str) >= seccion_requerida:
                data = self.rvk[seccion_str]
                return seccion_str, data.get("AWG"), data.get(trazado)
        return None, None, None
    
    # ============= MÉTODOS PARA ECM =============
    
    def get_ecm_tc(self, compania: str, tension: str, potencia_kva: int, expansion: str) -> Optional[str]:
        """Obtiene relación de TC para ECM"""
        try:
            potencias = sorted(self.ecm_tc[compania][tension].keys())
            kva_key = next((p for p in potencias if p >= potencia_kva), potencias[-1])
            return self.ecm_tc[compania][tension][kva_key].get(expansion, "N/A")
        except (KeyError, IndexError):
            return None
    
    def get_ecm_tp(self, compania: str, tension: str) -> Optional[Dict]:
        """Obtiene datos de TP para ECM"""
        try:
            return self.ecm_tp[compania][tension]
        except KeyError:
            return None
    
    def get_available_companies(self) -> List[str]:
        """Lista compañías disponibles para ECM"""
        return list(self.ecm_tc.keys())
    
    def get_available_voltages(self, compania: str) -> List[str]:
        """Lista tensiones disponibles para una compañía"""
        try:
            return list(self.ecm_tc[compania].keys())
        except KeyError:
            return []
    
    # ============= MÉTODOS PARA BANCO DE CAPACITORES =============
    
    def get_cap_bank_protection(self, kvar: float, icc_level: str) -> Optional[str]:
        """Obtiene protección para banco de capacitores"""
        potencias = sorted(self.cap_protection.keys())
        kva_key = next((p for p in potencias if p >= kvar), potencias[-1])
        data = self.cap_protection.get(kva_key)
        if data:
            return data.get(icc_level)
        return None
    
    def get_cap_bank_cable(self, kvar: float) -> Optional[Dict]:
        """Obtiene cableado para banco de capacitores"""
        potencias = sorted(self.cap_cable.keys())
        kva_key = next((p for p in potencias if p >= kvar), potencias[-1])
        return self.cap_cable.get(kva_key)
    
    def get_cap_bank_specs(self, kvar: float, icc_level: str = "50kA") -> Optional[Dict]:
        """Obtiene especificaciones completas del banco"""
        kvar_key = self._find_nearest_key(self.cap_protection, kvar)
        if kvar_key:
            return {
                "kvar_estandar": kvar_key,
                "interruptor": self.cap_protection[kvar_key].get(icc_level, "N/A"),
                "cable_data": self.cap_cable.get(kvar_key, {})
            }
        return None
    
    # ============= MÉTODOS PARA FUSIBLES =============
    
    def get_cooper_fuse_mt(self, voltage_kv: str, power_kva: float) -> Optional[str]:
        """Obtiene fusible MT Cooper según tensión y potencia"""
        try:
            v_key = "13.8" if "13.2" in voltage_kv else "23"
            potencias = sorted(self.cooper_fuse_mt[v_key].keys())
            kva_key = next((p for p in potencias if p >= power_kva), potencias[-1])
            return self.cooper_fuse_mt[v_key][kva_key]
        except (KeyError, IndexError):
            return None
    
    def get_cooper_fuse_specs(self, voltage_kv: str, fuse_type: str) -> Optional[Dict]:
        """Obtiene especificaciones del fusible Cooper"""
        v_key = "15.5" if "13.2" in voltage_kv else "25.8"
        try:
            return self.cooper_fuse_specs[v_key][fuse_type]
        except KeyError:
            return None
    
    def get_fuse_bt(self, current_a: float) -> Optional[int]:
        """Obtiene fusible BT recomendado"""
        for size in self.fuse_bt_sizes:
            if size >= current_a:
                return size
        return None
    
    def get_breaking_capacity_options(self) -> List[int]:
        """Obtiene opciones de poder de corte"""
        return self.fuse_bt_breaking
    
    # ============= MÉTODOS AUXILIARES =============
    
    def _find_nearest_key(self, dictionary: Dict, value: float) -> Optional[Any]:
        """Encuentra la clave más cercana (por defecto la inmediato superior)"""
        keys = sorted(dictionary.keys())
        for key in keys:
            if key >= value:
                return key
        return keys[-1] if keys else None
    
    def validate_cap_bank(self, kvar: float) -> Tuple[bool, Optional[float]]:
        """Valida si el banco de capacitores está dentro del rango soportado"""
        max_kvar = max(self.cap_protection.keys())
        min_kvar = min(self.cap_protection.keys())
        
        if kvar > max_kvar:
            return False, max_kvar
        if kvar < min_kvar:
            return False, min_kvar
        return True, None
    
    def export_to_json(self, filename: str) -> bool:
        """Exporta todas las bases de datos a JSON"""
        try:
            data = {
                "cables": self.cables,
                "ric4": self.ric4,
                "rvk": self.rvk,
                "ecm_tc": self.ecm_tc,
                "ecm_tp": self.ecm_tp,
                "cap_protection": self.cap_protection,
                "cap_cable": self.cap_cable,
                "cooper_fuse_mt": self.cooper_fuse_mt,
                "cooper_fuse_specs": self.cooper_fuse_specs
            }
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            return True
        except Exception:
            return False


# Instancia global para uso en la aplicación
db_manager = DatabaseManager()# database.py
