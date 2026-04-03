import { supabase } from './supabase'; // Asegúrate de que la ruta a tu cliente supabase sea correcta

export const ajustesService = {
  /**
   * Registra una nueva Nota de Crédito o Débito
   */
  async registrarNota({ clienteId, tipo, monto, motivo, esProveedor = false }) {
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('notas_ajuste')
      .insert([
        {
          perfil_id: clienteId,
          tipo_comprobante: tipo, // 'NC' o 'ND'
          entidad_tipo: esProveedor ? 'proveedor' : 'cliente',
          monto: parseFloat(monto),
          motivo: motivo,
          creado_por: user?.id
        }
      ])
      .select();

    if (error) throw error;
    return data[0];
  },

  /**
   * Obtiene el historial de ajustes de un cliente específico
   */
  async obtenerHistorial(clienteId) {
    const { data, error } = await supabase
      .from('notas_ajuste')
      .select('*')
      .eq('perfil_id', clienteId)
      .order('fecha', { ascending: false });

    if (error) throw error;
    return data;
  }
};