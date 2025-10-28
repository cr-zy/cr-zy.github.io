document.addEventListener('DOMContentLoaded', function() {
    let currentLang = 'en';
    const langBtn = document.getElementById('lang-btn');
    function setLanguage(lang) {
        currentLang = lang;
        langBtn.textContent = lang.toUpperCase();
        document.documentElement.lang = lang;
        document.querySelectorAll('[data-en]').forEach(element => {
            const text = element.getAttribute(`data-${lang}`);
            if (text) {
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    element.placeholder = text;
                } else {
                    element.textContent = text;
                }
            }
        });
        localStorage.setItem('preferredLanguage', lang);
    }
    langBtn.addEventListener('click', function() {
        const newLang = currentLang === 'en' ? 'my' : 'en';
        setLanguage(newLang);
    });
    async function detectCountryAndSetLanguage() {
        try {
            const savedLang = localStorage.getItem('preferredLanguage');
            if (savedLang) {
                setLanguage(savedLang);
                return;
            }
            const response = await fetch('https://ipapi.co/json/');
            const data = await response.json();
            const country = data.country_code;
            const malayCountries = ['MY', 'SG', 'BN', 'ID'];
            if (malayCountries.includes(country)) {
                setLanguage('my');
            } else {
                setLanguage('en');
            }
        } catch (error) {
            console.error('Error detecting country:', error);
            setLanguage('en');
        }
    }
    detectCountryAndSetLanguage();
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            navLinks.forEach(l => l.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            this.classList.add('active');
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            targetSection.classList.add('active');
        });
    });
    const projectsContainer = document.getElementById('projects-container');
    const projects = [
        {
            name: {
                en: 'Free Movies',
                my: 'Movie Percuma'
            },
            description: {
                en: 'Don\'t have money to watch movies? No worries! Free Movie is here to save the day by providing a collection of free movies for you to enjoy without payment like other streaming services.',
                my: 'Tak dak duit nak tengok movie? Jangan risau! Free Movie ada untuk menyelamatkan hari anda dengan menyediakan koleksi movie percuma untuk anda nikmati tanpa bayaran seperti perkhidmatan penstriman lain.'
            },
            technologies: ['HTML', 'CSS', 'JavaScript'],
            url: 'FreeMovie'
        },
    ];
    function renderP() {
        projectsContainer.innerHTML = '';
        projects.forEach(project => {
            const projectCard = document.createElement('div');
            projectCard.className = 'project-card';
            const projectTitle = document.createElement('h3');
            projectTitle.className = 'project-title';
            projectTitle.textContent = project.name[currentLang];
            const projectDescription = document.createElement('p');
            projectDescription.className = 'project-description';
            projectDescription.textContent = project.description[currentLang];
            const projectTech = document.createElement('div');
            projectTech.className = 'project-tech';
            project.technologies.forEach(tech => {
                const techTag = document.createElement('span');
                techTag.className = 'tech-tag';
                techTag.textContent = tech;
                projectTech.appendChild(techTag);
            });
            projectCard.appendChild(projectTitle);
            projectCard.appendChild(projectDescription);
            projectCard.appendChild(projectTech);
            projectCard.addEventListener('click', function() {
                window.open(`https://cr-zy.github.io/${project.url}`, '_blank');
            });
            projectsContainer.appendChild(projectCard);
        });
    }
    renderP();
    langBtn.addEventListener('click', renderProjects);
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
    window.addEventListener('scroll', function() {
        const header = document.querySelector('header');
        if (window.scrollY > 50) {
            header.style.backgroundColor = 'rgba(10, 10, 10, 0.95)';
            header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.5)';
        } else {
            header.style.backgroundColor = 'rgba(10, 10, 10, 0.9)';
            header.style.boxShadow = 'none';
        }
    });
});