// Tells the CSS that JavaScript is running (so reveal animations can work)
document.documentElement.classList.add("js");
 
// 1. Mobile menu
const navToggle = document.getElementById("navToggle");
const nav = document.getElementById("nav");
 
navToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", isOpen);
    navToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
});
 
// Close the menu after tapping a link
nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
        nav.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
    });
});
 
// 2. Service cards: show / hide details
document.querySelectorAll(".more-btn").forEach((button) => {
    button.addEventListener("click", () => {
        const details = button.nextElementSibling;
        const open = details.hidden;
        details.hidden = !open;
        button.setAttribute("aria-expanded", open);
        button.textContent = open ? "Hide details －" : "What's included ＋";
    });
});
 
// 3. Fade-in animation when sections scroll into view
const revealItems = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });
    revealItems.forEach((item) => observer.observe(item));
} else {
    revealItems.forEach((item) => item.classList.add("visible"));
}
 
// 4. Contact form (sends to Formspree, which emails you)
const form = document.getElementById("contactForm");
const status = document.getElementById("formStatus");
 
form.addEventListener("submit", (event) => {
    event.preventDefault();
    status.style.color = "#5E5470";
    status.textContent = "Sending...";
 
    fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
    })
        .then((response) => {
            if (!response.ok) throw new Error("Status " + response.status);
            form.reset();
            status.style.color = "#1E7A46";
            status.textContent = "Thank you! Your enquiry has been sent. We will reply by email soon.";
        })
        .catch((error) => {
            status.style.color = "#B3261E";
            status.textContent = "Could not send (" + error.message + "). Please use the email or WhatsApp option.";
        });
});
 
// 5. Footer year updates itself
document.getElementById("year").textContent = new Date().getFullYear();
 
