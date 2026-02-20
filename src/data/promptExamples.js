// Prompt examples curated from FoamGPT dataset (https://huggingface.co/datasets/LeoYML/FoamGPT)
// Source: foamgpt_train.jsonl — prompts are exact copies from the dataset
// Covers typical CFD physics domains with bilingual labels

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
    prompt: "Do an incompressible lid driven cavity flow. The cavity is a square with dimensions normalized to 1 unit on both the x and y axes and very thin in the z-direction (0.1 unit scaled down by a factor of 0.1, making it effectively 2D). Use a grid of 20X20 in x and y direction and 1 cell in z-direction(due to the expected 2D flow characteristics). The top wall ('movingWall') moves in the x-direction with a uniform velocity of 1 m/s. The 'fixedWalls' have a no-slip boundary condition (velocity equal to zero at the wall). The front and back faces are designated as 'empty'. The simulation runs from time 0 to 10 with a time step of 0.005 units, and results are output every 100 time steps. The viscosity (`nu`) is set as constant with a value of 1e-05 m\u00B2/s.",
  },
  {
    id: 'backstep',
    label: { zh: '后台阶湍流', en: 'Backward-Facing Step' },
    description: {
      zh: '经典湍流验证：后台阶分离流，使用 simpleFoam + k-epsilon 模型稳态求解',
      en: 'Classic turbulence validation: backward-facing step with simpleFoam + k-epsilon RANS',
    },
    tag: { zh: '湍流', en: 'Turbulent' },
    solver: 'simpleFoam',
    domain: 'incompressible',
    prompt: "Do a steady-state turbulent flow simulation using simpleFoam solver for a backward-facing step geometry. The domain extends from x=-20.6 to x=290, with varying y-dimensions: inlet height of 25.4, step height of 25.4, and outlet height of 16.6, with a thickness of 1 unit in z-direction (-0.5 to 0.5). Note that these dimensions have a convertToMeters factor of 0.001. Use k-epsilon RAS turbulence model with initial k=0.375 m\u00B2/s\u00B2 and epsilon=14.855 m\u00B2/s\u00B3. The boundary conditions include: timeVaryingMappedFixedValue for velocity, k, and epsilon at inlet; zeroGradient for velocity and turbulence quantities at outlet with fixedValue pressure (p=0); noSlip conditions on upperWall and lowerWall with standard wall functions for turbulence quantities; and empty type for frontAndBack faces. Set kinematic viscosity to 1e-05 m\u00B2/s. The mesh should be structured with refinement near walls using grading factors: 0.5 to 4 in x-direction and varying y-direction grading following specified profiles. Run simulation from t=0 to t=1000 with deltaT=1 and write results every 50 timesteps. Use SIMPLE algorithm with GAMG solver for pressure (tolerance 1e-06, relTol 0.1) and smoothSolver for other variables, with relaxation factors of 0.3 for pressure and 0.7 for other quantities.",
  },
  {
    id: 'airfoil',
    label: { zh: '二维翼型', en: '2D Airfoil' },
    description: {
      zh: '外部绕流：NACA 翼型气动仿真，使用 simpleFoam + Spalart-Allmaras 湍流模型',
      en: 'External aerodynamics: NACA airfoil simulation with simpleFoam + Spalart-Allmaras',
    },
    tag: { zh: '外流', en: 'External' },
    solver: 'simpleFoam',
    domain: 'incompressible',
    prompt: "Perform a steady-state incompressible airfoil simulation using simpleFoam solver with Spalart-Allmaras turbulence model (RAS). The simulation involves a 2D airfoil with inlet and outlet patches having freestream conditions, where the freestream velocity is (25.75, 3.62, 0) m/s. Set boundary conditions as: walls with no-slip condition for velocity, zeroGradient for pressure, and nutUSpaldingWallFunction for turbulent viscosity; inlet and outlet with freestreamVelocity for velocity and freestreamPressure for pressure; frontAndBack patches as empty type for 2D simulation. Use SIMPLE algorithm with relaxation factors of 0.3 for pressure and 0.7 for velocity and nuTilda. Physical properties include constant density of 1 kg/m\u00B3 and kinematic viscosity of 1e-05 m\u00B2/s. Initial turbulent viscosity (nut) and modified turbulent viscosity (nuTilda) are set to 0.14 m\u00B2/s in the domain. Run the simulation from t=0 to t=500 seconds with a timestep of 1 second, writing results every 50 timesteps. Set convergence criteria with residual controls of 1e-5 for pressure, velocity, and nuTilda equations. Use GAMG solver for pressure and smoothSolver with GaussSeidel smoother for velocity and nuTilda fields.",
  },
  {
    id: 'hotroom',
    label: { zh: '室内自然对流', en: 'Natural Convection' },
    description: {
      zh: '传热算例：封闭房间内的浮力驱动自然对流，使用 buoyantFoam 求解器',
      en: 'Heat transfer: buoyancy-driven natural convection in an enclosed room with buoyantFoam',
    },
    tag: { zh: '传热', en: 'Heat Transfer' },
    solver: 'buoyantFoam',
    domain: 'heatTransfer',
    prompt: "Perform a buoyant thermal flow simulation using buoyantFoam solver in a rectangular room of dimensions 10x5x10 (convertToMeters=1). Use k-epsilon RAS turbulence model with PIMPLE algorithm (2 correctors, 1 outer corrector). The domain has three boundary types: floor, ceiling, and fixedWalls, all with no-slip velocity conditions and wall functions for k, epsilon, and thermal diffusivity (alphat). Initial conditions: temperature of 300K throughout the domain except for a hot spot of 600K in the region 4.5<=x<=5.5, 4.5<=z<=5.5 near the floor (y~0), pressure of 1e5 Pa, zero initial velocity. Physical properties: air with molecular weight 28.9 kg/kmol, specific heat capacity (Cp) of 1000 J/kgK, dynamic viscosity of 1.8e-05 kg/ms, Prandtl number of 0.7, using perfectGas equation of state. Gravity acts in negative y-direction (-9.81 m/s\u00B2). Mesh consists of 20x10x20 cells with uniform grading. Run simulation from t=0 to t=2000s with fixed timestep of 2s and write results every 100 timesteps. Floor and ceiling have fixed temperature of 300K, while fixedWalls have zeroGradient temperature condition.",
  },
];

export default promptExamples;
