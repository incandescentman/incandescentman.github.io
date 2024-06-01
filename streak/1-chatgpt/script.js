document.addEventListener('DOMContentLoaded', function () {
    console.log("DOM fully loaded and parsed");

    const container = document.getElementById('dayContainer');
    if (!container) {
        console.error("Container element not found!");
        return;
    }

    fetch('progress.org')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(data => {
            console.log('Fetched org-mode data:', data);
            processOrgModeData(data, container);
        })
        .catch(error => {
            console.error('Error fetching progress.org:', error);
        });
});

function parseDate(dateString) {
    const [year, month, day] = dateString.split('-');
    return new Date(year, month - 1, day);
}

function processOrgModeData(orgModeData, container) {
    const lines = orgModeData.trim().split('\n');
    let weekRow = document.createElement('div');
    weekRow.classList.add('week-row');

    let dayCount = 1;

    lines.forEach((line, index) => {
        console.log(`Processing line ${index + 1}: ${line}`);
        if (line.startsWith('*')) {
            const [status, dateString] = line.slice(2).trim().split(' ');
            const date = parseDate(dateString.slice(1, 11));
            const dayOfWeek = date.toLocaleString('en-US', { weekday: 'short' });
            const monthDayYear = date.toLocaleString('en-US', { month: 'short', day: 'numeric' });

            const dayElement = document.createElement('div');
            dayElement.classList.add('day');
            if (status === 'DONE') {
                dayElement.classList.add('completed');
                dayElement.innerHTML = `
                    <span class="checkmark">✔</span>
                    <p class="day-number">Day ${dayCount}</p>
                    <p class="full-date">${dayOfWeek} ${monthDayYear}</p>
                `;
            } else if (status === 'MISSED') {
                dayElement.classList.add('missed');
                dayElement.innerHTML = `
                    <span class="cross">✘</span>
                    <p class="day-number">Day ${dayCount}</p>
                    <p class="full-date">${dayOfWeek} ${monthDayYear}</p>
                `;
            } else {
                dayElement.classList.add('todo');
                dayElement.innerHTML = `
                    <span class="empty-square">☐</span>
                    <p class="day-number">Day ${dayCount}</p>
                    <p class="full-date">${dayOfWeek} ${monthDayYear}</p>
                `;
            }

            weekRow.appendChild(dayElement);
            dayCount++;

            // If it's the end of the week or the end of the data, append the weekRow to the container and start a new weekRow
            if (dayOfWeek === 'Sun' || index === lines.length - 1) {
                container.appendChild(weekRow);
                weekRow = document.createElement('div');
                weekRow.classList.add('week-row');
            }
        }
    });

    console.log('Processed org-mode data:', orgModeData);
    console.log('Generated HTML:', container.innerHTML);
}
