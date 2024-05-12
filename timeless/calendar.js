/*
 📜 Timeless: The Infinitely Scrolling Calendar 📜
 by Jay Dixit

 An appreciative fork of Continuous Calendar by Evan Wallace
 (https://madebyevan.com/calendar/)
 License: MIT License (see below)

 Copyright (c) 2010 Evan Wallace
 Copyright (c) 2024 Jay Dixit

 Permission is hereby granted, free of charge, to any person
 obtaining a copy of this software and associated documentation
 files (the "Software"), to deal in the Software without
 restriction, including without limitation the rights to use,
 copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the
 Software is furnished to do so, subject to the following
 conditions:

 The above copyright notice and this permission notice shall be
 included in all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 OTHER DEALINGS IN THE SOFTWARE.
*/

// TODO: maybe put in a way to go to any date which reloads the calendar at that date
// TODO: need a way of exporting/importing data

function nextItemId()
{
	localStorage.nextId = localStorage.nextId ? parseInt(localStorage.nextId) + 1 : 0;
	return 'item' + localStorage.nextId;
}

// callback expects a list of objects with the itemId and itemValue properties set
function lookupItemsForParentId(parentId, callback)
{
	if(localStorage[parentId])
	{
		var parentIdsToItemIds = localStorage[parentId].split(',');
		var list = [];

		for(var i in parentIdsToItemIds)
		{
			var itemId = parentIdsToItemIds[i];
			var itemValue = localStorage[itemId];
			list.push({'itemId': itemId, 'itemValue': itemValue});
		}

		callback(list);
	}
}

function storeValueForItemId(itemId)
{
	var item = document.getElementById(itemId);
	if(item)
	{
		var parentId = item.parentNode.id;
		localStorage[itemId] = item.value;

		var parentIdsToItemIds = localStorage[parentId] ? localStorage[parentId].split(',') : [];
		var found = false;
		for(var i in parentIdsToItemIds)
		{
			if(parentIdsToItemIds[i] == itemId)
			{
				found = true;
				break;
			}
		}
		if(!found)
		{
			parentIdsToItemIds.push(itemId);
			localStorage[parentId] = parentIdsToItemIds;
		}
	}
}

function removeValueForItemId(itemId)
{
	delete localStorage[itemId];

	var item = document.getElementById(itemId);
	if(!item) return;
	var parentId = item.parentNode.id;
	if(localStorage[parentId])
	{
		var parentIdsToItemIds = localStorage[parentId].split(',');
		for(var i in parentIdsToItemIds)
		{
			if(parentIdsToItemIds[i] == itemId)
			{
				parentIdsToItemIds = parentIdsToItemIds.slice(0, i).concat(parentIdsToItemIds.slice(i + 1));
				if(parentIdsToItemIds.length) localStorage[parentId] = parentIdsToItemIds;
				else delete localStorage[parentId];
				break;
			}
		}
	}
}

var todayDate;
var firstDate;
var lastDate;
var calendarTableElement;
var itemPaddingBottom = (navigator.userAgent.indexOf('Firefox') != -1) ? 2 : 0;
var months = [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ];

var daysOfWeek = ['Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat', 'Sun'];

function idForDate(date)
{
	return date.getMonth() + '_' + date.getDate() + '_' + date.getFullYear();
}

function recalculateHeight(itemId)
{
	var item = document.getElementById(itemId);
	if(!item) return; // TODO: why is this sometimes null?
	item.style.height = '0px'; // item.scrollHeight doesn't shrink on its own
	item.style.height = item.scrollHeight + itemPaddingBottom + 'px';
}

function keydownHandler(event) {
    recalculateHeight(this.id);

    if (event.key === "Enter") { // Use event.key which is more readable
        event.preventDefault(); // Stop the default enter key action (newline)
        storeValueForItemId(this.id); // Save the item
        this.blur(); // Force the textarea to lose focus
        return false; // Stop further processing
    } else {
        if (this.storeTimeout) clearTimeout(this.storeTimeout);
        this.storeTimeout = setTimeout(() => storeValueForItemId(this.id), 1000);
    }
}



function checkItem()
{
	if(this.value.length == 0)
	{
		removeValueForItemId(this.id);
		this.parentNode.removeChild(this);
	}
}

