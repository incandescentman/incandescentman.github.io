/*
📜 Timeless: The Infinitely Scrolling Calendar 📜
by Jay Dixit

An appreciative fork of Continuous Calendar by Evan Wallace (https://madebyevan.com/calendar/)
License: MIT License (see below)

Copyright 2010 Evan Wallace
Copyright 2024 Jay Dixit

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

The software is provided "as is", without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose and noninfringement. In no event shall the authors or copyright holders be liable for any claim, damages or other liability, whether in an action of contract, tort or otherwise, arising from, out of or in connection with the software or the use or other dealings in the software.
*/

/*
📜 Timeless: The Infinitely Scrolling Calendar 📜
by Jay Dixit

An appreciative fork of Continuous Calendar by Evan Wallace (https://madebyevan.com/calendar/)
License: MIT License (see below)
*/

////////////////////////////////////////////////////////////////////////
// 1. ADD A WEEKEND HIGHLIGHT CSS STYLE (inline):
////////////////////////////////////////////////////////////////////////

document.write(`
<style>
  /* Very simple weekend highlight */
  .weekend {
    background-color: #f0f7ff; /* light bluish background for weekends */
  }
</style>
`);



////////////////////////////////////////////////////////////////////////
// 2. GLOBAL UNDO STACK
////////////////////////////////////////////////////////////////////////

let undoStack = [];
const MAX_UNDO = 5;

function pushUndoState() {
  // Create a snapshot of all localStorage data
  const snapshot = {};
  for (const key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      snapshot[key] = localStorage[key];
    }
  }
  // Push JSON string of snapshot
  undoStack.push(JSON.stringify(snapshot));
  // Limit stack size
  if (undoStack.length > MAX_UNDO) {
    undoStack.shift();
  }
}

function undoLastChange() {
  if (undoStack.length === 0) {
    alert("No undo history available.");
    return;
  }
  // Pop the last saved state
  const lastSnapshotStr = undoStack.pop();
  if (!lastSnapshotStr) return;

  // Restore localStorage from snapshot
  localStorage.clear();
  const snapshotData = JSON.parse(lastSnapshotStr);
  for (const key in snapshotData) {
    localStorage.setItem(key, snapshotData[key]);
  }
  // Reload the page so the UI re-renders
  location.reload();
}

////////////////////////////////////////////////////////////////////////
// 3. KEYBOARD NAVIGATION
//    - ArrowUp (↑) scroll half-screen up
//    - ArrowDown (↓) scroll half-screen down
//    - T (or t) to jump to today (smooth scroll)
////////////////////////////////////////////////////////////////////////


// T key always regenerates around systemToday
document.addEventListener("keydown", (e) => {
  if (e.target && e.target.tagName.toLowerCase() === "textarea") return;

  if (e.key === "ArrowUp") {
    window.scrollBy(0, -window.innerHeight / 2);
  } else if (e.key === "ArrowDown") {
    window.scrollBy(0, window.innerHeight / 2);
  } else if (e.key === "t" || e.key === "T") {
    // always load the real system date
    loadCalendarAroundDate(systemToday);
  }
});



////////////////////////////////////////////////////////////////////////
// 4. QUICK DATE JUMP UI:
//    We inject an <input type="date"> and "Go" button into your header
////////////////////////////////////////////////////////////////////////

document.write(`
  <div style="margin: 0.5em;">
    <input type="date" id="jumpDate" style="max-width: 150px;">
    <button onclick="jumpToDate()" title="Jump to date">Go</button>
    <button onclick="undoLastChange()" title="Undo last change">Undo</button>
  </div>
`);

/* Jump to the specified date in <input type="date" id="jumpDate"> */


// keep track of system date separately
let systemToday = new Date();
// keep track of user-chosen jump date
let jumpDateVar = null;

function jumpToDate() {
  const val = document.getElementById("jumpDate").value;
  if (!val) return;
  const [yyyy, mm, dd] = val.split("-");
  jumpDateVar = new Date(yyyy, mm - 1, dd);
  loadCalendarAroundDate(jumpDateVar);
}


