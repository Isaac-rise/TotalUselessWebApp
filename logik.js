// #region Archiv
//localStorage.setItem("choosenDate",dateToday.toISOString()); //speichert das dateObjekt von heute im lokalen Speicher
//manageTableInDb(name.toLowerCase().replaceAll(" ", "-"))

/*Notes

Statustypen: waiting (waiting in hub), confirmed (finished manipulating data),
              scheduled (wenn in tasks geladen), on hold (wenn begonnen aber pausiert),
              finished (wenn abgeschlossen)

indizes:
statustypen pro Tabelle

für alle Eigenschaften nach welchen ich besonders schnell suchen möchte

//Task-board-Blöcke: (unterscheiden sich in Position und Farbe der Darstellung und weitere Automatisierungen oder deren Statistikrelevanz)
1. Hinweise                     (Tages- und Ereignisfixiert, Erinnerungen an bevorstehende Termine)
2. Termine                      (alle Dinge, mit fester Uhrzeit)
3. wiederkehrende Ereig.        (Habits oder auch nicht Habits, die Darstellung von bestimmten Daten passiert später, bei Erstellen wird aber dennoch unterschieden)
4. Important Tasks
5. nächsten Schritte Projekten  (Immer die )
6. Medium Tasks                 (sortiert nach Wichtigkeit und Erstellungsdatum und Uhrzeit)

Den Großteil den ich haben werde, werden feste Termine und nächste Projektschritte sein.
Status, Type, Uhrzeit/Alphabetisch/Importance & Alphabetisch,
*/



// #endregion

// #region basic settings
// date
let   dateToday             = new Date();
let   choosenDate           = new Date();
let   day_clicks            = 0;
let   click_marker          = 0;
let   pageInFrontHub        = 'subcontainer-hub-one';
const homePageHub           = 'subcontainer-hub-one';

document.getElementById('newObjectPicker').style.display = 'none';
document.getElementById('taskHistory').style.display = 'none';
document.getElementById('newObject-container').style.display = 'none';
document.getElementById('datePicker').style.display = "none";


// region Database
//db öffnen
let db;
const request = indexedDB.open('Web-App');
let dbVersion;

// ...und Inhalte laden
request.onsuccess = function (event) {
  db = event.target.result;
  dbVersion = db.version;

  //manageTableInDb('clear','mainTable');
};

//Index
//index Daten auslesen und damit das Hub und das Task-Board bestücken


//um 00:00 soll das heutige Datum umwechseln

function generateDateAsStr (dateObject) {
    let day   = String(dateObject.getDate()).padStart(2, '0');
    let month = String(dateObject.getMonth() + 1).padStart(2, '0'); // Achtung: Monate starten bei 0
    let year  = dateObject.getFullYear();
    let formatedDate = `${day}.${month}.${year}`;

    return formatedDate;
}

function changeCurrentDate (date) {
    document.getElementById("button-datePicker").textContent = date;
}

function changeDateDay () {
    if (click_marker === 0) {
        click_marker = 1;
        setTimeout(() => {
            if (day_clicks != 0) {
            changeCurrentDate(generateDateAsStr(new Date(choosenDate.setDate(choosenDate.getDate() + day_clicks)))); // day_clicks nehmen und diese Tage auf aktuelles Datum addieren und Datum wechseln
            day_clicks = 0;
            click_marker = 0;
        }}, 31);
    }
}

changeCurrentDate(generateDateAsStr(dateToday)); //setzt immer beim neustarten der app das heutige Datum

// db managment
function insertInDb (dbName,object) {
    const store = db.transaction(dbName, 'readwrite').objectStore(dbName);
    /// generateShortId sollte immer einen richtigen key zurückgeben, sonst kommt es zu problemene,
    /// diese Fehler müssen abgefangen und behandelt werden
    object.id = generateShortId();
    store.put(object)
    };



function changeStatusOfObject (storeName,id,newStatus) {
  const store = db.transaction(type, 'readwrite').objectStore(storeName);

  const dbObject = store.get(id);

  dbObject.onsuccess = function () {
    const object = dbObject.result;

    if (object) {
      object.status = newStatus;

      store.put(object,id) //läd das geänderte Objekt wieder zurück in die db

    } else {
      // Fehlerlösung für falsch übergebene id bereitstellen
    }
  }
} /// muss noch gedebugged werden

