//variables para manejar el DOM
const formUI = document.getElementById('formulario')
const contenedorTareasUI= document.getElementById('listaTareas')
let arrayTareas = []
let indiceTareaActualizar
let intervalo
let parar=false


class Tarea{
    constructor(nombreTarea){
        this.nombreTarea=nombreTarea
        this.estado=false
        this.fecha = new Date()
    }
}

class Interfaz{
    //esta funcion se ejecutara al principio para insertar el html correspondiente 
    //traido del localstorage

    insertarAlerta(tarea,mensaje){
        document.getElementById('container-alerta').innerHTML=''
        document.getElementById('container-alerta').innerHTML+=`
            <div class="alert alert-info">
                <span><b>${tarea}</b>${mensaje}</span>
            </div>
            `
        setTimeout(()=>{
            document.getElementById('container-alerta').innerHTML=''
        },3000)
    }



    insertarTareaHTML(){
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
    insertarCronometroHTML(minutos,segundos){
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
    actualizarLocalStorage(){
        localStorage.setItem('tareas',JSON.stringify(arrayTareas))
        this.insertarTareaHTML()
    }

    //elimino un objeto del array de tareas y actualizo el localstorage
    eliminarTarea(tareaSeleccionada){
        const indiceABorrar = arrayTareas.findIndex((tarea)=>{
            return tarea.nombreTarea === tareaSeleccionada
        })
        arrayTareas.splice(indiceABorrar,1)
        this.insertarAlerta(tareaSeleccionada," eliminada satisfactoriamente")
        this.actualizarLocalStorage()
    }

        //marco una tarea como completada (modifico las propiedades del objeto)
    marcarTareaCompletada(tareaSeleccionada){
        const indiceTareaCompletar = arrayTareas.findIndex((tarea)=>{
            return tarea.nombreTarea===tareaSeleccionada
        })
        arrayTareas[indiceTareaCompletar].estado = true
        this.actualizarLocalStorage()

    }

    //guardo en una variable global el indice a actualizar y cambio el botón de añadir por uno de actualizar
    editarTarea(tareaAEditar){
        indiceTareaActualizar = this.recorrerArrayDeTareas(tareaAEditar)
        document.getElementById('botonAniadir').innerHTML ="Actualizar"
        document.getElementById('tareaInput').value=tareaAEditar
    }

    //esta funcion se inicia al seleccionar una tarea, recibo el nombre de la tarea seleccionada
    //e inserto el cronometro, inserto botones con distintas funcionalidades
    //y declaro los eventlisteners de esos botones
    seleccionarTarea(tareaAComenzar){
        let minutos=25
        let segundos=0
        this.insertarCronometroHTML(25,0)
        const contenedorTareaEnCurso = document.getElementById('containerTareaEnCurso')
        contenedorTareaEnCurso.innerHTML=''
        contenedorTareaEnCurso.innerHTML+=`<div class="tareaEnCurso alert alert-secondary" id="tareaEnCurso"><b>${tareaAComenzar}</b></div>`
        contenedorTareaEnCurso.innerHTML+=`<button class="btn btn-primary m-1" id='botonComenzar' type='submit'>Comenzar</button>`
        contenedorTareaEnCurso.innerHTML+=`<button class="btn btn-primary m-1" id='subirMinuto' type='submit'>+</button>`
        contenedorTareaEnCurso.innerHTML+=`<button class="btn btn-primary m-1" id='bajarMinuto' type='submit'>-</button>`
        contenedorTareaEnCurso.innerHTML+=`<button class="btn btn-primary m-1" id='botonCancelar' type='submit'>Cancelar</button>`
        
        //el boton cancelar remueve del html todos los elementos que especifican a la tarea
        //seleccionada
        document.getElementById('botonCancelar').addEventListener('click',(e)=>{
            document.getElementById('tareaEnCurso').hidden=true
            document.getElementById('botonComenzar').hidden=true
            document.getElementById('subirMinuto').hidden=true
            document.getElementById('bajarMinuto').hidden=true
            document.getElementById('botonCancelar').hidden=true
            document.getElementById('tiempo').hidden=true
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
                const tiempo = document.getElementById('cronometro').innerText.split(":")
                minutos=parseInt(tiempo[0])
                segundos=parseInt(tiempo[1])
                const cronometroTarea = new Reloj(minutos,segundos,tareaAComenzar)
                cronometroTarea.cronometro()
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
            this.insertarCronometroHTML(minutos,segundos)
            }
        })
        document.getElementById('bajarMinuto').addEventListener('click',(e)=>{
            if(minutos>1){
                minutos-=1
            this.insertarCronometroHTML(minutos,segundos)
            }
        })
        
    }

    //esta funcion recorre el array de tareas y requiere el nombre de una tarea
    //devuelve el indice del array que coincida con el nombre de la tarea
    //especificada por parametro
    recorrerArrayDeTareas(tareaABuscarIndice){
        const indice = arrayTareas.findIndex((tarea)=>{
            return tarea.nombreTarea===tareaABuscarIndice
        })
        return indice
    }

    //esta funcion busca la tarea que se le indica por parametro en el array de tareas
    //si la encuentra devuelve un true, de lo contrario es false
    buscarDuplicado(tareaABuscarDuplicado){
        let duplicado = false
        arrayTareas.forEach((tarea)=>{
            if(tarea.nombreTarea===tareaABuscarDuplicado){
                duplicado = true
            }
        })
        return duplicado
    }

}

//clase Reloj, tiene un constructor para crearla con minutos y segundos 
class Reloj{
    constructor(minutos,segundos,tareaAComenzar){
        this.minutos=minutos
        this.segundos=segundos
        this.tareaAComenzar=tareaAComenzar
        this.campana = new Audio("/media/bell.mp3")
    }

