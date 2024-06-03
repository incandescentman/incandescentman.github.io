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
    let startRendering = false;

    lines.forEach((line, index) => {
        console.log(`Processing line ${index + 1}: ${line}`);
        if (line.startsWith('*')) {
            const parts = line.slice(2).trim().split(' ');
            const status = parts[0].startsWith('<') ? '' : parts[0];
            const dateString = parts[0].startsWith('<') ? parts[0] : parts[1];
            const date = parseDate(dateString);
            if (!date) {
                console.error(`Invalid date format in line: ${line}`);
                return;
            }
            const dayOfWeek = date.toLocaleString('en-US', { weekday: 'short' });
            const monthDayYear = date.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

            const dayElement = document.createElement('div');
            dayElement.classList.add('day');

            if (status === 'TODO' || status === 'DONE' || status === 'MISSED') {
                if (!startRendering) {
                    startRendering = true;
                    dayCount = 1;
                } else {
                    dayCount++;
                }
                dayElement.innerHTML = `
                    <p class="full-date">${dayOfWeek} ${monthDayYear}</p>
                    <p class="day-number">Day ${dayCount}</p>
                `;

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
            } else {
                dayElement.innerHTML = `
                    <p class="full-date">${dayOfWeek} ${monthDayYear}</p>
                `;
            }

            if (startRendering) {
                weekRow.appendChild(dayElement);

                // If it's the end of the week or the end of the data, append the weekRow to the container and start a new weekRow
                if (dayOfWeek === 'Sun' || index === lines.length - 1) {
                    container.appendChild(weekRow);
                    weekRow = document.createElement('div');
                    weekRow.classList.add('week-row');
                }
            }
        }
    });

    console.log('Processed org-mode data:', orgModeData);
    console.log('Generated HTML:', container.innerHTML);
}
