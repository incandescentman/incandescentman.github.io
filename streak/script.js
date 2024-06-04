document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('dayContainer');
    if (!container) {
        console.error("Container element not found!");
        return;
    }

    fetch('progress.org')
        .then(response => response.text())
        .then(data => processOrgModeData(data, container))
        .catch(error => console.error('Error fetching progress.org:', error));
});



function processOrgModeData(orgModeData, container) {
    const lines = orgModeData.trim().split('\n').filter(line => line.startsWith('*'));
    let weekRow = document.createElement('div');
    weekRow.classList.add('week-row');

    let dayCount = 0;
    let currentWeekDay = 0;
    let firstWeek = true; // Flag for the first week

    for (const line of lines) {
        const dateMatch = line.match(/<(\d{4}-\d{2}-\d{2})/);
        if (!dateMatch) continue;

        const dateString = dateMatch[1];
        const date = new Date(dateString);
        const targetWeekDay = date.getDay();

        if (firstWeek) { // Handle the first week differently
            while (currentWeekDay < targetWeekDay) {
                weekRow.appendChild(document.createElement('div'));
                weekRow.lastChild.classList.add('day');
                currentWeekDay++;
            }
            firstWeek = false; // Turn off the flag after the first week
        } else if (currentWeekDay !== targetWeekDay) {  // Mismatch in subsequent weeks
            while (currentWeekDay < targetWeekDay) {
                weekRow.appendChild(document.createElement('div'));
                weekRow.lastChild.classList.add('day');
                currentWeekDay = (currentWeekDay + 1) % 7;
            }
        }

        const dayElement = document.createElement('div');
        dayElement.classList.add('day');
        dayElement.innerHTML = `<p class="full-date">${date.toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</p>`;

        // Only add "DONE", "MISSED", or "TODO" if present in the line
        if (line.includes("DONE") || line.includes("MISSED") || line.includes("TODO")) {
            const status = line.split(' ')[1];
            dayCount++;
            dayElement.innerHTML += `<p class="day-number">Day ${dayCount}</p>`;

            if (status === 'DONE') {
                dayElement.classList.add('completed');
                dayElement.innerHTML = `<span class="checkmark">✔</span>` + dayElement.innerHTML;
            } else if (status === 'MISSED') {
                dayElement.classList.add('missed');
                dayElement.innerHTML = `<span class="cross">✘</span>` + dayElement.innerHTML;
            } else if (status === 'TODO') {
                dayElement.classList.add('todo');
                dayElement.innerHTML = `<span class="empty-square">☐</span>` + dayElement.innerHTML;
            }
        }

        weekRow.appendChild(dayElement);
        currentWeekDay = (currentWeekDay + 1) % 7;

        if (currentWeekDay === 0) {
            container.appendChild(weekRow);
            weekRow = document.createElement('div');
            weekRow.classList.add('week-row');
        }
    }

    if (weekRow.children.length > 0) {
        container.appendChild(weekRow);
    }
}
