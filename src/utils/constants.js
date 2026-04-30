export const CONDICIONES_IVA = [
  'Responsable Inscripto',
  'Monotributo',
  'Consumidor Final',
  'Exento',
  'Sujeto No Categorizado'
];

export const METODOS_PAGO = [
  { id: 'EFECTIVO', label: 'Efectivo', icon: '💵' },
  { id: 'TRANSFERENCIA', label: 'Transferencia Bancaria', icon: '🏦' },
  { id: 'MERCADO_PAGO', label: 'Mercado Pago (Transferencia)', icon: '📱' },
  { id: 'QR_MERCADO_PAGO', label: 'QR Mercado Pago', icon: '📷' },
  { id: 'NARANJA_X', label: 'Naranja X', icon: '💳' },
  { id: 'TARJETA_CREDITO', label: 'Tarjeta de Crédito', icon: '💳' },
  { id: 'TARJETA_DEBITO', label: 'Tarjeta de Débito', icon: '💳' },
  { id: 'CHEQUE', label: 'Cheque', icon: '📝' }
];

export const TIPOS_COMPROBANTE = ['Factura A', 'Factura B', 'Factura C', 'Remito X', 'Presupuesto'];