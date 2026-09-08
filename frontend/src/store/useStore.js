import { create } from 'zustand';

// Parsear usuario guardado si existe
let initialUser = null;
try {
  const savedUser = localStorage.getItem('user');
  if (savedUser) initialUser = JSON.parse(savedUser);
} catch (e) {
  initialUser = null;
}

const useStore = create((set) => ({
  // Usuario y Sesión
  token: localStorage.getItem('token') || null,
  user: initialUser,
  setToken: (token, user = null) => {
    if (token) {
      localStorage.setItem('token', token);
      if (user) localStorage.setItem('user', JSON.stringify(user));
      set({ token, user: user || null });
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({ token: null, user: null });
    }
  },
  setUser: (user) => {
    if (user) localStorage.setItem('user', JSON.stringify(user));
    else localStorage.removeItem('user');
    set({ user });
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ token: null, user: null });
  },

  // Tab 1: Malla
  mallaInputs: {
    rho1: 37.0,
    h1: 0.44,
    rho2: 185.0,
    h2: 2.20,
    rho3: 24.0,
    largo_A: 5.0,
    ancho_B: 4.0,
    profundidad_h: 0.6,
    n_conductores_A: 5,
    n_conductores_B: 6,
    radio_conductor_m: 0.0032,
    L_R_barras: 0
  },
  mallaResults: null,
  setMallaInputs: (inputs) => set({ mallaInputs: inputs }),
  setMallaResults: (res) => set({ mallaResults: res }),

  // Tab 2: Trafo
  trafoInputs: { S_kva: 500, V_ll: 380, ucc_pct: 4.5, V_mt_kv: 13.2, fp: 0.90 },
  trafoResults: null,
  setTrafoInputs: (inputs) => set({ trafoInputs: inputs }),
  setTrafoResults: (res) => set({ trafoResults: res }),

  // Tab 3: Alimentador
  alimInputs: { V_ll: 380, S_kva: 500, ucc_pct: 4.5, R_malla: 4.18, R_linea_ohm_km: 0.387, X_linea_ohm_km: 0.08, longitud_m: 50.0, I_nom_bt: 759.6 },
  alimResults: null,
  setAlimInputs: (inputs) => set({ alimInputs: inputs }),
  setAlimResults: (res) => set({ alimResults: res }),

  // Tab 4: Tensiones
  tensionesInputs: { rho_s: 3000, hs: 0.10, ts: 0.5, I_falla: 5000 },
  tensionesResults: null,
  setTensionesInputs: (inputs) => set({ tensionesInputs: inputs }),
  setTensionesResults: (res) => set({ tensionesResults: res }),

  // Tab 5: Seccion
  seccionInputs: { I_falla: 5000, ts: 0.5, material: "Cobre recocido sólido" },
  seccionResults: null,
  setSeccionInputs: (inputs) => set({ seccionInputs: inputs }),
  setSeccionResults: (res) => set({ seccionResults: res }),

  // Tab 6: Capacitores
  capInputs: { potencia_kw: 150, fp_actual: 0.75, fp_objetivo: 0.95, V_servicio: 380 },
  capResults: null,
  setCapInputs: (inputs) => set({ capInputs: inputs }),
  setCapResults: (res) => set({ capResults: res })
}));

export default useStore;