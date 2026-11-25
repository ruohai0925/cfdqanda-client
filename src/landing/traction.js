// Platform usage figures shown on the landing page.
//
// Source: cfdqanda-server/export_deck_data.py run against the live database
// (the same workbook behind the traction deck). To refresh:
//   cd cfdqanda-server && python3 export_deck_data.py -o /tmp/deck.xlsx
// then copy the numbers below and update AS_OF.
//
// Rules carried over from the workbook's Read Me sheet:
// - Institutions are published as a COUNT only. Never list names, schools or
//   logos (the owner has not cleared that; keep it out of this file too).
// - TASKS is the id sequence and includes platform self-tests, so it is shown
//   as "780+" with that caveat, not as a user-only figure.
// - SUCCESS is the 2026-07-14..08-14 review (56 terminal user tasks). Do not
//   recompute it from the live table: failed tasks are purged after 30 days and
//   completed ones after 90, so a live ratio overstates it.
// - Physics areas are keyword-classified from the request text and are
//   multi-label, so the shares add up to more than 100%.

export const AS_OF = '2026-11-24';

export const USERS = 324;
// Distinct self-reported organisations after alias merging (the workbook's
// figure, as used in the deck). The owner chose this over a stricter count of
// identifiable organisations (~111 on 2026-11-24).
export const INSTITUTIONS = 159;
export const INSTITUTIONS_SUFFIX = '';
export const ACADEMIC_SHARE = 155 / 239;   // academic / institutions that answered usably
export const TASKS_FLOOR = 780;            // max(simulations.id) = 789, incl. platform tests
export const RETURNED = 69;                // signed in again after their first day
export const RETAINED_30D = 33;            // still signing in 30+ days after registering
export const SUCCESS = { rate: 0.679, tasks: 56, from: '2026-07-14', to: '2026-08-14' };

// Cumulative registered users at the end of each month of 2026 (Nov is to AS_OF).
export const GROWTH = [
  ['2026-01', 2], ['2026-02', 2], ['2026-03', 100], ['2026-04', 149], ['2026-05', 161],
  ['2026-06', 176], ['2026-07', 211], ['2026-08', 243], ['2026-09', 261], ['2026-10', 267],
  ['2026-11', 324],
];

// User tasks per physics area, out of AREA_TOTAL classified user tasks.
export const AREA_TOTAL = 66;
export const AREAS = [
  { zh: '湍流建模', en: 'Turbulence modelling', n: 33 },
  { zh: '传热 / 对流换热', en: 'Heat transfer', n: 23 },
  { zh: '多相流（VOF）', en: 'Multiphase (VOF)', n: 20 },
  { zh: '基准算例（方腔等）', en: 'Benchmark cases (cavity etc.)', n: 16 },
  { zh: '内流 / 管道', en: 'Internal / pipe flow', n: 12 },
  { zh: '旋转机械 / 旋转坐标系', en: 'Rotating machinery / MRF', n: 12 },
  { zh: '多孔介质', en: 'Porous media', n: 7 },
  { zh: '外流 / 气动', en: 'External aerodynamics', n: 6 },
  { zh: '可压缩 / 高速流', en: 'Compressible / high-speed', n: 6 },
];

// OpenFOAM applications seen in users' retained task logs (union of the
// 2026-09 and 2026-11 exports; the purge means the true list is longer).
export const SOLVERS = [
  'icoFoam', 'pisoFoam', 'simpleFoam', 'interFoam', 'buoyantFoam', 'rhoSimpleFoam',
  'rhoPimpleFoam', 'rhoCentralFoam', 'SRFSimpleFoam', 'particleFoam', 'incompressibleFluid',
];
export const MESH_TOOLS = ['blockMesh', 'snappyHexMesh', 'topoSet', 'setFields', 'checkMesh'];
