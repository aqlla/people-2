import { TODO } from "lib";
import { TbPlayer, TurnBasedGameLoop, TurnPlayer } from "./gameloop";

type TurnUnit = TODO;

type PeopleUnit = TurnUnit;


export class PeoplePlayer extends TbPlayer {
	nation: TODO
	alliances: TODO

	territories: Array<TODO> = []
	units: Array<PeopleUnit> = []

	bank: TODO
	research: TODO
}



export class PeopleGame extends TurnBasedGameLoop<PeoplePlayer> {
	world: TODO
}