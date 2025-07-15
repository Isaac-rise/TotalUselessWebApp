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
        status: active

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
const hubField = document.getElementById("hub");

hubField.addEventListener("input", () => {
  const text = hubField.value;
  console.log("Eingabe:", text);
  // Hier kannst du den Text z. B. in IndexedDB speichern
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
    console.log(`test1`)
    console.log(Math.sqrt(((startPosition.touches[0].pageX - endPosition.changedTouches[0].pageX) ** 2) + ((startPosition.touches[0].pageY - endPosition.changedTouches[0].pageY) ** 2)) / (endPosition.timeStamp - startPosition.timeStamp))
    console.log(startPosition.touches[0].pageX)
    console.log(endPosition.changedTouches[0].pageX)

    //wenn ein Ende erkannt wurde die Geste in ein Event umwandeln
    if (Math.sqrt(((startPosition.touches[0].pageX - endPosition.changedTouches[0].pageX) ** 2) + ((startPosition.touches[0].pageY - endPosition.changedTouches[0].pageY) ** 2)) / (endPosition.timeStamp - startPosition.timeStamp) > 0.7) {
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