// #region Archiv
//localStorage.setItem("choosenDate",dateToday.toISOString()); //speichert das dateObjekt von heute im lokalen Speicher

// #endregion

// #region basic settings
// date
let dateToday             = new Date();
let choosenDate           = new Date();
let day_clicks            = 0;
let click_marker          = 0;
let pageInFrontHub = 'subcontainer-hub-one';
const homePageHub = 'subcontainer-hub-one';
document.getElementById('newObjectPicker').style.display = 'none';
document.getElementById('taskHistory').style.display = 'none';
document.getElementById('newObject-container').style.display = 'none';
document.getElementById("datePicker").style.display = "none";




//um 00:00 soll das

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

//TabellenDaten auslesen
function processingTableData (status) {
  const tableData = document.getElementById('table-newObject').querySelectorAll('.current-newObject')

  let newData  = {};

  tableData.forEach(row => {
    let textContent   = row.querySelectorAll('td')[1].textContent.trim();
    let typeOfContent = row.querySelectorAll('td')[0].textContent;
    if (typeOfContent.length > 0) {
        newData[typeOfContent] = textContent;
      };
    });
    newData.status = status;
    //der Datenbank Werte einfügen
  }

// #endregion

// #region button controlling
document.getElementById('newObjectPicker').addEventListener('click', function(event) {

  // tabellen configs
  const newObjectArrays = {
    arrayTask: ['Test1'],
    //arrayTask: ['Title','Content','Deadline','Categorie','Pictures','Files'],
    arrayBlog: ['Test2','Test4','Test2','Test4','Test2','Test4','Test2','Test4','Test2','Test4','Test2','Test4'],
    //arrayBlog: ['Title','Content','Pictures','Files'],
    //arrayProject: ['Title','']
  }

  document.getElementById('newObjectPicker').style.display = 'none';
  document.getElementById('newObject-container').style.removeProperty('display');
  pageInFrontHub = 'newObject-container'

  // Herausfinden, welches Kind geklickt wurde
  const clickedElement = event.target;

  // Beispiel: data-id auslesen
  const id = clickedElement.id.split("-").at(-1);

  // ändert die Überschrift des newObject-previews
  document.getElementById('heading-newObject').textContent = id

/// hier muss noch die Fehlerbewältigung ergäntzt werden, damit wenn ein Objekt keine Id hat etwas entsprechendes gemacht wird
  newObjectArrays[`array${id}`].forEach((item, index) => {
    const newLine = document.getElementById('template-row-newObject').cloneNode(true);  //clont das template

    newLine.querySelector('#template-row-newObject-parameter').textContent = item; //ändert den textConten in dem Id-container
    newLine.style.removeProperty('display'); //löscht das display: none;
    newLine.classList.add('current-newObject');

    document.getElementById('table-newObject').querySelector('tbody').appendChild(newLine);

  });

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
        processingTableData('waiting')
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
      console.log(pageInFrontHub)
    }  else if (id === pageInFrontHub || 'newObject-container' === pageInFrontHub) { //wenn ich den Knopf für das öffnen nochmal nehme
      if (pageInFrontHub === 'newObject-container') {
        processingTableData('waiting')
      }
      document.getElementById(pageInFrontHub).style.display = "none";
      document.getElementById(homePageHub).style.removeProperty('display');
      pageInFrontHub = homePageHub;
    } else if (id !== pageInFrontHub) { //wenn ich von einem Fenster ohne homepage in das andere springe
      console.log(pageInFrontHub)
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
        processingTableData('waiting')
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

// #region Database
const dbName = "Web-App";
const dbVersion = 11;

let db;

const request = indexedDB.open(dbName, dbVersion);

request.onupgradeneeded = function (event) {
  db = event.target.result;

    if (!db.objectStoreNames.contains("habits")) {
    db.createObjectStore("habits", { keyPath: "id"});
    }

    if (!db.objectStoreNames.contains("repeating-tasks")) {
        db.createObjectStore("repeating-tasks", { keyPath: "id"});
    }
};

//Index


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

// Tasks
function insert_task (title = "",deadline = "",type = "") {
    const tx = db.transaction("tasks", "readwrite");
    const store = tx.objectStore("tasks");

    const newTask = {
        id: generateShortId(),
        title: title,
        deadline: deadline,
        type: type,
        status: "active"

    };
    store.add(newTask);
}

// in finished Tasks bewegen

// graph view


// Task in DB schreiben
request.onsuccess = function (event) {
    db = event.target.result;
    insert_task("TestTitle","12-12-2025")
}


//
const hubField = document.getElementById("hub");

hubField.addEventListener("input", () => {
  const text = hubField.value;

  // text scannen

});


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
