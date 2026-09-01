// BUSCADOR DE PRODUCTOS
const buscador = document.getElementById("buscar");

if (buscador) {
    buscador.addEventListener("keyup", function () {
        let texto = buscador.value.toLowerCase();
        let filas = document.querySelectorAll("#tablaProductos tbody tr");

        filas.forEach(function (fila) {
            let contenido = fila.textContent.toLowerCase();
            if (contenido.includes(texto)) {
                fila.style.display = "";
            } else {
                fila.style.display = "none";
            }
        });
    });
}

// CONFIRMAR ELIMINACIÓN
function confirmarEliminacion() {
    return confirm("¿Está seguro de eliminar este producto?");
}