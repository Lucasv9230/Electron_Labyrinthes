// Génération (recursive backtracker) et résolution (BFS) de labyrinthes

const SIZES = { small: 11, medium: 21, large: 31 };

function generateMaze(size, difficulty) {
  const dim = SIZES[size] || 21;
  const grid = Array.from({ length: dim }, () => Array(dim).fill(1));

  function carve(x, y) {
    grid[y][x] = 0;
    const dirs = [[0, -2], [2, 0], [0, 2], [-2, 0]].sort(() => Math.random() - 0.5);
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (nx > 0 && nx < dim - 1 && ny > 0 && ny < dim - 1 && grid[ny][nx] === 1) {
        grid[y + dy / 2][x + dx / 2] = 0;
        carve(nx, ny);
      }
    }
  }

  carve(1, 1);
  grid[1][1] = 0;
  grid[dim - 2][dim - 2] = 0;

  return {
    grid,
    width: dim,
    height: dim,
    start: [1, 1],
    end: [dim - 2, dim - 2],
    difficulty: Number(difficulty),
    size
  };
}

function solveMaze(mazeData) {
  const { grid, width, height, start, end } = mazeData;
  const [sx, sy] = start;
  const [ex, ey] = end;

  const queue = [[sx, sy, [[sx, sy]]]];
  const visited = new Set([`${sx},${sy}`]);

  while (queue.length) {
    const [x, y, path] = queue.shift();
    if (x === ex && y === ey) return path;

    for (const [dx, dy] of [[0, -1], [1, 0], [0, 1], [-1, 0]]) {
      const nx = x + dx, ny = y + dy;
      const key = `${nx},${ny}`;
      if (nx >= 0 && nx < width && ny >= 0 && ny < height && grid[ny][nx] === 0 && !visited.has(key)) {
        visited.add(key);
        queue.push([nx, ny, [...path, [nx, ny]]]);
      }
    }
  }
  return null;
}

module.exports = { generateMaze, solveMaze };
