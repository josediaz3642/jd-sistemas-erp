import { defineStore } from 'pinia';
import { supabase } from '@/supabase';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    empresa: null,
    loading: true
  }),
  actions: {
    // --- 1. VERIFICAR SESIÓN ACTIVA ---
    async fetchSession() {
      this.loading = true;
      try {
        const { data: { session } } = await supabase.auth.getSession();
        this.user = session?.user || null;
        
        if (this.user) {
          const { data, error } = await supabase
            .from('empresas')
            .select('*')
            .eq('id', this.user.id)
            .maybeSingle(); 
          
          if (error) console.error("⚠️ Error buscando datos de empresa:", error);
          this.empresa = data || null;
        }
      } catch (err) {
        console.error("Error en fetchSession:", err);
      } finally {
        this.loading = false;
      }
    },

    // --- 2. INICIAR SESIÓN ---
    async login(email, password) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error("Error Login:", error.message);
        throw error;
      }
      
      await this.fetchSession();
    },

    // --- 3. REGISTRO ---
    async register(email, password, nombre) {
      // 1. Registro en Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      // 2. Creación de empresa vinculada
      if (data.user) {
        const { error: empError } = await supabase.from('empresas').insert([{
          id: data.user.id,
          razon_social: nombre,
          cuit: '00000000000',
          condicion_iva: 'Responsable Inscripto'
        }]);

        if (empError) console.error("⚠️ Error al crear perfil de empresa:", empError);
      }

      await this.fetchSession();
    },

    // --- 4. CERRAR SESIÓN ---
    async logout() {
      await supabase.auth.signOut();
      this.user = null;
      this.empresa = null;
      localStorage.removeItem("contasoft_user_sesion");
      // Opcional: router.push('/login')
    }
  }
});