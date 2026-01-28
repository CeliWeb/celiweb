# CeliWeb

Web comunitaria de productos y restaurantes aptos para celíacos.

## Specs v1.0 - MVP

### Stack Tecnológico

| Tecnología | Uso |
|------------|-----|
| Next.js | Framework principal |
| Tailwind CSS | Estilos |
| SQLite | Base de datos |
| Drizzle/Prisma | ORM |
| NextAuth.js | Autenticación social |
| Leaflet + OpenStreetMap | Mapas |
| Nominatim API | Geocoding de direcciones |

---

## Funcionalidades

### 1. Mapa de Restaurantes (Home)

**Ruta:** `/`

- Mapa interactivo con restaurantes aptos para celíacos
- Marcadores con información: nombre, dirección, rating
- Distinción visual entre validados y pendientes:
  - **Validados (≥5 votos):** marcador normal
  - **Pendientes (<5 votos):** marcador con distinción (opacidad/color diferente)
- Usuarios autenticados pueden:
  - Agregar nuevos restaurantes
  - Votar para validar restaurantes existentes

### 2. Buscador de Productos

**Ruta:** `/productos`

- Búsqueda sobre listado CSV oficial (ALG/ANMAT)
- Búsqueda multi-campo:
  - `marca`
  - `nombreFantasia`
  - `denominacionventa`
  - `TipoProducto`
- Case-insensitive
- Búsqueda parcial (no requiere nombre completo)
- CSV se actualiza manualmente

### 3. Autenticación

- Login social via NextAuth.js
- Providers: Google, Apple
- Requerido para:
  - Agregar restaurantes
  - Votar/validar restaurantes

### 4. Sistema de Validación Comunitaria

- Usuarios agregan restaurantes nuevos
- Otros usuarios votan para validar
- **5 votos mínimos** para considerar un restaurante validado
- Restaurantes no validados se muestran pero con distinción visual

---

## Estructura de Datos

### CSV Productos

**Archivo:** `busqueda-listado-alg-27-1-2026.csv`

**Separador:** `;` (punto y coma)

| Columna | Descripción |
|---------|-------------|
| `id` | ID único |
| `rnpa` | Registro Nacional Producto Alimenticio |
| `marca` | Marca comercial |
| `nombreFantasia` | Nombre fantasía |
| `denominacionventa` | Descripción completa del producto |
| `TipoProducto` | Categoría (ej: BARRAS DE CEREAL, SEMILLAS, etc.) |
| `Estado` | Estado del registro (VIGENTE, etc.) |
| `activo` | Sí/No |

### Base de Datos SQLite

```sql
-- Usuarios (manejado principalmente por NextAuth)
users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  name TEXT,
  image TEXT,
  provider TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)

-- Restaurantes agregados por la comunidad
restaurants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  user_id TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
)

-- Votos de validación
votes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  restaurant_id INTEGER NOT NULL,
  user_id TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE(restaurant_id, user_id)
)
```

---

## Estructura del Proyecto

```
/CeliWeb
├── app/
│   ├── page.tsx                 # Home - Mapa de restaurantes
│   ├── layout.tsx               # Layout principal
│   ├── productos/
│   │   └── page.tsx             # Buscador de productos
│   └── api/
│       ├── auth/[...nextauth]/  # NextAuth endpoints
│       ├── restaurants/         # CRUD restaurantes
│       │   ├── route.ts         # GET (listar), POST (crear)
│       │   └── [id]/
│       │       ├── route.ts     # GET, PUT, DELETE individual
│       │       └── vote/
│       │           └── route.ts # POST voto
│       └── products/
│           └── search/
│               └── route.ts     # GET búsqueda productos
├── components/
│   ├── Map.tsx                  # Componente mapa Leaflet
│   ├── RestaurantMarker.tsx     # Marcador restaurante
│   ├── AddRestaurantForm.tsx    # Formulario agregar
│   ├── ProductSearch.tsx        # Buscador productos
│   ├── ProductList.tsx          # Lista resultados
│   └── AuthButton.tsx           # Botón login/logout
├── lib/
│   ├── db.ts                    # Conexión SQLite
│   ├── csv.ts                   # Parser CSV productos
│   └── nominatim.ts             # Cliente geocoding
├── prisma/ (o drizzle/)
│   └── schema.prisma            # Schema DB
├── public/
│   └── markers/                 # Iconos marcadores
├── busqueda-listado-alg-27-1-2026.csv  # Datos productos
├── README.md
└── package.json
```

---

## Rutas

| Ruta | Descripción |
|------|-------------|
| `/` | Home - Mapa de restaurantes |
| `/productos` | Buscador de productos |
| `/api/auth/*` | Endpoints autenticación |
| `/api/restaurants` | API restaurantes |
| `/api/products/search` | API búsqueda productos |

---

## Flujos de Usuario

### Agregar Restaurante
1. Usuario se autentica (Google/Apple)
2. Click en "Agregar restaurante" o en el mapa
3. Ingresa nombre y dirección
4. Dirección se valida con Nominatim API (geocoding)
5. Si es válida, se guarda con coordenadas
6. Aparece en el mapa como "pendiente de validación"

### Validar Restaurante
1. Usuario autenticado ve restaurante en el mapa
2. Click en "Validar" / "Confirmar que existe"
3. Se registra su voto (1 por usuario por restaurante)
4. Al llegar a 5 votos, el restaurante pasa a "validado"

### Buscar Productos
1. Usuario ingresa término de búsqueda
2. Se busca en marca, nombreFantasia, denominacionventa, TipoProducto
3. Se muestran resultados coincidentes
4. No requiere autenticación

---

## Futuras Iteraciones

- [ ] Comentarios en restaurantes
- [ ] Rating de restaurantes (1-5 estrellas)
- [ ] Filtros avanzados en productos (por categoría, marca)
- [ ] Reportar restaurante cerrado/incorrecto
- [ ] Fotos de restaurantes
- [ ] Favoritos del usuario
- [ ] PWA / App móvil

---

## Desarrollo

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local

# Inicializar base de datos
npx prisma db push

# Desarrollo
npm run dev

# Build
npm run build

# Abrir app de desarrollo
Ir a [http://localhost:3000](http://localhost:3000)
```


---

## Variables de Entorno

```env
# Auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Apple OAuth (opcional)
APPLE_ID=
APPLE_SECRET=

# Database
DATABASE_URL=file:./dev.db
```

Este es un projecto que usa [Next.js](https://nextjs.org) bootstrapped con [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).
