import { useEffect, useRef } from 'react';

function PureCanvas() {
  const el = useRef<HTMLCanvasElement>(null);
  const requestIdRef = useRef<number>();

  const size = { width: 480, height: 320 };
  // ball
  const ballRadius = 10;
  let x = size.width / 2;
  let y = size.height - 30;
  let dx = 2;
  let dy = -2;

  // paddle
  const paddleHeight = 10;
  const paddleWidth = 75;
  let paddleX = size.width / 2 - paddleWidth / 2;
  let leftPressed = false;
  let rightPressed = false;

  useEffect(() => {
    document.addEventListener('keydown', keyDownHandler, false);
    document.addEventListener('keyup', keyUpHandler, false);
    document.addEventListener('mousemove', mouseMoveHandler, false);

    function keyDownHandler(e: KeyboardEvent) {
      if (['Right', 'ArrowRight'].includes(e.key)) {
        rightPressed = true;
      } else if (['Left', 'ArrowLeft'].includes(e.key)) {
        leftPressed = true;
      }
    }
    function keyUpHandler(e: KeyboardEvent) {
      if (['Right', 'ArrowRight'].includes(e.key)) {
        rightPressed = false;
      } else if (['Left', 'ArrowLeft'].includes(e.key)) {
        leftPressed = false;
      }
    }
    function mouseMoveHandler(e: MouseEvent) {
      const canvas = el.current!;
      const relativeX = e.clientX - canvas.offsetLeft;
      if (relativeX > 0 && relativeX < canvas.width) {
        paddleX = Math.min(
          Math.max(0, relativeX - paddleWidth / 2),
          canvas.width - paddleWidth
        );
      }
    }

    return () => {
      document.removeEventListener('keydown', keyDownHandler);
      document.removeEventListener('keyup', keyUpHandler);
      document.removeEventListener('mousemove', mouseMoveHandler);
    };
  }, []);

  // brick
  const brickRowCount = 3;
  const brickColumnCount = 5;
  const brickWidth = 75;
  const brickHeight = 20;
  const brickPadding = 10;
  const brickOffsetTop = 30;
  const brickOffsetLeft = 30;
  type BrickItem = { x: number; y: number; status: 1 | 0 };
  const bricks: BrickItem[][] = [];
  for (let c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < brickRowCount; r++) {
      bricks[c][r] = { x: 0, y: 0, status: 1 };
    }
  }

  let score = 0;
  let lives = 3;

  function draw(next: () => void) {
    const canvas = el.current!;
    const ctx = canvas.getContext('2d')!;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBricks();
    drawBall();
    drawPaddle();
    drawScore();
    drawLives();
    collisionDetection();

    if (score === brickRowCount * brickColumnCount) {
      alert('YOU WIN, CONGRATS!');
      document.location.reload();
      cancelAnimationFrame(requestIdRef.current!); // Needed for Chrome to end game
      return;
    }

    // wall collision detection
    if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
      dx = -dx;
    }
    if (y + dy < ballRadius) {
      dy = -dy;
    } else if (y + dy > canvas.height - ballRadius) {
      if (x > paddleX && x < paddleX + paddleWidth) {
        dy = -dy;
      } else {
        lives--;
        if (!lives) {
          alert('GAME OVER');
          document.location.reload();
          cancelAnimationFrame(requestIdRef.current!); // Needed for Chrome to end game
          return;
        } else {
          // reset
          x = canvas.width / 2;
          y = canvas.height - 30;
          dx = 2;
          dy = -2;
          paddleX = canvas.width / 2 - paddleWidth / 2;
        }
      }
    }

    // control paddle
    if (rightPressed) {
      paddleX = Math.min(paddleX + 7, canvas.width - paddleWidth);
    } else if (leftPressed) {
      paddleX = Math.max(paddleX - 7, 0);
    }

    x += dx;
    y += dy;

    next();
  }

  // brick collision detection
  function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
      for (let r = 0; r < brickRowCount; r++) {
        const b = bricks[c][r];
        if (b.status === 1) {
          if (
            x > b.x &&
            x < b.x + brickWidth &&
            y > b.y &&
            y < b.y + brickHeight
          ) {
            dy = -dy;
            b.status = 0;
            score++;
          }
        }
      }
    }
  }

  function drawScore() {
    const canvas = el.current!;
    const ctx = canvas.getContext('2d')!;
    ctx.font = '16px Arial';
    ctx.fillStyle = '#0095DD';
    ctx.fillText('Score: ' + score, 8, 20);
  }

  function drawLives() {
    const canvas = el.current!;
    const ctx = canvas.getContext('2d')!;
    ctx.font = '16px Arial';
    ctx.fillStyle = '#0095DD';
    ctx.fillText(`Lives: ${lives}`, canvas.width - 65, 20);
  }

  function drawBall() {
    const canvas = el.current!;
    const ctx = canvas.getContext('2d')!;
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#0095DD';
    ctx.fill();
    ctx.closePath();
  }

  function drawPaddle() {
    const canvas = el.current!;
    const ctx = canvas.getContext('2d')!;
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
    ctx.fillStyle = '#0095DD';
    ctx.fill();
    ctx.closePath();
  }

  function drawBricks() {
    const canvas = el.current!;
    const ctx = canvas.getContext('2d')!;
    for (var c = 0; c < brickColumnCount; c++) {
      for (var r = 0; r < brickRowCount; r++) {
        if (bricks[c][r].status === 0) continue;
        var brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
        var brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
        bricks[c][r].x = brickX;
        bricks[c][r].y = brickY;
        ctx.beginPath();
        ctx.rect(brickX, brickY, brickWidth, brickHeight);
        ctx.fillStyle = '#0095DD';
        ctx.fill();
        ctx.closePath();
      }
    }
  }

  function tick() {
    let next = false;
    draw(() => {
      next = true;
    });
    if (!next) return;
    requestIdRef.current = requestAnimationFrame(tick);
  }

  useEffect(() => {
    requestIdRef.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(requestIdRef.current!);
    };
  }, []);

  return <canvas ref={el} className="board" {...size}></canvas>;
}

export default PureCanvas;
