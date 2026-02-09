import { expect } from 'vitest';
import { runConformanceSuite } from '../harness';
import {
  canPlayerMove,
  canMoveAnyDirection,
  canSaveMovementPoints,
  canEnterHexWithMinimumMovement,
  canUnitMove,
  getStackMovementAllowance,
  canLeaveStack,
  canContinueIndependently,
  canEnterEnemyOccupiedHex,
  canEndTurnWithAlliedKingdom,
  canSpendMovement,
  canEnterHexByMp,
  canCrossHexsideForMovement,
  handleOffMap,
} from '@/engine/movement/movement';

runConformanceSuite(
  'chunk_2_core_mechanics/18_movement.json',
  (input, expected) => {
    // 18.1.1 - Active player check
    if ('active_player' in input && 'moving_player' in input && 'movement_allowed' in expected) {
      expect(
        canPlayerMove(
          input.active_player as string,
          input.moving_player as string,
        ),
      ).toBe(expected.movement_allowed);
      return;
    }

    // 18.1.2 - Any direction
    if ('movement_directions' in input) {
      expect(canMoveAnyDirection()).toBe(expected.movement_allowed);
      return;
    }

    // 18.1.3 - No saving MP
    if ('next_turn_bonus' in input) {
      expect(canSaveMovementPoints()).toBe(expected.bonus_applied);
      return;
    }

    // 18.1.4 - Minimum movement
    if ('can_enter_hex' in expected && 'terrain_cost' in input) {
      const result = canEnterHexWithMinimumMovement(
        input.movement_allowance as number,
        input.terrain_cost as number,
      );
      expect(result.canEnter).toBe(expected.can_enter_hex);
      expect(result.minimumMovementApplies).toBe(
        expected.minimum_movement_applies,
      );
      return;
    }

    // 18.2.x / 18.3.x - Unit movement eligibility
    if (
      ('unit_owner' in input || 'unit_type' in input || 'is_under_siege' in input || 'activated_this_turn' in input || 'deactivated_this_turn' in input) &&
      'movement_allowed' in expected &&
      !('hexside_type' in input) &&
      !('target_hex' in input) &&
      !('movement_spent' in input)
    ) {
      expect(
        canUnitMove({
          unitOwner: input.unit_owner as string | undefined,
          isActivePlayer: input.is_active_player as boolean | undefined,
          unitType: input.unit_type as string | undefined,
          controlledByActivePlayer: input.controlled_by_active_player as
            | boolean
            | undefined,
          isUnderSiege: input.is_under_siege as boolean | undefined,
          activatedThisTurn: input.activated_this_turn as boolean | undefined,
          deactivatedThisTurn: input.deactivated_this_turn as
            | boolean
            | undefined,
        }),
      ).toBe(expected.movement_allowed);
      return;
    }

    // 18.4.1 - Stack speed
    if ('stack_movement_allowance' in expected) {
      const units = (
        input.stack_units as Array<{ movement_allowance: number }>
      ).map((u) => ({ movementAllowance: u.movement_allowance }));
      expect(getStackMovementAllowance(units)).toBe(
        expected.stack_movement_allowance,
      );
      return;
    }

    // 18.4.2 - Leave stack
    if ('leave_allowed' in expected) {
      expect(canLeaveStack()).toBe(expected.leave_allowed);
      return;
    }

    // 18.4.3 - Independent movement after leaving
    if ('independent_movement_allowed' in expected && 'remaining_mp' in input) {
      expect(canContinueIndependently(input.remaining_mp as number)).toBe(
        expected.independent_movement_allowed,
      );
      return;
    }

    // 18.5.1 - Cannot enter enemy hex
    if ('entry_allowed' in expected && 'target_hex_contains' in input) {
      expect(canEnterEnemyOccupiedHex()).toBe(expected.entry_allowed);
      return;
    }

    // 18.5.2 - Allied stacking end of turn
    if ('position_allowed' in expected) {
      expect(canEndTurnWithAlliedKingdom()).toBe(expected.position_allowed);
      return;
    }

    // 18.5.3 - Exceeding allowance
    if ('movement_spent' in input && 'movement_allowed' in expected) {
      expect(
        canSpendMovement(
          input.movement_allowance as number,
          input.movement_spent as number,
        ),
      ).toBe(expected.movement_allowed);
      return;
    }

    // 18.5.4 - Terrain cost vs remaining
    if ('remaining_mp' in input && 'entry_allowed' in expected) {
      const result = canEnterHexByMp(
        input.remaining_mp as number,
        input.terrain_cost as number,
        input.hexes_moved_this_turn as number,
      );
      expect(result.entryAllowed).toBe(expected.entry_allowed);
      if ('minimum_movement_applies' in expected) {
        expect(result.minimumMovementApplies).toBe(
          expected.minimum_movement_applies,
        );
      }
      return;
    }

    // 18.5.5 - Hexside crossing
    if ('hexside_type' in input && 'crossing_allowed' in expected) {
      expect(
        canCrossHexsideForMovement(
          input.unit_type as 'land' | 'fleet',
          input.hexside_type as string,
        ),
      ).toBe(expected.crossing_allowed);
      return;
    }

    // 18.5.6 - Off-map
    if ('forced_off_map' in input || 'target_hex' in input) {
      const forced = (input.forced_off_map as boolean) ?? false;
      const voluntary = (input.voluntary as boolean) ?? false;
      const result = handleOffMap(forced, voluntary);
      if ('unit_eliminated' in expected) {
        expect(result.unitEliminated).toBe(expected.unit_eliminated);
      }
      if ('movement_allowed' in expected) {
        expect(result.movementAllowed).toBe(expected.movement_allowed);
      }
      return;
    }
  },
);
