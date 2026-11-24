// Gravity on different worlds (m/s²) and launchable objects.
// Objects differ in mass and size, which only matters when air resistance is on.

export const WORLDS = [
  { id:'bumi', name:'Bumi', icon:'🌍', g:9.8 },
  { id:'bulan', name:'Bulan', icon:'🌙', g:1.62 },
  { id:'mars', name:'Mars', icon:'🔴', g:3.71 },
  { id:'jupiter', name:'Jupiter', icon:'🪐', g:24.79 },
];

// radius in meters, mass in kg, Cd = drag coefficient of a sphere
export const OBJECTS = [
  { id:'pingpong', name:'Bola pingpong', mass:0.0027, r:0.02, col:'#fff6d6' },
  { id:'tenis', name:'Bola tenis', mass:0.058, r:0.033, col:'#d9f25a' },
  { id:'sepak', name:'Bola sepak', mass:0.43, r:0.11, col:'#ffffff' },
  { id:'boling', name:'Bola boling', mass:6.0, r:0.11, col:'#5b7cfa' },
  { id:'meriam', name:'Peluru meriam', mass:12, r:0.075, col:'#4a4f57' },
];

export const AIR_DENSITY = 1.2;   // kg/m³ near sea level on Earth
export const SPHERE_CD = 0.47;
