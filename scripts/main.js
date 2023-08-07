// Auswahl der HTML-Elemente
const abgebenButton = document.querySelector('#abgeben');
const abholenButton = document.querySelector('#abholen');
const beiAbholenContainer = document.querySelector('#beiAbholen')
const checkboxes = document.querySelectorAll('input[type="checkbox"]');
const plzInput = document.querySelector('#plzInput');
const krisengebietInput = document.querySelector('#krisengebietInput');
const abholterminInput = document.querySelector('#abholterminInput');
const mainNavLinks = document.querySelectorAll('.mainNav');

// Event Listener
window.addEventListener('load', zeigeBild);
document.addEventListener('DOMContentLoaded', erzeugeAbholtermine);
document.addEventListener('DOMContentLoaded', ladeKrisengebiete);
document.querySelector('form').addEventListener('submit', verarbeiteSubmit);
abgebenButton.addEventListener('click', aktiviereAbgeben);
abholenButton.addEventListener('click', aktiviereAbholen);
checkboxes.forEach(checkbox => checkbox.addEventListener('click', aktiviereAnzahl));
mainNavLinks.forEach(link => link.addEventListener('click', collapseNavbar));

// Funktionen
// Aktivieren des Abgeben-Buttons
function aktiviereAbgeben(){
    abholenButton.classList.remove('active');
    abholenButton.value = false;
    abgebenButton.value = true;
    beiAbholenContainer.style.display = 'none';
}

// Aktivieren des Abholen-Buttons
function aktiviereAbholen(){
    abgebenButton.classList.remove('active');
    abgebenButton.value = false;
    abholenButton.value = true;
    beiAbholenContainer.style.display = 'block';

}

// Aktivieren des Anzahl-Input-Felds bei Kleidungsauswahl
function aktiviereAnzahl(event){
    let checkbox = event.target;
    let idCheckbox = checkbox.id;
    let idAnzahl = idCheckbox + 'Anzahl';
    let inputAnzahl = document.getElementById(idAnzahl);
    if(checkbox.checked){
        inputAnzahl.value = 1;
        inputAnzahl.removeAttribute('disabled');
    } else{
        inputAnzahl.value = '';
        inputAnzahl.setAttribute('disabled', 'disabled');
    }
}

// Funktion zum Laden von Krisengebieten aus Text-Datei
async function ladeKrisengebiete(){
    let txt = await fetch('krisengebiete.txt');
    let string = await txt.text();
    let krisengebiete = string.split('\n');
    krisengebiete.forEach(krisengebiet =>{
        let option = document.createElement('option');
        let text = document.createTextNode(krisengebiet);
        option.appendChild(text);
        krisengebietInput.appendChild(option);
    });
}

// Funktion zur automatischen Erzeugung der möglichen Abholtermine
function erzeugeAbholtermine(){
    const heute = new Date();
    let abholtermine = [];

    //Differenz bis Donnerstag:
    let difDo = 4-heute.getDay();

    //ab einem Mittwoch soll der erste mögliche Liefertermin in der darauffolgenden Woche sein
    if(difDo < 2){
        difDo += 7;
    }

    //Erstellen des ersten möglichen Abholtermins
    let abholtermin1 = new Date(heute);
    abholtermin1.setDate(heute.getDate()+difDo);
    abholtermine.push(formatiereDatum(abholtermin1));

    //Erstellen der restlichen Abholtermine
    for(let i=1; i<6; i++){
        let abholterminX = new Date(abholtermin1);
        abholterminX.setDate(abholtermin1.getDate() + 7*i)  
        abholtermine.push(formatiereDatum(abholterminX));
    }
    //Aufnahme der Abholtermine in die Dropdown-Liste
    for(let i=1; i<7; i++){
        let terminId = 'termin' + i;
        document.getElementById(terminId).value = abholtermine[i-1];
        document.getElementById(terminId).textContent = abholtermine[i-1];
    }
}

//Umwandlung des Date-Objekts in String mit Format 'DD.MM.YYYY'
function formatiereDatum(datum){
    let tagString = datum.getDate().toString().padStart(2,'0');
    let monatString = (datum.getMonth() + 1).toString().padStart(2,'0');
    let jahrString = datum.getFullYear().toString();
    return (tagString + '.' + monatString + '.' + jahrString);
}

//Umwandlung des Date-Objekts in String mit Format 'HH:MM Uhr'
function formatiereUhrzeit(datum){
    let stunden = datum.getHours().toString().padStart(2,'0');
    let minuten = datum.getMinutes().toString().padStart(2,'0');
    return (stunden + ':' + minuten + ' Uhr');
}

// Erzeugung sowie Speicherung eines Objektes mit Registrierungsdaten und Weiterleitung, wenn Validierung erfolgreich
function verarbeiteSubmit(event){
    event.preventDefault();
    if(validiereFormular()){
        let objektRegistrierung = erzeugeObjekt();
        let jsonObjekt = JSON.stringify(objektRegistrierung);
        localStorage.setItem('registrierung', jsonObjekt);
        window.location.href='pages/confirmation.html';

        //Senden des Objektes an Server
        /*fetch('serverseitige-verarbeitung.php', {
            method: 'POST',
            body: jsonObjekt
        })
        .then(() => {
            localStorage.setItem('registrierung', jsonObjekt);
            window.location.href='confirmation.html';
        })*/

    } else {
        // Fehlermeldung, wenn Eingaben unvollständig/fehlerhaft
        document.querySelector('#fehler').innerHTML='Bitte Eingaben prüfen.';
    }
}

