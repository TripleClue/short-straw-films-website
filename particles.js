class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 1.5 + 0.5; // Smaller particles (0.5-2px)
        this.baseSpeedX = (Math.random() - 0.2) * 1.5; // Slower base speed
        this.baseSpeedY = (Math.random() - 0.2) * 1.5;
        this.speedX = this.baseSpeedX;
        this.speedY = this.baseSpeedY;
        this.opacity = Math.random() * 0.3 + 0.2; // Opacity (0.1-0.3)
        this.angle = Math.random() * Math.PI * 2; // Random starting angle
        this.angleSpeed = (Math.random() - 0.5) * 0.03; // Slightly faster rotation
        this.radius = Math.random() * 3 + 2; // Larger swirl radius
        this.spiralFactor = Math.random() * 0.5 + 0.1; // Spiral effect
        this.timeOffset = Math.random() * 1000; // Random time offset for varied patterns
        this.borderTimer = 0; // Timer for border detection
        this.lastBorderTime = 0; // Last time particle was near border
        this.borderThreshold = 50; // Distance from edge to consider "near border"
    }

    isNearBorder() {
        return (
            this.x < this.borderThreshold ||
            this.x > window.innerWidth - this.borderThreshold ||
            this.y < 125 + this.borderThreshold ||
            this.y > window.innerHeight - this.borderThreshold
        );
    }

    randomizeDirection() {
        // Generate new random direction
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 1.5 + 0.5;
        this.baseSpeedX = Math.cos(angle) * speed;
        this.baseSpeedY = Math.sin(angle) * speed;
        this.speedX = this.baseSpeedX;
        this.speedY = this.baseSpeedY;
        
        // Reset border timer
        this.borderTimer = 0;
        this.lastBorderTime = 0;
    }

    update() {
        // Get navigation bar height (including divider)
        const navHeight = 125;

        // Update swirl angle with time-based variation
        this.angle += this.angleSpeed;
        const time = Date.now() * 0.001 + this.timeOffset;
        
        // Calculate complex swirl pattern
        const swirlX = Math.cos(this.angle) * this.radius * (1 + Math.sin(time * 0.5) * 0.3);
        const swirlY = Math.sin(this.angle) * this.radius * (1 + Math.cos(time * 0.5) * 0.3);
        
        // Add spiral motion
        const spiralX = Math.cos(time * this.spiralFactor) * this.radius * 0.5;
        const spiralY = Math.sin(time * this.spiralFactor) * this.radius * 0.5;

        // Calculate new position with combined effects
        let newX = this.x + this.speedX + (swirlX + spiralX) * 0.15;
        let newY = this.y + this.speedY + (swirlY + spiralY) * 0.15;

        // Handle horizontal boundaries
        if (newX < 0) {
            newX = 0;
            this.speedX = Math.abs(this.baseSpeedX);
        }
        if (newX > window.innerWidth) {
            newX = window.innerWidth;
            this.speedX = -Math.abs(this.baseSpeedX);
        }

        // Handle vertical boundaries
        if (newY <= navHeight) {
            newY = navHeight;
            this.speedY = Math.abs(this.baseSpeedY);
        }
        if (newY > window.innerHeight) {
            newY = window.innerHeight;
            this.speedY = -Math.abs(this.baseSpeedY);
        }

        // Only update position if it's valid
        this.x = newX;
        this.y = newY;

        // Gradually return to base speed with some variation
        this.speedX += (this.baseSpeedX - this.speedX) * 0.1 + Math.sin(time) * 0.01;
        this.speedY += (this.baseSpeedY - this.speedY) * 0.1 + Math.cos(time) * 0.01;

        // Border detection and direction randomization
        if (this.isNearBorder()) {
            const currentTime = Date.now();
            if (this.lastBorderTime === 0) {
                this.lastBorderTime = currentTime;
            }
            this.borderTimer = currentTime - this.lastBorderTime;
            
            // If particle has been near border for more than 1 second, randomize direction
            if (this.borderTimer > 1000) {
                this.randomizeDirection();
            }
        } else {
            this.lastBorderTime = 0;
            this.borderTimer = 0;
        }
    }

    draw(ctx) {
        // Get navigation bar height (including divider)
        const navHeight = 125;
        
        // Only draw if below navigation bar
        if (this.y > navHeight) {
            ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
            ctx.fillRect(this.x, this.y, this.size, this.size);
        }
    }
}

class ParticleSystem {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.init();
    }

    init() {
        // Style canvas
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '-1';
        document.body.appendChild(this.canvas);

        // Set canvas size
        this.resize();
        window.addEventListener('resize', () => this.resize());

        // Create particles
        const navHeight = 125;
        for (let i = 0; i < 1000; i++) { // Increased to 1000 particles
            this.particles.push(new Particle(
                Math.random() * window.innerWidth,
                Math.random() * (window.innerHeight - navHeight) + navHeight
            ));
        }

        // Start animation
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update and draw particles
        this.particles.forEach(particle => {
            particle.update();
            particle.draw(this.ctx);
        });

        requestAnimationFrame(() => this.animate());
    }
}

// Initialize particle system
new ParticleSystem(); 