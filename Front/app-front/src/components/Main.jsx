import React, { useState, useEffect } from "react";
import logo from '../images/logoplexustrans.png';
import '../styles/Main.css';
import { useNavigate } from "react-router-dom";
import { FaSignOutAlt } from 'react-icons/fa';//icono para salir sesion
import { FiDownload, FiTrash2 } from 'react-icons/fi';//icono para descargar y eliminar archivos


function Main() {
  const [archivos, setArchivos] = useState([]);
  const [usuario, setUsuario] = useState("Usuario"); //nombre de usuario
  const [rol, setRol] = useState('');//rol del usuario
  const navegarA = useNavigate();
  const [seccionActiva, setSeccionActiva] = useState("listado");//creando secciones barra nav
  const [selectedFile, setSelectedFile] = useState(null);//selecionar archivos para subir
  const [mensajeExito, setMensajeExito] = useState(''); //mensaje de éxito subir archivos
  const [mensajeError, setMensajeError] = useState(''); //mensaje de error subir archivo
  const [cargando, setCargando] = useState(false); //saber si se está cargando
  const [progreso, setProgreso] = useState(0); //progreso de la carga
  const [chiste, setChiste] = useState('');//mostrar un el chiste de la api


  //cargar los datos iniciales, si se inicia bien la sesion y guardar el nomrbe del usuario y rol
  useEffect(() => {
    const nombreUsuario = sessionStorage.getItem('usuario');//recupera el nombre del usuario almacenado y actualiza el estado
    const rolUsuario = sessionStorage.getItem('rol');//recupera el rol
    if(nombreUsuario) {
      setUsuario(nombreUsuario);
    }
    if(rolUsuario){
      setRol(rolUsuario); 
    } 
    else {
      navegarA("/");//si no hay nombre de usuario,redirige a login
    }
    //funcion para cargar y ver los archivos
    const cargarArchivos = async () => {
      const response = await fetch('http://localhost:3001/archivos');
      const data = await response.json();
      console.log(data);
      setArchivos(data);
    };

    cargarArchivos();
  }, [navegarA]);

  //funcion salir limpiar todo volver al login
  const handleLogout = () => {
    //limpia los datos de sesesio y sale a /
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("sesion");
    sessionStorage.removeItem("usuario");
    sessionStorage.removeItem("rol");
    setSeccionActiva("listado");
    navegarA("/");
  };

  //funcion para descargar archivos
  const descargarArchivo = (uuid) => {
    //URL de descarga de mi api
    const urlDescarga = `http://localhost:3001/descargar/${uuid}`;
    
    //redirige al navegador a la URL de descarga
    window.open(urlDescarga, '_blank');
  };

  //funcion para eliminar archivos
  const eliminarArchivo = async (uuid) => {
    let confirmarEliminar = true;

    if (rol !== 'admin'){
      confirmarEliminar = window.confirm("¿Estás seguro que quieres eliminar?");
    }

    if (confirmarEliminar){

      try {
        //solicitud DELETE al endpoint de eliminación
        const urlEliminar = `http://localhost:3001/archivos/${uuid}`;
        const response = await fetch(urlEliminar, {
          method: 'DELETE'
        });
    
        //si la eliminación fue exitosa
        if (response.ok) {
          //elimina el archivo del estado si la API retorna una respuesta exitosa
          setArchivos(prevArchivos => prevArchivos.filter(archivo => archivo.uuid !== uuid));
        } else {
          //maneja posibles errores, como que el archivo no exista o problemas de servidor
          console.error("Error al eliminar el archivo:", response.statusText);
        }
      } catch (error) {
        //maneja errores de red
        console.error("Error al intentar comunicarse con el servidor:", error);
      }
    }
  };

  //SUBIR ARCHIVOS
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files);//guarda todos los archivos
  };

  //funcion subir archivos
  const handleFileUpload = async (event) => {
    event.preventDefault();

    if (!selectedFile || selectedFile.length ===0) {
      setMensajeError("Por favor, selecciona un archivo al menos");
      return;
    }
  
    setCargando(true);
    setProgreso(0);
    
    const formData = new FormData();
    Array.from(selectedFile).forEach(file => {
      formData.append('subir', file);
    });

    const token = sessionStorage.getItem("token");//obtener el token del almacenamiento sesion
  
    try {
      const response = await fetch('http://localhost:3001/subir-archivo', {
        method: 'POST',
        headers: {
          "Authorization": "Bearer " + token  //incluye el token en el encabezado de autorizacion
        },
        body: formData,
      });
  
      if (response.ok) {
        await new Promise(resolve => setTimeout(resolve, 2000));//simular tiempo carga
        setProgreso(100);
        const result = await response.json();
        console.log(result);
        setMensajeExito("Éxito!");
        setChiste(result.chiste);
        cargarArchivos(); //actulizar la lista de archivos
        setSelectedFile(null);
      } else {
        setMensajeError("Error al subir el archivo.");
      }
    } catch (error) {
      console.error("Error al subir el archivo:", error);
      setMensajeError("Error al subir el archivo.");
    } finally {
      //ejcuta despues de la carga
      setTimeout(() => {
        setCargando(false);
        setProgreso(0);
        setMensajeExito("");
        setMensajeError(""); //limpiar los mensajes en un tiempo
      }, 3000);
    }
  };

  //efecto para limpiar el mensaje de éxito/error después de un tiempo
  useEffect(() => {
    if (mensajeExito !== '' || mensajeError !== '') {
      const timer = setTimeout(() => {
        setMensajeExito('');
        setMensajeError('');
      }, 3500); //milisegundos
      return () => clearTimeout(timer);
    }
  }, [mensajeExito, mensajeError]); //se ejecuta cada vez que cambian

  //efecto para limpiar el mensaje del chiste
  useEffect(() => {
    if (chiste!=='') {
      const timer = setTimeout(() => {
        setChiste('');
      }, 12500); //milisegundos
      return () => clearTimeout(timer);
    }
  }, [chiste]); //se ejecuta cada vez que cambian

  //funcion para recargar la pagina y recargar los archivos con cambio de seccion
  const cargarArchivos = async () => {
    try {
      const response = await fetch('http://localhost:3001/archivos');
      const data = await response.json();
      setArchivos(data);
    } catch (error) {
      console.log("Error al cargar archivos:");
      navegarA("/");
    }
  };


  //cambiar de una seccion a otra
  const cambiarSeccion = (nuevaSeccion) => {
    setSeccionActiva(nuevaSeccion);
    cargarArchivos();
  };

  //funcion para mostrar bytes KB MB etc
  function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
  
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
    const i = Math.floor(Math.log(bytes) / Math.log(k));
  
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };
  

  return (
    <div className="contenedor_principal">
    
      <nav className="navbar">
        <div className="logo">
          <img src={logo} alt="Logo" />
        </div>

        <div className="usuario">
        {usuario}<span className="rol">{rol}</span>
        </div>

        <div className={`listado navegable ${seccionActiva === "listado" ? "activo" : ""}`} onClick={() => cambiarSeccion("listado")}>
          Listado de Archivos
        </div>

        <div className={`almacen navegable ${seccionActiva === "almacen" ? "activo" : ""}`} onClick={() => cambiarSeccion("almacen")}>
          Almacen
        </div>

        <div className={`subir navegable ${seccionActiva === "subir" ? "activo" : ""}`} onClick={() => cambiarSeccion("subir")}>
          Cargar Archivos
        </div>

        <button className="salir navegable" onClick={handleLogout}>
          <FaSignOutAlt className="icono_salir" /> Salir
        </button>
      </nav>

      <div className="contenido">
        <h1 className="titulos_contenido">{seccionActiva === "listado" ? "Archivos Subidos" : seccionActiva === "almacen" ? "Almacen" : "Cargar Archivos"}</h1>

        {seccionActiva === "listado" && (
        archivos.length > 0 ? (
          <ol>
            {archivos.map((archivo) => (
              <li className="lista_contenidos" key={archivo.uuid}>
                <strong>Nombre del archivo:</strong> {archivo.nombre} <br />
                <strong>Tipo:</strong> {archivo.tipo} <br />
                <strong>Tamaño:</strong> {formatBytes(archivo.tamaño)}<br />
                <strong>Creado por:</strong> {archivo.createdby}<br />
                <strong>Fecha de Creación:</strong> {archivo.createdfecha}<br />
                {archivo.updatedby === 'Sin Actualizar' ? null : (
                  <>
                    <strong>Actualizado por:</strong> {archivo.updatedby}<br />
                    <strong>Fecha de Actualización:</strong> {archivo.updatedfecha}<br />
                  </>
                )}
              </li>
            ))}
          </ol>
        ) : (
          <p>No hay lista de archivos.</p> // Mensaje cuando no hay archivos
        )
      )}

        {seccionActiva === "almacen" && (
          archivos.length > 0 ? (
            <div className="tabla_almacen">
              {archivos.map((archivo) => (
                <div className="fila_almacen" key={archivo.uuid}>
                  <div className="celda_descargar">
                    <FiDownload className="icono_descargar" onClick={() => descargarArchivo(archivo.uuid)} />
                  </div>
                  <div className="celda_nombre">{archivo.nombre}</div>
                  <div className="celda_tamaño">{formatBytes(archivo.tamaño)}</div>
                  <div className="celda_eliminar">
                    <FiTrash2 className="icono_eliminar" onClick={() => eliminarArchivo(archivo.uuid)} />
                  </div>
                  <div className="celda_modify">{archivo.fecha}</div>
                </div>
              ))}
            </div>
          ) : (
                <p>El almacén está vacío.</p> // Mensaje cuando el almacen está vacío
              )
        )}

        {seccionActiva === "subir" && (
                <div className="contenedor_subir">
                  <div className="contenedor_chiste">
                  {chiste && <div className="mensaje_chiste">{chiste}</div>}
                  </div>
                  <form className="contenido_subir" onSubmit={handleFileUpload}>
                    <input type="file" multiple onChange={handleFileChange} />
                    <button type="submit">Subir Archivos</button>
                    {cargando && <div className="barra_progreso">
                      <div className="progreso" style={{ width: `${progreso}%` }}></div>
                    </div>}
                  </form>
                  <div className="mensajes">
                    {mensajeExito && <div className="mensaje mensaje_exito">{mensajeExito}</div>}
                    {mensajeError && <div className="mensaje mensaje_error">{mensajeError}</div>}
                  </div>
                </div>
              )}

        
      </div>


    </div>

  );

}

export default Main;
