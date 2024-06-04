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
    let weekRow = null;

    let dayCount = 0;
    let startCounting = false;

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

            dayElement.innerHTML = `
                <p class="full-date">${dayOfWeek} ${monthDayYear}</p>
            `;

            if (status === 'TODO' || status === 'DONE' || status === 'MISSED') {
                if (!startCounting) {
                    startCounting = true;
                    dayCount = 1;
                } else {
                    dayCount++;
                }

                if (status === 'DONE') {
                    dayElement.classList.add('completed');
                    dayElement.innerHTML += `<p class="day-number">Day ${dayCount}</p>`;
                    dayElement.innerHTML = `<span class="checkmark">✔</span>` + dayElement.innerHTML;
                } else if (status === 'MISSED') {
                    dayElement.classList.add('missed');
                    dayElement.innerHTML += `<p class="day-number">Day ${dayCount}</p>`;
                    dayElement.innerHTML = `<span class="cross">✘</span>` + dayElement.innerHTML;
                } else if (status === 'TODO') {
                    dayElement.classList.add('todo');
                    dayElement.innerHTML += `<p class="day-number">Day ${dayCount}</p>`;
                    dayElement.innerHTML = `<span class="empty-square">☐</span>` + dayElement.innerHTML;
                }
            }

            if (!weekRow || dayOfWeek === 'Mon') {
                weekRow = document.createElement('div');
                weekRow.classList.add('week-row');
                container.appendChild(weekRow);
            }

            weekRow.appendChild(dayElement);
        }
    });

    console.log('Processed org-mode data:', orgModeData);
    console.log('Generated HTML:', container.innerHTML);
}
