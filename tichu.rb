require 'sinatra'
require 'sinatra-websocket'
require 'active_support'
require 'active_support/core_ext'
require 'byebug'

require_relative 'state'
require_relative 'player'

$games = {}

get '/' do
  erb :index
end

post '/new' do
  halt 400, 'missing required parameter `name`' unless params['name'].present?

  game = State.new(end_score: (params['end_score'] || 1000).to_i)
  $games[game.id] = game

  player = Player.new(params['name'])
  game.add_player!(player)

  { game_id: game.id, player_id: player.id }.to_json
end

post '/join' do
  halt 400, 'missing required parameter `name`' unless params['name'].present?
  game_id = params['game_id']
  halt 400, 'missing required parameter `game_id`' unless game_id.present?
  game = $games[game_id]
  halt 400, 'invalid game_id' unless game
  halt 403, 'game is full' if game.players.size >= 4

  player = Player.new(params['name'])
  game.add_player!(player)

  { game_id: game.id, player_id: player.id }.to_json
end

get '/connect' do
  halt 400, 'this is a websocket endpoint' unless request.websocket?
  game_id = params['game_id'].upcase.strip
  halt 400, 'missing required parameter `game_id`' unless game_id.present?
  if game_id == 'TEST'
    # shortcut to save time when testing this thing
    game = ($games['TEST'] ||= State.new)
    halt 400, 'test game is full' if game.players.size == 4
    player = Player.new("Player #{game.players.size}")
    player_id = player.id
    game.add_player!(player)
  else
    game = $games[game_id]
    halt 400, 'invalid game_id' unless game

    player_id = params['player_id']
    if player_id
      player = game.players.find { |player| player.id == player_id }
      halt 400, 'invalid player_id' unless player
    end
  end

  request.websocket do |ws|
    ws.onopen do
      game.connect!(ws, player_id)
    end
    ws.onmessage do |msg|
      game.message(msg, ws, player_id)
    end
    ws.onclose do
      game.disconnect!(ws)
    end
  end
end

