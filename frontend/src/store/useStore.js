import { create } from 'zustand';

const useStore = create((set) => ({
  // Tab 1
  mallaInputs: {
    strata: [{ rho: 100, h: 1 }],
    largo_A: 10,
    ancho_B: 10,
    n_conductores_A: 3,
    n_conductores_B: 3,
    profundidad_h: 0.6,
    radio_conductor_m: 0.005,
    largo_total_L: 60,
    area_S: 100,
  },
  mallaResults: null,
  setMallaInputs: (inputs) => set({ mallaInputs: inputs }),
  setMallaResults: (res) => set({ mallaResults: res }),

  // Tab 2
  trafoInputs: { S_kva: 500, V_ll: 380, ucc_pct: 4.5, V_mt_kv: 12 },
  trafoResults: null,
  setTrafoInputs: (inputs) => set({ trafoInputs: inputs }),
  setTrafoResults: (res) => set({ trafoResults: res }),

  // Auth
  token: localStorage.getItem('token') || null,
  setToken: (token) => {
    if(token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
    set({ token });
  },
  
  // Agregar aqui los de alimentador, tensiones, etc.
}));

export default useStore;