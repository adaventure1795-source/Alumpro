# Reglas de Configuración y Directrices del Proyecto - Aludev

## Nombre de la Empresa y Aplicación
- El nombre exclusivo de la empresa es **Aludev** (o completo: **Aludev Cancelería & Portones de Aluminio**).
- **MUY IMPORTANTE**: Si el usuario copia y pega retroalimentación, reseñas, o menciones de otras aplicaciones de ejemplo o competidoras en el mercado (como *"Perfil Pro"*, *"Herrajes Pro"*, *"Perfil-fácil"*, etc.), el agente **DEBE REEMPLAZARLAS AUTOMÁTICAMENTE** y adaptar el texto al ecosistema de **Aludev**.
- Bajo ninguna circunstancia se debe cambiar el nombre de la marca o la identidad corporativa de la aplicación a otro nombre que no sea **Aludev**.

## Parámetros Técnicos de Cantidades y Formularios
- Los contadores, cantidades de piezas (`qty`), dimensiones (`width`, `height`), minutos de mano de obra (`laborMinutes`), precios personalizados (`customPrice`), y cualquier cantidad/número modificable en el Cotizador, Notas de Remisión o inventario, deben permitir la edición libre del usuario sin restricciones forzadas que impidan ingresar números de un solo dígito como `1-9`, o números grandes combinados con teclas de control.
- En React, para permitir que el campo de texto de un número esté temporalmente vacío mientras el usuario borra e ingresa un nuevo número (evitando que se fuerce un "1" de inmediato, lo que impide borrar el contenido completo o escribir libremente), se debe manejar un estado de tipo `number | ""` donde el valor vacío se represente como `""`.
