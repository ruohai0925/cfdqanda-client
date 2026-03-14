// Prompt examples curated from FoamGPT dataset (https://huggingface.co/datasets/LeoYML/FoamGPT)
// Source: foamgpt_train.jsonl / foamgpt_test.jsonl — prompts are exact copies from the dataset
// All examples avoid complex mesh descriptions (no multi-block vertices, no arc edges)

const promptExamples = [
  {
    id: 'cavity',
    label: { zh: '方腔流动', en: 'Lid-Driven Cavity' },
    description: {
      zh: '经典入门算例：顶盖驱动的二维方腔流，使用 icoFoam 求解不可压层流',
      en: 'Classic beginner case: 2D lid-driven cavity flow, laminar incompressible with icoFoam',
    },
    tag: { zh: '入门', en: 'Beginner' },
    solver: 'icoFoam',
    domain: 'incompressible',
    prompt: "Do an incompressible lid driven cavity flow. The cavity is a square with dimensions normalized to 1 unit on both the x and y axes and very thin in the z-direction (0.1 unit scaled down by a factor of 0.1, making it effectively 2D). Use a grid of 20X20 in x and y direction and 1 cell in z-direction(due to the expected 2D flow characteristics). The top wall ('movingWall') moves in the x-direction with a uniform velocity of 1 m/s. The 'fixedWalls' have a no-slip boundary condition (velocity equal to zero at the wall). The front and back faces are designated as 'empty'. The simulation runs from time 0 to 0.5 with a time step of 0.005 units, and results are output every 20 time steps. The viscosity (`nu`) is set as constant with a value of 1e-05 m\u00B2/s.",
  },
  {
    id: 'porousBlockage',
    label: { zh: '多孔介质流动', en: 'Porous Blockage' },
    description: {
      zh: '层流通道中的多孔介质阻塞，使用 pisoFoam 求解，含 Darcy 阻力源项',
      en: 'Laminar channel flow with a porous blockage zone, pisoFoam with Darcy resistance',
    },
    tag: { zh: '多孔', en: 'Porous' },
    solver: 'pisoFoam',
    domain: 'incompressible',
    prompt: "Do a laminar incompressible flow simulation using pisoFoam solver for a domain with porous blockage. The domain extends from x=-2 to x=6 and y=-2 to y=2 with a thin depth of 0.2 (-0.1<=z<=0.1) with convertToMeters=1. A porous blockage zone is defined as a box in the region -0.5<=x<=0.5, -0.5<=y<=0.5, -1<=z<=1 with Darcy coefficient D=1000 in all directions. Use a structured hex mesh with 64x32x1 cells and uniform grading. Set inlet velocity to uniform (1 0 0) m/s with zeroGradient pressure, outlet with fixedValue pressure of 0 and pressureInletOutletVelocity for velocity, symmetryPlane conditions for top and bottom boundaries, and empty type for front and back faces. The kinematic viscosity is set to 5e-3 m\u00B2/s. Run the simulation from t=0 to t=5s with a timestep of 0.05s and write results every 0.5s. Use PISO algorithm with 2 correctors and 0 non-orthogonal correctors. For pressure, use GAMG solver with GaussSeidel smoother (tolerance 1e-06, relTol 0.1 for p and 0 for pFinal), and for velocity use smoothSolver with GaussSeidel smoother (tolerance 1e-05, relTol 0).",
  },
  {
    id: 'elbow',
    label: { zh: '弯管流动', en: 'Elbow Channel' },
    description: {
      zh: '二维 L 形弯管双入口混合流，使用 icoFoam 求解不可压层流',
      en: '2D L-shaped elbow channel with two inlets, laminar incompressible with icoFoam',
    },
    tag: { zh: '管流', en: 'Pipe' },
    solver: 'icoFoam',
    domain: 'incompressible',
    prompt: "Perform an incompressible flow simulation in a 2D elbow-shaped channel using icoFoam solver. The domain has two inlets: one with a fixed velocity of (1 0 0) m/s and another with (0 3 0) m/s, and a pressure outlet with fixed value of 0. The walls (wall-4 and wall-8) have no-slip boundary conditions, and the front and back planes are set as empty for 2D simulation. Use PISO algorithm with 2 correctors and 2 non-orthogonal correctors. The kinematic viscosity is set to 0.01 m\u00B2/s. Run the simulation from t=0 to t=1 seconds with a timestep of 0.05s, writing results every 4 timesteps. For pressure solution, use PCG solver with DIC preconditioner (tolerance 1e-06, relTol 0.05), and for velocity, use smoothSolver with symGaussSeidel smoother (tolerance 1e-05). Initial conditions are zero velocity and pressure throughout the domain.",
  },
  {
    id: 'backstep',
    label: { zh: '后台阶湍流', en: 'Backward-Facing Step' },
    description: {
      zh: '经典分离流：后台阶湍流，使用 pimpleFoam + k-epsilon 模型',
      en: 'Classic separation flow: turbulent backward-facing step with pimpleFoam + k-epsilon',
    },
    tag: { zh: '湍流', en: 'Turbulent' },
    solver: 'pimpleFoam',
    domain: 'incompressible',
    prompt: "Do a Reynolds-Averaged Simulation (RAS) of turbulent flow in a backward-facing step channel using pimpleFoam solver. The geometry consists of a 2D channel with dimensions: inlet section (-20.6 to 0 in x, 0 to 25.4 in y), main channel section (0 to 206 in x) with sudden expansion from 25.4 to 50.8 in y at x=0, and outlet section (206 to 290 in x) with gradual contraction to 33.2 in y (convertToMeters=0.001). Use k-epsilon turbulence model with inlet conditions k=0.375 m\u00B2/s\u00B2 and epsilon=14.855 m\u00B2/s\u00B3. Specify inlet velocity as uniform 10 m/s in x-direction, zero pressure at outlet, and no-slip conditions on upper and lower walls. Set kinematic viscosity to 1e-05 m\u00B2/s. The mesh should have varying resolution with 18 cells in inlet section, 180 cells in main channel, and 25 cells in outlet section along x-direction, with graded distribution in y-direction (27-30 cells). Use PIMPLE algorithm with 2 correctors, maxCo=1, and local Euler time discretization. Run simulation from t=0 to t=100s with deltaT=1s and write results every 10s. The domain has a thickness of 1 unit (-0.5 to 0.5 in z-direction) with empty-type boundary condition on front and back faces for 2D simulation.",
  },
];

export default promptExamples;
