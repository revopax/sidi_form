# Formulario Offline SIDI

Aplicacion web para capturar registros en tablets y laptops aunque no haya internet. Los datos se guardan localmente en el dispositivo y se sincronizan con un formulario de HubSpot cuando vuelve la conexion.

## Configuracion

1. Configura las variables en `.env.local`:

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

Para Vercel, configura las mismas variables de entorno en el proyecto y despliega el repositorio.

## Uso En El Evento

- Abre el enlace de Vercel en cada dispositivo antes del evento para que la app quede cacheada.
- Haz una prueba con Wi-Fi apagado para confirmar que el formulario carga y guarda registros.
- Cuando vuelva internet, la app sincronizara automaticamente en segundo plano.
