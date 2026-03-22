# Staj Tracker

Staj Tracker is a lightweight internship application tracking app built with vanilla HTML, CSS, and JavaScript.

It helps you manage applications in one place with status tracking, search and filtering, Kanban view, and CSV/JSON import-export support. All data is stored locally in the browser using `localStorage`, so no backend setup is required.

## Features

- Track company name, position, application date, follow-up date, status, details, and applicant portal link
- Switch between card view and Kanban view
- Update application status directly from each card
- Filter, search, and sort applications
- Export and import data as `JSON`
- Export and import data as `CSV`
- Persist data locally with `localStorage`
- Deploy as a static site with GitHub Pages

## Tech Stack

- HTML
- CSS
- JavaScript
- GitHub Actions for deployment

## Project Structure

- `index.html`: Main UI structure
- `styles.css`: Styling and responsive layout
- `app.js`: Application logic, storage, filtering, Kanban, and import-export handling
- `.github/workflows/deploy-pages.yml`: GitHub Pages deployment workflow

## Running Locally

Open [index.html](C:\Users\minik\OneDrive\Belgeler\New%20project\index.html) in a browser.

Because the project is fully static, no package installation or build step is needed.

## Deployment

This project is configured for GitHub Pages via GitHub Actions.

1. Create an empty GitHub repository
2. Push this project to the `main` branch
3. In the repository settings, open `Settings > Pages`
4. Set the source to `GitHub Actions`
5. Pushes to `main` will trigger automatic deployment

The deployment workflow is defined in `.github/workflows/deploy-pages.yml`.

## Data Storage

Application data is stored in the browser using `localStorage`.

- Data remains available on the same browser unless storage is cleared
- You can create backups using the JSON or CSV export options
- Imported files replace the current in-browser dataset

## Possible Improvements

- Add tags such as `remote`, `frontend`, or `referral`
- Add a timeline view for application progress
- Add reminder-focused follow-up highlighting
- Add notes history per application