////////////////////////////////////////////////////////////////////////
// 5. STORING FULL DATES (YYYY-MM-DD):
//    We'll store an extra key "YYYY-MM-DD" whenever you create or remove notes.
//    This way your existing M_D_YYYY approach still works, but you also
//    maintain data in the ISO format for ICS or other usage.
////////////////////////////////////////////////////////////////////////

function parseDateFromId(idStr) {
  // idStr = "month_day_year" e.g. "5_6_2024"
  // from idForDate(date): date.getMonth() + '_' + date.getDate() + '_' + date.getFullYear()
  const parts = idStr.split("_");
  if (parts.length !== 3) return null;
  let [month, day, year] = parts.map((p) => parseInt(p));
  // Example: month=5 => means June (0-based from getMonth())
  // So the actual month is month+1
  const realMonth = month + 1;
  // Build an ISO string
  const iso = `${year.toString().padStart(4, "0")}-${String(realMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  return iso;
}

////////////////////////////////////////////////////////////////////////
// BELOW IS YOUR ORIGINAL CODE, with MINIMAL MODIFICATIONS annotated
////////////////////////////////////////////////////////////////////////

function nextItemId() {
  localStorage.nextId = localStorage.nextId ? parseInt(localStorage.nextId) + 1 : 0;
  return "item" + localStorage.nextId;
}

// callback expects a list of objects with the itemId and itemValue properties set
function lookupItemsForParentId(parentId, callback) {
  if (localStorage[parentId]) {
    var parentIdsToItemIds = localStorage[parentId].split(",");
    var itemList = [];

    for (var itemIndex in parentIdsToItemIds) {
      var itemId = parentIdsToItemIds[itemIndex];
      var itemValue = localStorage[itemId];
      itemList.push({ itemId: itemId, itemValue: itemValue });
    }

    callback(itemList);
  }
}

function storeValueForItemId(itemId) {
  // Push current localStorage state before making changes
  pushUndoState();

  var item = document.getElementById(itemId);
  if (item) {
    var parentId = item.parentNode.id;
    localStorage[itemId] = item.value;

    var parentIdsToItemIds = localStorage[parentId] ? localStorage[parentId].split(",") : [];
    var found = false;
    for (var itemIndex in parentIdsToItemIds) {
      if (parentIdsToItemIds[itemIndex] == itemId) {
        found = true;
        break;
      }
    }
    if (!found) {
      parentIdsToItemIds.push(itemId);
      localStorage[parentId] = parentIdsToItemIds;
    }

    // Also store in YYYY-MM-DD format
    const isoDate = parseDateFromId(parentId);
    if (isoDate) {
      localStorage[isoDate] = item.value;
    }

    // Store the timestamp of the last saved event
    localStorage.setItem("lastSavedTimestamp", Date.now());
  }
}

async function shouldLoadOrExport() {
  try {
    const handle = await window.showDirectoryPicker();
    const fileHandle = await handle.getFileHandle("calendar_data.json", { create: false });

    const file = await fileHandle.getFile();
    const contents = await file.text();
    const data = JSON.parse(contents);

    const fileTimestamp = data.lastSavedTimestamp;
    const localTimestamp = localStorage.getItem("lastSavedTimestamp");

    if (fileTimestamp && (!localTimestamp || fileTimestamp > localTimestamp)) {
      // Backup existing localStorage data
      downloadBackupStorageData();

      // Load data from file if it's newer
      await loadDataFromFileHandle(fileHandle);
      location.reload(); // Refresh to show loaded data
    } else {
      // Save data to file if local data is newer
      await exportToFileHandle(fileHandle);
    }
  } catch (err) {
    if (err.name === "AbortError") {
      console.log("User cancelled file/directory selection");
    } else {
      console.error("Error syncing data:", err);
      alert("There was an error syncing the calendar data. See console for details.");
    }
  }
}

async function loadDataFromFileHandle(fileHandle) {
  try {
    const file = await fileHandle.getFile();
    const contents = await file.text();
    const data = JSON.parse(contents);

    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        localStorage.setItem(key, data[key]);
      }
    }

    alert("Loaded calendar data from file.");
  } catch (err) {
    console.error("Error loading data from file:", err);
    alert("There was an error loading the calendar data. See console for details.");
  }
}

async function exportToFileHandle(fileHandle) {
  try {
    const writable = await fileHandle.createWritable();

    const data = {};
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        data[key] = localStorage.getItem(key);
      }
    }
    data.lastSavedTimestamp = Date.now();

    await writable.write(JSON.stringify(data));
    await writable.close();

    alert("Saved calendar data to file.");
  } catch (err) {
    console.error("Error saving data to file:", err);
    alert("There was an error saving the calendar data. See console for details.");
  }
}

function removeValueForItemId(itemId) {
  // Push current localStorage state before making changes
  pushUndoState();

  delete localStorage[itemId];

  var item = document.getElementById(itemId);
  if (!item) return;
  var parentId = item.parentNode.id;
  if (localStorage[parentId]) {
    var parentIdsToItemIds = localStorage[parentId].split(",");
    for (var itemIndex in parentIdsToItemIds) {
      if (parentIdsToItemIds[itemIndex] == itemId) {
        parentIdsToItemIds = parentIdsToItemIds
          .slice(0, itemIndex)
          .concat(parentIdsToItemIds.slice(itemIndex + 1));
        if (parentIdsToItemIds.length) localStorage[parentId] = parentIdsToItemIds;
        else delete localStorage[parentId];
        break;
      }
    }
  }

  // Also remove from the YYYY-MM-DD key if it exists
  const isoDate = parseDateFromId(parentId);
  if (isoDate && localStorage[isoDate]) {
    delete localStorage[isoDate];
  }
}

var todayDate;
var firstDate;
var lastDate;
var calendarTableElement;
var itemPaddingBottom = navigator.userAgent.indexOf("Firefox") != -1 ? 2 : 0;
var months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
var daysOfWeek = ["Mon", "Tues", "Wed", "Thurs", "Fri", "Sat", "Sun"];

function idForDate(date) {
  // Return "month_day_year", e.g. "5_6_2024" if date is June 6 2024
  return date.getMonth() + "_" + date.getDate() + "_" + date.getFullYear();
}

function recalculateHeight(itemId) {
  var item = document.getElementById(itemId);
  if (!item) return;
  item.style.height = "0px"; // item.scrollHeight doesn't shrink on its own
  item.style.height = item.scrollHeight + itemPaddingBottom + "px";
}

function keydownHandler(event) {
  recalculateHeight(this.id);

  if (event.key === "Enter") {
    event.preventDefault(); // Stop the default enter key action (newline)
    storeValueForItemId(this.id); // Save the item
    this.blur(); // Force the textarea to lose focus
    return false; // Stop further processing
  } else {
    if (this.storeTimeout) clearTimeout(this.storeTimeout);
    this.storeTimeout = setTimeout(() => storeValueForItemId(this.id), 1000);
  }
}

function checkItem() {
  if (this.value.length == 0) {
    removeValueForItemId(this.id);
    this.parentNode.removeChild(this);
  }
}

function generateItem(parentId, itemId) {
  var item = document.createElement("textarea");
  var parent = document.getElementById(parentId);
  if (!parent) return; // offscreen items aren't generated
  parent.appendChild(item);
  item.id = itemId;
  item.onkeydown = keydownHandler; // Change from onkeyup to onkeydown
  item.onblur = checkItem;
  item.spellcheck = false;
  return item;
}

document.onclick = function (e) {
  var parentId = e.target.id;
  if (parentId.indexOf("_") == -1) return;

  var item = generateItem(parentId, nextItemId());
  recalculateHeight(item.id);
  storeValueForItemId(item.id);
  item.focus();
};

function generateDay(day, date) {
  // HIGHLIGHT WEEKENDS:
  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
  if (isWeekend) {
    day.className += " weekend";
  }



  var isShaded = date.getMonth() % 2;
  var isToday =
    date.getDate() == todayDate.getDate() &&
    date.getMonth() == todayDate.getMonth() &&
    date.getFullYear() == todayDate.getFullYear();

  if (isShaded) day.className += " shaded";
  if (isToday) day.className += " today";

  day.id = idForDate(date);
  day.innerHTML =
    "<span>" +
    daysOfWeek[getAdjustedDayIndex(date)] +
    " " +
    months[date.getMonth()] +
    " " +
    date.getDate() +
    "</span>";

  lookupItemsForParentId(day.id, function (items) {
    for (var i in items) {
      var item = generateItem(day.id, items[i].itemId);
      item.value = items[i].itemValue;
      recalculateHeight(item.id);
    }
  });
}

function getAdjustedDayIndex(date) {
  var day = date.getDay();
  // Adjust so Monday=0 and Sunday=6
  return day === 0 ? 6 : day - 1;
}

function prependWeek() {
  var week = calendarTableElement.insertRow(0);
  var monthName = "";

  do {
    firstDate.setDate(firstDate.getDate() - 1);
    if (firstDate.getDate() === 1) {
      monthName = months[firstDate.getMonth()] + " " + firstDate.getFullYear();
    }
    var day = week.insertCell(0);
    generateDay(day, new Date(firstDate)); // Use a new instance to avoid reference issues
  } while (getAdjustedDayIndex(firstDate) !== 0);
}

function appendWeek() {
  var week = calendarTableElement.insertRow(-1);
  var monthName = "";

  do {
    lastDate.setDate(lastDate.getDate() + 1);
    if (lastDate.getDate() === 1) {
      monthName = months[lastDate.getMonth()] + " " + lastDate.getFullYear();
    }
    var day = week.insertCell(-1);
    generateDay(day, new Date(lastDate)); // Ensure a new date object is used
  } while (getAdjustedDayIndex(lastDate) !== 6); // ensure the week ends on Sunday

  var extra = week.insertCell(-1);
  extra.className = "extra";
  extra.innerHTML = monthName;
}

function scrollPositionForElement(element) {
  // find the y position by working up the DOM tree
  var clientHeight = element.clientHeight;
  var y = element.offsetTop;
  while (element.offsetParent && element.offsetParent != document.body) {
    element = element.offsetParent;
    y += element.offsetTop;
  }

  // center the element in the window
  return y - (window.innerHeight - clientHeight) / 2;
}

function scrollToToday() {
  window.scrollTo(0, scrollPositionForElement(document.getElementById(idForDate(todayDate))));
}

var startTime;
var startY;
var goalY;

function curve(x) {
  return x < 0.5 ? 4 * x * x * x : 1 - 4 * (1 - x) * (1 - x) * (1 - x);
}

function scrollAnimation() {
  var percent = (new Date() - startTime) / 1000;

  if (percent > 1) window.scrollTo(0, goalY);
  else {
    window.scrollTo(0, Math.round(startY + (goalY - startY) * curve(percent)));
    setTimeout(scrollAnimation, 10);
  }
}

function documentScrollTop() {
  var scrollTop = document.body.scrollTop;
  if (document.documentElement) scrollTop = Math.max(scrollTop, document.documentElement.scrollTop);
  return scrollTop;
}

function documentScrollHeight() {
  var scrollHeight = document.body.scrollHeight;
  if (document.documentElement)
    scrollHeight = Math.max(scrollHeight, document.documentElement.scrollHeight);
  return scrollHeight;
}

function smoothScrollToToday() {
  var elem = document.getElementById(idForDate(todayDate));
  if (!elem) return; // edge case if date not in DOM
  goalY = scrollPositionForElement(elem);
  startY = documentScrollTop();
  startTime = new Date();
  if (goalY != startY) setTimeout(scrollAnimation, 10);
}

function poll() {
  // add more weeks so you can always keep scrolling
  if (documentScrollTop() < 200) {
    var oldScrollHeight = documentScrollHeight();
    for (var i = 0; i < 8; i++) prependWeek();
    window.scrollBy(0, documentScrollHeight() - oldScrollHeight);
  } else if (
    documentScrollTop() >
    documentScrollHeight() - window.innerHeight - 200
  ) {
    for (var i = 0; i < 8; i++) appendWeek();
  }

  // update 'today' when the date changes
  var newTodayDate = new Date();
  if (
    newTodayDate.getDate() != todayDate.getDate() ||
    newTodayDate.getMonth() != todayDate.getMonth() ||
    newTodayDate.getFullYear() != todayDate.getFullYear()
  ) {
    var todayElement = document.getElementById(idForDate(todayDate));
    if (todayElement) todayElement.className = todayElement.className.replace("today", "");

    todayDate = newTodayDate;

    todayElement = document.getElementById(idForDate(todayDate));
    if (todayElement) todayElement.className += " today";
  }
}

function loadCalendarAroundDate(seedDate) {
  calendarTableElement.innerHTML = "";
  firstDate = new Date(seedDate);

  // Find the closest previous Monday
  while (getAdjustedDayIndex(firstDate) !== 0) {
    firstDate.setDate(firstDate.getDate() - 1);
  }

  lastDate = new Date(firstDate);
  lastDate.setDate(firstDate.getDate() - 1);

  appendWeek();
  while (documentScrollHeight() <= window.innerHeight) {
    prependWeek();
    appendWeek();
  }

  setTimeout(scrollToToday, 50);
}

// Improved download function with key check
function downloadLocalStorageData() {
  var data = {};
  for (var key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      data[key] = localStorage.getItem(key);
    }
  }
  var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
  var downloadAnchorNode = document.createElement("a");
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", "calendar_data.json");
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}

function downloadBackupStorageData() {
  var data = {};
  for (var key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      data[key] = localStorage.getItem(key);
    }
  }
  var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
  var downloadAnchorNode = document.createElement("a");
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", "calendar_data_backup.json");
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();

  alert(
    "A backup of your existing calendar data has been saved to your Downloads folder just in case."
  );
}

// Improved load data function with better feedback
function loadDataFromFile() {
  var input = document.getElementById("fileInput");
  if (input.files.length === 0) {
    alert("Please select a file to load.");
    return;
  }
  var file = input.files[0];
  var reader = new FileReader();

  reader.onload = function (e) {
    try {
      var data = JSON.parse(e.target.result);
      for (var key in data) {
        if (data.hasOwnProperty(key)) {
          localStorage.setItem(key, data[key]);
        }
      }
      alert("Data loaded successfully!");
      location.reload(); // Optional: reload the page to reflect the new data
    } catch (error) {
      alert("Invalid file format. Please select a valid JSON file.");
    }
  };

  reader.onerror = function () {
    alert("There was an error reading the file!");
  };

  reader.readAsText(file);
}

async function exportToiCloud() {
  try {
    // Prompt the user to select a directory
    const handle = await window.showDirectoryPicker();

    // Create a new file handle in the selected directory
    const fileHandle = await handle.getFileHandle("calendar_data.json", { create: true });

    // Create a writable stream
    const writable = await fileHandle.createWritable();

    // Prepare the data to be saved
    var data = {};
    for (var key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        data[key] = localStorage.getItem(key);
      }
    }
    var dataStr = JSON.stringify(data);

    // Write the data to the file
    await writable.write(dataStr);

    // Close the writable stream
    await writable.close();

    alert("Data saved to iCloud Drive successfully!");
  } catch (error) {
    alert("Failed to save data to iCloud Drive.");
    console.error(error);
  }
}

window.onload = function () {
  calendarTableElement = document.getElementById("calendar");
  todayDate = new Date();

  loadCalendarAroundDate(todayDate);
  setInterval(poll, 100);
};

function showHelp() {
  document.getElementById("help").style.display = "block";
}
function hideHelp() {
  document.getElementById("help").style.display = "none";
}