    //esta funcion corresponde al cronometro, se le especifican los minutos y segundos
    //si declaro el intervalo que se ejecutara cada 1 segundo
    //si minutos y segundos son igual a 0 se limpia el intervalo
    //si el boton comenzar vale 'comenzar' o 'reanudar' (significa que el botón
    //"Parar" fue clickeado) el intervalo se limpia
    //y mientras parar sea false, se resta 1 segundo en cada paso del intervalo, si segundos es igual a 0 se resta
    //un minuto y se colocan 60 segundos
    cronometro(){
        document.getElementById('tiempo').hidden=false
        let parar = false
        intervalo = setInterval(()=>{
            if(this.segundos===0 && this.minutos===0){
                parar = true
                clearInterval(intervalo)
                ui.marcarTareaCompletada(this.tareaAComenzar)
                this.campana.play()
                document.getElementById('botonComenzar').hidden=true
                document.getElementById('cronometro').hidden=true
                document.getElementById('tareaEnCurso').hidden=true
                ui.insertarAlerta(this.tareaAComenzar," finalizada")
            }
            if(document.getElementById('botonComenzar').innerHTML==='Comenzar' || document.getElementById('botonComenzar').innerHTML==='Reanudar'){
                clearInterval(intervalo)
            }
            else if(!parar){
                if (this.segundos===0){
                    this.minutos-=1
                    this.segundos=60
                }
                this.segundos-=1
            }
            ui.insertarCronometroHTML(this.minutos,this.segundos)
        },1000)
    }


}

//declaro una instancia global de la interfaz para poder utilizarla en todo el script
ui = new Interfaz()

//cargar al iniciar la página:
document.addEventListener('DOMContentLoaded',ui.insertarTareaHTML)



//boton del formulario
//comprueba que la tarea ingresada no esté duplicada tanto cuando se añade una tarea nueva
//como cuando se edita el nombre de una tarea
formUI.addEventListener('submit',(e)=>{
    e.preventDefault()
    const tareaIngresadaPorElUsuario = document.getElementById('tareaInput').value
    const botonClickeado = e.composedPath()[0][1].innerHTML
    if(arrayTareas.length!=0){
        const duplicado = ui.buscarDuplicado(tareaIngresadaPorElUsuario)
        if(!duplicado){
            if(botonClickeado==="Añadir"){
                tareaIngresadaPorElUsuario != "" ? arrayTareas.push(new Tarea(tareaIngresadaPorElUsuario)) : null
            }
            else if(botonClickeado === "Actualizar"){
                if(tareaIngresadaPorElUsuario != ""){
                    ui.insertarAlerta(arrayTareas[indiceTareaActualizar].nombreTarea," actualizada satisfactoriamente")
                    arrayTareas[indiceTareaActualizar].nombreTarea = tareaIngresadaPorElUsuario
                }
                document.getElementById('botonAniadir').innerHTML= "Añadir"
            }
        }
    }else{
        if(botonClickeado==="Añadir"){
            tareaIngresadaPorElUsuario != "" ? arrayTareas.push(new Tarea(tareaIngresadaPorElUsuario)) : null
        }
    }
    ui.actualizarLocalStorage()
    formUI.reset()
})

//este evento detecta un click en el contenedor de la tarea, a partir del click detecta 
//que boton fue el q clickeo y se guarda el nombre de la tarea para utilizarlo en 
//los distintos botones
contenedorTareasUI.addEventListener('click',(e)=>{
    e.preventDefault()
    const opcionClickeada = e.composedPath()[0].innerHTML
    const tareaSeleccionadaPorElUsuario = e.composedPath()[1].childNodes[1].innerHTML
    opcionClickeada==="Eliminar" ? ui.eliminarTarea(tareaSeleccionadaPorElUsuario) : null
    opcionClickeada==="Completar" ? ui.marcarTareaCompletada(tareaSeleccionadaPorElUsuario) : null
    opcionClickeada==="Editar nombre" ? ui.editarTarea(tareaSeleccionadaPorElUsuario) : null
    opcionClickeada==="Seleccionar" ? ui.seleccionarTarea(tareaSeleccionadaPorElUsuario) : null
})