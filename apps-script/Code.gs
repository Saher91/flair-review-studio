const SHEET_NAME = "Review Results";
const HEADERS = [
  "Received at",
  "Reviewer",
  "Case number",
  "Case ID",
  "Rating (1-10)",
  "Note",
  "Client saved at"
];

function setupReviewSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (!spreadsheet) {
    throw new Error("Open Apps Script from the results spreadsheet.");
  }

  PropertiesService.getScriptProperties()
    .setProperty("RESULTS_SPREADSHEET_ID", spreadsheet.getId());
  const sheet = ensureReviewSheet_(spreadsheet);
  return sheet.getName();
}

function ensureReviewSheet_(spreadsheet) {
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function doGet() {
  return jsonResponse({ ok: true, service: "FLAIR review results" });
}

function doPost(event) {
  let lock;
  try {
    if (!event || !event.postData || !event.postData.contents) {
      throw new Error("Missing JSON request body.");
    }

    const data = JSON.parse(event.postData.contents);
    const reviewer = safeText(data.reviewer, 100).trim();
    const caseId = String(data.case_id || "").trim();
    const caseNumber = Number(data.case_number);
    const rating = data.rating === "" || data.rating == null
      ? ""
      : Number(data.rating);
    const note = safeText(data.note, 2000);

    if (!reviewer) throw new Error("Reviewer name is required.");
    if (!/^case_\d{5}$/.test(caseId)) throw new Error("Invalid case ID.");
    if (!Number.isInteger(caseNumber) || caseNumber < 1 || caseNumber > 1056) {
      throw new Error("Invalid case number.");
    }
    if (Number(caseId.slice(5)) !== caseNumber) {
      throw new Error("Case ID and case number do not match.");
    }
    if (rating !== "" && (!Number.isInteger(rating) || rating < 1 || rating > 10)) {
      throw new Error("Rating must be a whole number from 1 to 10.");
    }
    if (rating === "" && !note) throw new Error("The result has no rating or note.");

    const sheet = setupReviewSheet_();
    lock = LockService.getScriptLock();
    lock.waitLock(30000);

    const lastRow = sheet.getLastRow();
    let targetRow = 0;
    if (lastRow > 1) {
      const keys = sheet.getRange(2, 2, lastRow - 1, 3).getValues();
      for (let index = 0; index < keys.length; index += 1) {
        if (String(keys[index][0]) === reviewer && String(keys[index][2]) === caseId) {
          targetRow = index + 2;
          break;
        }
      }
    }

    const row = [
      new Date(),
      reviewer,
      caseNumber,
      caseId,
      rating,
      note,
      safeText(data.at, 40)
    ];
    if (targetRow) {
      sheet.getRange(targetRow, 1, 1, row.length).setValues([row]);
    } else {
      sheet.appendRow(row);
    }
    return jsonResponse({ ok: true });
  } catch (error) {
    console.error(error);
    return jsonResponse({ ok: false, error: String(error.message || error) });
  } finally {
    if (lock && lock.hasLock()) lock.releaseLock();
  }
}

function setupReviewSheet_() {
  const spreadsheetId = PropertiesService.getScriptProperties()
    .getProperty("RESULTS_SPREADSHEET_ID");
  if (!spreadsheetId) {
    throw new Error("Run setupReviewSheet from the spreadsheet before deploying.");
  }
  return ensureReviewSheet_(SpreadsheetApp.openById(spreadsheetId));
}

function safeText(value, maxLength) {
  let text = String(value == null ? "" : value).slice(0, maxLength);
  if (/^[\s]*[=+\-@]/.test(text)) text = "'" + text;
  return text;
}

function jsonResponse(value) {
  return ContentService
    .createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}
