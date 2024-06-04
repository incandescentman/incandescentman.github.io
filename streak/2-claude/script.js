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
    const match = dateString.match(/<(\d{4}-\d{2}-\d{2})/);
    if (match) {
        return new Date(match[1]);
    }
    return null;
}





function processOrgModeData(orgModeData, container) {
    const lines = orgModeData.trim().split('\n');
    let weekRow = document.createElement('div');
    weekRow.classList.add('week-row');

    let dayCount = 0;

    lines.forEach((line, index) => {
        console.log(`Processing line ${index + 1}: ${line}`);
        if (line.startsWith('*')) {
            const parts = line.slice(2).trim().split(' ');
            const status = parts[0];
            const dateString = parts[1];
            const date = parseDate(dateString);
            if (!date) {
                console.error(`Invalid date format in line: ${line}`);
                return;
            }

            const dayOfWeek = date.toLocaleString('en-US', { weekday: 'short' });
            const monthDayYear = date.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

            const dayElement = document.createElement('div');

            if (status === 'DONE') {
                dayCount++;
                dayElement.classList.add('day', 'completed');
                dayElement.innerHTML = `<span class="checkmark">✔</span>
                    <p class="full-date">${dayOfWeek} ${monthDayYear}</p>
                    <p class="day-number">Day ${dayCount}</p>`;
            } else if (status === 'MISSED') {
                dayCount++;
                dayElement.classList.add('day', 'missed');
                dayElement.innerHTML = `<span class="cross">✘</span>
                    <p class="full-date">${dayOfWeek} ${monthDayYear}</p>
                    <p class="day-number">Day ${dayCount}</p>`;
            } else if (status === 'TODO') {
                dayCount++;
                dayElement.classList.add('day', 'todo');
                dayElement.innerHTML = `<span class="empty-square">☐</span>
                    <p class="full-date">${dayOfWeek} ${monthDayYear}</p>
                    <p class="day-number">Day ${dayCount}</p>`;
            } else {
                dayElement.innerHTML = `<p class="full-date">${dayOfWeek} ${monthDayYear}</p>`;
            }

            weekRow.appendChild(dayElement);

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
