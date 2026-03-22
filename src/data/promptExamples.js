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
    id: 'hotRoom',
    label: { zh: '室内自然对流', en: 'Natural Convection' },
    description: {
      zh: '传热算例：封闭房间内浮力驱动自然对流，使用 buoyantFoam 求解',
      en: 'Heat transfer: buoyancy-driven natural convection in a room with buoyantFoam',
    },
    tag: { zh: '传热', en: 'Heat' },
    solver: 'buoyantFoam',
    domain: 'heatTransfer',
    prompt: "Perform a buoyant thermal flow simulation using buoyantFoam solver in a rectangular room of dimensions 10x5x10 (convertToMeters=1). Use k-epsilon RAS turbulence model with PIMPLE algorithm (2 correctors, 1 outer corrector). The domain has three boundary types: floor, ceiling, and fixedWalls, all with no-slip velocity conditions and wall functions for k, epsilon, and thermal diffusivity (alphat). Initial conditions: temperature of 300K throughout the domain except for a hot spot of 600K in the region 4.5<=x<=5.5, 4.5<=z<=5.5 near the floor (y~0), pressure of 1e5 Pa, zero initial velocity. Physical properties: air with molecular weight 28.9 kg/kmol, specific heat capacity (Cp) of 1000 J/kgK, dynamic viscosity of 1.8e-05 kg/ms, Prandtl number of 0.7, using perfectGas equation of state. Gravity acts in negative y-direction (-9.81 m\u00B2/s). Mesh consists of 20x10x20 cells with uniform grading. Run simulation from t=0 to t=100s with fixed timestep of 2s and write results every 10 timesteps. Floor and ceiling have fixed temperature of 300K, while fixedWalls have zeroGradient temperature condition.",
  },
  {
    id: 'tandemWing',
    label: { zh: '串列翼（需上传 .msh）', en: 'Tandem Wing (.msh required)' },
    description: {
      zh: '外部网格算例：使用上传的 .msh 文件进行三维翼型绕流仿真，SA 湍流模型 + simpleFoam',
      en: 'Custom mesh case: 3D flow over tandem wings with uploaded .msh file, SA turbulence + simpleFoam',
    },
    tag: { zh: '外部网格', en: 'Custom Mesh' },
    solver: 'simpleFoam',
    domain: 'incompressible',
    prompt: 'Do an incompressible 3D incompressible flow over a tandem wing configuration. The mesh is provided as a .msh file. The msh file contains 4 boundaries named "inlet", "outlet", "walls", "airfoil" and "frontAndBack". The "inlet" and "outlet" are of type freestream with the freestream velocity being 9 m/s. The "walls" and "airfoil" have a no-slip boundary condition (velocity equal to zero at the wall). The "frontAndBack" faces are also of type wall. The simulation runs from time 0 to 10 with a time step of 1.0 units, and results are output every 1 time steps. The viscosity (`nu`) is set as constant with a value of 1.5e-05 m\u00B2/s. Use simpleFoam solver. Use SpalartAllmaras turbulence model. Further visualize the magnitude of velocity along the mid Z section at the final time.',
  },
];

export default promptExamples;
