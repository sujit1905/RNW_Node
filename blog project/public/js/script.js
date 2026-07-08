// Client-side interactions for MyBlog

document.addEventListener('DOMContentLoaded', function() {
    // Automatically close flash alerts after 4 seconds
    setTimeout(function() {
        var alerts = document.querySelectorAll('.alert-dismissible');
        alerts.forEach(function(alert) {
            var bsAlert = bootstrap.Alert.getInstance(alert);
            if (!bsAlert) {
                bsAlert = new bootstrap.Alert(alert);
            }
            if (bsAlert) {
                bsAlert.close();
            }
        });
    }, 4000);

    // Dynamic active links in Navbar
    var currentPath = window.location.pathname;
    var navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    navLinks.forEach(function(link) {
        var href = link.getAttribute('href');
        if (currentPath === href || (href !== '/blog' && currentPath.startsWith(href))) {
            link.classList.add('active');
        }
    });
});
