# Marketing Guys UTM Builder

Nederlandstalige, responsive React-app voor consistente campagnelinks. Alle verwerking en geschiedenis blijven in de browser; er is geen backend of account nodig.

## Lokaal starten

Installeer Node.js 22 LTS of nieuwer en voer in deze map uit:

```sh
npm install
npm run dev
```

Open de URL die Vite toont (standaard http://127.0.0.1:5173).

```sh
npm test          # unit-tests en gebruikersacties
npm run build    # TypeScript-controle en productiebuild
npm run preview  # productiebuild lokaal bekijken
```

## Zelfstandig HTML-bestand (offline)

Na `npm run build` bevat `dist/` alleen `index.html`. Dubbelklik op dit bestand om de app rechtstreeks via `file://` in je browser te openen. Een lokale webserver of internetverbinding is niet nodig. Je kunt alleen dit HTML-bestand kopiëren, mailen of op een andere computer openen. De productieversie kan ook op statische hosting draaien.

JavaScript, CSS, afbeeldingen en Montserrat zijn volledig ingebed. `vite.config.ts` bundelt de JavaScript als één IIFE en plaatst die als klassiek inline script na het HTML-element `#root`. Er zijn dus geen externe module-imports of losse assets nodig en React start pas nadat het benodigde element bestaat. De ontwikkelserver blijft de normale Vite-modules gebruiken.

Het formulier en de linkgeneratie werken offline; het openen van een externe bestemmingssite vereist uiteraard internet. Klembordtoegang hangt af van de browser en diens toestemming voor lokale bestanden. Bij geweigerde toegang verschijnt een foutmelding en kun je de URL handmatig selecteren en kopiëren. Via HTTPS of localhost is klembordtoegang doorgaans beschikbaar.

## Gebruik

1. Kies eventueel een snelle instelling.
2. Vul een volledige http(s)-URL, Source en Medium in. Name is optioneel.
3. Open geavanceerde opties voor Campaign ID, Term en Content.
4. Kopieer of open de gegenereerde link. Alleen die acties slaan een geschiedenisitem op.

De geschiedenis bevat maximaal twintig unieke links, met datum, campagne, bron en medium. Je kunt items apart verwijderen of de hele geschiedenis wissen. De opslag geldt alleen voor deze browser en dit webadres. Bij `file://` verschilt opslaggedrag per browser; een verplaatst of gedeeld HTML-bestand neemt je geschiedenis niet mee. Bij geblokkeerde opslag blijft nieuwe geschiedenis tijdens de sessie beschikbaar en verschijnt een melding. Wis browsergegevens om alle lokaal bewaarde gegevens te verwijderen.

## Configuratie en structuur

- `src/config.ts`: alle presets, voorkeurswaarden, beginwaarden, voorbeeld en parametervolgorde. Voeg presets toe als `{ name, source, medium }`. De optie Aangepast staat in het formulier en laat eigen waarden toe.
- `src/styles.css`: centrale merkkleuren in de Tailwind `@theme`-tokens en responsive vormgeving.
- `src/assets/marketing-guys-logo.png`: het aangeleverde transparante MG-logo.
- `src/assets/Montserrat-Variable.ttf`: ingebedde Montserrat met variabele gewichten (100–900); de bijbehorende OFL-licentie staat in `public/fonts/OFL-Montserrat.txt`. Alle tekst, inclusief invoervelden en URL-preview, gebruikt dit lettertype.
- `src/utm.ts`: pure validatie en URL-generatie via URL/URLSearchParams.
- `src/history.ts`: validatie, ontdubbelen en begrenzen van lokale geschiedenis.
- `src/App.tsx`: formulier, live preview, acties en geschiedenis; herbruikbare Field- en IconButton-componenten.
- `src/*.test.*`: URL-regressies, presets, opslag en de belangrijkste gebruikersacties.

Bestaande queryparameters en fragmenten blijven behouden. Alle bestaande parameters met een naam die begint met `utm_` (ongeacht hoofdletters) worden verwijderd voordat de ingevulde UTM-parameters in de afgesproken volgorde worden toegevoegd. Lege optionele waarden worden weggelaten. Ingevulde waarden behouden hun hoofdletters en speciale tekens; spaties worden URL-gecodeerd. Hoofdlettervarianten van voorkeurswaarden geven een waarschuwing, zonder automatische correctie.

Gebruik UTM-tags voor externe inkomende links. Gebruik ze niet voor interne navigatie, omdat dat attributie kan verstoren. De tool maakt trackinglinks; een correct ingestelde GA4-implementatie op de bestemmingssite blijft nodig.

Functionele referentie: [Google Campaign URL Builder](https://ga-dev-tools.google/campaign-url-builder/).

## Lynx-mascotte

`src/LynxMascot.tsx` toont de aangeleverde lynx in twee houdingen naast de live preview. Zodra Website URL, Source en Medium geldig zijn, verschijnt een blije lynx met een kort huppeltje (drie keer). Bij ongeldige invoer of wissen keert hij terug naar de rustige houding. De animaties respecteren `prefers-reduced-motion`.

Afbeelding: `src/assets/lynx-states.png`, met transparante achtergrond, twee gelijke cellen naast elkaar. Bewerkt vanuit de gebruikersreferentie met de ingebouwde imagegen-tool. Gebruikte prompt:

```text
Use case: identity-preserve. Edit target: the user's attached cartoon lynx. Create a compact website mascot sprite sheet with EXACTLY TWO equally sized square cells horizontally side by side (2 columns, 1 row). Transparent background, no text, no frames, no separators, no added props. Preserve this exact lynx character: orange spotted fur, cream paws/chest, black ear tufts, dark outlines, greenish shading, same illustration style. LEFT CELL: full body original calm attentive standing lynx, facing right, neutral friendly expression. RIGHT CELL: same full-body lynx, same scale and ground baseline, visibly delighted with eyes happily closed, broad joyful smile and one front paw slightly lifted, perked ears. Each lynx fully inside its own square cell with 8% clear padding. Both poses recognizable as the attached lynx. Crisp at small sizes. Output a single wide transparent 2:1 sprite-sheet image. Save the generated asset and return its local file path so it can be integrated into the React project.
```
