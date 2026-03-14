// Prompt examples curated from FoamGPT dataset (https://huggingface.co/datasets/LeoYML/FoamGPT)
// Source: foamgpt_train.jsonl / foamgpt_test.jsonl — prompts are exact copies from the dataset
// All examples use laminar solvers (no turbulence models) for higher success rate with gpt-5-mini

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
    id: 'backstep',
    label: { zh: '后台阶流动', en: 'Backward-Facing Step' },
    description: {
      zh: '经典分离流：脉冲入口的后台阶层流，使用 pimpleFoam 瞬态求解',
      en: 'Classic separation flow: pulsating inlet backward-facing step, transient laminar with pimpleFoam',
    },
    tag: { zh: '分离流', en: 'Separation' },
    solver: 'pimpleFoam',
    domain: 'incompressible',
    prompt: "Do a laminar incompressible flow simulation using pimpleFoam solver for a backward-facing step geometry. The domain has dimensions (in raw units before scaling): inlet section from x=-20.6 to x=0 with height 25.4, main channel section from x=0 to x=206 with total height varying from 25.4 at top to -25.4 at bottom, and outlet section from x=206 to x=290 with height varying from 16.6 to -16.6, with thickness of 1 unit (-0.5 to 0.5 in z-direction). Note that convertToMeters=0.001. Use PIMPLE algorithm with 2 correctors and no non-orthogonal corrections. The inlet has a pulsating velocity profile defined by U=0.5*(1-cos(2\u03C0*min(x/0.3,1))) in x-direction, outlet has fixed pressure (p=0), upper and lower walls have no-slip condition, and front/back faces are empty. The mesh consists of 5 blocks with grading: inlet section (18x30x1), two middle sections (180x27x1 and 180x30x1), and two outlet sections (25x27x1 and 25x30x1). Set kinematic viscosity to 1e-4 m\u00B2/s. Run simulation from t=0 to t=0.3s with initial deltaT=0.001s, adjustable timestep with maxCo=5, and write results every 0.02s. Use GAMG solver for pressure with 1e-7 tolerance and smoothSolver for velocity with 1e-5 tolerance.",
  },
  {
    id: 'cylinder',
    label: { zh: '圆柱绕流', en: 'Flow Around Cylinder' },
    description: {
      zh: '经典外流算例：偏心圆柱绕流，使用 pimpleFoam 层流瞬态求解',
      en: 'Classic external flow: laminar flow around an offset cylinder, transient with pimpleFoam',
    },
    tag: { zh: '绕流', en: 'External' },
    solver: 'pimpleFoam',
    domain: 'incompressible',
    prompt: "Conduct a laminar flow simulation around an offset cylinder using pimpleFoam solver. The domain consists of a 3D geometry with a cylindrical obstruction, where the domain extends from -5 to 5 units in x-direction and -1.5 to 2.5 units in y-direction, with a thickness of 2 units in z-direction (-1 to 1), with convertToMeters=1. The cylinder is positioned off-center with its outer radius being 1.4 units and inner radius of 1 unit. The boundary conditions include: inlet (left patch) with fixed velocity of (1 0 0) m/s and zero gradient pressure, outlet (right patch) with zero gradient velocity and fixed pressure of 0, no-slip conditions for the cylinder wall and up/down walls, and empty type for front and back faces. Use a structured mesh with 10x10 cells in most blocks and 10x5 cells in the lower blocks. Set kinematic viscosity (nu) to 0.01 m\u00B2/s. Run the simulation from t=0 to t=0.5 seconds with a timestep of 0.0025s and write results every 0.05s. Use PIMPLE algorithm with 5 outer correctors, 1 corrector, and no momentum predictor. The mesh is divided into 20 blocks with appropriate edge refinement around the cylinder using arc edges.",
  },
];

export default promptExamples;
