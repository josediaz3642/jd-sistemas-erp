import { defineStore } from 'pinia';
import { supabase } from '@/supabase';

export const useSubscriptionStore = defineStore('subscription', {
  state: () => ({
    suscripcion: null,
    loading: true,
    allSuscripciones: [] // Para admin
  }),

  getters: {
    diasRestantes(state) {
      if (!state.suscripcion?.fecha_vencimiento) {
        // Use local storage to track trial start date and correctly count down
        const userStr = localStorage.getItem("contasoft_user_sesion");
        if (!userStr) return 30;
        const eid = JSON.parse(userStr).empresa_id;
        let trialStartStr = localStorage.getItem(`trial_start_${eid}`);
        if (!trialStartStr) {
          trialStartStr = new Date().toISOString();
          localStorage.setItem(`trial_start_${eid}`, trialStartStr);
        }
        const diff = 30 - Math.floor((new Date() - new Date(trialStartStr)) / (1000 * 60 * 60 * 24));
        return Math.max(diff, 0);
      }
      const hoy = new Date();
      const venc = new Date(state.suscripcion.fecha_vencimiento);
      const diff = Math.ceil((venc - hoy) / (1000 * 60 * 60 * 24));
      return Math.max(diff, 0);
    },
    estaActiva(state) {
      if (!state.suscripcion) return true; // Default: activa si no hay registro
      return this.diasRestantes > 0 && state.suscripcion.estado !== 'suspendida';
    },
    estadoDisplay(state) {
      if (!state.suscripcion) return 'trial';
      if (state.suscripcion.estado === 'suspendida') return 'suspendida';
      if (this.diasRestantes <= 0) return 'vencida';
      return state.suscripcion.estado;
    }
  },

  actions: {
    async fetchSuscripcion(empresaId) {
      this.loading = true;
      try {
        const { data, error } = await supabase
          .from('suscripciones')
          .select('*')
          .eq('empresa_id', empresaId)
          .order('created_at', { ascending: false })
          .maybeSingle();
        
        if (error) console.warn('Suscripciones table may not exist yet:', error.message);
        this.suscripcion = data || null;
      } catch (err) {
        console.error('Error fetching suscripcion:', err);
      } finally {
        this.loading = false;
      }
    },

    // Admin: cargar todas las suscripciones
    async fetchAllSuscripciones() {
      try {
        const { data: empresas } = await supabase
          .from('empresas')
          .select('*');

        const { data: subs } = await supabase
          .from('suscripciones')
          .select('*');

        // Merge
        this.allSuscripciones = (empresas || []).map(emp => {
          const sub = (subs || []).find(s => s.empresa_id === emp.id);
          return {
            ...emp,
            suscripcion: sub || null,
            dias_restantes: sub ? Math.max(0, Math.ceil((new Date(sub.fecha_vencimiento) - new Date()) / (1000*60*60*24))) : null,
            estado_sub: sub ? (sub.estado === 'suspendida' ? 'suspendida' : (Math.ceil((new Date(sub.fecha_vencimiento) - new Date()) / (1000*60*60*24)) <= 0 ? 'vencida' : sub.estado)) : 'sin_plan'
          };
        });
      } catch (err) {
        console.error('Error fetching all subs:', err);
      }
    },

    // Admin: extender/reducir días
    async modificarDias(empresaId, dias) {
      const { data: sub } = await supabase
        .from('suscripciones')
        .select('*')
        .eq('empresa_id', empresaId)
        .maybeSingle();

      if (sub) {
        const nuevaFecha = new Date(sub.fecha_vencimiento);
        nuevaFecha.setDate(nuevaFecha.getDate() + dias);
        
        await supabase
          .from('suscripciones')
          .update({ fecha_vencimiento: nuevaFecha.toISOString() })
          .eq('id', sub.id);
      } else {
        // Crear nueva suscripción
        const fecha = new Date();
        fecha.setDate(fecha.getDate() + dias);
        
        await supabase.from('suscripciones').insert([{
          empresa_id: empresaId,
          fecha_vencimiento: fecha.toISOString(),
          estado: 'activa',
          precio_mensual: 14990
        }]);
      }
      
      await this.fetchAllSuscripciones();
    },

    // Admin: cambiar estado
    async cambiarEstado(subId, estado) {
      await supabase
        .from('suscripciones')
        .update({ estado })
        .eq('id', subId);
      await this.fetchAllSuscripciones();
    },

    // Admin: cambiar precio
    async cambiarPrecio(subId, precio) {
      await supabase
        .from('suscripciones')
        .update({ precio_mensual: precio })
        .eq('id', subId);
      await this.fetchAllSuscripciones();
    },

    // Admin: eliminar suscripcion
    async deleteSuscripcion(subId) {
      await supabase
        .from('suscripciones')
        .delete()
        .eq('id', subId);
      await this.fetchAllSuscripciones();
    }
  }
});
