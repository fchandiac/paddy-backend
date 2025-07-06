# Sistema de Auditoría - Guía de Uso

## Implementación Completada

El sistema de auditoría ha sido implementado con los siguientes componentes:

### 📁 Archivos Creados:

1. **Entidad**: `libs/entities/audit-log.entity.ts`
2. **Interceptor**: `src/common/interceptors/audit.interceptor.ts`
3. **Servicio**: `src/audit/audit.service.ts`
4. **Controlador**: `src/audit/audit.controller.ts`
5. **Módulo**: `src/audit/audit.module.ts`
6. **Migración**: `src/migrations/1736163600000-CreateAuditLogTable.ts`

### 🔧 Configuración Necesaria:

1. **Ejecutar la migración**:
   ```bash
   npm run typeorm:run-migrations
   ```

2. **El módulo ya está registrado** en `app.module.ts`

### 🎯 Uso Automático con Decoradores:

```typescript
import { Audit } from '../common/interceptors/audit.interceptor';

@Controller('receptions')
@UseInterceptors(AuditInterceptor)
export class ReceptionController {
  
  @Post()
  @Audit('CREATE', 'RECEPTION', 'Crear nueva recepción')
  create(@Body() dto: CreateReceptionDto) {
    return this.receptionService.create(dto);
  }

  @Patch(':id')
  @Audit('UPDATE', 'RECEPTION', 'Actualizar recepción')
  update(@Param('id') id: number, @Body() dto: UpdateReceptionDto) {
    return this.receptionService.update(id, dto);
  }
}
```

### 🔍 Uso Manual del Servicio:

```typescript
import { AuditService } from '../audit/audit.service';

@Injectable()
export class AuthService {
  constructor(private readonly auditService: AuditService) {}

  async login(email: string, request: any) {
    // En caso de login exitoso:
    await this.auditService.createAuditLog({
      userId: user.id,
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
      action: 'LOGIN',
      entityType: 'SYSTEM',
      description: \`Usuario \${user.email} inició sesión\`,
      success: true,
    });

    // En caso de error:
    await this.auditService.createAuditLog({
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
      action: 'LOGIN',
      entityType: 'SYSTEM',
      description: 'Intento de login fallido',
      success: false,
      errorMessage: 'Credenciales inválidas',
    });
  }
}
```

### 📊 Endpoints de Consulta:

- `GET /audit` - Lista logs con filtros
- `GET /audit/stats` - Estadísticas de auditoría
- `GET /audit/user/:userId` - Logs de un usuario
- `GET /audit/entity/:entityType/:entityId` - Logs de una entidad
- `GET /audit/cleanup/:days` - Limpiar logs antiguos

### 🎮 Ejemplos de Consulta:

```bash
# Obtener logs de los últimos 7 días
GET /audit?startDate=2025-06-30&endDate=2025-07-06

# Obtener solo operaciones de CREATE
GET /audit?action=CREATE

# Obtener logs de recepciones
GET /audit?entityType=RECEPTION

# Obtener estadísticas de los últimos 30 días
GET /audit/stats?days=30

# Obtener logs de un usuario específico
GET /audit/user/1

# Obtener historial de una recepción específica
GET /audit/entity/RECEPTION/123
```

### 📋 Tipos de Acciones Soportadas:

- `LOGIN` - Inicio de sesión
- `LOGOUT` - Cierre de sesión
- `CREATE` - Creación de entidades
- `UPDATE` - Actualización de entidades
- `DELETE` - Eliminación de entidades
- `VIEW` - Visualización de datos
- `EXPORT` - Exportación de datos
- `IMPORT` - Importación de datos

### 🏷️ Tipos de Entidades Soportadas:

- `USER` - Usuarios
- `PRODUCER` - Productores
- `RECEPTION` - Recepciones
- `RICE_TYPE` - Tipos de arroz
- `TEMPLATE` - Plantillas
- `TRANSACTION` - Transacciones
- `DISCOUNT_PERCENT` - Rangos de descuento
- `SYSTEM` - Operaciones del sistema

### 🛡️ Características de Seguridad:

1. **Sanitización automática** de campos sensibles (password, token, etc.)
2. **Tracking de IP y User-Agent**
3. **Registro de errores** sin afectar la operación principal
4. **Índices optimizados** para consultas rápidas
5. **Limpieza automática** de logs antiguos

### ⚡ Próximos Pasos:

1. Ejecutar la migración para crear la tabla
2. Agregar decoradores @Audit() a más controladores
3. Implementar middleware de autenticación para capturar usuarios
4. Crear dashboard en frontend para visualizar logs
5. Configurar alertas para acciones críticas

### 🔄 Aplicar a Otros Controladores:

Para agregar auditoría a otros controladores, simplemente:

1. Importar el interceptor y decorador
2. Agregar `@UseInterceptors(AuditInterceptor)` a nivel de clase
3. Agregar `@Audit(action, entityType, description)` a cada método

Ejemplo para RiceType:
```typescript
@Controller('rice-types')
@UseInterceptors(AuditInterceptor)
export class RiceTypeController {
  
  @Post()
  @Audit('CREATE', 'RICE_TYPE', 'Crear tipo de arroz')
  create(@Body() dto: CreateRiceTypeDto) {
    return this.riceTypeService.create(dto);
  }
}
```
