# Swedemom production incentives: employee proposal and survey

Staff-facing materials for the production bonus program (Hub project "Intake Metrics & Incentives", P-HUB-4, Linear workspace swedemom).

**Resume here.** The current design and its open assumptions are in the Linear doc "Production incentive program: design v1 (pitched 2026-10-05)", whose v2 section reflects these files. Decisions with their reasons are in the brain note `memories/production-incentives.md`.

## Files

| File | What |
| -- | -- |
| `proposal.html` | Source of the 21-page employee proposal (hand-written HTML, inline CSS and SVG illustrations, Swedemom brand). |
| `Swedemom-Production-Bonus-Proposal.pdf` | The rendered PDF, v2 (2026-10-07). |
| `build.mjs` | Renders the PDF with headless Chrome, checks every page for clipped content, and with `--preview` writes `preview/preview-N.png`. |
| `survey.html` | Source of the survey questions PDF for manager review (`Swedemom-Production-Bonus-Survey-Questions.pdf`, built by `build.mjs`). Keep it in sync with `survey-draft.md` and `create-survey-form.gs`. |
| `survey-draft.md` | The anonymous survey, readable for manager review (v3: branching by main job, 30 questions, a typical person sees 17 to 20). |
| `create-survey-form.gs` | Google Apps Script that builds the same survey as a Google Form with email collection and sign-in off. Paste into script.google.com and run `createSurvey`. Branding (theme color, header) is set afterwards in the Forms UI. |
| `assets/` | Swedemom logo and butterfly. |

## Build

```bash
npm install          # puppeteer-core only; uses the system Chrome
node build.mjs --preview
```

Set `CHROME_PATH` if Chrome or Chromium isn't found automatically. Every page must print `ok`; an `X` means content is clipped. Look at the previews before sending.

## Status (2026-10-07)

- Proposal v2 and survey drafted, with Jamie's first read-through applied 2026-10-07 (draft and estimate disclaimers, a more upbeat everyone-wins framing, Hub-down backup plans). Next: manager review, then the proposal and survey go to the whole organization by email, with the survey open Oct 12-16 as a Google Form.
- Assumptions in the PDF that Jamie hasn't confirmed are listed in the Linear doc's v2 section.
- Software for the program is tracked as HUB-135 (Hub clock and CSV import into Gusto) and HUB-136 (Gusto CLI spike), plus HUB-123, HUB-30 and HUB-32.

## Status (2026-10-14)

- Survey v3 (Jamie, 2026-10-14):
  - Branching by main job.
  - A required "why" after negative or "rarely" answers.
  - Time tracking explained as necessary, with the survey asking how to make it painless.
  - Intake method questions (camera vs keyword, and why).
  - Station equipment questions.
  - "How should we start?" (team goals first is Devri's idea).
- Proposal updated from the Slack group (Cami and Devri, 2026-10-14):
  - A ready-to-go station card (dedicated phone camera, fast computer, scanner, label printer, scale, Hub tutorials).
  - The survey is open for one week from the email, not fixed dates.
- Next: Jamie reviews; the managers give one more approval; then send to the All SCOG email group (pending Savannah's OK).
