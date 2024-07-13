import { TbPlayer, TurnBasedGameLoop } from "./gameloop";
export class PeoplePlayer extends TbPlayer {
    nation;
    alliances;
    territories = [];
    units = [];
    bank;
    research;
}
export class PeopleGame extends TurnBasedGameLoop {
    world;
}
//# sourceMappingURL=people.js.map