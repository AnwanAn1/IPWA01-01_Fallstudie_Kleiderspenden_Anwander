// Laden der Registrierungsdaten aus dem Local Storage des Browsers
document.addEventListener('DOMContentLoaded', bestaetigeRegistrierung);

// Ausgabe der Registrierungsdaten
function bestaetigeRegistrierung(){
    const abholart = document.querySelector('#abholart');
    let stringKleidung = '';
    let storedData = localStorage.getItem('registrierung');
    let parsedData = JSON.parse(storedData);

    document.querySelector('#id').textContent = '#' + parsedData['ID'];
    document.querySelector('#datum').innerHTML = parsedData['Datum'] + '<br>' + parsedData['Uhrzeit'];
    Object.keys(parsedData.Kleidung).forEach(key => {
        if (parsedData.Kleidung[key] !== ''){
            stringKleidung += key + ': ' + parsedData.Kleidung[key] + '<br>' ;
        }
    })
    document.querySelector('#spende').innerHTML = stringKleidung;
    document.querySelector('#krisengebiet').textContent = parsedData['Krisengebiet'];
    if(parsedData['Abholung'] === 'true'){
        let adresse = parsedData.Abholadresse;
        abholart.textContent = 'ja';
        document.querySelector('#abholadresse').innerHTML = adresse.Name['Vorname'] + ' ' + adresse.Name['Nachname'] + '<br>'+
                                                            adresse['Straße'] + '<br>' + adresse['PLZ'] + ' ' + adresse['Ort'];
        document.querySelector('#email').textContent = adresse['Email'];
        document.querySelector('#abholtermin').textContent = parsedData['Abholtermin'];
        document.querySelector('#beiAbgabe').style.display = 'none';
    } else {
        abholart.textContent = 'nein';
        document.querySelectorAll('tr.beiAbholung').forEach(tr => tr.style.display = 'none');
    }
}