
import {firebase} from './firebase'
import React, {useEffect, useState} from 'react' 

function App() {

  const [tareas,setTareas] = useState([])
  const [tarea,setTarea] = useState('')
  const [modoEdicion,setModoEdicion] = useState(false)
  const [id,setId] = useState('')


  useEffect(()=>{

    const obtenerDatos = async () =>{

      try {

        //se inicia el llamdo a firestore
        const db = firebase.firestore()
        //tareas es el nombre de la coleccion creada en firebase
        const data = await db.collection('tareas').get()
        // console.log(data.docs)
        //en vez de hacer otro objeto, ...doc accede directamente al id con sus datos
        const arrayData = await data.docs.map(doc =>({ id: doc.id, ...doc.data() }))
        // console.log(arrayData)
        setTareas(arrayData)
        
      } catch (error) {
        console.log(error)
      }
    }

    obtenerDatos()
  }, [])

  const agregar = async (e)=>{
    e.preventDefault()
    // console.log(tarea)
    if(!tarea.trim()){
      // console.log('esta vacio')
      return
    }

    try {
      //agregar campos a la base de datos de firebase
      const db = firebase.firestore()
      const nuevaTarea = {
        name: tarea,
        fecha: Date.now()
      }
      //con el add el id va a ser aleatorio
      const data = await db.collection('tareas').add(nuevaTarea)

      //se agrega las tareas a la lista y no se tenga que reiniciar el sitio
      setTareas([
        ...tareas,
        //es la forma de acceder al name y la fecha de nuevaTarea
        {...nuevaTarea, id:data.id }
      ])
      setTarea('')
      
    } catch (error) {
      console.log(error)
    }
  }

  const eliminar =async (id)=>{
    try {
      const db = firebase.firestore()
      await db.collection('tareas').doc(id).delete()
      
    } catch (error) {
      console.log(error)
    }

    const arrayFiltrado = tareas.filter(item => item.id !==id)

    setTareas(arrayFiltrado)
  }

  const activarEdicion = (item)=>{
    setModoEdicion(true)
    setTarea(item.name)
    setId(item.id)
  }

  const editar = async (e)=>{
    e.preventDefault()
    
    if(!tarea.trim()){
      // console.log('esta vacio')
      return
  }

  try {

    const db = firebase.firestore()
    //solo se ingresa el dato que se quiere actualizar
    await db.collection('tareas').doc(id).update({
      name:tarea
    })

    const arrayEditado = tareas.map(item=>(
      item.id === id ? {id: item.id, fecha:item.fecha, name:tarea} : item
    ))
    setTareas(arrayEditado)
    setModoEdicion(false)
    setTarea('')
    setId('')
  
    
  } catch (error) {
    console.log(error)
  }
  }
  return (
    <div className="container mt-3">
      <div className="row">
        <div className="col-md-6">
          <ul className="list-group">
            {
              tareas.map(item =>(
                <li className="list-group-item" key={item.id}>
                  {item.name}
                  <button 
                  className="btn btn-danger btn-sm float-end"
                  onClick={()=> eliminar(item.id)}
                  >Eliminar</button>

                  <button 
                  className="btn btn-warning btn-sm float-end me-2"
                  onClick={()=> activarEdicion(item)}
                  >Editar</button>

                </li>
              ))
            }
          </ul>
        </div>
        <div className="col-md-6">
          <h3>
            {
              modoEdicion ? 'Editar Tarea' : 'Agregar Tarea'
            }

          </h3>
          <form onSubmit={modoEdicion ? editar : agregar}>
            <input 
            type="text"
            placeholder="Ingrese tarea"
            className="form-control mb-2"
            onChange={e => setTarea(e.target.value)}
            value={tarea} />

            <button className={
              modoEdicion ? "btn btn-warning  w-100" : "btn btn-primary  w-100"
            } type="submit">
             {
               modoEdicion ? 'Editar' : 'Agregar'
             }
              </button>
          </form>
        </div>
      </div>

      
    </div>
  );
}

export default App;