function manageTableInDb (type,name) {
  if (db) {
    db.close();
    dbVersion += 1

    const request = indexedDB.open('Web-App', dbVersion);

    request.onupgradeneeded = function (event) {
      const db = event.target.result;
      const table = event.target.transaction.objectStore(name);

      if (type === 'c') {
        const store = db.createObjectStore(name, { keyPath: "id" });  // neue Tabelle erstellen
        store.createIndex(`statusIndex-${name}`, "status");
      } else if (type === 'd') {
        db.deleteObjectStore(name);
      } else if (type === 'clear') {
        table.clear();
      }
    }

    request.onsuccess = function (event) {
      db = event.target.result;
    }

  } else {
    setTimeout(() => manageTableInDb(type,name), 50); // prüft alle 50ms
  }
}

function manageIndex (type,storeName,indexName,cellName) {
  if (db) {
    db.close();
    dbVersion += 1

    let request = indexedDB.open('Web-App', dbVersion);

    request.onupgradeneeded = function (event) {
      let store = event.target.transaction.objectStore(storeName);
      if (type === 'c') {
        store.createIndex(`${indexName}-${storeName}`, cellName,{ unique: false });
      } else if (type === 'd') {
        store.deleteIndex(`${indexName}-${storeName}`);
      }
    }

  } else {
    setTimeout(() => createIndex (storeName,cellName), 50); // prüft alle 50ms
  }
}

//TabellenDaten auslesen
function processingTableData (status) {
  const tableData = document.getElementById('table-newObject').querySelectorAll('.current-newObject');
  let   titleMarker = 0;

  newData = {};

  if (tableData.length > 0){
    tableData.forEach(row => {
      let typeOfContent = row.querySelectorAll('td')[0].textContent;
      let textContent   = row.querySelectorAll('td')[1].textContent.trim();
      if (typeOfContent === 'Title' && textContent.length > 0) {
        titleMarker = 1;
        console.log('Marker');
        console.log(titleMarker);
      }
      if (textContent.length > 0) {
        newData[typeOfContent] = textContent;
        console.log(newData);
      };
    });
  }

  newData.status      = status;
  newData.type        = document.getElementById('newObject-container').querySelector('h3').textContent.toLowerCase().replaceAll(" ", "-");

  if (titleMarker === 1) {
    insertInDb('mainTable',newData);
  };
}

// DOM managment
function deletingObjectsOutContainer (container, className) {
  const objects = document.getElementById(container).querySelectorAll('.' + className);
  objects.forEach(el => el.remove());
}

// #region button controlling
document.getElementById('newObjectPicker').addEventListener('click', function(event) {

  // tabellen configs
  const newObjectArrays = {
    arrayTask: ['Title'],
    one: ['Title'],
    newObjectPicker: ['Title'],
    //arrayTask: ['Title','Content','Deadline','Categorie','Pictures','Files'],
    arrayBlog: ['Titel','Test4','Test2','Test4','Test2','Test4','Test2','Test4','Test2','Test4','Test2','Test4']
    //arrayBlog: ['Title','Content','Pictures','Files'],
    //arrayProject: ['Title','']
  }

  document.getElementById('newObjectPicker').style.display = 'none';

  // Herausfinden, welches Kind geklickt wurde
  const clickedElement = event.target;

  // Beispiel: data-id auslesen
  const id = clickedElement.id.split("-").at(-1); //type auslesen
  console.log('id');
  console.log(id);
  // ändert die Überschrift des newObject-previews
  document.getElementById('heading-newObject').textContent = id

/// hier muss noch die Fehlerbewältigung ergäntzt werden, damit wenn ein Objekt keine Id hat etwas entsprechendes gemacht wird
  newObjectArrays[`array${id}`].forEach((item, index) => {
    const newLine = document.getElementById('template-row-newObject').cloneNode(true);  //clont das template

    newLine.querySelector('#template-row-newObject-parameter').textContent = item; //ändert den textConten in dem Id-container
    newLine.style.removeProperty('display');  //löscht das display: none;
    newLine.querySelector('td').removeAttribute('id');
    newLine.removeAttribute('id');
    newLine.classList.add('current-newObject');

    document.getElementById('table-newObject').querySelector('tbody').appendChild(newLine);


  });

  document.getElementById('newObject-container').style.removeProperty('display');
  pageInFrontHub = 'newObject-container'

});

