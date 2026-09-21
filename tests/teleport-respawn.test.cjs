const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const context = vm.createContext({ window: {}, centerX: 420, jumpPadType: 'jump_pad', jumpRingType: 'jump_ring' });
for (const file of ['game/allObjects.js', 'core/level.js', 'core/player.js']) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../assets/scripts', file), 'utf8'), context);
}
const { PlayerObject, PlayerState, Collider } = vm.runInContext(
  '({ PlayerObject, PlayerState, Collider })', context
);

function fixture({ gap = 6, mini = false, respawn = true, checkpoint = true, type = 'portal_teleport' } = {}) {
  const portal = new Collider(type, 100, 120, 50, 180);
  portal.teleportTargetY = 540;
  portal.teleportTargetX = 100;
  const halfSize = mini ? 18 : 30;
  const x = portal.x + portal.w / 2 + halfSize + gap;
  const player = Object.create(PlayerObject.prototype);
  player.p = new PlayerState();
  Object.assign(player.p, { y: 120, lastY: 120, yVelocity: 5, isMini: mini, ignorePortals: checkpoint });
  Object.assign(player, {
    _scene: { _playerWorldX: x },
    _gameLayer: { getNearbySectionObjects: () => [portal], getFloorY: () => 0, getCeilingY: () => null },
    _lastCollisionWorldX: x, _lastCollisionWorldY: 120,
    noclipStats: { totalFrames: 0, deathFrames: 0 },
    _allLayers: [], _playerLayers: [],
    _orbpadHitEffect() {}, _playPortalShine() {},
  });
  // Reset the real controller; only rendering/audio collaborators are stubbed.
  for (const method of ['_cleanupExplosion', 'stopRotation', 'setCubeVisible', 'setShipVisible',
    'setBallVisible', 'setWaveVisible', 'setBirdVisible', 'setSpiderVisible', 'setRobotVisible', '_hideRobotJumpFlame']) {
    player[method] = () => {};
  }
  for (const field of ['_particleEmitter', '_flyParticleEmitter', '_flyParticle2Emitter',
    '_shipDragEmitter', '_streak', '_waveTrail']) player[field] = { stop() {}, reset() {} };
  if (respawn) player.reset();
  return { player, portal, step: () => player.checkCollisions(x - 420), x };
}

test('portal just behind the hitbox activates on the first respawn step', () => {
  for (const mini of [false, true]) {
    for (const checkpoint of [false, true]) {
      const { player, portal, step, x } = fixture({ mini, checkpoint });
      assert.equal(player._isPlayerTouchingPortalHitbox(portal, x, 120, mini ? 18 : 30, x, 120), false);
      step();
      assert.equal(player.p.y, 540);
      assert.equal(player._scene._playerWorldX, x);
      assert.equal(player.p.yVelocity, 5);
      assert.equal(player._isObjectActivated(portal), true);
    }
  }
});

test('respawn allowance is bounded, horizontal, and limited to the first step', () => {
  for (const options of [{ gap: 31 }, { respawn: false }]) {
    const { player, step } = fixture(options);
    step();
    assert.equal(player.p.y, 120);
  }
  const { player, portal, step } = fixture();
  portal.y = 500;
  step();
  assert.equal(player.p.y, 120);
  portal.y = 120;
  step();
  assert.equal(player.p.y, 120);
});

test('overlapping checkpoint portals activate once; other portal suppression remains', () => {
  const { player, step } = fixture({ gap: -5 });
  step();
  assert.equal(player.p.y, 540);
  player.p.y = player.p.lastY = 120;
  step();
  assert.equal(player.p.y, 120);
  const other = fixture({ gap: -5, type: 'portal_gravity_down' });
  other.step();
  assert.equal(other.player.p.gravityFlipped, false);
});