function generateItem(parentId, itemId) {
    var item = document.createElement('textarea');
    var parent = document.getElementById(parentId);
    if (!parent) return; // offscreen items aren't generated
    parent.appendChild(item);
    item.id = itemId;
    item.onkeydown = keydownHandler; // Change from onkeyup to onkeydown
    item.onblur = checkItem;
    item.spellcheck = false;
    return item;
}

document.onclick = function(e)
{
	var parentId = e.target.id;
	if(parentId.indexOf('_') == -1) return;

	var item = generateItem(parentId, nextItemId());
	recalculateHeight(item.id);
	storeValueForItemId(item.id);
	item.focus();
}



function generateDay(day, date) {
    console.log(date); // Log to see the actual date being passed

    var isShaded = (date.getMonth() % 2);
    var isToday = (date.getDate() == todayDate.getDate() && date.getMonth() == todayDate.getMonth() && date.getFullYear() == todayDate.getFullYear());

    if (isShaded) day.className += ' shaded';
    if (isToday) day.className += ' today';

    day.id = idForDate(date);
    day.innerHTML = '<span>' + daysOfWeek[getAdjustedDayIndex(date)] + ' ' + months[date.getMonth()] + ' ' + date.getDate() + '</span>';

    lookupItemsForParentId(day.id, function(items) {
        for (var i in items) {
            var item = generateItem(day.id, items[i].itemId);
            item.value = items[i].itemValue;
            recalculateHeight(item.id);
        }
    });
}

function getAdjustedDayIndex(date) {
    var day = date.getDay();
    return (day === 0) ? 6 : day - 1; // Adjusts so Monday is 0 and Sunday is 6
}


function prependWeek() {
    var week = calendarTableElement.insertRow(0);
    var monthName = '';

    do {
        firstDate.setDate(firstDate.getDate() - 1);
        console.log("Prepending date:", firstDate.toDateString()); // Check what date is being set
        if (firstDate.getDate() === 1) {
            monthName = months[firstDate.getMonth()] + ' ' + firstDate.getFullYear();
        }
        var day = week.insertCell(0);
        generateDay(day, new Date(firstDate)); // Use a new instance to avoid reference issues
    } while (getAdjustedDayIndex(firstDate) !== 0);
}




function appendWeek() {
    var week = calendarTableElement.insertRow(-1);
    var monthName = '';

    do {
        lastDate.setDate(lastDate.getDate() + 1);
        if (lastDate.getDate() === 1) {
            monthName = months[lastDate.getMonth()] + ' ' + lastDate.getFullYear();
        }
        var day = week.insertCell(-1);
        generateDay(day, new Date(lastDate)); // Ensure a new date object is used
    } while (getAdjustedDayIndex(lastDate) !== 6); // Ensure the week ends on Sunday

    var extra = week.insertCell(-1);
    extra.className = 'extra';
    extra.innerHTML = monthName;
}



function scrollPositionForElement(element)
{
	// find the y position by working up the DOM tree
	var clientHeight = element.clientHeight;
	var y = element.offsetTop;
	while(element.offsetParent && element.offsetParent != document.body)
	{
		element = element.offsetParent;
		y += element.offsetTop;
	}

	// center the element in the window
	return y - (window.innerHeight - clientHeight) / 2;
}

function scrollToToday()
{
	window.scrollTo(0, scrollPositionForElement(document.getElementById(idForDate(todayDate))));
}

var startTime;
var startY;
var goalY;

function curve(x)
{
	return (x < 0.5) ? (4*x*x*x) : (1 - 4*(1-x)*(1-x)*(1-x));
}

function scrollAnimation()
{
	var percent = (new Date() - startTime) / 1000;

	if(percent > 1) window.scrollTo(0, goalY);
	else
	{
		window.scrollTo(0, Math.round(startY + (goalY - startY) * curve(percent)));
		setTimeout('scrollAnimation()', 10);
	}
}

function documentScrollTop()
{
	var scrollTop = document.body.scrollTop;
	if(document.documentElement) scrollTop = Math.max(scrollTop, document.documentElement.scrollTop);
	return scrollTop;
}