document.getElementById('navigation-bar-tasks').addEventListener('click', function(event) {

  const id = event.target.id.split("-").at(1);

  if        (id === 'taskHistory') {

    if (pageInFrontHub === homePageHub) {
      document.getElementById(pageInFrontHub).style.display = 'none';
      document.getElementById(id).style.removeProperty('display');
      pageInFrontHub = id;
    } else if (id === pageInFrontHub) {
      document.getElementById(pageInFrontHub).style.display = "none";
      document.getElementById(homePageHub).style.removeProperty('display');
      pageInFrontHub = homePageHub;
      // für den Fall das ich schon Werte an das neues Object übergeben habe, sollten diese zum
      // Hub hinzugefügt werden
    } else if (id !== pageInFrontHub) {
      if (pageInFrontHub === 'newObject-container') {
        processingTableData('waiting');
        deletingObjectsOutContainer('table-newObject','current-newObject');
      }
      document.getElementById(pageInFrontHub).style.display = 'none';
      document.getElementById(id).style.removeProperty('display');
      pageInFrontHub = id;
    }

  } else if (id === 'newObjectPicker') {
    if (pageInFrontHub === homePageHub) { //wenn ich von der homepage öffne
      document.getElementById(pageInFrontHub).style.display = 'none';
      document.getElementById(id).style.removeProperty('display');
      pageInFrontHub = id;
    }  else if (id === pageInFrontHub || 'newObject-container' === pageInFrontHub) { //wenn ich den Knopf für das öffnen nochmal nehme
      if (pageInFrontHub === 'newObject-container') {
        processingTableData('waiting');
        deletingObjectsOutContainer('table-newObject','current-newObject');
      }
      document.getElementById(pageInFrontHub).style.display = "none";
      document.getElementById(homePageHub).style.removeProperty('display');
      pageInFrontHub = homePageHub;
    } else if (id !== pageInFrontHub) { //wenn ich von einem Fenster ohne homepage in das andere springe
      document.getElementById(pageInFrontHub).style.display = 'none';
      document.getElementById(id).style.removeProperty('display');
      pageInFrontHub = id;
    }

  } else if (id === 'datePicker') {
    if (pageInFrontHub === homePageHub) { //wenn ich von der homepage öffne
      document.getElementById(pageInFrontHub).style.display = 'none';
      document.getElementById(id).style.removeProperty('display');
      pageInFrontHub = id;
    } else if (id === pageInFrontHub) { //wenn ich den Knopf für das öffnen nochmal nehme
      document.getElementById(pageInFrontHub).style.display = "none";
      document.getElementById(homePageHub).style.removeProperty('display');
      pageInFrontHub = homePageHub;
    } else if (id !== pageInFrontHub) { //wenn ich von einem Fenster ohne homepage in das andere springe
      if (pageInFrontHub === 'newObject-container') {
        processingTableData('waiting');
        deletingObjectsOutContainer('table-newObject','current-newObject');
      }
      document.getElementById(pageInFrontHub).style.display = 'none';
      document.getElementById(id).style.removeProperty('display');
      pageInFrontHub = id;
    }

  } else if (id === 'today') {
    changeCurrentDate(generateDateAsStr(dateToday)); //heutiges Datum anzeigen
    choosenDate = new Date()
    // heutige Tasks anzeigen
  } else if (id === 'dayBack') {
    day_clicks--;
    changeDateDay();
    //Tasks des spezifischen Tages laden
  } else if (id === 'dayForward') {
    day_clicks = day_clicks + 1;
    changeDateDay();
    //Tasks des spezifischen Tages laden
  }
});

document.getElementById('toolBar-newObject').addEventListener('click', function(event) {
  const button = event.target.closest('button');

  if (!button) return;

  const id = button.id.split('-').at(1);

  document.getElementById('newObject-container').style.display = 'none';
  document.getElementById(homePageHub).style.removeProperty('display');
  pageInFrontHub = homePageHub

  if (id === 'waitNewObject') {
    processingTableData('waiting')
  } else if (id === 'confirmNewObject') {
    processingTableData('confirmed')
  }

  deletingObjectsOutContainer('table-newObject','current-newObject');
});

