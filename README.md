# FLAIR Review Studio — GitHub Pages

This folder is a static-site package for hosting the review app on GitHub Pages. It includes the 1,056 cases and their image assets. Anyone who can access the published site can also access those images.

## Set up result collection

1. Create a Google Sheet for the review results.
2. In the sheet, open **Extensions → Apps Script** and paste the contents of `apps-script/Code.gs`.
3. Save, select `setupReviewSheet`, and run it once. Approve the requested Google Sheets permission.
4. Choose **Deploy → New deployment → Web app**. Set **Execute as** to yourself and access to **Anyone**. Deploy and copy the URL ending in `/exec`.
5. Paste that URL into `SHEET_URL` in `review-config.js`.
6. Open `index.html` locally and submit a test review before publishing. Confirm the test row appears in the sheet's **Review Results** tab.

For an existing deployment, paste an updated `apps-script/Code.gs` into the sheet's Apps Script editor, then select **Deploy → Manage deployments**, edit the web-app deployment, choose **New version**, and click **Deploy**. The existing `/exec` URL stays the same.

The app sends a case result when it is rated or a note changes. Requests are serialized, retried, and checked against the Apps Script JSON response; the note status reports a confirmed save or the error, and **Save comment now** retries manually. The Apps Script updates the row for the same reviewer and case instead of adding a duplicate.

The Apps Script web app accepts public POST requests. Do not put patient identifiers, confidential notes, or other sensitive information in review notes. Monitor the results sheet for unwanted submissions.

## Publish on GitHub Pages

1. Create a GitHub repository for this site. It must be public to use GitHub Pages on the free plan.
2. Upload the **contents** of this folder, including `index.html`, `review-config.js`, `.nojekyll`, `assets/`, and `apps-script/`. GitHub's web upload is inconvenient for thousands of image files; use GitHub Desktop or Git instead.
3. In the repository, open **Settings → Pages** and publish from the `main` branch and `/ (root)`.
4. Share the URL shown by GitHub Pages. It will look like `https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/`.

The original review HTML is over GitHub's 100 MB per-file limit. This package splits the images into individual files so no single image asset has that problem.

## Reviewer workflow

Reviewers must enter a name before they can rate or annotate. Choosing a rating keeps the reviewer on the current case so they can add a note; use **Next** to move on. Notes save to the browser while typing and sync to the configured sheet after typing pauses; leaving the note field or clicking **Save comment now** sends it immediately. The note status indicates when a request was sent. Open the sheet's **Review Results** tab to verify that it arrived.

The review interface uses a fixed dark navy theme (#19273D), adapts to phone-sized screens, and does not follow a reviewer's light-system preference.


The English video tutorial opens every time the platform loads, including after a refresh. **Skip tutorial** closes it for the current visit, and **Watch tutorial** replays it. Browser audio restrictions may require selecting **Start tutorial**. Tutorial dismissal does not change saved ratings, notes, or reviewer identity.

Identical saves already in progress share one request. Unchanged ratings and notes already confirmed by the sheet are not sent again during the same page session. If the content changes, it is saved again; the Apps Script updates the existing reviewer/case row under a lock instead of adding another row. Failed or unconfirmed saves remain retryable through **Save comment now**. No final submission button is needed.
