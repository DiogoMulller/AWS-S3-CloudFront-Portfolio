/* ==========================================================
   DIOGO MULLER — INTERAÇÕES DO PORTFÓLIO
   01. Seletores e configurações
   02. Menu mobile
   03. Rolagem e navegação ativa
   04. Animações ao entrar na tela
   05. Filtro de projetos
   06. Copiar e-mail
   07. Rodapé
   ========================================================== */

"use strict";

// 01. SELETORES E CONFIGURAÇÕES
const header = document.querySelector("#siteHeader");
const menuToggle = document.querySelector("#menuToggle");
const navigation = document.querySelector("#mainNavigation");
const progressBar = document.querySelector("#scrollProgress");
const navLinks = document.querySelectorAll(".nav-link");
const revealElements = document.querySelectorAll(".reveal");
const filterButtons = document.querySelectorAll(".filter-button");
const projectCards = document.querySelectorAll(".project-card");
const copyEmailButton = document.querySelector("#copyEmail");
const yearElement = document.querySelector("#currentYear");

const emailAddress = "diogomullerciber@gmail.com";

// 02. MENU MOBILE
function setMenuOpen(isOpen) {
    navigation.classList.toggle("open", isOpen);
    document.body.classList.toggle("menu-open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute(
        "aria-label",
        isOpen ? "Fechar menu" : "Abrir menu"
    );
}

menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    setMenuOpen(!isOpen);
});

navigation.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
        setMenuOpen(false);
    });
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        setMenuOpen(false);
    }
});

window.addEventListener("resize", () => {
    if (window.innerWidth > 900) {
        setMenuOpen(false);
    }
});

// 03. PROGRESSO DA ROLAGEM E CABEÇALHO
function updateScrollState() {
    const scrollPosition = window.scrollY;
    const scrollableHeight =
        document.documentElement.scrollHeight - window.innerHeight;

    const progress = scrollableHeight > 0
        ? (scrollPosition / scrollableHeight) * 100
        : 0;

    progressBar.style.width = `${progress}%`;
    header.classList.toggle("scrolled", scrollPosition > 20);
}

window.addEventListener("scroll", updateScrollState, {
    passive: true
});

updateScrollState();

// Atualiza o link ativo conforme a seção visível.
const observedSections = document.querySelectorAll("main section[id]");

if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(
        (entries) => {
            const visibleSections = entries
                .filter((entry) => entry.isIntersecting)
                .sort(
                    (first, second) =>
                        second.intersectionRatio - first.intersectionRatio
                );

            if (visibleSections.length === 0) {
                return;
            }

            const activeId = visibleSections[0].target.id;

            navLinks.forEach((link) => {
                const isActive = link.getAttribute("href") === `#${activeId}`;
                link.classList.toggle("active", isActive);
            });
        },
        {
            rootMargin: "-20% 0px -55% 0px",
            threshold: [0, 0.1, 0.3]
        }
    );

    observedSections.forEach((section) => {
        sectionObserver.observe(section);
    });
}

// 04. ANIMAÇÕES AO ENTRAR NA TELA
if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
        (entries, observer) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) {
                    return;
                }

                entry.target.classList.add("visible");
                observer.unobserve(entry.target);
            });
        },
        {
            threshold: 0.08,
            rootMargin: "0px 0px -20px 0px"
        }
    );

    revealElements.forEach((element) => {
        revealObserver.observe(element);
    });
} else {
    revealElements.forEach((element) => {
        element.classList.add("visible");
    });
}

// 05. FILTRO DE PROJETOS
filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
        const selectedCategory = button.dataset.filter;

        filterButtons.forEach((filterButton) => {
            const isSelected = filterButton === button;

            filterButton.classList.toggle("selected", isSelected);
            filterButton.setAttribute("aria-pressed", String(isSelected));
        });

        let visibleCount = 0;

        projectCards.forEach((card) => {
            const shouldShow = selectedCategory === "todos"
                || card.dataset.category === selectedCategory;

            card.hidden = !shouldShow;

            if (shouldShow) {
                visibleCount += 1;
            }
        });

        const emptyMessage = document.querySelector("#emptyProjects");
        emptyMessage.hidden = visibleCount > 0;
    });
});

// 06. COPIAR E-MAIL
copyEmailButton.addEventListener("click", async () => {
    const originalContent = copyEmailButton.innerHTML;

    try {
        await navigator.clipboard.writeText(emailAddress);
        copyEmailButton.textContent = "E-mail copiado! ✓";
    } catch (error) {
        // Fallback simples para navegadores sem acesso à Clipboard API.
        const temporaryInput = document.createElement("textarea");
        temporaryInput.value = emailAddress;
        temporaryInput.style.position = "fixed";
        temporaryInput.style.opacity = "0";
        document.body.appendChild(temporaryInput);
        temporaryInput.select();

        const success = document.execCommand("copy");
        temporaryInput.remove();

        copyEmailButton.textContent = success
            ? "E-mail copiado! ✓"
            : "Selecione o e-mail acima para copiar";
    }

    window.setTimeout(() => {
        copyEmailButton.innerHTML = originalContent;
    }, 2300);
});

// 07. ANO AUTOMÁTICO NO RODAPÉ
yearElement.textContent = String(new Date().getFullYear());


/* ==========================================================
   08. FUNDO ANIMADO — NUVEM / REDE DE CONEXÕES
   Canvas transparente, responsivo e sem dependências.
   Respeita prefers-reduced-motion e pausa fora da aba.
   ========================================================== */
