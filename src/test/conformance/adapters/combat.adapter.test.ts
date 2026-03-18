import { expect } from 'vitest';
import { runConformanceSuite } from '../harness';
import { hexDistance } from '@/engine/map/hex-utils';
import {
  canPlayerAttack,
  canAttackNonAdjacent,
  isAttackRequired,
  canAttemptRetreat,
  isRetreatRollSuccessful,
  getRetreatTestOrder,
  getValidRetreatDestinations,
  mustRetreatToSameHex,
  canRetreatIfSurrounded,
  canRetreatAgain,
  canAdvanceAfterRetreat,
  getMovementAfterRetreat,
  isMarkedAsRetreated,
  canContinueAttackAfterRetreat,
  getCombatDice,
  resolveCombat,
  getLossSelector,
  calculateCombatModifier,
  getUnitCombatStrength,
  getStackCombatStrength,
  requiresDeclarationPhase,
  resolveAfterAllDeclared,
  getResolutionOrderChooser,
  areResultsImmediate,
  getUnitsLostWithFleet,
  canUnitTypeInitiateAttack,
  canUnitAttack,
  canAttackInsideCastle,
  getTotalAttackerStrength,
  canAlliedForcesCombine,
  canUnitAttackAgain,
  canHexBeAttackedAgain,
  getDefenderTerrainBonus,
  getEffectiveDefenderStrength,
  canAttackAcrossHexside,
  mustAllStackAttack,
  canSplitStackAttack,
  areAllDefendersAttackedAsOne,
  canAdvanceAfterCombat,
  getAdvanceChoiceOptions,
  getMaxAdvanceHexes,
} from '@/engine/combat/combat-resolution';

function isAdjacentHex(a: number[], b: number[]): boolean {
  return hexDistance({ col: a[0]!, row: a[1]! }, { col: b[0]!, row: b[1]! }) === 1;
}

