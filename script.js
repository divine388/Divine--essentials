// script.js

// Sticky Header
window.onscroll = function() { stickyHeader() };  
var header = document.getElementById("myHeader");  
var sticky = header.offsetTop;  

function stickyHeader() {  
    if (window.pageYOffset > sticky) {  
        header.classList.add("sticky");  
    } else {  
        header.classList.remove("sticky");  
    }  
}

// Dark Mode Toggle
const toggleSwitch = document.getElementById('toggle-switch');
const currentTheme = localStorage.getItem('theme') ? localStorage.getItem('theme') : null;

if (currentTheme) {  
    document.body.classList.toggle('dark-mode', currentTheme === 'dark');  
}

toggleSwitch.addEventListener('change', () => {  
    document.body.classList.toggle('dark-mode');  
    const theme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';  
    localStorage.setItem('theme', theme);  
});

// Smooth Scrolling
const links = document.querySelectorAll('a[href^="#"]');

for (const link of links) {  
    link.addEventListener('click', function (e) {  
        e.preventDefault();  
        const targetId = this.getAttribute('href');  
        document.querySelector(targetId).scrollIntoView({  
            behavior: 'smooth'  
        });  
    });  
}

// Form Validation
const form = document.getElementById('contact-form');
form.addEventListener('submit', function(e) {  
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    if (!name || !email) {  
        e.preventDefault();  
        alert('Please fill in all fields.');  
    }  
});

// Interactive Hover Effects
const hoverElements = document.querySelectorAll('.hover-effect');
hoverElements.forEach(el => {
    el.addEventListener('mouseenter', () => {  
        el.classList.add('hovered');  
    });  
    el.addEventListener('mouseleave', () => {  
        el.classList.remove('hovered');  
    });  
});
