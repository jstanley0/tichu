require 'sinatra'
require 'sinatra-websocket'

require_relative 'state'

$games = {}
$conns = []

get '/' do
  erb :index
end

post '/new' do
  halt 400, 'missing required parameter `name`' unless params['name']&.length > 0

  game = State.new
  $games[game.id] = game

  player = Player.new(params['name'])
  game.add_player!(player)

  game.to_h(for_player: player.id).to_json
end

post '/join' do
  halt 400, 'missing required parameter `name`' unless params['name']&.length > 0
  halt 400, 'missing required parameter `game_id`' unless params['game_id']&.length > 0
  game = $games[params['game_id']]
  halt 400, 'invalid game_id' unless game
  halt 403, 'game is full' if game.players.size == 4

  player = Player.new(params['name'])
  game.add_player!(player)

  game.to_h(for_player: player.id).to_json
end

