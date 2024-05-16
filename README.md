#### GERMAN VERSION BELOW
### *** Erläuterung:

Das ist ein Mini-Projekt, zum automatischen Ändern von Spielen und Titeln, sowie wechseln von Szenen in OBS-Studio.
Dieser Branche enthält eine Fassung in etwas modernere Code-Form.

Benötigt Node, light-server, einen ElectronJS-Wrapper o.ä.

### Diese Version ist in aktuellem Zustand nicht einsetzbar!

### *** Requirements:

- Webbrowser auf dem System mit der OBS-Instanz, Ideal: Chrome, Firefox.
- OBS starten
- Werkzeuge :: Websockets-Servereinstellungen
- Einen Port (Standard 4444) und ein Passwort festlegen

### *** Installation & Start:
- Mit einem Texteditor die Datei "settings.json" öffnen und hier Port und Passwort eintragen (siehe Requirements).
- Das Passwort muss zwischen Anführungszeichen stehen! Der Port nicht.
- config.js speichern
- Die Datei index.html im Browser öffnen.

### *** Bedienung:

Die ersten beiden Schritte sollten nur einmalig, bzw. nicht allzu oft notwendig sein.
Alle Werte werden im Local-Storage des Webbrowsers auf Dauer gespeichert.

Schritt 1: Access-Token erzeugen

Klicke auf "Token ermitteln". Das führt zu (m)einer App, der du zustimmen musst. Anschließend wirst du umgeleitet auf eine
URL die ca. so ausschaut:

http://localhost/#access_token=wkejqju3i123kl1h23jhdkjh123&scope=channel%3Amanage%3Abroadcast&token_type=bearer

Kopiere den Teil zwischen #access_token=**[DIESEN HIER]**&scope=channel in das Feld für den Access Token und klicke auf "Einstellungen speichern".

Schritt 2: Broadcaster ID ermitteln

Klicke auf ID ermitteln. Dazu wird auf jeden Fall der Token benötigt, sonst kann man nicht auf die Twitch-API zugreifen.
Gib hier deinen Twitch-Account-Namen deines Broadcasts an. Klicke anschließend auf "Einstellungen speichern".
Du kannst hier zwar gern auch andere Channels angeben, aber da wird sich nichts ändern, da nur du eingeloggt
beim Abholen des Access Token zugestimmt hast, dass (m)eine App Daten nur in deinem Channel ändern darf.

Jetzt ist das System bereit. Du kannst in den automatisch erkannten Szenen jetzt für jede Szene bzw. deine Wunschszenen
einen Titel eintragen und ein Spiel. Die Spiele werden bei Eingabe automatisch ermittelt, also ob die bei Twitch überhaupt
verfügbar sind.

Wenn alles eingegeben ist, klicke auf "Eingaben speichern" (unten).

Dann kannst du die Wechselerkennung aktivieren. Erst dann wird das Tool beim Wechsel deiner Szenen auch die korrekten
Spiele und Titel bei deinem Broadcast-Channel live(!) ändern. Das Tool reagiert nur dann, wenn auch wenigstens ein Spiel
oder Titel von dir eingetragen wurde, sonst fasst es die Szenen nicht an.

### *** Q&A:

**Warum muss ich das Access-Token erneuern?**
- Das Access-Token ist nur 60 Tage gültig. Das ist ein Sicherheitsfeature von Twitch. Das Tool erinnert dich daran, wenn es
  abläuft. Du musst dann nur wieder auf "Token ermitteln" klicken und den neuen Token speichern.

**Warum ist das nicht in einer App?**
- Keine Lust bisher ^^

### *** Known Issues:

- Das Tool ist nicht für mehrere Channels gleichzeitig ausgelegt. Es ist nur für einen Channel gedacht.
- Die Timeouts funktionieren noch nicht korrekt, mangels einer vernünftigen nextScene()-Methode.