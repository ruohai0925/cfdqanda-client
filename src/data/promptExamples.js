// Prompt examples curated from FoamGPT dataset (https://huggingface.co/datasets/LeoYML/FoamGPT)
// Source: foamgpt_train.jsonl — prompts are exact copies from the dataset
// Covers 7 physics domains with bilingual labels

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
    prompt: "Do an incompressible cavity flow simulation using icoFoam solver. The domain is a rectangular cavity with dimensions 1x1x0.1 (convertToMeters=0.1) divided into four blocks. The mesh consists of 20x20x1 cells with non-uniform grading: blocks have grading ratios of (2 2 1), (0.5 2 1), (2 0.5 1), and (0.5 0.5 1) for the bottom-left, bottom-right, top-left, and top-right blocks respectively. The top wall ('movingWall') moves with a uniform velocity of (1 0 0) m/s, while all other walls ('fixedWalls') have no-slip conditions. Front and back faces are set as 'empty' type. For pressure, use zeroGradient condition on all walls except front and back. The simulation should run from t=0.5 to t=0.7 with a timestep of 0.0025, writing results every 40 timesteps. Use kinematic viscosity (nu) of 0.01 m\u00B2/s. The solver should use PISO algorithm with 2 correctors and 0 non-orthogonal correctors, with pressure reference cell 0 set to value 0.",
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
  {
    id: 'dambreak',
    label: { zh: '溃坝问题', en: 'Dam Break' },
    description: {
      zh: '多相流经典算例：带障碍物的溃坝问题，使用 interFoam 求解水-气两相流',
      en: 'Classic multiphase: dam break with obstacle, water-air two-phase flow using interFoam',
    },
    tag: { zh: '多相流', en: 'Multiphase' },
    solver: 'interFoam',
    domain: 'multiphase',
    prompt: "Conduct a two-phase dam break simulation with obstacle using interFoam solver. The domain is a 1x1x1 cubic meter box (convertToMeters=1) with a rectangular obstacle (0.375,0.375,0) to (0.625,0.625,0.25) removed from the domain. Initially, water (alpha.water=1) occupies the region 0\u2264x\u22640.6, 0\u2264y\u22640.1875, 0\u2264z\u22640.75, with air filling the remaining space. Use a uniform hexahedral mesh of 32x32x32 cells. The domain has two boundary patches: 'atmosphere' (top face) with pressure inlet-outlet velocity condition and 'walls' (remaining faces) with no-slip condition. Physical properties include: water (density=1000 kg/m\u00B3, kinematic viscosity=1e-6 m\u00B2/s), air (density=1 kg/m\u00B3, kinematic viscosity=1.48e-5 m\u00B2/s), and surface tension coefficient of 0.07 N/m. Gravity acts in negative z-direction (-9.81 m/s\u00B2). Use PIMPLE algorithm with 3 correctors, no momentum predictor, and pressure reference point at (0.51,0.51,0.51). Simulate from t=0 to t=2s with initial timestep of 0.001s (adjustable with maxCo=0.5, maxAlphaCo=0.5), writing results every 0.02s. The simulation uses laminar flow model and includes dynamic mesh refinement based on alpha.water field (refinement levels between 0.001 and 0.999).",
  },
  {
    id: 'forwardstep',
    label: { zh: '超音速台阶', en: 'Supersonic Step' },
    description: {
      zh: '可压缩流动：超音速前台阶激波问题，使用 rhoCentralFoam 密度基求解器',
      en: 'Compressible flow: supersonic forward-facing step with shock waves using rhoCentralFoam',
    },
    tag: { zh: '可压缩', en: 'Compressible' },
    solver: 'rhoCentralFoam',
    domain: 'compressible',
    prompt: "Perform a compressible flow simulation using rhoCentralFoam solver for a forward-facing step geometry. The domain consists of three blocks: an inlet section (0.6x0.2), a vertical section (0.6x0.8), and a main channel (2.4x0.8), with a total depth of 0.1 (convertToMeters=1). Use a structured mesh with 48x16 cells for the inlet section, 48x64 cells for the vertical section, and 192x64 cells for the main channel. Set inlet conditions with a fixed velocity of (3 0 0) m/s, fixed pressure of 1 Pa, and temperature of 1 K. Apply symmetryPlane conditions for top and bottom boundaries, slip condition for the obstacle, and wave transmissive outlet condition. The simulation should run from 0 to 4 seconds with an initial timestep of 0.002s and adjustable timestepping (maxCo=0.2, maxDeltaT=1s), writing results every 0.1 seconds. Use laminar flow conditions with perfectGas equation of state (molWeight=11640.3), constant specific heat capacity Cp=2.5, and Prandtl number Pr=1. Implement the Kurganov flux scheme with vanLeer reconstruction for density and temperature, and vanLeerV for velocity.",
  },
  {
    id: 'tjunction',
    label: { zh: 'T 型管道', en: 'T-Junction Pipe' },
    description: {
      zh: '内部流动：T 型管道分流问题，使用 pimpleFoam + k-epsilon 瞬态湍流模拟',
      en: 'Internal flow: T-junction pipe bifurcation with pimpleFoam + k-epsilon transient RANS',
    },
    tag: { zh: '内流', en: 'Internal' },
    solver: 'pimpleFoam',
    domain: 'incompressible',
    prompt: "Perform a turbulent incompressible flow simulation through a T-junction using pimpleFoam solver with k-epsilon RAS turbulence model. The T-junction geometry consists of a main horizontal channel (0.22 m long x 0.02 m wide) with a vertical bifurcation at x=0.2 m extending \u00B10.21 m in the y-direction, with a uniform depth of 0.02 m (convertToMeters=1). Set up a pressure-driven flow with time-varying total pressure at inlet (10 to 40 units from t=0 to t=1), fixed pressure of 10 units at outlet1 (bottom branch) and 0 units at outlet2 (top branch). Apply no-slip conditions on all walls. Initialize the velocity field to (0 0 0) m/s, turbulent kinetic energy k to 0.2 m\u00B2/s\u00B2, and epsilon to 200 m\u00B2/s\u00B3. Use PIMPLE algorithm with 1 outer corrector and 2 inner correctors. The mesh should consist of 50x5x5 cells in the inlet section, 5x5x5 cells in the junction region, and 5x50x5 cells in each outlet branch. Set fluid properties as density=1.2 kg/m\u00B3 and kinematic viscosity=1e-5 m\u00B2/s. Run simulation from t=0 to t=1.5 s with initial timestep of 0.001 s (adjustable with maxCo=5) and write results every 0.1 s. Include probe measurements at inlet (1e-06, 0, 0.01), bottom outlet (0.21, -0.20999, 0.01), top outlet (0.21, 0.20999, 0.01), and junction center (0.21, 0, 0.01) for pressure and velocity monitoring.",
  },
];

export default promptExamples;