// Validieren der Nutzereingaben
function validiereFormular(){
    let validierErgebnisse = [];
    let istValide;
    validierErgebnisse.push(validiereKleidungsauswahl());
    validierErgebnisse.push(validiereAuswahl(krisengebietInput))
    if(abgebenButton.value === 'true'){
        istValide = !validierErgebnisse.includes(false);
        return istValide;
    }
    validierErgebnisse.push(validiereAdresse());
    validierErgebnisse.push(validiereAuswahl(abholterminInput))
    istValide = !validierErgebnisse.includes(false);

    return istValide;
}

// Prüfung, ob alle Adressfelder ausgefüllt wurden sowie Prüfung auf unerlaubte Zeichen
function validiereAdresse(){
    const inputFelder = document.querySelectorAll('.adresse');
    let werte = [];
    let zeichenValide = [];
    let fehlermeldung = '';

    inputFelder.forEach((item) =>{
        werte.push(item.value.trim());
        zeichenValide.push(validiereZeichen(item.value));
        let istValide = item.value.trim() && validiereZeichen(item.value);
        item.classList.toggle('border-danger', !istValide);
    })
    if(werte.includes('')){
        fehlermeldung = 'Bitte Adresseingaben vervollständigen.<br>';
    }
    if(zeichenValide.includes(false)){
        fehlermeldung += 'Deine Eingabe enthält nicht erlaubte Zeichen (<>&\"\'/\;$\(\)|=).<br>';
    }

    fehlermeldung += validierePLZ();
    document.querySelector('#adresseFehler').innerHTML = fehlermeldung;
    return !fehlermeldung;
}

// Überprüfen von Nutzereingaben, um Code-Injektion zu verhindern
function validiereZeichen(string){
    const regex = /^[^<>&"'/\\;$()|=]*$/;
    return regex.test(string);
}

// Prüfung, ob Adresse im Abholbereich liegt (nur bei Abholung)
function validierePLZ(){
    if((plzInput.value < 12000 || plzInput.value > 12999) && plzInput.value){
        plzInput.classList.add('border-danger');
        return 'Die angegebene Adresse liegt außerhalb unseres Abholgebiets. Eine Abholung ist leider nur mit der Postleitzahl 12xxx möglich.';
    }
    return '';
}

// Prüfung, ob mindestens eine Kleidungsart ausgewählt wurde
function validiereKleidungsauswahl(){
    let isChecked = false;
    const kleidungFehler = document.querySelector('#kleidungFehler');
    for(let i = 0; i < checkboxes.length; i++){
        if(checkboxes[i].checked){
            isChecked = true;
            break;
        }
    }
    if(!isChecked){
        kleidungFehler.innerHTML = 'Bitte wähle mindestens eine Option aus.'
    } else {
        kleidungFehler.innerHTML = '';
    }
    return isChecked;
}

// Prüfung, ob in select-Feldern eine Auswahl erfolgte
function validiereAuswahl(selectElement){
    const idFehler = selectElement.id.replace('Input','Fehler');
    const fehler = document.getElementById(idFehler);
    let istValide = selectElement.value !== '';
    selectElement.classList.toggle('border-danger', !istValide);

    if(!istValide){
        fehler.innerHTML = 'Bitte treffe eine Auswahl.';
    } else {
        fehler.innerHTML = '';
    }

    return istValide
}

//Erzeugung eines Objekts mit den Daten der Registrierung
function erzeugeObjekt(){
    let datumRegistrierung = new Date();
    let objektRegistrierung = {
        Kleidung : {
            Oberteile : document.querySelector('#oberteileAnzahl').value,
            Hosen : document.querySelector('#hosenAnzahl').value,
            Kleider : document.querySelector('#kleiderAnzahl').value,
            Jacken : document.querySelector('#jackenAnzahl').value,
            Schuhe : document.querySelector('#schuheAnzahl').value,
            Sonstige : document.querySelector('#sonstigesAnzahl').value,
        },
        Krisengebiet : krisengebietInput.value,
        Abholung: abholenButton.value,
        Abholadresse : {
            Name : {
                Vorname : document.querySelector('#vornameInput').value,
                Nachname : document.querySelector('#nachnameInput').value,
            },
            Straße : document.querySelector('#straßeInput').value,
            PLZ : plzInput.value,
            Ort : document.querySelector('#ortInput').value,
            Email: document.querySelector('#emailInput').value,
        },
        Abholtermin : abholterminInput.value,
        ID : erzeugeID(),
        Datum: formatiereDatum(datumRegistrierung),
        Uhrzeit: formatiereUhrzeit(datumRegistrierung),
    }
    return objektRegistrierung;
}

// Funktion zur Ausgabe der Registrierungs-ID
function erzeugeID(){
    let id = Math.floor(Math.random()*10000000000);
    let stringId = id.toString().padStart(10, '0');
    return stringId;
}

// Einklappen der Navigations-Liste bei Klick auf Link
function collapseNavbar(){
    document.querySelector('#navbarButton').click();
}

// Funktion zur Vermeidung von Flash of Unstyled Content
function zeigeBild(){
    document.querySelector('#keyvisual').style.display = 'block';
    document.querySelector('#platzhalter').style.display = 'none';
}