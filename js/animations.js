import { selectAll } from "./utils.js";

export const initAnimations = () => {

    initRevealAnimations();
    initCounters();
    initHeroSlider();
    initParallax();

};

/* ===========================
   Reveal Elements
=========================== */

function initRevealAnimations() {

    const elements = selectAll(
        ".reveal-fade, .reveal-slide"
    );

    if (!elements.length) return;

    const observer = new IntersectionObserver(

        entries => {

            entries.forEach(entry => {

                if (!entry.isIntersecting) return;

                entry.target.classList.add("visible");

                observer.unobserve(entry.target);

            });

        },

        {
            threshold: .15
        }

    );

    elements.forEach(el => observer.observe(el));

}

/* ===========================
   Counter Animation
=========================== */

function initCounters() {

    const counters = selectAll(
        ".metric-number, .stat-number"
    );

    if (!counters.length) return;

    const observer = new IntersectionObserver(

        entries => {

            entries.forEach(entry => {

                if (!entry.isIntersecting) return;

                animateCounter(entry.target);

                observer.unobserve(entry.target);

            });

        },

        {
            threshold: .5
        }

    );

    counters.forEach(counter =>
        observer.observe(counter)
    );

}

function animateCounter(counter) {
        
    console.log("Animando:", counter);
    const target = Number(counter.dataset.target);

    let current = 0;

    const increment = target / 80;

    function update() {

        current += increment;

        if (current >= target) {

            counter.textContent = target;

            return;

        }

        counter.textContent =
            Math.floor(current);

        requestAnimationFrame(update);

    }

    update();

}

/*==========================
Hero Slider
==========================*/

function initHeroSlider(){

    const slides =
        selectAll(".hero-slide");

    if(slides.length<=1) return;

    let current = 0;

    setInterval(()=>{

        slides[current].classList.remove("active");

        current++;

        if(current>=slides.length){

            current=0;

        }

        slides[current].classList.add("active");

    },6000);

}

/*==========================
Hero Parallax
==========================*/

function initParallax(){

    const hero = document.querySelector(".hero-bg-wrapper");

    if(!hero) return;

    let lastScroll = 0;

    const update = () => {

        const scroll = window.scrollY;

        if(scroll === lastScroll) return;

        lastScroll = scroll;

        hero.style.transform =
            `translateY(${scroll * 0.35}px)`;

    };

    window.addEventListener(
        "scroll",
        update,
        { passive:true }
    );

}
