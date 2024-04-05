class Lobby {
  constructor(lobbyId, name) {
    this.uuid = uuidv4();
    this.lobbyId = lobbyId;
    this.status = 'created';
    this.name = name;
    this.players = [];
    this.results = [];
  }

  addPlayer(player) {
    if (this.players.length < 6) {
      this.players.push(player);
      return true;
    }
    return false;
  }
}
module.exports = Lobby;