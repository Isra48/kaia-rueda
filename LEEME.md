# Rueda estacional KAIA

- `index.html`: demo. `kaia-rueda.js`: componente completo, un solo archivo (incluye imágenes).
- Editar en `src/` y empaquetar con `python3 build.py`.

## Incrustar

    <kaia-rueda lat="20.63" lon="-87.08" tz="America/Cancun" lugar="Riviera Maya"></kaia-rueda>
    <script src="kaia-rueda.js" defer></script>

Agregar el atributo `controles` muestra el panel de previsualización.
El fondo es un color plano por estación (variables `--bg` en el CSS).
La tipografía se define con la variable CSS `--kaia-font`.