function documentScrollHeight()
{
	var scrollHeight = document.body.scrollHeight;
	if(document.documentElement) scrollHeight = Math.max(scrollHeight, document.documentElement.scrollHeight);
	return scrollHeight;
}

function smoothScrollToToday()
{
	goalY = scrollPositionForElement(document.getElementById(idForDate(todayDate)));
	startY = documentScrollTop();
	startTime = new Date();
	if(goalY != startY) setTimeout('scrollAnimation()', 10);
}

// TODO: when scrolling down, safari sometimes scrolls down by the exact height of content added
function poll()
{
	// add more weeks so you can always keep scrolling
	if(documentScrollTop() < 200)
	{
		var oldScrollHeight = documentScrollHeight();
		for(var i = 0; i < 8; i++) prependWeek();
		window.scrollBy(0, documentScrollHeight() - oldScrollHeight);
	}
	else if(documentScrollTop() > documentScrollHeight() - window.innerHeight - 200)
	{
		for(var i = 0; i < 8; i++) appendWeek();
	}

	// update today when the date changes
	var newTodayDate = new Date;
	if(newTodayDate.getDate() != todayDate.getDate() || newTodayDate.getMonth() != todayDate.getMonth() || newTodayDate.getFullYear() != todayDate.getFullYear())
	{
		// TODO: resize all items in yesterday and today because of the border change

		var todayElement = document.getElementById(idForDate(todayDate));
		if(todayElement) todayElement.className = todayElement.className.replace('today', '');

		todayDate = newTodayDate;

		todayElement = document.getElementById(idForDate(todayDate));
		if(todayElement) todayElement.className += ' today';
	}
}


function loadCalendarAroundDate(seedDate) {
    calendarTableElement.innerHTML = '';
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

    setTimeout('scrollToToday()', 50);
}


function downloadLocalStorageData() {
    var data = {};
    for (var key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
            data[key] = localStorage.getItem(key);
        }
    }
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "calendar_data.json");
    document.body.appendChild(downloadAnchorNode); // Required for Firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

function loadDataFromFile() {
    var input = document.getElementById('fileInput');
    if (input.files.length === 0) {
        alert('Please select a file to load.');
        return;
    }
    var file = input.files[0];
    var reader = new FileReader();

    reader.onload = function(e) {
        var data = JSON.parse(e.target.result);
        for (var key in data) {
            if (data.hasOwnProperty(key)) {
                localStorage.setItem(key, data[key]);
            }
        }
        alert('Data loaded successfully!');
        location.reload(); // Optional: reload the page to reflect the new data
    };

    reader.onerror = function() {
        alert('There was an error reading the file!');
    };

    reader.readAsText(file);
}



window.onload = function()
{
	calendarTableElement = document.getElementById('calendar');
	todayDate = new Date;

	loadCalendarAroundDate(todayDate);
	setInterval('poll()', 100);
}

function showHelp() { document.getElementById('help').style.display = 'block'; }
function hideHelp() { document.getElementById('help').style.display = 'none'; }

document.write('<div id="header">' +
    '<a href="https://github.com/incandescentman/timeless" target="_blank" class="timeless" rel="noopener noreferrer">🪐 <span class="bold">Timeless:</span> The Infinite Calendar ✨</a><br>' +
    '<a class="button" href="javascript:smoothScrollToToday()" data-tooltip="Go to Today">📅</a>' +
    '<a class="button" href="javascript:document.getElementById(\'fileInput\').click()" data-tooltip="Load Calendar Data">📥</a>' +
    '<a class="button" href="javascript:downloadLocalStorageData()" data-tooltip="Save Calendar Data">💾</a>' +
    '<a class="button" href="javascript:showHelp()" data-tooltip="Help">ℹ️</a>' +
    '</div>');
document.write('<input type="file" id="fileInput" style="display: none;" onchange="loadDataFromFile()">');
document.write('<table id="calendar"></table>');
document.write('<div id="help"><div><ul><li>Click on a day to add a note</li><li>To delete a note, delete its text</li><li>Use the scroll wheel to move forward or backward in time</li></ul><a class="button" href="javascript:hideHelp()">Close</a></div></div>');

