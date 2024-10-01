function buyTicket(platform) {
    alert('Redirecting to ' + platform + '...');
}
function handleSearch(event) {
    event.preventDefault(); // Prevents the form from actually submitting
    alert('Looking for your event'); // Displays the alert message
}
document.addEventListener('DOMContentLoaded', function() {
    const image = document.getElementById('seatingChart');
    const mapAreas = document.querySelectorAll('area');
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    document.body.appendChild(overlay);

    mapAreas.forEach(area => {
        area.addEventListener('mouseenter', function() {
            const coords = this.getAttribute('coords').split(',').map(Number);
            const rect = image.getBoundingClientRect();
            overlay.style.width = `${coords[2] - coords[0]}px`;
            overlay.style.height = `${coords[3] - coords[1]}px`;
            overlay.style.left = `${rect.left + window.scrollX + coords[0]}px`;
            overlay.style.top = `${rect.top + window.scrollY + coords[1]}px`;
            overlay.style.display = 'block';
        });

        area.addEventListener('mouseleave', function() {
            overlay.style.display = 'none';
        });
    });
});