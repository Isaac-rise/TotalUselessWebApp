// #region Archiv
//localStorage.setItem("choosenDate",dateToday.toISOString()); //speichert das dateObjekt von heute im lokalen Speicher

// #endregion

// #region basic settings
// date
let dateToday     = new Date();
let choosenDate     = new Date();
let day_clicks      = 0;
let click_marker    = 0;

//um 00:00 soll das 

function generateDateAsStr (dateObject) {
    let day   = String(dateObject.getDate()).padStart(2, '0');
    let month = String(dateObject.getMonth() + 1).padStart(2, '0'); // Achtung: Monate starten bei 0
    let year  = dateObject.getFullYear();
    let formatedDate = `${day}.${month}.${year}`;

    return formatedDate;
}

function changeCurrentDate (date) {
    document.getElementById("currentDate").textContent = date;
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

// #endregion

// #region button controlling

document.getElementById("button-today").addEventListener("click", () => {
    changeCurrentDate(generateDateAsStr(dateToday)); //heutiges Datum anzeigen
    choosenDate = new Date()
    // heutige Tasks anzeigen
});

document.getElementById("button-day-back").addEventListener("click", () => {
    day_clicks--;
    console.log('click back');
    changeDateDay();
    //Tasks des spezifischen Tages laden
});

document.getElementById("button-day-forward").addEventListener("click", () => {
    day_clicks = day_clicks + 1  
    console.log('click forward');
    changeDateDay();
    //Tasks des spezifischen Tages laden
});

let activity_task_history = 0;
let activity_date_picker = 0;

document.getElementById("button-task-history").addEventListener("click", () => {
    if (activity_task_history === 0) {
        activity_task_history = 1;
        document.getElementById("abc123").style.display = "none";
        document.getElementById("information-bar-tasks").style.display = "none";
        document.getElementById("task-history").style.display = "flex";
        document.getElementById("date-picker").style.removeProperty("display");
    } else {
        activity_task_history = 0;
        document.getElementById("abc123").style.removeProperty("display");
        document.getElementById("information-bar-tasks").style.removeProperty("display");
        document.getElementById("task-history").style.display = "none";
    }    
});

document.getElementById("currentDate").addEventListener("click", () => {
    if (activity_date_picker === 0) {
        activity_date_picker = 1;
        document.getElementById("abc123").style.display = "none";
        document.getElementById("information-bar-tasks").style.display = "none";
        document.getElementById("date-picker").style.display = "flex";
        document.getElementById("task-history").style.display = "none";
    } else {
        activity_date_picker = 0;
        document.getElementById("abc123").style.removeProperty("display");
        document.getElementById("information-bar-tasks").style.removeProperty("display");
        document.getElementById("date-picker").style.removeProperty("display");
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

// 
//#endregion

// #region Task in DB schreiben
request.onsuccess = function (event) {
    db = event.target.result;
    insert_task("TestTitle","12-12-2025")
}
// #endregion

// #region Listener Hub
/*
1. Ich möchte im Hubbereich einen ex-container anklicken und diesen weiter bearbeiten oder einen neuen Auftrag schreiben und dafür den leeren Container auswählen
    1.1 wenn ich einen container bearbeite möchte ich das im Nachhinein der Inhalt den Eintrag in der DB updatet
    1.2 wenn ich den leeren Bereich anwähle möchte ich das bei verlassen der Container verarbeitet wird
        1.2.1 wenn der container ein ex container wird, soll der Inhalt in die DB geschrieben werden und dann ein entsprechender container geformt und in das Hub eingefügt werden
              hierbei soll der Term und der Titel ensprechend eingefärbt werden
        1.2.2 wenn der container kein ex container ist soll er entsprechend verarbeitet werden
            1.2.1 dafür soll zunächst der Term erfasst werden 
            1.2.2 dann soll das entsprechende Datenformat gefunden werden und nach diesem sollen dann die Attribute des Objektes bestimmt werden
            1.2.3 das Objekt soll dann mit weiteren automatisch erstellten Inhalten in der db erfasst werden 
*/

const hubField = document.getElementById("hub");

hubField.addEventListener("input", () => {
  const text = hubField.value;
  
  // text scannen

});

// #endregion

// #region coloring hub

// #endregion

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

//startpunkt einer touch geste abfangen und speichern
window.addEventListener('touchstart', (event) => {
    startPosition = event;
    console.log(`test1`)
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


/*
if (Math.sqrt(((startPostion.pageX - endPositon.pageX) ** 2) + ((startPostion.pageY - endPositon.pageY) ** 2)) > 25) {
    console.log(`right speed successful`);
}
*/


// #endregion



/*k
Im Hub werden immer die Zeilen angezeigt welche noch nicht verarbeitet werden sollten, diese werden in einer Tabelle gespeichert
Wenn wenn ich dann etwas hineinschreibe, wird es in der DB gespeichert, vorher wird es verarbeitet so das 
*/