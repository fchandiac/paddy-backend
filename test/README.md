# Estructura de tests

- Cada entidad o módulo tiene su propia carpeta bajo `test/`.
- Los tests e2e, integración y unitarios deben ubicarse aquí, nunca en `src/`.
- Ejemplo de estructura:

```
test/
  auth/
    user/
      user.e2e-spec.ts
    producer/
      producer.e2e-spec.ts
  receptions/
    riceType/
      riceType.e2e-spec.ts
    discountsPercent/
      discountsPercent.e2e-spec.ts
    template/
      template.e2e-spec.ts
    reception/
      receptions.e2e-spec.ts
  transactions/
    transaction/
      transaction.e2e-spec.ts
    transactionReference/
      transactionReference.e2e-spec.ts
  audit/
    audit.e2e-spec.ts
```

Ajusta la configuración de Jest para que busque los tests en `test/` en vez de `src/`.
