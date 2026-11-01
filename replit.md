# Math Master Evolution

## Stack
- Existing browser game in plain HTML, CSS, and JavaScript.
- Python 3.12 serves the static files using the standard library.
- No third-party dependencies, external services, or secrets are required.

## Run on Replit
- Click **Run** to start the **Start application** workflow.
- The workflow runs `python -u main.py` from the project root.
- The server listens on `0.0.0.0:5000`; open Replit's Preview to play.
- Player progress is stored in the browser's local storage, not on the server.

## Known limitation
The imported repository does not include the audio files referenced in
`script.js`: `música.mp3`, `1.mp3`, `2.mp3`, and `3.mp3`. Music and sound effects
will not play until those assets are supplied. The game can be played without
them.

Keep the existing structure and stack when making changes. The Python server
is for development preview, not a production application server.
