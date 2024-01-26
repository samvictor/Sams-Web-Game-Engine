enum ColliderShape {
  Box,
  Point,
  Cylinder,
  Sphere,
}

enum GameObjectType {
  Default,
  Player,
  Projectile,
}

enum GameState {
  StartScreen = 'startScreen',
  NormalPlay = 'normalPlay',
  Paused = 'paused',
  EndScreen = 'endScreen',
}

enum LevelState {
  StartScreen = 'startScreen',
  NormalPlay = 'normalPlay',
  WinScreen = 'winScreen',
  FailScreen = 'failScreen',
  OutOfTime = 'outOfTime',
}

enum FailCriteria {
  NumLives0,
  TimeLeft0,
}

enum WinCriteria {
  NumEnemies0, 
  CollideWithAnyTarget, 
  CollideWithAllTargets,
  ScoreAtOrAboveTarget,
}

enum LevelFlowType {
  None,
  Linear,
}

interface GameSettings {
  background: string
  overlayTextColor: string
  gravity: string
  travelDirection: string
  levelFlowType: LevelFlowType
  levelFlow: string[]
  // when this is set to a level id,
  // that level sees this and starts itself
  // then clears this data
  goToLevel?: string
  currentLevel: string | null
  gameState: GameState
}

// initial level settings
interface LevelSettings {
  id: string
  failCriteria: FailCriteria[]
  winCriteria: WinCriteria[]
  numberOfLives?: number
  numLivingEnemies?: number
  timeLimitSec?: number
  targetIds?: string[]
  targetScore?: number
  levelState: LevelState
  title: string 
  startScreenBody: string
}

// level data as game is being played
interface LevelData extends LevelSettings {
  timeLeftSec: number
  // add extra time while paused so time doesn't count down
  pauseOffsetMs?: number
  startTimeMs?: number
}

interface AllLevelSettings {
  [id: string]: LevelSettings,
}

interface LevelResults {
  // what happened in this level? did player win? what was the score?
  id: string,
  timeToCompleteSec?: number,
  timeRemainingSec: number, 
  score: number,
  livesLeft?: number,
  enemiesDestroyed?: number,
  won: boolean,
  winningCriteria?: WinCriteria,
  failingCriteria?: FailCriteria,
}

interface AllLevelResults {
  [id: string]: LevelResults
}

interface Collider {
  shape: ColliderShape
  offset: number[]
  boxSize?: number[]
  boxRotation?: number[]
  cylinderSize?: number[]
  cylinderRotation?: number[]
  sphereRadius?: number
  visible?: boolean
}

interface GameObjectData {
  position: number[]
  size: number[]
  id: string
  rotation: number[]
  speed: number
  health?: number
  scoreValue?: number
  collider: Collider
  objectType: GameObjectType
  destroyed?: boolean
  isEnemy?: boolean
}

interface PlayerObjectData extends GameObjectData {
  lastShootTimeMs: number
  shootDelayMs: number
}

interface PlayerStats {
  score:number
}

interface ProjectileData extends GameObjectData {
  damage: number
  sourceId: string
}

interface GameObjectsDictionary {
  [id: string]: GameObjectData
}

export {
  Collider,
  GameObjectData,
  GameObjectsDictionary,
  ProjectileData,
  PlayerObjectData,
  ColliderShape,
  GameObjectType,
  GameState,
  GameSettings,
  LevelState,
  PlayerStats,
  FailCriteria, 
  WinCriteria,
  LevelSettings,
  LevelFlowType,
  LevelData,
  LevelResults,
  AllLevelResults,
  AllLevelSettings,
}
