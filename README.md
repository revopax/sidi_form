# Formulario Offline SIDI

Aplicacion web para capturar registros en tablets y laptops aunque no haya internet. Los datos se guardan localmente en el dispositivo y se sincronizan con un formulario de HubSpot cuando vuelve la conexion.

## Configuracion

1. La conexion con HubSpot esta en `.env.production`, versionado en el repositorio porque ambos IDs son publicos (viajan en el JavaScript del navegador). Para desarrollo local se usa `.env.local` con los mismos valores:

```bash
VITE_HUBSPOT_PORTAL_ID=24172997
VITE_HUBSPOT_FORM_ID=a2964f29-32d5-4612-9507-1302147f047e
```

2. Los campos en `src/formConfig.ts` estan mapeados a estas propiedades de HubSpot:

- `firstname`: Nombre
- `lastname`: Apellidos
- `email`: Correo corporativo
- `hs_whatsapp_phone_number`: Numero de WhatsApp

El campo `email` valida formato y bloquea dominios personales comunes para aceptar solo correos corporativos. La lista se puede ampliar en `src/lib/emailValidation.ts`.

## Desarrollo

```bash
npm install
npm run dev
```

## Produccion

```bash
npm run build
npm run preview
```

Vercel toma la configuracion de `.env.production` al compilar; no hace falta definir variables en el proyecto. Si se definen en Vercel, tienen prioridad sobre el archivo.

## Uso En El Evento

### Importante: la primera carga debe ser con internet

El formulario solo funciona sin conexion despues de haberse abierto al menos una vez con internet en cada dispositivo. En esa primera carga el navegador descarga y guarda la aplicacion, el fondo y el icono. A partir de ese momento se pueden capturar registros sin conexion.

Cada dispositivo guarda sus propios registros pendientes; no se comparten entre dispositivos.

### Instalar el icono en cada dispositivo

Antes de instalar, abre la URL del formulario con internet y espera a que cargue por completo.

**iPad / iPhone (Safari)**

1. Abre la URL del formulario en Safari (no funciona desde Chrome en iOS).
2. Toca el boton de compartir (cuadro con flecha hacia arriba).
3. Selecciona `Agregar a pantalla de inicio`.
4. Confirma con `Agregar`.

**Android (Chrome)**

1. Abre la URL del formulario en Chrome.
2. Toca el menu de tres puntos en la esquina superior derecha.
3. Selecciona `Instalar aplicacion` o `Agregar a pantalla principal`.
4. Confirma con `Instalar`.

**Laptop / Desktop (Chrome o Edge)**

1. Abre la URL del formulario en Chrome o Edge.
2. Haz clic en el icono de instalar que aparece al final de la barra de direcciones, o abre el menu del navegador y selecciona `Instalar Registro SIDI`.
3. Confirma con `Instalar`. La app se abre en su propia ventana y queda disponible en el escritorio o menu de aplicaciones.

En Safari para Mac usa `Archivo > Agregar al Dock`.

### Antes del evento

1. Instala el icono en cada dispositivo siguiendo los pasos anteriores.
2. Abre la app desde el icono con internet una vez mas para confirmar que carga.
3. Haz una prueba sin conexion: activa modo avion (o apaga el Wi-Fi), abre la app desde el icono y captura un registro de prueba.
4. Vuelve a conectar internet, deja la app abierta unos segundos y confirma que el registro aparece en HubSpot.

### Durante el evento

- Abre siempre el formulario desde el icono instalado.
- Los asistentes solo ven el formulario; al enviar aparece un mensaje de confirmacion aunque no haya internet.
- Los registros se guardan en el dispositivo y se envian a HubSpot automaticamente al abrir la app, al recuperar la conexion y cada minuto mientras la app este abierta.

### Despues del evento

1. Conecta cada dispositivo a internet.
2. Abre la app desde el icono y dejala abierta un par de minutos para que envie los registros pendientes.
3. Verifica en HubSpot que las submissions del evento aparezcan completas.
4. No borres los datos del navegador ni desinstales la app hasta confirmar que todos los registros llegaron a HubSpot; los registros pendientes se perderian.
