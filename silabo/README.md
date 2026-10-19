# Sílabo BI · UTC

Micrositio estático del curso **Sistemas de Información para la Inteligencia de Negocios**. Usa HTML, CSS y JavaScript; Chart.js y html2pdf.js se cargan desde CDN.

## Estructura

- `index.html`: contenido académico y controles semánticos.
- `styles.css`: diseño responsivo, modo oscuro y reglas de impresión A4.
- `script.js`: dashboard, búsqueda, acordeones, enlaces, tema y exportaciones.
- `.nojekyll`: evita el procesamiento Jekyll de la carpeta del sitio.

## Integración y despliegue

1. Copia la carpeta `silabo/` en la raíz del repositorio que publica el portafolio.
2. En el `index.html` principal, añade un enlace relativo como `<a href="./silabo/index.html">Sílabo BI</a>`. En este repositorio el enlace ya está en la portada.
3. Conserva `silabo/.nojekyll` al subir los archivos. El micrositio y sus recursos usan rutas relativas.
4. Publica la rama y carpeta configuradas en **GitHub → Settings → Pages**. Espera a que finalice la acción de despliegue.
5. Abre `https://USUARIO.github.io/REPOSITORIO/silabo/` (o la ruta equivalente para tu dominio) y revisa navegación, gráficos, tema, búsqueda y descargas.

Para probar localmente, abre `silabo/index.html` en el navegador o inicia Live Server desde la raíz del repositorio.

## Mantenimiento

- Edita los textos del curso directamente en `index.html`; esta página es la fuente del contenido exportado.
- Los datos de horas y series de los gráficos están en `script.js`. No se especifican horas autónomas por tema cuando el sílabo no las indica.
- Los puntajes iniciales de habilidades son simbólicos; el lector puede modificarlos con los controles y se conservan en su navegador.
- El modo claro/oscuro y los puntajes editados se guardan localmente en el navegador.
- Imprimir usa la hoja A4; Exportar PDF usa html2pdf.js y Exportar Word descarga un `.doc` compatible con Microsoft Word.
- Chart.js, html2pdf.js, Font Awesome y Google Fonts requieren conexión a internet. Si Chart.js no carga, se conserva el resumen textual de horas.
