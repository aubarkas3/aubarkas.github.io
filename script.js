function buyTicket(platform) {
    alert('Redirecting to ' + platform + '...');
}
function handleSearch(event) {
    event.preventDefault(); // Prevents the form from actually submitting
    alert('Looking for your event'); // Displays the alert message
}
document.querySelectorAll('.button').forEach(button => {
    button.addEventListener('click', function(event) {
        event.preventDefault();
        alert('Redirecting to ' + this.href);
        window.location.href = this.href; // or other tracking functionality
    });
});