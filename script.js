function buyTicket(platform) {
    alert('Redirecting to ' + platform + '...');
}
function handleSearch(event) {
    event.preventDefault(); // Prevents the form from actually submitting
    alert('Looking for your event'); // Displays the alert message
}
document.addEventListener('DOMContentLoaded', function() {
    const areas = document.querySelectorAll('.seating-chart area');
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    document.body.appendChild(tooltip);

    areas.forEach(area => {
        area.addEventListener('mouseenter', function(e) {
            tooltip.textContent = area.dataset.section;
            tooltip.style.display = 'block';
            tooltip.style.left = e.pageX + 'px';
            tooltip.style.top = e.pageY + 'px';
        });
        area.addEventListener('mouseleave', function() {
            tooltip.style.display = 'none';
        });
    });
});