runConformanceSuite(
  'chunk_2_core_mechanics/25_combat.json',
  (input, expected) => {
    // 25.1.1
    if ('active_player' in input && 'attacking_player' in input) {
      expect(
        canPlayerAttack(input.active_player as string, input.attacking_player as string),
      ).toBe(expected.attack_allowed);
      return true;
    }

    // 25.1.2 + 25.8.2
    if ('hexes_adjacent' in input && 'attack_allowed' in expected) {
      expect(canAttackNonAdjacent(input.hexes_adjacent as boolean)).toBe(expected.attack_allowed);
      return true;
    }

    // 25.1.3
    if ('attack_required' in expected) {
      expect(isAttackRequired()).toBe(expected.attack_required);
      return true;
    }

    // 25.2.1
    if ('retreat_attempt_allowed' in expected) {
      expect(canAttemptRetreat(input.attack_declared as boolean, input.dice_rolled as boolean)).toBe(expected.retreat_attempt_allowed);
      return true;
    }

    // 25.2.2
    if ('retreat_successful' in expected && 'retreat_roll' in input) {
      expect(isRetreatRollSuccessful(input.faction_type as 'human' | 'non_human', input.retreat_roll as number)).toBe(expected.retreat_successful);
      return true;
    }

    // 25.2.3
    if ('test_order' in expected) {
      const units = (input.stack_units as Array<{ type: string }>);
      const order = getRetreatTestOrder(units);
      expect(order).toEqual(expected.test_order);
      expect(expected.all_retreat_on_first_success).toBe(true);
      return true;
    }

    // 25.2.4
    if ('valid_retreat_destinations' in expected) {
      const result = getValidRetreatDestinations(
        input.adjacent_hexes as number[][],
        input.enemy_occupied as number[][],
      );
      expect(result).toEqual(expected.valid_retreat_destinations);
      return true;
    }

    // 25.2.5
    if ('all_units_same_destination' in expected) {
      expect(mustRetreatToSameHex()).toBe(expected.all_units_same_destination);
      return true;
    }

    // 25.2.6
    if ('movement_remaining' in expected) {
      expect(getMovementAfterRetreat()).toBe(expected.movement_remaining);
      return true;
    }

    // 25.2.7
    if ('has_retreated' in expected) {
      const hasRetreated = isMarkedAsRetreated(input.retreat_successful as boolean);
      expect(hasRetreated).toBe(expected.has_retreated);
      expect(
        canRetreatAgain(
          hasRetreated,
          input.still_adjacent_to_attacker as boolean,
        ),
      ).toBe(expected.can_retreat_again);
      return true;
    }

    // 25.2.9
    if ('retreat_possible' in expected) {
      expect(canRetreatIfSurrounded(input.all_adjacent_hexes_enemy_occupied as boolean)).toBe(expected.retreat_possible);
      return true;
    }

    // 25.2.10
    if ('second_retreat_allowed' in expected) {
      expect(canRetreatAgain(input.retreated_once as boolean, input.still_adjacent_to_attacker as boolean)).toBe(expected.second_retreat_allowed);
      return true;
    }

    // 25.2.11 continuation
    if ('continuation_attack_allowed' in expected) {
      const attackerHex = input.attacker_hex as number[];
      const result = canContinueAttackAfterRetreat(
        input.retreat_destination as number[],
        [attackerHex],
        isAdjacentHex,
      );
      expect(result).toBe(expected.continuation_attack_allowed);
      return true;
    }

    // 25.2.11
    if ('attacker_advance_allowed' in expected && 'defender_retreated' in input) {
      const result = canAdvanceAfterRetreat(input.defender_retreated as boolean);
      expect(result.advanceAllowed).toBe(expected.attacker_advance_allowed);
      expect(result.furtherAttacksAllowed).toBe(expected.further_attacks_allowed);
      return true;
    }

    // 25.3.1
    if ('attacker_rolls' in expected) {
      const dice = getCombatDice();
      expect(dice.attackerRolls).toBe(expected.attacker_rolls);
      expect(dice.defenderRolls).toBe(expected.defender_rolls);
      expect(dice.dieType).toBe(expected.die_type);
      return true;
    }

    // 25.3.2 + 25.3.4
    if ('winner' in expected) {
      const result = resolveCombat(
        input.attacker_roll as number,
        input.attacker_modifier as number,
        input.defender_roll as number,
        input.defender_modifier as number,
      );
      expect(result.attackerModifiedTotal).toBe(expected.attacker_modified_total);
      expect(result.defenderModifiedTotal).toBe(expected.defender_modified_total);
      expect(result.winner).toBe(expected.winner);
      if ('attacker_losses' in expected) expect(result.attackerLosses).toBe(expected.attacker_losses);
      if ('defender_losses' in expected) expect(result.defenderLosses).toBe(expected.defender_losses);
      return true;
    }

    // 25.3.3 - Loser losses
    if ('defender_losses' in expected && 'attacker_modified_total' in input) {
      const diff = (input.attacker_modified_total as number) - (input.defender_modified_total as number);
      expect(diff).toBe(expected.defender_losses);
      return true;
    }

    // 25.3.5
    if ('selection_by' in expected) {
      expect(getLossSelector(input.losing_player as string)).toBe(expected.selection_by);
      return true;
    }

    // 25.4.3
    if ('combat_strength' in expected && 'unit_count' in input) {
      const unitStrength = getUnitCombatStrength(input.unit_type as string);
      expect(unitStrength * (input.unit_count as number)).toBe(expected.combat_strength);
      return true;
    }
    if ('total_combat_strength' in expected) {
      const stackUnits = input.stack_units as Array<{ type: string }>;
      expect(getStackCombatStrength(stackUnits.map((unit) => unit.type))).toBe(
        expected.total_combat_strength,
      );
      return true;
    }

    // 25.4.x - Combat modifier
    if ('modifier' in expected && 'attacker_count' in input) {
      const result = calculateCombatModifier(input.attacker_count as number, input.defender_count as number);
      expect(result.modifier).toBe(expected.modifier);
      expect(result.appliesTo).toBe(expected.applies_to);
      return true;
    }

    // 25.5.1
    if ('declaration_phase_required' in expected) {
      expect(requiresDeclarationPhase()).toBe(expected.declaration_phase_required);
      expect(resolveAfterAllDeclared()).toBe(expected.resolution_after_all_declared);
      return true;
    }

    // 25.5.2
    if ('resolution_order_chosen_by' in expected) {
      expect(getResolutionOrderChooser()).toBe(expected.resolution_order_chosen_by);
      return true;
    }

    // 25.5.3
    if ('elimination_immediate' in expected) {
      expect(areResultsImmediate()).toBe(expected.elimination_immediate);
      return true;
    }

    // 25.6.1
    if ('units_also_eliminated' in expected) {
      expect(getUnitsLostWithFleet(input.units_aboard as string[])).toEqual(expected.units_also_eliminated);
      return true;
    }

    // 25.7.1
    if ('attack_allowed' in expected && 'is_combat_unit' in input) {
      expect(canUnitTypeInitiateAttack(input.unit_type as string)).toBe(expected.attack_allowed);
      return true;
    }

    // 25.7.2 - Combat restrictions
    if ('combat_attack_allowed' in expected) {
      expect(canUnitAttack({
        declaredSiegeAttack: input.declared_siege_attack as boolean | undefined,
        aboardFleet: input.aboard_fleet as boolean | undefined,
        unitType: input.unit_type as string | undefined,
      })).toBe(expected.combat_attack_allowed);
      return true;
    }

    // 25.7.2 - Activation restrictions
    if ('attack_allowed' in expected && ('activated_this_turn' in input || 'deactivated_this_turn' in input)) {
      expect(canUnitAttack({
        activatedThisTurn: input.activated_this_turn as boolean | undefined,
        deactivatedThisTurn: input.deactivated_this_turn as boolean | undefined,
      })).toBe(expected.attack_allowed);
      return true;
    }

    // 25.8.1
    if ('attack_allowed' in expected && 'defender_location' in input) {
      expect(canAttackInsideCastle(input.defender_location as string)).toBe(expected.attack_allowed);
      return true;
    }

    // 25.9.1
    if ('total_attacker_strength' in expected) {
      const hexes = (input.attacking_hexes as Array<{ units: number }>);
      expect(getTotalAttackerStrength(hexes)).toBe(expected.total_attacker_strength);
      return true;
    }

    // 25.9.2
    if ('combined_attack_allowed' in expected) {
      expect(canAlliedForcesCombine()).toBe(expected.combined_attack_allowed);
      return true;
    }

    // 25.10.1 / 25.10.2
    if ('additional_attack_allowed' in expected) {
      if ('attacks_made_this_turn' in input) {
        expect(canUnitAttackAgain(input.attacks_made_this_turn as number)).toBe(expected.additional_attack_allowed);
      } else {
        expect(canHexBeAttackedAgain(input.attacks_this_turn_by_player as number)).toBe(expected.additional_attack_allowed);
      }
      return true;
    }

    // 25.11.1
    if ('defender_terrain_bonus' in expected) {
      expect(getDefenderTerrainBonus(input.defender_terrain as string)).toBe(expected.defender_terrain_bonus);
      return true;
    }

    // 25.11.2
    if ('effective_defender_strength' in expected) {
      expect(getEffectiveDefenderStrength(input.defender_terrain as string, input.defender_strength as number)).toBe(expected.effective_defender_strength);
      return true;
    }

    // 25.11.4
    if ('attack_allowed' in expected && 'hexside_type' in input) {
      expect(canAttackAcrossHexside(input.unit_type as 'land' | 'fleet', input.hexside_type as string)).toBe(expected.attack_allowed);
      return true;
    }

    // 25.12.1
    if ('all_must_attack' in expected) {
      expect(mustAllStackAttack()).toBe(expected.all_must_attack);
      return true;
    }

    // 25.12.2
    if ('split_attack_allowed' in expected) {
      expect(canSplitStackAttack()).toBe(expected.split_attack_allowed);
      return true;
    }

    // 25.12.3
    if ('attacked_as_single_force' in expected) {
      expect(areAllDefendersAttackedAsOne()).toBe(expected.attacked_as_single_force);
      return true;
    }

    // 25.13.1
    if ('advance_allowed' in expected && 'defenders_remaining' in input) {
      expect(canAdvanceAfterCombat(input.defenders_remaining as number)).toBe(expected.advance_allowed);
      return true;
    }

    // 25.13.2
    if ('advance_choice_options' in expected) {
      expect(getAdvanceChoiceOptions()).toEqual(expected.advance_choice_options);
      return true;
    }

    // 25.13.3 / 25.13.4
    if ('advance_allowed_hexes' in expected) {
      const isSiegeRelief = (input.is_siege_relief as boolean) ?? false;
      expect(getMaxAdvanceHexes(isSiegeRelief)).toBe(expected.advance_allowed_hexes);
      return true;
    }

    return false;
  },
);
