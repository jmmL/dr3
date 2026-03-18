import { expect } from 'vitest';
import { runConformanceSuite } from '../harness';
import {
  isLeaderUnit,
  getLeaderCombatStrength,
  doesLeaderBonusApply,
  getLeaderStackMovement,
  didUseLeaderBonus,
  canLeaveBehindDuringLeaderMove,
  canMoveIndependentlyAfterLeaderMove,
  doTerrainBonusesTransferToLeader,
  getLeaderCombatBonus,
  getLeaderAdjustedCombatValue,
  getTotalLeaderCombatBonus,
  doesLeaderBonusApplyToSiege,
  canLoneLeaderPassThroughEnemy,
  doesPassThroughRequireFateRoll,
  isFateRollRequired,
  resolveFateRoll,
  getFateOutcomeEffect,
  rollLeaderFateWithSeed,
  isAdditionalFateRollRequired,
  canEnterLoneLeaderHex,
  canAttackLoneLeader,
} from '@/engine/leaders/leader-rules';

runConformanceSuite(
  'chunk_2_core_mechanics/26_leaders.json',
  (input, expected) => {
    // 26.1 - Is leader
    if ('is_leader' in expected) {
      expect(isLeaderUnit(input.unit_type as string)).toBe(
        expected.is_leader,
      );
      return true;
    }

    // 26.2 - Leader combat strength
    if ('combat_strength' in expected && 'unit_type' in input) {
      expect(getLeaderCombatStrength(input.unit_type as string)).toBe(
        expected.combat_strength,
      );
      return true;
    }

    // 26.3.1 - Leader bonus scope
    if ('movement_bonus_applies' in expected) {
      expect(
        doesLeaderBonusApply(input.stack_contains as string[]),
      ).toBe(expected.movement_bonus_applies);
      return true;
    }

    // 26.3.2 - Stack uses leader MA
    if ('effective_movement_allowance' in expected) {
      expect(
        getLeaderStackMovement(
          input.leader_movement_allowance as number,
          input.unit_movement_allowance as number,
          input.stacked_with_leader as boolean,
        ),
      ).toBe(expected.effective_movement_allowance);
      return true;
    }

    // 26.3.3 - Must begin and end with leader
    if ('used_leader_bonus' in expected) {
      expect(
        didUseLeaderBonus(
          input.began_turn_with_leader as boolean,
          input.ended_turn_with_leader as boolean,
        ),
      ).toBe(expected.used_leader_bonus);
      return true;
    }

    // 26.3.4 - Leave behind
    if ('leave_behind_allowed' in expected) {
      expect(canLeaveBehindDuringLeaderMove()).toBe(
        expected.leave_behind_allowed,
      );
      return true;
    }

    // 26.3.5 - No independent movement after leader move
    if (
      'independent_movement_allowed' in expected &&
      'used_leader_movement' in input
    ) {
      expect(
        canMoveIndependentlyAfterLeaderMove(
          input.used_leader_movement as boolean,
        ),
      ).toBe(expected.independent_movement_allowed);
      return true;
    }

    // 26.3.6 - Terrain bonuses don't transfer
    if ('leader_gains_tree_symbol' in expected) {
      expect(doTerrainBonusesTransferToLeader()).toBe(
        expected.leader_gains_tree_symbol,
      );
      return true;
    }

    // 26.4.1 - Bonus applied to resolution
    if ('total_combat_value' in expected) {
      const result = getLeaderAdjustedCombatValue(
        input.stack_base_strength as number,
        input.stack_combat_roll as number,
        input.personality_card_combat_bonus as number,
      );
      expect(result).toBe(expected.total_combat_value);
      expect(
        result !==
          (input.stack_base_strength as number) +
            (input.stack_combat_roll as number),
      ).toBe(expected.bonus_included_in_roll);
      return true;
    }

    // 26.4.1 - Leader combat bonus
    if ('combat_bonus' in expected && 'personality_card_combat_bonus' in input) {
      expect(
        getLeaderCombatBonus(
          input.personality_card_combat_bonus as number,
        ),
      ).toBe(expected.combat_bonus);
      return true;
    }

    // 26.4.2 - Multiple bonuses stack
    if ('total_combat_bonus' in expected) {
      const leaders = (
        input.leaders_in_combat as Array<{ combat_bonus: number }>
      ).map((l) => ({ combatBonus: l.combat_bonus }));
      expect(getTotalLeaderCombatBonus(leaders)).toBe(
        expected.total_combat_bonus,
      );
      return true;
    }

    // 26.4.3 - No bonus in siege
    if ('bonus_applied' in expected && input.combat_type === 'siege') {
      expect(doesLeaderBonusApplyToSiege()).toBe(expected.bonus_applied);
      return true;
    }

    // 26.5.1 - Lone leader pass through
    if ('pass_through_allowed' in expected) {
      expect(
        canLoneLeaderPassThroughEnemy(input.is_alone as boolean),
      ).toBe(expected.pass_through_allowed);
      return true;
    }

    // 26.5.2 - Pass through requires fate roll
    if (
      'fate_roll_required' in expected &&
      'passed_through_enemy' in input &&
      'unit_type' in input
    ) {
      expect(
        doesPassThroughRequireFateRoll(
          input.is_alone as boolean,
          input.passed_through_enemy as boolean,
        ),
      ).toBe(expected.fate_roll_required);
      return true;
    }

    // 26.6.1 - Fate roll required (various triggers)
    if ('fate_roll_required' in expected) {
      expect(
        isFateRollRequired({
          leaderInStack: input.leader_in_stack as boolean | undefined,
          stackLostCombatUnits: input.stack_lost_combat_units as
            | boolean
            | undefined,
          leaderAlone: input.leader_alone as boolean | undefined,
          passedThroughEnemy: input.passed_through_enemy as
            | boolean
            | undefined,
          enemyPassedThrough: input.enemy_passed_through as
            | boolean
            | undefined,
          leaderInCastle: input.leader_in_castle as boolean | undefined,
          castleTakenBySiege: input.castle_taken_by_siege as
            | boolean
            | undefined,
          leaderInBesiegedCastle: input.leader_in_besieged_castle as
            | boolean
            | undefined,
          leavingAlone: input.leaving_alone as boolean | undefined,
          leaderAboardFleet: input.leader_aboard_fleet as
            | boolean
            | undefined,
          fleetLostAtSea: input.fleet_lost_at_sea as boolean | undefined,
        }),
      ).toBe(expected.fate_roll_required);
      return true;
    }

    // 26.6 - Deterministic seeded fate
    if ('deterministic' in expected) {
      const first = rollLeaderFateWithSeed(input.rng_seed as string | number);
      const second = rollLeaderFateWithSeed(input.rng_seed as string | number);
      const consistent = first.roll === second.roll && first.outcome === second.outcome;
      expect(consistent).toBe(expected.roll_result_consistent_across_runs);
      expect(consistent).toBe(expected.deterministic);
      return true;
    }

    // 26.6.2 - Fate outcome effects
    if ('leader_removed_from_map' in expected) {
      const effect = getFateOutcomeEffect(input.outcome as 'killed' | 'no_effect' | 'captured');
      expect(effect.removedFromMap).toBe(expected.leader_removed_from_map);
      if ('leader_permanently_eliminated' in expected) {
        expect(effect.removedFromGame).toBe(expected.leader_permanently_eliminated);
        expect(!effect.removedFromGame).toBe(expected.leader_available_for_play);
      }
      if ('leader_held_by' in expected) {
        expect(
          effect.heldByCaptor ? input.capturing_player : null,
        ).toBe(expected.leader_held_by);
        expect(effect.ransomEligible).toBe(expected.ransom_eligible);
      }
      if ('leader_hex' in expected) {
        expect(effect.remainsInPlace).toBe(true);
        expect(input.leader_hex).toEqual(expected.leader_hex);
        expect(expected.leader_status).toBe('active');
      }
      return true;
    }

    // 26.6.2 - Fate roll outcomes
    if ('outcome' in expected && 'fate_roll' in input) {
      expect(resolveFateRoll(input.fate_roll as number)).toBe(
        expected.outcome,
      );
      return true;
    }

    // 26.6.3 - Once per phase
    if ('additional_roll_required' in expected) {
      const rollsThisPhase =
        (input.fate_rolls_this_player_turn as number | undefined) ??
        (input.fate_rolls_this_enemy_phase as number | undefined) ??
        0;
      expect(isAdditionalFateRollRequired(rollsThisPhase)).toBe(
        expected.additional_roll_required,
      );
      return true;
    }

    // 26.6.5 - Enter lone leader hex
    if ('fate_roll_triggered' in expected) {
      const result = canEnterLoneLeaderHex(
        input.entering_unit_type as string,
      );
      expect(result.entryAllowed).toBe(expected.entry_allowed);
      expect(result.fateRollTriggered).toBe(expected.fate_roll_triggered);
      return true;
    }

    // 26.7 - Cannot attack lone leader
    if ('combat_attack_allowed' in expected) {
      expect(canAttackLoneLeader()).toBe(expected.combat_attack_allowed);
      return true;
    }

    return false;
  },
);
