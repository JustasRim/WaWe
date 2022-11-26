const canvas = document.querySelector('#canvas');
const fps = document.querySelector('.fps');
canvas.width = window.innerWidth / 1.5;
canvas.height = window.innerHeight / 1.5;

const c = canvas.getContext('2d');
const ballCount = 15;

const materials = {
  granite: 2.7,
  glass: 2.5,
  plastic: 1.175,
  diamond: 3.5,
  titanium: 4.54,
};

const balls = [];
for (let i = 0; i < ballCount; i++) {
  const radius = Math.floor(Math.random() * 50) + 5;
  let x = Math.floor(Math.random() * canvas.width);
  let y = Math.floor(Math.random() * canvas.height);
  if (x - radius <= 0) {
    x += radius * 1.1;
  }

  if (x + radius >= canvas.width) {
    x -= radius * 1.1;
  }

  if (y - radius <= 0) {
    y += radius * 1.1;
  }

  if (y + radius >= canvas.height) {
    y -= radius * 1.1;
  }

  const speedX = Math.floor(Math.random() * 4);
  const speedY = Math.floor(Math.random() * 4);
  const keys = Object.keys(materials);
  const key = keys[Math.floor(Math.random() * keys.length)];

  balls.push({
    x: x,
    y: y,
    radius: radius,
    speedX: speedX,
    speedY: speedY,
    density: materials[key],
    mass() {
      return Math.PI * 2 * this.radius * this.density;
    },

    updateCoordinates(width, height) {
      this.x += this.speedX;
      this.y += this.speedY;

      if (this.x + this.radius >= width && this.speedX > 0) {
        this.speedX *= -1;
      }

      if (this.x - this.radius <= 0 && this.speedX < 0) {
        this.speedX *= -1;
      }

      if (this.y + this.radius >= height && this.speedY > 0) {
        this.speedY *= -1;
      }

      if (this.y - this.radius <= 0 && this.speedY < 0) {
        this.speedY *= -1;
      }
    },
  });
}

const insideBall = (ball1, ball2) => {
  const length = calculateLength(
    { x: ball1.x, y: ball1.y },
    { x: ball2.x, y: ball2.y }
  );

  return length <= Math.pow(ball1.radius + ball2.radius, 2);
};

const calculateLength = (point1, point2) => {
  const pointCoordX = point1.x - point2.x;
  const pointCoordY = point1.y - point2.y;

  return Math.pow(pointCoordX, 2) + Math.pow(pointCoordY, 2);
};

const calculateSpeedOfCollision = (m1, v1, m2, v2) => {
  m1 = Math.round(m1 * 1000) / 1000.0;
  v1 = Math.round(v1 * 1000) / 1000.0;
  m2 = Math.round(m2 * 1000) / 1000.0;
  v2 = Math.round(v2 * 1000) / 1000.0;

  const p = m1 * v1 + m2 * v2;
  const e = m1 * v1 * v1 + m2 * v2 * v2;
  const a = m1 * m2 + m1 * m1;
  const b = -2 * p * m1;
  const c = p * p - m2 * e;
  let D = Math.sqrt(b * b - 4 * a * c);
  if (isNaN(D)) {
    D = 0;
  }

  let v10 = (-b - D) / (2 * a);
  if (Math.round(v10) === Math.round(v1)) {
    v10 = (-b + D) / (2 * a);
  }
  const v20 = (p - m1 * v10) / m2;
  return { v1: Math.round(v10), v2: Math.round(v20) };
};

const calculateColisions = (ball, ball2) => {
  const inside = insideBall(ball, ball2);
  if (inside) {
    // p = mv
    const speedX = calculateSpeedOfCollision(
      ball.mass(),
      ball.speedX,
      ball2.mass(),
      ball2.speedX
    );

    ball.speedX = speedX.v1;
    ball2.speedX = speedX.v2;

    const speedY = calculateSpeedOfCollision(
      ball.mass(),
      ball.speedY,
      ball2.mass(),
      ball2.speedY
    );

    ball.speedY = speedY.v1;
    ball2.speedY = speedY.v2;
  }
};

let dframes = 0;
const animate = () => {
  requestAnimationFrame(animate);
  c.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < balls.length; i++) {
    const ball = balls[i];
    c.beginPath();
    c.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    c.stroke();

    ball.updateCoordinates(canvas.width, canvas.height);
    for (let j = i + 1; j < balls.length; j++) {
      calculateColisions(ball, balls[j]);
    }
  }

  dframes++;
  endTime = new Date();
  const timeDiff = endTime - startTime;
  if (timeDiff >= 1000) {
    fps.innerHTML = dframes;
    dframes = 0;
    startTime = new Date();
  }
};

let startTime = new Date();
animate();
