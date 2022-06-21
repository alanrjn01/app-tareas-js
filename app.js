class Tarea{
    constructor(nombreTarea){
        this.nombreTarea=nombreTarea
        this.estado=false
    }
}


//guardo el formulario y el contenedor en una variable
const formUI = document.getElementById('formulario')
const contenedorTareasUI= document.getElementById('listaTareas')
let arrayTareas = []
let minutos=0
let segundos=0
let indiceTareaActualizar
let intervalo
let parar=false

//esta funcion se ejecutara al principio para insertar el html correspondiente 
//traido del localstorage
const insertarTareaHTML= () =>{
    contenedorTareasUI.innerHTML = ''
    arrayTareas = JSON.parse(localStorage.getItem('tareas'))
    arrayTareas===null ? arrayTareas=[] : arrayTareas.forEach((elemento)=>{
        if(elemento.estado){
            contenedorTareasUI.innerHTML+=`
            <div class="tarea mt-2 alert alert-success">
                <b>${elemento.nombreTarea}</b>
                <i>| estado: terminado </i>
                <button class="btn btn-danger" id="botonEliminar" type="submit">Eliminar</button>
            </div>
        `
        }else{
            contenedorTareasUI.innerHTML+=`
            <div class="tarea mt-2 alert alert-danger">
                <b>${elemento.nombreTarea}</b>
                <i>| estado: sin terminar</i>
                <button class="btn btn-danger" id="botonEliminar" type="submit">Eliminar</button>
                <button class="btn btn-danger" id="botonEditar" type="submit">Editar nombre</button>
                <button class="btn btn-danger" id="botonMarcarCompletado" type="submit">Completar</button>
                <button class="btn btn-danger" id="seleccionarTarea" type="submit">Seleccionar</button>
            </div>
            `
        }
        

    })
}

//inserto el cronometro al dom con los minutos y segundos recibidos por parametros
const insertarCronometroHTML = (minutos,segundos) =>{
    document.getElementById('cronometro').innerHTML=''
    if(segundos>=0 && segundos<10){
        document.getElementById('cronometro').innerHTML=`
        <h2 class="tiempo alert alert-primary mt-2" id="tiempo">${minutos}:0${segundos}</h2>
    `
    }
    else{
        document.getElementById('cronometro').innerHTML=`
        <h2 class="tiempo alert alert-primary mt-2" id="tiempo">${minutos}:${segundos}</h2>
    `
    }
}

//actualizo el local storage y recargo los datos html mostrados en pantalla
const actualizarLocalStorage = () =>{
    localStorage.setItem('tareas',JSON.stringify(arrayTareas))
    insertarTareaHTML()
}

//elimino un objeto del array de tareas y actualizo el localstorage
const eliminarTarea = (tareaAEliminar) =>{
    console.log(tareaAEliminar)
    const indiceABorrar = arrayTareas.findIndex((tarea)=>{
        return tarea.nombreTarea === tareaAEliminar
    })
    arrayTareas.splice(indiceABorrar,1)
    actualizarLocalStorage()
}

//marco una tarea como completada (modifico las propiedades del objeto)
const marcarTareaCompletada = (tareaACompletar) =>{
    
    const indiceTareaCompletar = arrayTareas.findIndex((tarea)=>{
        return tarea.nombreTarea===tareaACompletar
    })
    arrayTareas[indiceTareaCompletar].estado = true
    actualizarLocalStorage()

}

//guardo en una variable global el indice a actualizar y cambio el botón de añadir por uno de actualizar
const editarTarea = (tareaAEditar) => {
    indiceTareaActualizar = arrayTareas.findIndex((tarea)=>{
        return tarea.nombreTarea===tareaAEditar
    })
    document.getElementById('botonAniadir').innerHTML ="Actualizar"
    document.getElementById('tareaInput').value=tareaAEditar
}