// #endregion

// #region etwas in eine Liste einfügen welche zwei Spalten hat
function insert_into_table_with_two_columns(idTemplate,idParent,content,color) {
    let original    = document.getElementById(idTemplate);
    let clone       = original.cloneNode(false);
    let container   = document.getElementById(idParent);

    let newElement  = document.createTextNode(content)

    clone.appendChild(newElement);

    clone.style.color = color;

    container.appendChild(clone);
}
// #endregion

// #region UUID's
function generateShortId(length = 15) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
// #endregion


//#endregion

// #region Inhalte DB einfügen

/*
    Ich möchte bei den Tasks zunächst nach aktiv und inaktiv unterscheiden. Die aktiven möchte ich absteigend sortieren nach

    - mit dem "important" - tag markiert
    - Termine nach Urzeit markiert
    - (fällig, überfällig) (regelmäßige Aufgaben, habits) - zunächst nach diese nach kategorien
    - die nächste Aufgabe von jedem Projekt

    - unkategorisierte Aufgaben
    - habits, termine, random-tasks, nächste Projekt schritte, regelmäßige Aufgaben, Erinnerungen,

*/

// in finished Tasks bewegen

// graph view

// #region Srollverhalten
if (window.innerWidth <= 799) {
//variablen
let currentPage = 0;
let startPosition;
let endPosition;

//index der Seiten breiten

//Funktion zur Eventgenerierung definieren
function moveToPage(index) {
    currentPage = index; //damit ändern wir die Info auf welcher Seite wir danach sind. Für den nächsten Vorgan
    const pages = document.querySelector('#pages');

    pages.style.transform = `translateX(-${currentPage * 100}vw)`;
}
moveToPage(1) /// später noch entfernen

//startpunkt einer touch geste abfangen und speichern
window.addEventListener('touchstart', (event) => {
    startPosition = event;
});

//entpunkt einer Geste abfangen
window.addEventListener('touchend', (event) => {
    endPosition = event;

    const differenceX = startPosition.touches[0].pageX - endPosition.changedTouches[0].pageX
    const differenceY = startPosition.touches[0].pageY - endPosition.changedTouches[0].pageY
    const exeleration = Math.sqrt(differenceX ** 2 + differenceY ** 2) / (endPosition.timeStamp - startPosition.timeStamp);
    const maxAngle = 20;
    const minExel = 0.6;
    const angle =  Math.atan((differenceY / differenceX)) * (180 / Math.PI);

    //wenn ein Ende erkannt wurde die Geste in ein Event umwandeln
    if (exeleration > minExel && angle < maxAngle && angle > -1 * maxAngle) {
        if (startPosition.touches[0].pageX < endPosition.changedTouches[0].pageX) {
            //Seite wird nach Links gewechselt
            if (currentPage > 0) {
                moveToPage(currentPage - 1)
                console.log(currentPage)
            }

        } else if (startPosition.touches[0].pageX > endPosition.changedTouches[0].pageX) {
            //Seite wird nach Rechts gewechselt
            if (currentPage < 3) {
                moveToPage(currentPage + 1)
                console.log(currentPage)
            }
        }
    }
});

//scrollverhalten beim öffnen der Tastatur steuern
const height = window.getComputedStyle(document.querySelector('.page')).height;
const innerHeight = window.innerHeight
let letzteGemerkteHöhe;



window.addEventListener('resize', () => {
  if (window.innerHeight < height) {
    // Tastatur vermutlich geschlossen
    letzteGemerkteHöhe = window.innerHeight;
    const differenceNewHeight = letzteGemerkteHöhe / (innerHeight / 100 )
    document.querySelector('.pages').style.height = `calc(${height} - ${differenceNewHeight}%`;
  }
});

window.addEventListener('resize', () => {
  if (window.innerHeight > letzteGemerkteHöhe) {
    // Tastatur vermutlich geschlossen
    //*document.body.style.overflow = 'hidden';

    document.querySelector('.pages').style.height = `100%`;
  }
});


}
