let DB;

//selectores de la interfaz
const form= document.querySelector('form'),
      nombreMascota= document.querySelector('#mascota'),
      cliente= document.querySelector('#cliente'),
      telefono= document.querySelector('#telefono'),
      fecha= document.querySelector('#fecha'),
      hora= document.querySelector('#hora'),
      sintomas= document.querySelector('#sintomas'),
      citas= document.querySelector('#citas'),
      headingAdministra= document.querySelector('#administra');


//Esperar que el DOM cargue es necesario para el correcto funcionamiento de idexDB
document.addEventListener('DOMContentLoaded', ()=>{
  //creamos la base de datos

  let crearDB= window.indexedDB.open('citas', 1);

  //si hay error...
  crearDB.onerror= function(){
      console.log('hubo un error');
  }
  
  //si no hay error
  crearDB.onsuccess= function(){
    DB= crearDB.result;
    mostrarCitas();
  }

  crearDB.onupgradeneeded= function(e){
    let db=e.target.result;
   
    //Definir el objecstore, toma 2 parametros, el nombre de la base de datos y segundo las opciones
    let objecstore= db.createObjectStore('citas', {keyPath: 'key',
    autoIncrement: true});

    //indice y campos de la base de datos, createIndex: 3 parametros, nombre, keypath y opciones.

    objecstore.createIndex('mascota', 'mascota', {unique: false});
    objecstore.createIndex('cliente', 'cliente', {unique: false});
    objecstore.createIndex('telefono', 'telefono', {unique: false});
    objecstore.createIndex('fecha', 'fecha', {unique: false});
    objecstore.createIndex('hora', 'hora', {unique: false});
    objecstore.createIndex('sintomas', 'sintomas', {unique: false});

  }
  form.addEventListener('submit', agregarDatos);

  function agregarDatos(e){
   e.preventDefault();

   const nuevaCita={
       mascota : nombreMascota.value,
       cliente : cliente.value,
       telefono : telefono.value,
       fecha : fecha.value,
       hora : hora.value,
       sintomas : sintomas.value
   } 
  //console.log(nuevaCita);

  //Se utilizan transacciones en IndexedDB
  let transaccion = DB.transaction(['citas'], 'readwrite');
  let objectStore = transaccion.objectStore('citas');
  
  let peticion = objectStore.add(nuevaCita);

  peticion.onsuccess= ()=>{
      form.reset();
  }
  transaccion.oncomplete= ()=>{
      console.log('Cita agregada');
      mostrarCitas();
  }

  transaccion.onerror= ()=>{
      console.log('Error');
  }
}

function mostrarCitas(){
    //limpiando citas anteriores
    while(citas.firstChild){
        citas.removeChild(citas.firstChild);
        console.log('estoy en el while');
    }
     //creamos un objecstore para la consulta que realizaremos
    let objectStore= DB.transaction('citas').objectStore('citas');
     
    //esto retoma una peticion
    objectStore.openCursor().onsuccess = function(e){
    //Cursor se va a ubicar en el registro indicado para acceder a los datos.
     let cursor= e.target.result;
     console.log(cursor);

     if(cursor){
         let citaHTML = document.createElement('li');
         citaHTML.setAttribute('data-cita-id', cursor.value.key);
         citaHTML.classList.add('list-group-item');

        citaHTML.innerHTML = `
         <p class="font-weight-bold">Mascota:<span class="font-weight-normal">${cursor.value.mascota}</span></p>
         <p class="font-weight-bold">Dueño:<span class="font-weight-normal">${cursor.value.cliente}</span></p>
         <p class="font-weight-bold">Telefono:<span class="font-weight-normal">${cursor.value.telefono}</span></p>
         <p class="font-weight-bold">Fecha:<span class="font-weight-normal">${cursor.value.fecha}</span></p>
         <p class="font-weight-bold">Hora:<span class="font-weight-normal">${cursor.value.hora}</span></p>
         <p class="font-weight-bold">Sintomas:<span class="font-weight-normal">${cursor.value.sintomas}</span></p>
        `;
        //Boton de borrar
        const botonBorrar = document.createElement('button');
        botonBorrar.classList.add('borrar', 'btn', 'btn-danger');
        botonBorrar.innerHTML = '<span aria-hidden="true">x</span> Borrar';
        botonBorrar.onclick= borrarCita;
        citaHTML.appendChild(botonBorrar);

    citas.appendChild(citaHTML);

    //se usa cursor.continue para que continue consultando los registros y asi pase por todos los datos
    cursor.continue()
    } else{
        if(!citas.firstChild){
        //cuando no hay registros
        headingAdministra.textContent= 'Agrega citas para comenzar';
        let listado = document.createElement('p');
        listado.classList.add('text-center');
        listado.textContent = 'No hay registros';
        citas.appendChild(listado);
    } else{
        headingAdministra.textContent= 'Administra Tus Citas';

    }
    }
    }
}
function borrarCita(e){
 let citaID= Number(e.target.parentElement.getAttribute('data-cita-id'));

 let transaccion = DB.transaction(['citas'], 'readwrite');
 let objectStore = transaccion.objectStore('citas');
 
 let peticion = objectStore.delete(citaID);

transaccion.oncomplete= ()=>{
    e.target.parentElement.parentElement.removeChild(e.target.parentElement);
    console.log(`Se eleminino la cita con el ID ${citaID}`);

    if(!citas.firstChild){
        //cuando no hay registros
        headingAdministra.textContent= 'Agrega citas para comenzar';
        let listado = document.createElement('p');
        listado.classList.add('text-center');
        listado.textContent = 'No hay registros';
        citas.appendChild(listado);
    } else{
        headingAdministra.textContent= 'Administra Tus Citas';

    }

}

}
})