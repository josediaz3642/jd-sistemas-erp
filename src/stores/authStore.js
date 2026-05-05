import { defineStore } from 'pinia';
import { supabase } from '@/supabase';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    empresa: null,
    loading: true,
    mobileMenuOpen: false
  }),
  actions: {
    toggleMobileMenu() {
      this.mobileMenuOpen = !this.mobileMenuOpen;
    },
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
          
          if (!data) {
            // Primer login, crear empresa
            const newEmpresa = {
              id: this.user.id,
              razon_social: this.user.user_metadata?.nombre || 'Mi Empresa',
              cuit: '00000000000',
              condicion_iva: 'Responsable Inscripto'
            };
            const { error: insErr } = await supabase.from('empresas').insert([newEmpresa]);
            if (insErr) console.error("⚠️ Error al crear perfil de empresa:", insErr);
            this.empresa = newEmpresa;
            
            // Crear registro en la tabla de usuarios públicos para que aparezca en el listado
            const newUsuario = {
              id: this.user.id,
              nombre: this.user.user_metadata?.nombre || 'Dueño/Admin',
              email: this.user.email,
              password: 'login-via-auth',
              rol: 'admin',
              empresa_id: this.user.id,
              estado: 'activo',
              accesos: ['Dashboard', 'Ventas', 'Stock', 'Clientes', 'Proveedores', 'Remitos', 'Cheques', 'Caja', 'Reportes', 'Ajustes']
            };
            await supabase.from('usuarios').insert([newUsuario]);
            
          } else {
            this.empresa = data;
          }
          
          // Guardar en localStorage para compatibilidad con data.js
          localStorage.setItem("contasoft_user_sesion", JSON.stringify({ empresa_id: this.user.id }));
        } else {
          localStorage.removeItem("contasoft_user_sesion");
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
        options: {
          data: { nombre }
        }
      });

      if (error) throw error;
      
      // Ya no insertamos en empresas aquí, porque sin confirmar el email no hay sesión 
      // y daría error 401 por RLS. Se creará automáticamente en fetchSession() al loguearse.

      await this.fetchSession();
    },

    // --- 4. CERRAR SESIÓN ---
    async logout() {
      await supabase.auth.signOut();
      this.user = null;
      this.empresa = null;
      localStorage.removeItem("contasoft_user_sesion");
      // Opcional: router.push('/login')
    },

    // --- 5. RECUPERAR CONTRASEÑA ---
    async resetPassword(email) {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/perfil',
      });
      return { data, error };
    }
  }
});