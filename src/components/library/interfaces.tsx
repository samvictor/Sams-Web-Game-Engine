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
  LoseScreen = 'loseScreen',
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

interface LevelSettings {
  id?: string
  failCriteria: FailCriteria[]
  winCriteria: WinCriteria[]
  numberOfLives?: number
  numLivingEnemies?: number
  timeLimitSec?: number
  timeLeftSec?: number
  startTimeMs?: number
  // add extra time while paused so time doesn't count down
  pauseOffsetMs?: number
  targetIds?: string[]
  targetScore?: number
  levelState: LevelState
  title: string 
  startScreenBody: string
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
}
