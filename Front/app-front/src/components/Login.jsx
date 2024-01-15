import React, { useState, useEffect } from 'react';
import '../styles/Login.css';
import logo_plexus from '../images/cloudmine.png';
import { useNavigate } from 'react-router-dom';//poder navegar por rutas


function Login() {
  const [usuario, setUsuario] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [errorMensaje, setErrorMensaje] = useState('');//estado para el mensaje de error
  const [mensajeExito, setMensajeExito] = useState('');//estado para mensaje de exito

  const navegarA = useNavigate();

  /*const iniciarSesion = () => {
    console.log('Usuario:', usuario);
    console.log('Contraseña:', contraseña);

    if(usuario==='admin' && contraseña==='1234'){
      navegarA('/main');
    }
    else{
      console.log("Error en el nombre de usuario o la contraseña");
    }
  };*/

  const iniciarSesion = async () => {
    try {
      const response = await fetch("http://localhost:3001/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          usuario: usuario,
          contraseña: contraseña,
        }),
      });

      const data = await response.json();
      console.log(usuario);

      if (data.autenticado) {
        sessionStorage.setItem('usuario', usuario);//almacena el nombre del usuario usuario nombre que se guarda
        sessionStorage.setItem('token', data.token);//almacena el token
        sessionStorage.setItem('rol', data.rol);//almacena el rol
        sessionStorage.setItem('sesion', 'activo'); //almacena el estado de la sesión
        setMensajeExito('Inicio Correcto, Redirigiendo...');//mensaje exito

        setTimeout(() => {
          navegarA('/main');
        }, 2500); // Espera 2 segundos antes de redirigir

      } else {
        console.log('Error en el nombre de usuario o la contraseña');
        setErrorMensaje('Usuario o contraseña incorrectos');//mensaje de error si usuario o contraseña falla
      }
    } catch (error) {
      console.error("Hubo un error al intentar iniciar sesión", error);
      setErrorMensaje('Error al conectar con el servidor');//mensaje de error server falla
    }
  };

  //efecto mensaje de error 
  useEffect(() => {
    if (errorMensaje !== '') {
      const timer = setTimeout(() => {
        setErrorMensaje('');
      }, 2500); //milisegundos
      //limpiar el temporizador si el componente se desmonta o el mensaje cambia
      return () => clearTimeout(timer);
    }
  },[errorMensaje]); //ejecuta cada vez que errorMensaje cambia

  return (
    <>
      <div className='contenedor_logo'>
      <img className='logo' src={logo_plexus} alt='Logo de Almacenamiento' />

      </div><div className='contenedor_formulario_login'>
        <div className='campo'>
          <label htmlFor='usuario'>Usuario</label>
          <input
            type='text'
            placeholder='Usuario'
            id='usuario'
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)} />
        </div>
        <div className='campo'>
          <label htmlFor='contraseña'>Contraseña</label>
          <input
            type='password'
            placeholder='Contraseña'
            id='contraseña'
            value={contraseña}
            onChange={(e) => setContraseña(e.target.value)} />
        </div>

        <button className='boton_iniciar' onClick={iniciarSesion}>
          Iniciar Sesión
        </button>

      </div>

      <div className='contenedor_error'>{errorMensaje && <div className="mensaje_error">{errorMensaje}</div>}</div>
      <div className='contenedor_exito'>{mensajeExito && <div className="mensaje_exito">{mensajeExito}</div>}</div>

      <div className='buble'></div> 
    </>
  );

}

export default Login;
