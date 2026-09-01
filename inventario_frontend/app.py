import sqlite3
from flask import Flask, render_template, request, redirect, url_for

app = Flask(__name__)
DATABASE = "inventario.db"

def conectar_bd():
    conexion = sqlite3.connect(DATABASE)
    conexion.row_factory = sqlite3.Row
    return conexion

def crear_tabla():
    conexion = conectar_bd()
    conexion.execute("""
        CREATE TABLE IF NOT EXISTS productos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            categoria TEXT NOT NULL,
            precio REAL NOT NULL,
            stock INTEGER NOT NULL,
            proveedor TEXT NOT NULL DEFAULT 'Sin Proveedor'
        )
    """)
    conexion.commit()
    conexion.close()

@app.route("/")
def inicio():
    conexion = conectar_bd()
    productos = conexion.execute(
        "SELECT * FROM productos ORDER BY id DESC"
    ).fetchall()
    conexion.close()
    return render_template("index.html", productos=productos)

@app.route("/agregar", methods=["POST"])
def agregar():
    nombre = request.form["nombre"]
    categoria = request.form["categoria"]
    precio = float(request.form["precio"])
    stock = int(request.form["stock"])
    proveedor = request.form.get("proveedor", "Sin Proveedor")

    conexion = conectar_bd()
    conexion.execute(
        "INSERT INTO productos (nombre, categoria, precio, stock, proveedor) VALUES (?, ?, ?, ?, ?)",
        (nombre, categoria, precio, stock, proveedor)
    )
    conexion.commit()
    conexion.close()
    return redirect(url_for("inicio"))

@app.route("/eliminar/<int:id>")
def eliminar(id):
    conexion = conectar_bd()
    conexion.execute("DELETE FROM productos WHERE id = ?", (id,))
    conexion.commit()
    conexion.close()
    return redirect(url_for("inicio"))

if __name__ == "__main__":
    crear_tabla()
    app.run(debug=True)