//esta funcion se inicia al seleccionar una tarea, recibo el nombre de la tarea seleccionada
//e inserto el cronometro, inserto botones con distintas funcionalidades
//y declaro los eventlisteners de esos botones
const seleccionarTarea = (tareaAComenzar) =>{
    
    minutos=25
    segundos=0
    insertarCronometroHTML(25,0)
    document.getElementById('containerTareaEnCurso').innerHTML=''

    document.getElementById('containerTareaEnCurso').innerHTML += `
        <div class="tareaEnCurso alert alert-secondary" id="tareaEnCurso"><b>${tareaAComenzar}</b></div>
    `
    document.getElementById('containerTareaEnCurso').innerHTML+=`
        <button class="btn btn-primary" id='botonComenzar' type='submit'>Comenzar</button>
    `
    document.getElementById('containerTareaEnCurso').innerHTML+=`
        <button class="btn btn-primary" id='subirMinuto' type='submit'>+</button>
    `
    document.getElementById('containerTareaEnCurso').innerHTML+=`
        <button class="btn btn-primary" id='bajarMinuto' type='submit'>-</button>
    `
    document.getElementById('containerTareaEnCurso').innerHTML+=`
        <button class="btn btn-primary" id='botonCancelar' type='submit'>Cancelar</button>
    `
    
    //el boton cancelar remueve del html todos los elementos que especifican a la tarea
    //seleccionada
    document.getElementById('botonCancelar').addEventListener('click',(e)=>{
        document.getElementById('tareaEnCurso').remove()
        document.getElementById('botonComenzar').remove()
        document.getElementById('subirMinuto').remove()
        document.getElementById('bajarMinuto').remove()
        document.getElementById('botonCancelar').remove()
        document.getElementById('tiempo').remove()
    })

    //el boton comenzar(o reanudar) oculta los botones para manejar el tiempo y el boton de cancelar
    //y reemplaza su nombre con "Parar" para reutilizar el mismo botón para parar
    //el cronometro
    //aca es cuando se inicializa el cronometro. Lo que hago es seleccionar el cronometro desde el
    //dom y almacenarlo en un array spliteado para obtener los numeros que necesito, luego los parseo a int
    //esos numeros que representan minutos y segundos los envio por argumento a la funcion cronometro
    document.getElementById('botonComenzar').addEventListener('click',(e)=>{
        if(document.getElementById('botonComenzar').innerHTML==='Comenzar' || document.getElementById('botonComenzar').innerHTML==='Reanudar'){
            document.getElementById('subirMinuto').hidden=true
            document.getElementById('bajarMinuto').hidden=true
            document.getElementById('botonCancelar').hidden=true
            document.getElementById('botonComenzar').innerHTML="Parar"
            tiempo = document.getElementById('cronometro').innerText.split(":")
            minutos=parseInt(tiempo[0])
            segundos=parseInt(tiempo[1])
            cronometro(minutos,segundos,tareaAComenzar)
        }
        //si se clickea y el boton se llama "Parar", se cambia el innerHTML del boton a "reanudar"
        //y se habilita nuevamente el boton de cancelar
        else if (document.getElementById('botonComenzar').innerHTML==="Parar"){
            document.getElementById('botonCancelar').hidden=false
            document.getElementById('botonComenzar').innerHTML="Reanudar"
        }
        
    })
    //estos botones suben o bajan los minutos del cronometro y lo insertan en el html 
    document.getElementById('subirMinuto').addEventListener('click',(e)=>{
        if(minutos<60){
            minutos+=1
        insertarCronometroHTML(minutos,segundos)
        }
    })
    document.getElementById('bajarMinuto').addEventListener('click',(e)=>{
        if(minutos>1){
            minutos-=1
        insertarCronometroHTML(minutos,segundos)
        }
    })
    
}

//esta funcion corresponde al cronometro, se le especifican los minutos y segundos
//si declaro el intervalo que se ejecutara cada 1 segundo
//si minutos y segundos son igual a 0 se limpia el intervalo
//si el boton comenzar vale 'comenzar' o 'reanudar' (significa que el botón
//"Parar" fue clickeado) el intervalo se limpia
//y mientras parar sea false, se resta 1 segundo en cada paso del intervalo, si segundos es igual a 0 se resta
//un minuto y se colocan 60 segundos
const cronometro = (minutos,segundos,tarea)=>{
    let parar = false
    intervalo = setInterval(()=>{
        if(segundos===0 && minutos===0){
            parar = true
            clearInterval(intervalo)
            marcarTareaCompletada(tarea)
        }
        if(document.getElementById('botonComenzar').innerHTML==='Comenzar' || document.getElementById('botonComenzar').innerHTML==='Reanudar'){
            clearInterval(intervalo)
        }
        else if(!parar){
            if (segundos===0){
                minutos-=1
                segundos=60
            }
            segundos-=1
        }
        insertarCronometroHTML(minutos,segundos)
    },1000)
}


//event listeners

//cargar al iniciar la página:
document.addEventListener('DOMContentLoaded',insertarTareaHTML)

//boton submit del formulario si es el boton de añadir ( i 'comprobarDuplicado' es falso o
// el array esta vacio) agrega un objeto tarea al array 
//si es el boton de actualizar accedo a la posición del elemento a actualizar y modifico su propiedad
//para añadir una tarea compruebo que no este duplicada en el arrayTareas

formUI.addEventListener('submit',(e)=>{
    e.preventDefault()
    comprobarDuplicado=false
    if(arrayTareas.length!=0){
        arrayTareas.forEach((tarea)=>{
            if(tarea.nombreTarea===document.getElementById('tareaInput').value){
                comprobarDuplicado=true
            }
        })
    }
    if (e.composedPath()[0][1].innerHTML === "Añadir"){
        if(arrayTareas.length===0 || comprobarDuplicado==false){
            document.getElementById('tareaInput').value != "" ? arrayTareas.push(new Tarea(document.getElementById('tareaInput').value)) : null
        }
    }
    else if(e.composedPath()[0][1].innerHTML === "Actualizar"){
        document.getElementById('tareaInput').value != "" ? arrayTareas[indiceTareaActualizar].nombreTarea=document.getElementById('tareaInput').value : null
        actualizarLocalStorage()
        document.getElementById('botonAniadir').innerHTML ="Añadir"
    }
    actualizarLocalStorage()
    formUI.reset()
})

//detecta un click dentro del contenedor de tareas y veo q fue lo que se clickeo,
//si el boton eliminar, completar o editar nombre
contenedorTareasUI.addEventListener('click',(e)=>{
    e.preventDefault()
    e.composedPath()[0].innerHTML==="Eliminar" ? eliminarTarea(e.composedPath()[1].childNodes[1].innerHTML) : null
    if(e.composedPath()[0].innerHTML==="Completar"){
        marcarTareaCompletada(e.composedPath()[1].childNodes[1].innerHTML)
    }
    e.composedPath()[0].innerHTML==="Editar nombre" ? editarTarea(e.composedPath()[1].childNodes[1].innerHTML) : null
    e.composedPath()[0].innerHTML==="Seleccionar" ? seleccionarTarea(e.composedPath()[1].childNodes[1].innerHTML) : null

})