(function initializeCloudNetwork() {
    const canvas = document.querySelector("#cloudNetwork");

    if (!canvas) {
        return;
    }

    const context = canvas.getContext("2d", { alpha: true });

    if (!context) {
        return;
    }

    const motionQuery = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    );

    const settings = {
        maxDistance: 155,
        speed: 0.23,
        nodeRadius: 1.6,
        color: [249, 3, 98]
    };

    let width = 0;
    let height = 0;
    let points = [];
    let animationFrame = null;
    let lastFrame = 0;
    let resizeFrame = null;

    function randomBetween(min, max) {
        return min + Math.random() * (max - min);
    }

    function createPoints() {
        const area = width * height;
        const isMobile = width < 700;
        const count = Math.min(
            isMobile ? 28 : 75,
            Math.max(14, Math.round(area / (isMobile ? 23000 : 19000)))
        );

        points = Array.from({ length: count }, () => ({
            x: randomBetween(0, width),
            y: randomBetween(0, height),
            vx: randomBetween(-settings.speed, settings.speed),
            vy: randomBetween(-settings.speed, settings.speed),
            phase: randomBetween(0, Math.PI * 2)
        }));
    }

    function resizeCanvas() {
        width = window.innerWidth;
        height = window.innerHeight;

        // Limita a escala para reduzir trabalho da GPU em telas 4K.
        const ratio = Math.min(window.devicePixelRatio || 1, 2);

        canvas.width = Math.round(width * ratio);
        canvas.height = Math.round(height * ratio);
        context.setTransform(ratio, 0, 0, ratio, 0, 0);

        createPoints();
        draw(0, false);
    }

    function draw(time, move) {
        context.clearRect(0, 0, width, height);

        points.forEach((point) => {
            if (move) {
                point.x += point.vx;
                point.y += point.vy;

                if (point.x <= 0 || point.x >= width) {
                    point.vx *= -1;
                }

                if (point.y <= 0 || point.y >= height) {
                    point.vy *= -1;
                }
            }
        });

        const [red, green, blue] = settings.color;

        for (let first = 0; first < points.length; first += 1) {
            const a = points[first];

            for (let second = first + 1; second < points.length; second += 1) {
                const b = points[second];
                const distance = Math.hypot(a.x - b.x, a.y - b.y);

                if (distance >= settings.maxDistance) {
                    continue;
                }

                const strength = 1 - distance / settings.maxDistance;
                const opacity = strength * 0.19;

                context.strokeStyle = `rgba(${red}, ${green}, ${blue}, ${opacity})`;
                context.lineWidth = 0.8;
                context.beginPath();
                context.moveTo(a.x, a.y);
                context.lineTo(b.x, b.y);
                context.stroke();

                // Pulso viajando entre alguns pontos próximos.
                if ((first + second) % 13 === 0 && strength > 0.35) {
                    const progress = ((time * 0.00022) + a.phase) % 1;
                    const x = a.x + (b.x - a.x) * progress;
                    const y = a.y + (b.y - a.y) * progress;

                    context.fillStyle = `rgba(255, 96, 151, ${strength * 0.48})`;
                    context.beginPath();
                    context.arc(x, y, 1.9, 0, Math.PI * 2);
                    context.fill();
                }
            }

            const glow = 0.27 + 0.13 * Math.sin(time * 0.001 + a.phase);
            context.fillStyle = `rgba(${red}, ${green}, ${blue}, ${glow})`;
            context.beginPath();
            context.arc(a.x, a.y, settings.nodeRadius, 0, Math.PI * 2);
            context.fill();
        }
    }

    function animate(time) {
        // Aproximadamente 30 FPS: menor consumo de CPU e bateria.
        if (time - lastFrame >= 32) {
            draw(time, true);
            lastFrame = time;
        }

        animationFrame = window.requestAnimationFrame(animate);
    }

    function stopAnimation() {
        if (animationFrame !== null) {
            window.cancelAnimationFrame(animationFrame);
            animationFrame = null;
        }
    }

    function updateAnimationState() {
        stopAnimation();

        if (!document.hidden && !motionQuery.matches) {
            animationFrame = window.requestAnimationFrame(animate);
        } else {
            draw(0, false);
        }
    }

    window.addEventListener("resize", () => {
        if (resizeFrame !== null) {
            window.cancelAnimationFrame(resizeFrame);
        }

        resizeFrame = window.requestAnimationFrame(() => {
            resizeCanvas();
            resizeFrame = null;
        });
    }, { passive: true });

    document.addEventListener("visibilitychange", updateAnimationState);
    motionQuery.addEventListener("change", updateAnimationState);

    resizeCanvas();
    updateAnimationState();
}());


// 08. MOSTRAR / OCULTAR TODAS AS CREDENCIAIS
(function initCredentialsToggle() {
    const button = document.querySelector("#credentialsToggle");
    const counter = document.querySelector("#credentialsCount");
    const extras = document.querySelectorAll("[data-extra-credential]");

    if (!button || !counter || extras.length === 0) {
        return;
    }

    button.addEventListener("click", () => {
        const expanded = button.getAttribute("aria-expanded") === "true";
        const showAll = !expanded;

        extras.forEach((card) => {
            card.hidden = !showAll;

            if (showAll) {
                card.classList.add("visible");
            }
        });

        button.setAttribute("aria-expanded", String(showAll));
        button.textContent = showAll
            ? "Mostrar apenas os destaques"
            : "Mostrar todas as 25 credenciais";

        counter.textContent = showAll
            ? "Exibindo todas as 25 credenciais e cursos."
            : "Exibindo 4 destaques de 25 credenciais e cursos.";
    });
}());
