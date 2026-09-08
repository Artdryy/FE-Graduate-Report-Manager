// Extrae el mensaje que el backend ya envia en el cuerpo de la respuesta.
//
// Todas las rutas responden { status, message, data }: las validaciones y las
// reglas de negocio de los procedimientos llegan como 400 con un texto util,
// y los fallos internos como 500 con un mensaje generico. Antes ese texto se
// perdia en un `catch` que solo hacia console.error, asi que un formulario
// rechazado se veia como un boton que no hacia nada.
export const mensajeDeError = (error, respaldo = 'No se pudo completar la operación. Inténtalo de nuevo.') => {
  if (!error) return respaldo;

  const mensaje = error.response?.data?.message;
  if (typeof mensaje === 'string' && mensaje.trim()) return mensaje;

  // Sin respuesta del servidor: la peticion nunca llego (red caida, backend
  // apagado). Conviene distinguirlo de un rechazo del servidor.
  if (error.request && !error.response) {
    return 'No se pudo contactar al servidor. Revisa tu conexión.';
  }

  return error.message || respaldo;
};
