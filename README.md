# Clinica Off Road — landing + inscripciones + panel admin

Landing de 2 viewports:

1. **Viewport 1** — toda la info del evento (fecha, predio, precios, almuerzo, incluye, FAQ, contacto).
2. **Viewport 2** — formulario de inscripción en **4 pasos**: persona → moto → alimentación → confirmar.

Stack: **Vite + React**, **Vercel** (hosting estático) y **Firebase** (Firestore + Storage + Auth).
**Sin backend**: no hay funciones serverless ni Node en produccion. El navegador habla directo
con Firebase y la seguridad esta en las **reglas** de Firestore/Storage.

---

## Estructura

```
src/
  components/        Hero.jsx (viewport 1), RegistrationSection.jsx + form-steps.jsx (viewport 2)
  admin/             Admin.jsx (login), ContentEditor.jsx (contenido), Registrations.jsx (inscripciones + CSV)
  lib/               firebase.js, contentRepo.js, registrationsRepo.js, csv.js, validate.js,
                     defaultContent.js (contenido por defecto), useContent.js (suscripcion en vivo)
  styles.css
scripts/             seed.mjs (contenido inicial), check-firebase.mjs (diagnostico),
                     test-validate.mjs (validacion compartida), ssr-smoke.jsx
firestore.rules      permisos de Firestore
storage.rules        permisos de Storage
vercel.json          build estatico + rewrite SPA (/admin)
```

## Puesta en marcha (local)

```bash
npm install
copy .env.example .env     # completa las claves
npm run seed                # opcional: crea content/main con el contenido de ejemplo
npm run dev
```

- Landing: `http://localhost:5173`
- Panel: `http://localhost:5173/admin`

Un solo proceso: no hace falta `vercel dev` ni ningun servidor extra.

## Configuracion de Firebase (una vez)

1. **Authentication** → habilitar el proveedor **Email/Password**.
2. Crear el usuario admin: **Authentication → Users → Add user**. Ese email tiene que estar en
   `VITE_ADMIN_EMAILS` **y** en `firestore.rules` / `storage.rules` (`isAdmin()`).
3. **Firestore Database** → crear la base en modo produccion.
4. **Storage** → habilitar (sirve para la foto de portada). Copiar el nombre del bucket a
   `VITE_FIREBASE_STORAGE_BUCKET`.
5. Deployar las reglas (esto es lo que habilita al panel y las inscripciones):

   ```bash
   npx firebase-tools login
   npx firebase-tools deploy --only firestore:rules,storage:rules
   ```

6. Opcional: baixar una clave de Service Account (Project settings → Service accounts) para
   `npm run seed` y `npm run check:firebase`. **No hace falta en Vercel**: la app no usa secretos.

Sin el paso 5 el panel no puede leer ni guardar, y el formulario devuelve
`Firebase no permitió guardar la inscripción`.

## Deploy en Vercel

```bash
npx vercel           # o conectar el repo en vercel.com
```

En **Settings → Environment Variables** cargar solo las variables `VITE_*` de `.env`:

| Variable | Uso |
| --- | --- |
| `VITE_FIREBASE_API_KEY` | front (publica) |
| `VITE_FIREBASE_AUTH_DOMAIN` | front |
| `VITE_FIREBASE_PROJECT_ID` | front |
| `VITE_FIREBASE_STORAGE_BUCKET` | front |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | front |
| `VITE_FIREBASE_APP_ID` | front |
| `VITE_ADMIN_EMAILS` | emails con acceso a `/admin`, ej: `carbo@gmail.com,otro@mail.com` |

`vercel.json` ya define el build de Vite, el rewrite SPA (para `/admin`) y la cache de `/assets`.
Las variables `FIREBASE_*` (secretos) **no** van a Vercel.

## Como funcionan los datos

| Coleccion | Documento | Escritura | Lectura |
| --- | --- | --- | --- |
| `content` | `main` | admins | publica |
| `registrations` | id = hash de `version\|email` | cualquiera (validado) / admins | solo admins |

- `content/main` guarda textos, fecha, predio, precios, almuerzo, FAQ, contacto, colores y `version`.
- Las inscripciones se escriben directo desde el form: las reglas validan que existan los campos
  obligatorios y que `final.aceptaTerminos` sea `true`. Como el ID se deriva del email y del
  `version`, un mail repetido en el mismo evento vuelve a escribir el mismo documento y las reglas
  lo rechazan → no hay duplicados ni hace falta contador de recibos.
- La foto de portada se sube a Storage en `site/hero.<ext>` y queda publica.
- `useContent` escucha `content/main` con `onSnapshot`: si editas el contenido desde el panel,
  la landing se actualiza sola.
- Cambiar de evento = editar contenido y subir el campo **versión** (de la tarjeta "Marca y evento").
  El `version` separa las inscripciones de ediciones distintas, así que un mismo mail puede
  volver a anotarse para el evento nuevo.

## Panel admin (`/admin`)

- **Contenido**: textos, fecha, predio, precios, almuerzo, FAQ, contacto, hashtags, foto de fondo, colores.
- **Formulario**: textos del form, pasos opcionales (alimentacion / grupo / notas) y opciones de las listas.
- **Inscripciones**: filtros por estado y busqueda, estadisticas (total, pendientes, almuerzo, bebida),
  cambio de estado, borrado, lista para mandar por WhatsApp y **exportar CSV**.

## Seguridad

- La seguridad real son las reglas, no el front: `isAdmin()` exige un token de Firebase Auth con
  email en la lista blanca de `firestore.rules` / `storage.rules`.
- `VITE_ADMIN_EMAILS` solo oculta el panel por UX; si alguien lo saca del `.env`, las reglas lo frenan.
- El publico puede crear inscripciones pero **no** leerlas ni modificarlas.
- El panel solo escribe en `content/main` y en `registrations/<id>`.
- Imagenes: solo admins escriben en `site/`, con limite de 6MB.

## Comandos

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Vite en 5173 |
| `npm run build` | build de produccion en `dist/` |
| `npm run preview` | sirve `dist/` |
| `npm run lint` | ESLint |
| `npm run check` | lint + build |
| `npm test` | prueba la validacion compartida por el form y las reglas |
| `npm run smoke` | renderiza los componentes en Node y chequea textos clave |
| `npm run seed` | crea `content/main` con el contenido de ejemplo |
| `npm run check:firebase` | diagnostico: reglas, content/main, bucket, emails admin |