# Staj Tracker

Staj Tracker is a lightweight internship application tracking app built with vanilla HTML, CSS, and JavaScript.

It provides a clean interface for managing internship applications with status tracking, search and filtering, Kanban organization, and CSV/JSON import-export support. All data is stored locally in the browser using `localStorage`.

[Live Demo](https://emirhansariyar.github.io/Staj-Tracker/)

## Highlights

- Card view and Kanban view
- Application status management
- Search, filtering, and sorting
- CSV and JSON import-export
- Local persistence with `localStorage`
- Static deployment with GitHub Pages

## Features

- Track company name, role, application date, follow-up date, status, details, and applicant portal link
- Switch between card view and Kanban view
- Update application status directly from each card
- Search, filter, and sort applications
- Export and import data as `JSON`
- Export and import data as `CSV`
- Persist data locally with `localStorage`

## Tech Stack

- HTML
- CSS
- JavaScript

## Project Structure

- `index.html`: Main UI structure
- `styles.css`: Styling and responsive layout
- `app.js`: Application logic, storage, filtering, Kanban, and import-export handling

## Running Locally

Open `index.html` in a browser.

Because the project is fully static, no package installation or build step is required.

## Data Storage

Application data is stored in the browser using `localStorage`.

- Data remains available in the same browser unless storage is cleared
- Backups can be created using the JSON or CSV export options
- Imported files replace the current in-browser dataset
